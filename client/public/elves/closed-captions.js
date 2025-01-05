import elf from '@silly/elf'
import Vosk from 'vosk-browser'
import translate from 'translate'

translate.engine = "libre";
translate.url = plan98.env.LIBRE_TRANSLATE_URL + '/translate'

const $ = elf('closed-captions', {
  caption: '',
  translated: '',
  to: 'es',
  from: 'en',
  sourceLanguages: [],
  destinationLanguages: [],
  consented: false
})

$.draw((target) => {
  const {
    consented,
    caption,
    translated
  } = $.learn()

  if(!consented) {
    return `
      <div data-enabled>
        <label class="field">
         <input name="realtime" type="checkbox" />
         <span class="label">Real-time Only</span>
        </label>
        <button data-load>
          Click this button to load "Synthia"
        </button>
      </div>
    `
  }

  return `
    <div class="caption">
      ${caption}
    </div>
    <div class="caption">
      ${translated}
    </div>
  `
})

$.when('change', '[type="checkbox"]', (event) => {
  const { checked, name } = event.target
  $.teach({ [name]: checked })
})

$.when('click', '[data-load]', (event) => {
  init(event.target.closest($.link))
  $.teach({
    consented: true,
  })
})

async function init(target) {
  const channel = new MessageChannel();
  const model = await Vosk.createModel('/cdn/sillyz.computer/models/vosk-model-small-en-us-0.15.tar.gz');
  model.registerPort(channel.port1);

  const sampleRate = 48000;

  const recognizer = new model.KaldiRecognizer(sampleRate);
  recognizer.setWords(true);

  recognizer.on("result", async (message) => {
    const result = message.result;

    if(result.text) {
      $.teach({
        caption: result.text
      })

      const { to, from } = $.learn()
      const translated = await translate(result.text, { to, from })
      $.teach({
        translated
      })
    }
  });

  recognizer.on("partialresult", async (message) => {
    const partial = message.result.partial;
    console.log(partial)
  });

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate
    },
  });

  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('/cdn/sillyz.computer/models/vosk-browser/recognizer-processor.js')
  const recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 });
  recognizerProcessor.port.postMessage({action: 'init', recognizerId: recognizer.id}, [ channel.port2 ])
  recognizerProcessor.connect(audioContext.destination);

  const source = audioContext.createMediaStreamSource(mediaStream);
  source.connect(recognizerProcessor);
}

const defaults = {
  monospace: '0',
  casual: '1',
  weight: '800',
  slant: '-15',
  cursive: '1',
}

const {
  monospace,
  casual,
  weight,
  slant,
  cursive
} = defaults

$.style(`
  & {
    background: #54796d;
    color: white;
    --v-font-mono: ${monospace};
    --v-font-casl: ${casual};
    --v-font-wght: ${weight};
    --v-font-slnt: ${slant};
    --v-font-crsv: ${cursive};
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    display: grid;
    overflow: auto;
    position: relative;
    grid-template-columns: 1fr 1fr;
    height: 100%;
    padding: 2rem;
    font-size: 1.5rem;
    line-height: 1;
  }

  & .caption {
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
  }

  &::before {
    background: linear-gradient(#54796d, transparent);
    content: '';
    position: absolute;
    inset: 0;
  }

  & [data-enabled] {
    position: absolute;
    z-index: 9001;
  }
`)

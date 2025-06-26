import elf from '@silly/elf'
import Vosk from 'vosk-browser'

const $ = elf('vosk-browser', {
  partial: '',
  sequence: '',
  consented: false
})

$.draw((target) => {
  const {
    consented,
    partial,
    realtime,
    sequence
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

  return realtime
    ? `
      <div class="partial">
        ${partial}
      </div>
    ` : `
      <div class="sequence">
        ${sequence}
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
    partial: "Synthia is not who she says. Simon says. Play along. Play along?"
  })
})

async function init(target) {
  const channel = new MessageChannel();
  const model = await Vosk.createModel('/public/cdn/sillyz.computer/models/vosk-model-small-en-us-0.15.tar.gz');
  model.registerPort(channel.port1);

  const sampleRate = 48000;

  const recognizer = new model.KaldiRecognizer(sampleRate);
  recognizer.setWords(true);

  recognizer.on("result", (message) => {
    const result = message.result;

    if(result.text) {
      $.teach({
        type: 'textNode',
        textNode: result.text
      }, function merge(s, p) {
        return {
          ...s,
          sequence: s.sequence += p.textNode + " "
        }
      })

      target.scrollTop = 0;
    }
  });
  recognizer.on("partialresult", (message) => {
    const partial = message.result.partial;
    console.log({ partial })
    $.teach({ partial })
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
    display: block;
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
    position: relative;
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

import elf from '@silly/elf'
import Vosk from 'vosk-browser'
import translate from 'translate'
import { innerHTML } from 'diffhtml'
import { saveAudio } from './time-machine.js'
import { get, put } from './plan98-wallet.js'

translate.engine = "libre";
translate.url = plan98.env.LIBRE_TRANSLATE_URL + '/translate'

const $ = elf('audio-notes', {
  caption: '',
  translated: '',
  to: 'es',
  from: 'en',
  sourceLanguages: [],
  destinationLanguages: [],
  consented: false
})

let languages = []
async function loadLanguages() {
  const response = await fetch(plan98.env.LIBRE_TRANSLATE_URL + '/languages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  languages = await response.json();
  $.teach({
    sourceLanguages: languages.map(x => ({code: x.code, name: x.name})),
    destinationLanguages: languages[0].targets
  })
}

try {
  loadLanguages()
} catch (error) {
  alert('Error submitting form.');
}


$.draw((target) => null, {
  beforeUpdate(target) {
    if(!target.initialized) {
      target.initialized = true
      init(event.target.closest($.link))
    }
  },
  afterUpdate(target) {
    const {
      partial='',
      translated,
      recording,
      ready,
      result=''
    } = $.learn()

    if(!ready) {
      innerHTML(target, `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `)
      return
    }

    const audio = target.querySelector('audio')
    if(!audio) {
      target.innerHTML = `
        <div class="microphone"></div>
        <audio controls="true"></audio>
        <div class="partial"></div>
        <div class="result"></div>
        <div class="translate"></div>
      `
    }

    const partialContainer = target.querySelector('.partial')
    const resultContainer = target.querySelector('.result')
    const translateContainer = target.querySelector('.translate')
    const microphoneContainer = target.querySelector('.microphone')

    partialContainer.innerHTML = partial
    resultContainer.innerHTML = result
    translateContainer.innerHTML = translated
    microphoneContainer.innerHTML = recording
      ? '<button data-stop>Stop</button>'
      : '<button data-record>Record</button>'
  }
})

let mediaRecorder;
let audioChunks = [];

const extensions = {
  'audio/mp4': 'm4a',
  'audio/mp4; codecs=mp4a.40.2': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/webm; codecs=opus': 'webm',
  'audio/webm': 'webm'
}


const mimeTypes = Object.keys(extensions)

const supportedAudioType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

$.when('click', '[data-record]', async (event) => {
  if (!supportedAudioType) {
    return
  }

  try {
    const root = event.target.closest($.link)
    $.teach({ recording: true })

    // Create a MediaRecorder instance
    // You can specify the MIME type here if you want a specific format,
    // e.g., { mimeType: 'audio/webm; codecs=opus' }
    // If not specified, the browser will choose a default supported format.
    mediaRecorder = new MediaRecorder(root.mediaStream);
    const recordedAudio = root.querySelector('audio')

    // Event handler for when data is available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Event handler for when recording stops
    mediaRecorder.onstop = () => {
      // Combine all audio chunks into a single Blob
      const audioBlob = new Blob(audioChunks, { type: supportedAudioType });
      audioChunks = []; // Clear chunks for next recording

      // Create a URL for the Blob and set it as the audio source
      const audioUrl = URL.createObjectURL(audioBlob);
      recordedAudio.src = audioUrl;

      // Play the recorded audio
      recordedAudio.play()
        .catch(e => console.error("Error playing recorded audio:", e));

      // Clean up the object URL after the audio is loaded (optional, but good practice)
      // For longer audio, you might do this on audio.onended
      recordedAudio.onloadedmetadata = () => {
        URL.revokeObjectURL(audioUrl); // Revoke after metadata is loaded
      };

      // Stop the microphone stream
      //root.mediaStream.getTracks().forEach(track => track.stop());
      const now = new Date();
      const timestamp = now.toJSON()
      const src = `/private/audio-notes/${timestamp}.${extensions[supportedAudioType]}`

      // Attempt to upload to server
      put(src, audioBlob, { type: supportedAudioType }).then(response => {
        if (!response.ok) {
          // Explicitly throw for non-200 responses
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        saveAudio({ src })
      }).catch(error => {
        console.warn('Server upload failed, falling back to download', error);

        // Fallback: create a download link
        const link = document.createElement('a');
        link.download = `${timestamp}.jpg`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

    };

    // Start recording
    mediaRecorder.start();

    // Update button states
    recordedAudio.src = ''; // Clear previous recording

    console.log('Recording started...');

  } catch (err) {
    $.teach({ recording: false })
    console.error('Error accessing microphone:', err);
    alert('Could not access microphone. Please ensure you have a microphone and have granted permission.');
  }
});

$.when('click', '[data-stop]', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    $.teach({ recording: false })
    console.log('Recording stopped.');
  }
});

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})


$.when('change', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('change', '[type="checkbox"]', (event) => {
  const { checked, name } = event.target
  $.teach({ [name]: checked })
})


async function init(target) {
  const { realtime } = $.learn()
  const channel = new MessageChannel();
  const model = await Vosk.createModel('/cdn/sillyz.computer/models/vosk-model-small-en-us-0.15.tar.gz');
  model.registerPort(channel.port1);

  const sampleRate = 48000;

  const recognizer = new model.KaldiRecognizer(sampleRate);
  recognizer.setWords(true);

    recognizer.on("partialresult", async (message) => {
      const partial = message.result.partial;
      if(partial === '') return
      $.teach({
        partial
      })
    });

    recognizer.on("result", async (message) => {
      const result = message.result;

      if(result.text) {
        $.teach({
          result: result.text
        })

        const { to, from } = $.learn()
        const translated = await translate(result.text, { to, from })
        $.teach({
          translated
        })
      }
    });

  target.mediaStream = await navigator.mediaDevices.getUserMedia({
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

  const source = audioContext.createMediaStreamSource(target.mediaStream);
  source.connect(recognizerProcessor);

  $.teach({ ready: true })
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
  
`)

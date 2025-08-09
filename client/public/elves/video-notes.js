import elf from '@silly/elf'
import Vosk from 'vosk-browser'
import translate from 'translate'
import { innerHTML } from 'diffhtml'
import { updateDraft, getDraft } from './time-machine.js'
import { get, put } from './plan98-wallet.js'

translate.engine = "libre";
translate.url = plan98.env.LIBRE_TRANSLATE_URL + '/translate'

const tag = 'video-notes'
const $ = elf(tag, {
  recording: false,
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
  }).catch(console.error);
  
  const languages = await response.json().catch(console.error)
  if(languages) {
    $.teach({
      sourceLanguages: languages.map(x => ({code: x.code, name: x.name})),
      destinationLanguages: languages[0].targets
    })
  }
}

try {
  loadLanguages()
} catch (error) {
  alert('Error submitting form.');
}

let mediaRecorder;
let audioChunks = [];

const extensions = {
  'video/mp4;codecs=avc1': 'mp4',
  'video/mp4': 'mp4',
  'video/webm;codecs=vp8,opus': 'webm', // Fallback for other browsers
  'video/webm': 'webm'
}


const videoMimeTypes = Object.keys(extensions)
const supportedVideoType = videoMimeTypes.find(type =>
  MediaRecorder.isTypeSupported(type)
);

$.when('click', '[data-record]', async (event) => {
  if (!supportedVideoType) {
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
    const recordedVideo = root.querySelector('video')

    // Event handler for when data is available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Event handler for when recording stops
    mediaRecorder.onstop = () => {
      // Combine all audio chunks into a single Blob
      const videoBlob = new Blob(audioChunks, { type: supportedVideoType });
      audioChunks = []; // Clear chunks for next recording

      // Create a URL for the Blob and set it as the audio source
      const audioUrl = URL.createObjectURL(videoBlob);
      recordedVideo.src = audioUrl;

      // Play the recorded audio
      recordedVideo.play()
        .catch(e => console.error("Error playing recorded audio:", e));

      // Clean up the object URL after the audio is loaded (optional, but good practice)
      // For longer audio, you might do this on audio.onended
      recordedVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(audioUrl); // Revoke after metadata is loaded
      };

      // Stop the microphone stream
      //root.mediaStream.getTracks().forEach(track => track.stop());
      const now = new Date();
      const timestamp = now.toJSON()
      const src = root.getAttribute('src') || `/private/video-notes/${timestamp}.${extensions[supportedVideoType]}`

      // Attempt to upload to server
      put(src, videoBlob, { type: supportedVideoType }).then(response => {
        if (!response.ok) {
          // Explicitly throw for non-200 responses
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        updateDraft({ src })
      }).catch(error => {
      });
    };

    updateDraft({ transcription: '' })
    // Start recording
    mediaRecorder.start();

    // Update button states
    recordedVideo.src = ''; // Clear previous recording

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

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: block;
    height: 100%;
  }

  & .viewport {
    position: absolute;
    inset: 0;
  }

  & .lingustics {
    font-size: 1.5rem;
    padding: .5rem;
    position: absolute;
    bottom: 4rem;
    left: 2rem;
    right: 2rem;
    color: white;
    text-shadow: 1px 1px black;
  }

  & .partial {
    display: inline-block;
    background: black;
  }

  & video {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & .taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
  }
`)

class VideoNotes extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $.draw(() => null, { afterUpdate: this.afterUpdate })
    this.init(this)
  }

  disconnectedCallback() {
    const video = this.querySelector('video')
    if(video) {
      video.pause();

      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }

      if (video.src && video.src.startsWith('blob:')) {
        URL.revokeObjectURL(video.src);
        video.src = '';
      }

      video.removeAttribute('src');
    }

    this.innerHTML = null

    if(this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null
    }
  }

  async init(target) {
    const sampleRate = 48000;
    target.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate
      },
    });

    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="taskbar">
          <div class="left">
          </div>
          <div class="center" data-primary-action></div>
          <div class="right">
          </div>
        </div>

        <div class="viewport">
          <div class="lingustics">
            <div class="partial"></div>
            <div class="translate"></div>
          </div>
          <video playsinline disablePictureInPicture></video>
        </div>
      `
      this.afterUpdate(target)
    }

    target.video = target.querySelector('video')
    target.video.muted = true
    target.video.srcObject = target.mediaStream;
    target.video.autoplay = true;

    const channel = new MessageChannel();
    const model = await Vosk.createModel('/public/cdn/sillyz.computer/models/vosk-model-small-en-us-0.15.tar.gz');
    model.registerPort(channel.port1);

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
        const { recording } = $.learn()
        const result = message.result;

        if(result.text) {
          if(recording) {
            const { transcription } = getDraft()
            updateDraft({ transcription: transcription + ' ' + result.text })
          }
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

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('/public/cdn/sillyz.computer/models/vosk-browser/recognizer-processor.js')
    const recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 });
    recognizerProcessor.port.postMessage({action: 'init', recognizerId: recognizer.id}, [ channel.port2 ])
    recognizerProcessor.connect(audioContext.destination);

    const source = audioContext.createMediaStreamSource(target.mediaStream);
    source.connect(recognizerProcessor);
  }

  afterUpdate(target) {
    if(!target.innerHTML) return
    const {
      partial='',
      translated,
      recording,
      result=''
    } = $.learn()

    const partialContainer = target.querySelector('.partial')
    const translateContainer = target.querySelector('.translate')
    const actionContainer = target.querySelector('[data-primary-action]')

    innerHTML(partialContainer, partial)
    innerHTML(translateContainer, translated)

    if(recording !== target.lastRecording) {
      target.lastRecording = recording
      innerHTML(actionContainer, recording
        ? `
          <div2>
            <button data-stop class="standard-button bias-negative -large -round">
              <sl-icon name="stop-circle-fill"></sl-icon>
            </button>
          </div2>
        `
        : `
          <div3>
            <button data-record class="standard-button -large -round">
              <sl-icon name="record-circle-fill"></sl-icon>
            </button>
          </div3>
        `
      )
    }
  }
}

customElements.define(tag, VideoNotes);



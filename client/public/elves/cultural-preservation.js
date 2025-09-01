import app, { get, getSpace, put, del} from '@plan68/app'
import Vosk from 'vosk-browser'
import { innerHTML } from 'diffhtml'

const sampleRate = 48000;

const tag = 'cultural-preservation'
const $ = app(tag, {
  recording: false,
  caption: '',
  facingMode: 'environment',
  to: 'es',
  from: 'en',
  sourceLanguages: [],
  destinationLanguages: [],
  transcription: '',
  history: [],
  consented: false
})

/*



The Post Request

A post is a message is a mail is a medium which may mean many multitudes.

in computer world, to post is the verb to share, to send, which implies an object

an object that has been posted must be handled and may resolve and redistribute knowledge in the network



*/

function POST(object, handler) {
  $.teach(object, handler)
}

/*



The Historical Record

A conclusion is a fact. Whether the fact is true or false is contextual.

People make conclusions every day. They share conclusions.

Conclusions are stored chronologically and fetched by recency.



*/

function appendToHistoricalRecord(state, payload) {
  return {
    ...state,
    history: [
      ...state.history,
      payload
    ]
  }
}

/*



The Get Request

Information is all around us.

Data, as CARBON, can be snatched out of thin air and turned into butter.

How we handle the ever so prescient flow is all there is to know



*/

function GET(handler) {
  return handler($.learn())
}

/*



The Breaking News

News breaks all day every day non stop.

How you tune it out or turn it up is real rizz.



*/

function theBreakingNews(rizz) {
  if(!rizz.history) return null
  if(rizz.history.length === 0) return null

  return rizz.history[rizz.history.length - 1]
}

/*



The Top 8

In historic implementations, the Top 8 were hand selected individuals

In this implementation, the top eight are recent contributions to the rizzstory



*/

function topEight(rizz) {
  const rizzstory = rizz.history

  if(!rizzstory)
    return []
  if(rizzstory.length === 0)
    return []

  return rizzstory.slice(
    Math.max(
      0,
      rizzstory.length-8
    ),
    rizzstory.length
  )
}

let mediaRecorder;
let videoChunks = [];

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
        videoChunks.push(event.data);
      }
    };

    // Event handler for when recording stops
    mediaRecorder.onstop = () => {
      // Combine all audio chunks into a single Blob
      const videoBlob = new Blob(videoChunks, { type: supportedVideoType });
      videoChunks = []; // Clear chunks for next recording

      // Create a URL for the Blob and set it as the audio source
      const videoUrl = URL.createObjectURL(videoBlob);
      recordedVideo.src = videoUrl;

      // Play the recorded audio
      recordedVideo.play()
        .catch(e => console.error("Error playing recorded audio:", e));

      // Clean up the object URL after the audio is loaded (optional, but good practice)
      // For longer audio, you might do this on audio.onended
      recordedVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(videoUrl); // Revoke after metadata is loaded
      };

      // Stop the microphone stream
      //root.mediaStream.getTracks().forEach(track => track.stop());
      const now = new Date();
      const timestamp = now.toJSON()
      const src = root.getAttribute('src') || `/private/video-notes/${timestamp}.${extensions[supportedVideoType]}`

      const historicalNugget = {
        src,
        title: 'Recorded Entry',
        author: 'Wally Wollaston',
        when: new Date().toLocaleString('en-us')
      }

      POST(historicalNugget, appendToHistoricalRecord)

      const space = getSpace(root.id)

      // Attempt to upload to server
      put.call({ space }, src, videoBlob, { type: supportedVideoType }).then(response => {
        if (!response.ok) {
          // Explicitly throw for non-200 responses
          throw new Error(`HTTP error! status: ${response.status}`);
        }

      }).catch(error => {
      });
    };

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
    z-index: 30;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
  }

  & .taskbar .right {
    text-align: right;
  }

  & .panel-area {
    background: white;
    display: none;
    overflow: auto;
  }

  &[data-show-panel="true"] .panel-area {
    position; absolute;
    right: 0;
    display: block;
    width: clamp(240px, var(--panel-width, 320px), 100%);
    max-width: 100vw;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 25;
    display: block;
  }

  & .playlist {
    display: flex;
    flex-direction: column-reverse;
    gap: 1rem;
    padding: 1rem;
  }

  & .clip {
    
  }

  & .clip-title {
    color: rgba(0,0,0,.85);
    font-weight: 100;
  }

  & .clip-author {
    color: rgba(0,0,0,.65);
    font-weight: 400;
  }

  & .clip-time {
    color: rgba(0,0,0,.45);
    font-weight: 700;
  }
`)

class CulturalPreservation extends HTMLElement {
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
    await setMediaStream(target)

    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="taskbar">
          <div class="left">
            <button data-flip class="standard-button -stealth -large -round">
              <sl-icon name="phone-flip"></sl-icon>
            </button>
          </div>
          <div class="center" data-primary-action></div>
          <div class="right">
            <button data-list class="standard-button -stealth -large -round">
              <sl-icon name="music-note-list"></sl-icon>
            </button>
          </div>
        </div>

        <div class="viewport">
          <div class="lingustics">
            <div class="partial"></div>
          </div>
          <video playsinline disablePictureInPicture></video>
        </div>

        <div class="panel-area"></div>
        <div class="modal-area"></div>
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
        const { recording, transcription } = $.learn()
        const result = message.result;

        if(result.text) {
          if(recording) {
            $.teach({ transcription: transcription + ' ' + result.text })
          }
          $.teach({
            result: result.text
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
      recording,
      showPanel,
      result='',
      history,
    } = $.learn()

    const partialContainer = target.querySelector('.partial')
    const actionContainer = target.querySelector('[data-primary-action]')

    innerHTML(partialContainer, partial)

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

    if(showPanel) {
      const area = document.querySelector('.panel-area')
      const clips = GET(topEight).map(x => {
        return `
          <button data-play="${x.src}" class="clip standard-button -stealth">
            <div class="clip-title">${x.title}</div>
            <div class="clip-author">${x.author}</div>
            <div class="clip-time">${x.when}</div>
          </button>
        `
      }).join('')

      area.innerHTML = `
        <div class="playlist">
          ${clips}
        </div>
      `
      target.dataset.showPanel = true
    } else {
      const area = document.querySelector('.panel-area')
      target.dataset.showPanel = false
      if(area.innerHTML) area.innerHTML = ''
    }
  }
}

async function setMediaStream(target) {
  const { facingMode } = $.learn()
  target.mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
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
}

$.when('click', '[data-play]', (event) => {
  const { play } = event.target.dataset
  const root = event.target.closest($.link)
  showModal(`
    <div style="height: 100%; background: rgba(128,128,128,1); overflow: auto; width: 100%;">
      <plan68-video src="${play}" space="${root.id}"></plan68-video>
    </div>
  `, {
    blockExit: false,
    onHide: () => $.teach({ popped: false })
  })
})

$.when('click', '[data-flip]', (event) => {
  const { facingMode } = $.learn()

  if(facingMode === 'environment') {
    $.teach({ facingMode: 'user' })
  } else {
    $.teach({ facingMode: 'environment' })
  }

  const target = event.target.closest($.link)
  setMediaStream(target)
  target.video.srcObject = target.mediaStream;
})

$.when('click', '[data-list]', () => {
  const { showPanel } = $.learn()

  $.teach({ showPanel: !showPanel })
})


/*

This last line is important to some people for whatever reason

In elf world, omission of this is allowed and it may be auto-defined at runtime

In this case in particular, it was needed for system hooks to toggle media

*/
customElements.define(tag, CulturalPreservation);

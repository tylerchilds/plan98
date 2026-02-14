/*

In the beginning,

Dog created man. Man's best friend.

Man's first instruction: fetch

The fetch command instructs the human to chase and fetch the ball

*/

import Self from '@plan98/elf'
import { Float, Integer } from '@plan98/types'
import { get, put } from './plan98-wallet.js'
import Chromakey from './chroma-key.js'
import { checkButton, checkAxis } from './debug-gamepads.js'
import {
  attack,
  release,
} from './paper-pocket.js'

/*

Since man could not reliably communicate telepathically,

Dog gave man voice

*/

import Vosk from 'vosk-browser'

/*

An dog fed man toast.

*/

import { toast } from './plan98-toast.js'
import { showModal } from './plan98-modal.js'
import './plan98-palette.js'

/*

And dog let man bark at nothing in particular

*/

import { publish } from './plan98-gallery.js'

/*

And for performance reasons, included an additional dependency when bootstrapping reality

*/

import { innerHTML } from 'diffhtml'

/*

Every universe needs a number. Some like Earth 616, others like it 48000

*/

const sampleRate = 48000;
const gridUnit = 16
const spatialOffset = 1
const center = 60
const orientation = {
	x: '0', y: '0', z: '0', yaw: '0', pitch: '0', roll: '0'
}
const camera = {
	x: -2 * gridUnit, y: gridUnit + 4, z: 4*gridUnit, yaw: '0', pitch: '0', roll: '0'
}
const rows = 7
const columns = 13

/*

Data means nothing without a tag or a label or a lens through which to see

*/

const tag = 'plan98-camera'

/*

An app is a nanobot, a machine elf

*/

// Generate a unique player ID for this session
const playerId = self.crypto.randomUUID()
let cameraLock = false

let lineWidth = 0
let isMousedown = false
let points = []
const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 9001, 9002, 9004, 9008]
const opacities = [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]
const backgrounds = [
  {
    key: 'Transparent',
    value: 'transparent'
  },
  {
    key: 'Black',
    value: 'black'
  },
  {
    key: 'White',
    value: 'white'
  },
  {
    key: 'Blue',
    value: '#0047bb'
  },
  {
    key: 'Green',
    value: '#00b140'
  },
  {
    key: 'Red',
    value: 'firebrick'
  },
  {
    key: 'Orange',
    value: 'darkorange'
  },
  {
    key: 'Yellow',
    value: 'gold'
  },
  {
    key: 'Green',
    value: 'mediumseagreen'
  },
  {
    key: 'Blue',
    value: 'Dodgerblue'
  },
  {
    key: 'Indigo',
    value: 'slateblue'
  },
  {
    key: 'Violet',
    value: 'mediumpurple'
  },
  {
    key: 'Otr',
    value: 'lemonchiffon'
  },
  {
    key: 'Wally',
    value: '#54796d'
  },
]

const $ = Self(tag, {
  menuOpen: false,
  recording: false,
  kind: null,
  showDeviceList: false,
  showModeList: false,
  mode: 'photo',
  caption: '',
  facingMode: 'environment',
  transcription: '',
  devicesByKind: {},
  url: '',
  title: '',
  author: '',
  when: '',
  description: '',
  history: [],
  showList: false,
  showOverlay: false,
  view: null,
  objectId: null,
  strokeHistory: [],
  strokeRevisory: [],
  thickness: 16,
  opacity: 1,
  color: 'transparent',
  background: 'transparent',
  players: {}, // { [playerId]: { currentStroke: [], cursorX: 0, cursorY: 0, color: 'color' } }
  videoEnabled: true,
  audioEnabled: true,
  chromakeyEnabled: false,
  chromakeyColor: 'dodgerblue',
  chromakeyTolerance: 30,
  passphrase: ''
})

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

Replacing In

Forget forgetting! When new facts are found, incorporate them into the model.

*/

function replaceInHistoricalRecord(state, payload) {
  return {
    ...state,
    history: [
      ...state.history.map(x => {
        if(x.id === payload.id) {
          return {
            ...x,
            ...payload
          }
        }

        return x
      })
    ]
  }
}

/*

Dog said, "No more fake news" and there was a media recorder

*/

let mediaRecorder;

/*

And a news station to store all the clips moment by moment was born

*/

let videoChunks = [];

/*

And the political and technical details were not lost on dog.

*/

const extensions = {
  'video/mp4;codecs=avc1': 'mp4',
  'video/mp4': 'mp4',
  'video/webm;codecs=vp8,opus': 'webm',
  'video/webm': 'webm'
}

/*

And dog realized the humans needed sheperds and created mimes.

*/

const videoMimeTypes = Object.keys(extensions)

/*

And depending on exactly someone's identity politics, a palatable mime is alotted.

*/

const supportedVideoType = videoMimeTypes.find(type =>
  MediaRecorder.isTypeSupported(type)
);

/*

Dog knew humans lacked telepathy and created a record button, imbued with magic

*/

async function safeAsync(call) {
  return await call().then((x) => {
    return { data: x, error: null }
  }).catch(e => {
    return { error: e, data: null }
  });
}

async function startStream(hasAudio) {
  const { passphrase } = $.learn()

  return await safeAsync(async () => {
    const response = await fetch('/rtmp/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        passphrase,
        hasAudio
      })
    });

    return response.json()
  })
}

async function startRecording(event) {
  if (!supportedVideoType) {
    return
  }

  const { videoEnabled, audioEnabled } = $.learn()

  try {
    const root = event.target.closest($.link)
    $.teach({ recording: true, transcription: '' })

    const tracks = []
    let hasAudio = false  // Track actual audio availability

    if (audioEnabled && root.webcamStream) {
      const audioTrack = root.webcamStream.getAudioTracks()[0]

      console.log('Audio check:', {
        audioEnabled,
        hasWebcamStream: !!root.webcamStream,
        audioTrack: audioTrack ? {
          id: audioTrack.id,
          label: audioTrack.label,
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState
        } : null
      });

      if (audioTrack) {
        tracks.push(audioTrack)
        hasAudio = true  // We actually have audio
      }
    }

    if (root.outputCanvas) {
      // Capture stream at 30fps to ensure smooth recording
      const compositedVideoStream = root.outputCanvas.captureStream(30)
      const videoTrack = compositedVideoStream.getVideoTracks()[0]
      if (videoTrack) tracks.push(videoTrack)
    }

    if (tracks.length === 0) {
      toast("No tracks available to record")
      $.teach({ recording: false })
      return
    }

    const product = new MediaStream(tracks)

    console.log('MediaStream tracks:', {
      video: product.getVideoTracks().length,
      audio: product.getAudioTracks().length,
      hasAudio
    });

    const { data, error } = await startStream(hasAudio)

    if(!error) {
      const { streamId } = data
      $.teach({ streamId })
    }

     const recorderOptions = {
      videoBitsPerSecond: 8000000
    };

    // If we have audio, use a codec that supports it
    // If we don't have audio, use video-only codec
    if (hasAudio) {
      recorderOptions.mimeType = 'video/webm;codecs=vp8,opus';
    } else {
      recorderOptions.mimeType = 'video/webm;codecs=vp8';
    }

    // Verify the mimeType is supported
    if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
      console.warn('Preferred mimeType not supported, falling back to default');
      recorderOptions.mimeType = supportedVideoType;
    }

    console.log('MediaRecorder config:', recorderOptions);

    mediaRecorder = new MediaRecorder(product, recorderOptions);

    const recordedVideo = root.querySelector('video.recorded-playback')

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);

        const { streamId } = $.learn()
        if(streamId) {
          // Retry logic for chunk sending
          let retries = 3;
          while (retries > 0) {
            try {
              const response = await fetch(`/rtmp/chunk?streamId=${streamId}`, {
                method: 'POST',
                body: event.data
              });

              if (response.ok) {
                break; // Success
              } else if (response.status === 410) {
                // Stream ended permanently
                console.warn('Stream ended on server');
                $.teach({ streamId: null, recording: false });
                break;
              } else if (response.status === 503) {
                // Temporary - retry
                retries--;
                await new Promise(resolve => setTimeout(resolve, 100));
              } else {
                throw new Error(`Server error: ${response.status}`);
              }
            } catch (err) {
              console.error('Chunk send failed:', err);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              } else {
                console.error('Failed to send chunk after retries');
              }
            }
          }
        }
      }
    };
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);

        const { streamId } = $.learn()
        if(streamId) {
          fetch(`/rtmp/chunk?streamId=${streamId}`, {
            method: 'POST',
            body: event.data
          }).catch(err => console.error('Chunk send failed:', err));
        }
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: supportedVideoType });
      videoChunks = [];

      const videoUrl = URL.createObjectURL(videoBlob);

      if (recordedVideo) {
        recordedVideo.src = videoUrl;

        /*
        recordedVideo.play()
          .catch(e => console.error("Error playing recorded audio:", e));
        */

        recordedVideo.onloadedmetadata = () => {
          URL.revokeObjectURL(videoUrl);
        };
      }

      const now = new Date();
      const timestamp = now.toJSON()
      const documentSrc = root.getAttribute('src') || `/private/${$.link}/${timestamp}.json`

      const { transcription } = $.learn()
      const videoSrc = `/private/${$.link}/${timestamp}.${extensions[supportedVideoType]}`
      const historicalNugget = {
        $type: 'computer.sillyz.data.video',
        id: self.crypto.randomUUID(),
        src: videoSrc,
        title: 'Recorded Entry',
        description: 'A video recorded now about another time or place',
        createdAt: new Date().toLocaleString('en-us'),
        transcription
      }

      //$.teach(historicalNugget, appendToHistoricalRecord)
      publish(historicalNugget)
      /*
      put(documentSrc, JSON.stringify($.ear()), { type: 'application/json' }).then(response => {
      }).catch(error => {
        console.warn(error);
      });
      */

      put(videoSrc, videoBlob, { type: supportedVideoType }).then(res => {
        if(!res || !res.ok) {
          throw new Error('Upload failed')
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

      }).catch(error => {
      });
    };

    mediaRecorder.start(1000);

    if (recordedVideo) {
      recordedVideo.src = ''; // Clear previous recording
    }
  } catch (err) {
    $.teach({ recording: false })
    console.error('Error accessing microphone:', err);
    alert('Could not access microphone. Please ensure you have a microphone and have granted permission.');
  }
}

$.when('click', '[data-record]', startRecording);

/*

And a button to stop the record

*/

async function stopRecording(event) {
  const { streamId } = $.learn()
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();

    if (streamId) {
      await fetch('/rtmp/stop', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ streamId })
      });
    }
    $.teach({ recording: false })
  }
}

$.when('click', '[data-stop]', stopRecording);

/*

And a button to do the other one than we're currently doing

*/

$.when('click', '[data-toggle-recording]', (event) => {
  if($.learn().recording) {
    stopRecording(event)
  } else {
    startRecording(event)
  }
})

/*

And finally a button just to take a photo since that's all dog really wanted man to do.

*/


$.when('click', '[data-screenshot]', screenshot)

function screenshot(event) {
  const { outputCanvas } = engine(event.target)
  if (!outputCanvas) {
    toast("Camera not ready")
    return
  }

  const { strokeHistory, strokeRevisory } = $.ear()

  outputCanvas.toBlob((blob) => {
    if (!blob) {
      toast("Failed to capture image")
      return
    }

    const now = new Date()
    const timestamp = now.toJSON()
    const imageSrc = `/private/${$.link}/${timestamp}.jpg`

    const historicalNugget = {
      $type: 'computer.sillyz.data.image',
      id: self.crypto.randomUUID(),
      src: imageSrc,
      strokeHistory,
      strokeRevisory,
      title: 'Recorded Entry',
      description: 'A video recorded now about another time or place',
      createdAt: new Date().toLocaleString('en-us'),
    }

    publish(historicalNugget)

    put(imageSrc, blob, { type: 'image/jpeg' }).then(res => {
      if (!res || !res.ok) {
        throw new Error('Upload failed')
      }
      console.log('successful upload')
    }).catch(error => {
      console.warn(error)
      // Fallback: download locally
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${timestamp}.jpg`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }, 'image/jpeg', 0.92)
}

/*

And a bunch of colorful shapes and sizes, since once again, humans.

*/

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: block;
    height: 100%;
    background: black;
  }

  & .viewport {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .lingustics {
    pointer-events: none;
    font-size: 1.5rem;
    padding: .5rem;
    position: absolute;
    bottom: 4rem;
    left: 2rem;
    right: 2rem;
    color: white;
    text-shadow: 1px 1px black;
    z-index: 5;
  }

  & .partial {
    display: inline-block;
    background: black;
  }

  & .input-video,
  & .recorded-playback {
    position: absolute;
    inset: 0;
    object-fit: contain;
    width: 100%;
    height: 100%;
  }

  & .taskbar {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    z-index: 5;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    pointer-events: none;
  }

  & .taskbar.-top {
    top: 0;
    bottom: auto;
  }


  & .taskbar button {
    pointer-events: all;
  }

  & .taskbar .right {
    text-align: right;
  }

  & .overlay-area {
    background: white;
    display: none;
    overflow: auto;
  }

  &[data-show-overlay="true"] .overlay-area {
    position; absolute;
    display: block;
    position: absolute;
    inset: 0;
    z-index: 50;
    display: block;
  }

  & .panel-area {
    background: white;
    display: none;
    overflow: auto;
  }

  &[data-show-list="true"] .panel-area {
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
    gap: .5rem;
    padding: 0 .5rem .5rem;
  }

  & .instructions {
    padding: 0 .5rem .5rem;
    display: none;
  }

  & .playlist:empty + .instructions {
    display: block;
  }

  & .share-area {
    text-align: right;
    padding: .5rem;
  }

  & .clip {

  }

  & .clip-title {
    color: rgba(0,0,0,.85);
    font-weight: 100;
  }

  & .clip-author {
    color: rgba(0,0,0,.45);
    font-weight: 400;
  }

  & .clip-time {
    color: rgba(0,0,0,.25);
    font-weight: 700;
  }

  & .memex-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }

  & .memex-row button {
    width: 100%;
  }

  & .focused-work {
    display: grid;
    margin: 0 auto;
    max-width: 480px;
    padding: 1rem .5rem 1rem;
    display: block;
  }

  & .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 0 auto 2rem;
    max-width: 320px;
  }

  & .form-actions button {
    width: 100%;
  }

  & .letterbox {
    position: relative;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    background: var(--background, black);
    margin: auto;
  }

  @media (orientation: landscape) {
    & .letterbox {
      aspect-ratio: 16 / 9;
    }
  }

  @media (orientation: portrait) {
    & .letterbox {
      aspect-ratio: 9 / 16;
    }
  }

  @media (aspect-ratio: 1 / 1) {
    & .letterbox {
      aspect-ratio: 1 / 1;
    }
  }

  & .letterbox canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  & .input-video {
    opacity: 0;
  }

  & .input-canvas {
    opacity: 0;
    z-index: 1;
  }

  & .player-canvases {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }

  & .player-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }

  & .output-canvas {
    pointer-events: none;
    z-index: 3;
  }

  & .cursor-tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    transform: translate(-50%, -150%);
    z-index: 100;
  }

  & .footer {
    height: 2rem;
    position: absolute;
    gap: .5rem;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: grid;
    align-content: end;
    grid-template-columns: 1fr auto 1fr;
  }

  & .footer .left,
  & .footer .center,
  & .footer .right {
    display: flex;
  }

  & .footer .center {
    position: relative;
  }

  & .footer .fixed-center {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  & .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    place-items: center;
    gap: .5rem;
  }

  & .share-link-copyable-url {
    white-space: nowrap;
    overflow-x: auto;
    display: block;
  }

  & canvas {
    touch-action: none;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }
`)

/*

And after filling the mind of man with fantasy, dog gave visions and dreams

*/

const views = {
  edit: 'edit',
  color: 'color',
  brush: 'brush',
  settings: 'settings',
  social: 'social',
  share: 'share'
}

const viewRenderers = {
  [views.edit]: function (target) {
    const { draft } = $.learn()
    const { id, title, author, description, transcription } = draft

    return `
      <div${id} class="focused-work">
        <div class="form-actions">
          <div>
            <button data-save class="standard-button bias-positive">
              Save
            </button>
          </div>
          <div>
            <button data-cancel class="standard-button bias-generic">
              Cancel
            </button>
          </div>
        </div>

        <div class="metadata-form">
          <label class="field">
            <span class="label">Title</span>
            <input data-bind="draft" name="title" value="${escapeHyperText(title)}"/>
          </label>

          <label class="field">
            <span class="label">Author</span>
            <input data-bind="draft" name="author" value="${escapeHyperText(author)}"/>
          </label>

          <label class="field">
            <span class="label">Description</span>
            <textarea data-bind="draft" name="description" value="${escapeHyperText(description)}"></textarea>
          </label>

          <label class="field">
            <span class="label">Transcription</span>
            <textarea data-bind="draft" name="transcription" value="${escapeHyperText(transcription)}"></textarea>
          </label>
        </div>

      </div${id}>
    `
  },
  [views.color]: function (target) {
    const { view } = $.learn()

    if(target.view === view) return

    return `
      <plan98-palette></plan98-palette>
    `
  },
  [views.brush]: function (target) {
    const { thickness, opacity, background } = $.learn()
    return `
      <div style="position: sticky; top: 0; text-align: right;">
        <button data-cancel class="branded-button">
          Close
        </button>
      </div>

      <div class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3>Thickness</h3>
        <div class="settings-grid">
          ${thicknoids.map(x => `
            <button class="branded-button ${thickness === x ? 'active' : ''}" data-tooltip="Set thicknoid to ${x}" data-thickness="${x}">
              ${x}
            </button>
          `).join('')}
        </div>
        <h3>Opacities</h3>
        <div class="settings-grid">
          ${opacities.map(x => `
            <button class="branded-button ${opacity === x ? 'active' : ''}" data-tooltip="Set opacity to ${x}" data-opacity="${x}">
              ${x}
            </button>
          `).join('')}
        </div>

        <h3>Background</h3>
        <div class="settings-grid">
          ${backgrounds.map(x => `
            <button class="branded-button ${background === x.value ? 'active' : ''}" data-tooltip="Set opacity to ${x}" data-background="${x.value}" style="background: ${background === x.value ? 'white' : x.value}">
              ${x.key}
            </button>
          `).join('')}
        </div>
      </div>
    `
  },
  [views.social]: function (target) {
    const { view } = $.learn()

    if(target.view === view) return

    return `
      <div style="display: grid; grid-template-rows: auto 1fr; height: 100%;">
        <div style="background: black; text-align: right;">
          <button data-cancel class="branded-button">
            Close
          </button>
        </div>
        <face-less></face-less>
      </div>
    `
  },
  [views.settings]: function (target) {
      const {
      transcriptionEnabled,
      videoEnabled,
      audioEnabled,
      chromakeyEnabled,
      chromakeyColor,
      passphrase
    } = $.learn()

    return `
      <div style="text-align: right; position: sticky; top: 0;">
        <button data-cancel class="branded-button">Close</button>
      </div>
      <div class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3>Video</h3>
        <div>
          <button class="branded-button" data-toggle-video>
            ${videoEnabled?'on':'off'}
          </button>
        </div>

        <h3>Audio</h3>
        <div>
          <button class="branded-button" data-toggle-audio>
            ${audioEnabled?'on':'off'}
          </button>
        </div>

        <h3>Chromakey</h3>
        <div>
          <button class="branded-button" data-toggle-chromakey>
            ${chromakeyEnabled?'on':'off'}
          </button>
        </div>
        <p style="font-size: 0.9em; color: #666; padding: 0 0.5rem;">
          Draw with ${chromakeyColor} to reveal video beneath
        </p>

        <h3>Live Stream</h3>
        <div>
          <label class="field">
            <span class="label">Passphrase</span>
            <input data-bind name="passphrase" type="password" value="${escapeHyperText(passphrase)}"/>
          </label>
        </div>

        <h3>Transcription</h3>
        <div>
          <button class="branded-button" data-toggle-transcription>
            ${transcriptionEnabled?'on':'off'}
          </button>
        </div>
      </div>
    `
  },
  [views.share]: function share(target) {
    const { view } = $.learn()

    if(target.view === view) return

    const shareLink = `${self.location.origin}/app/${$.link}?id=${target.closest($.link).id}`
    const copyId = self.crypto.randomUUID()
    const label = target.getAttribute('label') || 'Pluto'

    return `
      <div style="display: flex;">
        <button data-copy="${copyId}" class="branded-button">
          Copy
        </button>
        <div id="${copyId}" class="share-link-copyable-url standard-input -small">${shareLink}</div>
        <button data-cancel class="branded-button" style="margin-left: auto;">
          Close
        </button>
      </div>

      <div class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3>Share</h3>

        <div style="padding: 51px; height: 100%; display: flex; flex-direction: column;">
          <qr-code src="${self.location.origin}/app/${$.link}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
        </div>
      </div>
    `
  }
}

/*
Convert any color format to RGB values
*/
const colorCache = new Map()

function hexToRgb(colorString) {
  if (colorCache.has(colorString)) {
    return colorCache.get(colorString)
  }
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = colorString
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  const result = { r, g, b }

  if (colorCache.size > 100) {
    colorCache.delete(colorCache.keys().next().value)
  }
  colorCache.set(colorString, result)
  return result
}

/*
Calculate color distance in RGB space
*/
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  )
}

$.when('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.teach({ color, showOverlay: false, view: null, objectId: null })
})

$.when('click', '[data-thickness]', function  (event) {
  event.preventDefault()
  $.mouth({
    thickness: Integer(event.target.dataset.thickness) || 1,
  })
})

$.when('click', '[data-opacity]', function  (event) {
  event.preventDefault()
  $.mouth({
    opacity: Float(event.target.dataset.opacity),
  })
})



/*

And while dog created man, he imbued them with free will

Free to make their own mistakes, they did.

*/

class VLog extends HTMLElement {
  constructor() {
    super();
    // Don't initialize anything in constructor for iOS Safari compatibility
  }

  connectedCallback() {
    // Initialize instance properties here instead of constructor
    if (this._initialized) return;
    this._initialized = true;
    this._isDestroyed = false;
    this._animationFrameId = null;
    this._chromakeyCanvas = null;
    this._chromakeyCtx = null;
    this._chromakeyProcessor = null;

    $.draw(() => null, {
      beforeUpdate: this.beforeUpdate,
      afterUpdate: this.afterUpdate
    })

    loadAllDevices()

    this.init(this)

    this.orientationHandler = () => handleOrientationChange(this)
    window.addEventListener('resize', this.orientationHandler)
  }

  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
    }

    {
      const { beltGrabbed } = $.learn()
      target.dataset.belt = beltGrabbed ? 'true' : 'false'
    }

    {
      const { kind } = $.learn()
      if(kind) {
        target.dataset.device = kind
      } else {
        delete target.dataset.device
      }
    }

    {
      const { showDeviceList } = $.learn()
      target.dataset.showDeviceList = showDeviceList
    }

    {
      const { showModeList } = $.learn()
      target.dataset.showModeList = showModeList
    }

    {
      const { mode } = $.learn()
      target.dataset.activeMode = mode
    }

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

    if(this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null
    }

    if (this.orientationHandler) {
      window.removeEventListener('resize', this.orientationHandler)
    }

    this._isDestroyed = true
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId)
      this._animationFrameId = null
    }

    if (this._chromakeyCanvas) {
      this._chromakeyCanvas = null
      this._chromakeyCtx = null
    }

    if (this._chromakeyProcessor) {
      this._chromakeyProcessor.destroy()
      this._chromakeyProcessor = null
    }

    // Reset for potential reconnection
    this._initialized = false
  }

  async init(target) {
    target._chromakeyProcessor = new Chromakey()

    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="footer">
          <div class="left">
            <div class="device-list"></div>
            <button data-device-toggle class="branded-button">
              Devices
            </button>
          </div>

          <div class="center">
            <div class="fixed-center">
              <button data-show-mode="photo" data-screenshot class="">
                <sl-icon name="camera"></sl-icon>
              </button>
              <button data-show-mode="video" data-toggle-recording class="">
                <sl-icon name="camera-video" class="camera-status"></sl-icon>
              </button>
            </div>
          </div>

          <div class="right">
            <div style="margin-left: auto;">
              <div class="mode-list">
                <div>
                  <button data-mode="photo" class="branded-button">
                    Photo
                  </button>
                </div>
                <div>
                  <button data-mode="video" class="branded-button">
                    Video
                  </button>
                </div>
              </div>
              <button data-mode-toggle class="branded-button">
                Mode
              </button>
            </div>
          </div>
        </div>
        <div class="taskbar -top">
          <div class="left">
          </div>
          <div class="center"></div>
          <div class="right">
          </div>
        </div>
        <div class="taskbar -bottom">
          <div class="left">
          </div>
          <div class="center" style="padding: 1rem;" data-primary-action></div>
          <div class="right">
          </div>
        </div>

        <div class="viewport">
          <div class="lingustics">
            <div class="partial"></div>
          </div>
          <div class="letterbox">
            <video playsinline disablePictureInPicture class="input-video"></video>
            <video playsinline disablePictureInPicture class="recorded-playback" style="display: none;"></video>
            <div class="cursor-tooltips"></div>
          </div>
        </div>

        <div class="panel-area"></div>
        <div class="overlay-area"></div>
      `
      this.afterUpdate(target)
    }

    {
      const { videoEnabled, audioEnabled } = $.learn()
      if (videoEnabled || audioEnabled) {
        await setMediaStream(target)
      }
    }

    // Setup video element even if stream is not available yet
    target.video = target.querySelector('video.input-video')
    target.video.muted = true
    target.video.autoplay = true;

    const { videoEnabled } = $.learn()

    // Only setup video stream if enabled
    if (videoEnabled && target.webcamStream) {
      target.video.srcObject = target.webcamStream;
      await new Promise((resolve) => {
        target.video.addEventListener('loadedmetadata', resolve, { once: true });
      });
    }

    // Setup canvases with default dimensions or from video if available
    const { width, height } = calculateCanvasDimensions(target)

    // LAYER 1: Historical strokes (only redraws when history changes)
    {
      const letterbox = target.querySelector('.letterbox')
      target.inputCanvas = document.createElement('canvas')
      target.inputCanvas.classList.add('input-canvas')
      target.inputCanvas.width = width;
      target.inputCanvas.height = height;
      target.inputCanvasCtx = target.inputCanvas.getContext('2d', { willReadFrequently: false })
      letterbox.appendChild(target.inputCanvas)
    }

    // LAYER 2: Container for per-player active stroke canvases
    {
      const letterbox = target.querySelector('.letterbox')
      target.playerCanvasContainer = document.createElement('div')
      target.playerCanvasContainer.classList.add('player-canvases')
      letterbox.appendChild(target.playerCanvasContainer)
      target.playerCanvases = {}
    }

    // LAYER 3: Final composite (video + all layers)
    {
      const letterbox = target.querySelector('.letterbox')
      target.outputCanvas = document.createElement('canvas')
      target.outputCanvas.classList.add('output-canvas')
      target.outputCanvas.width = width;
      target.outputCanvas.height = height;
      target.outputCanvasCtx = target.outputCanvas.getContext('2d')
      letterbox.appendChild(target.outputCanvas)
    }

    {
      target._chromakeyCanvas = document.createElement('canvas')
      target._chromakeyCanvas.width = width
      target._chromakeyCanvas.height = height
      target._chromakeyCtx = target._chromakeyCanvas.getContext('2d', { willReadFrequently: true })
    }

    setupCompositeLoop(target)

    {
      const { transcriptionEnabled } = $.learn()
      if (transcriptionEnabled) {
        initializeVosk(target)
      }
    }

    {
      //requestAnimationFrame(gameLoop.bind({ id: playerId }))
    }

    {
      $.teach({
        musicX: Math.floor(columns/2),
        musicY: Math.floor(rows/2) - spatialOffset,
        activeNotes: {},
        root: center,
        rows,
        columns,
        orientation,
        camera
      }, {
        mergeHandler: mergePlayer,
        parameters: [playerId]
      }, {
        bypassSecurity: true
      })

    }
  }

  afterUpdate(target) {
    if(!target.innerHTML) return

    const {
      partial='',
      recording,
      showList,
      showOverlay,
      strokeHistory,
      strokeRevisory,
      view,
      players
    } = $.learn()

    // Initialize tracking if needed
    if (!target._lastHistoryLength) {
      target._lastHistoryLength = 0
      target._lastRevisoryLength = 0
      target._lastPlayerStrokeLengths = {}
    }

    // Check if historical strokes changed
    const historyChanged = target._lastHistoryLength !== strokeHistory.length
    const revisoryChanged = target._lastRevisoryLength !== strokeRevisory.length

    if (historyChanged || revisoryChanged) {
      target._lastHistoryLength = strokeHistory.length
      target._lastRevisoryLength = strokeRevisory.length

      if (!target._historyRedrawScheduled) {
        target._historyRedrawScheduled = true
        requestAnimationFrame(() => {
          if (!target._isDestroyed) drawHistoricalStrokes(target)
          target._historyRedrawScheduled = false
        })
      }
    }

    // Check which players' active strokes changed
    const currentPlayers = new Set(Object.keys(players || {}))
    const lastPlayers = new Set(Object.keys(target._lastPlayerStrokeLengths))

    // Remove canvases for players who left
    for (const playerId of lastPlayers) {
      if (!currentPlayers.has(playerId)) {
        removePlayerCanvas(target, playerId)
        delete target._lastPlayerStrokeLengths[playerId]
      }
    }

    // Update canvases for players whose strokes changed
    for (const pid of currentPlayers) {
      const player = players[pid]
      const currentStroke = player.currentStroke || []
      const lastLength = target._lastPlayerStrokeLengths[pid] || 0

      if (currentStroke.length !== lastLength) {
        target._lastPlayerStrokeLengths[pid] = currentStroke.length

        if (currentStroke.length === 0) {
          // Player finished their stroke, clear their canvas
          const canvas = target.playerCanvases[pid]
          if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        } else {
          // Player is drawing, update their canvas
          drawPlayerStroke(target, pid, currentStroke)
        }
      }
    }

    {
      // Update cursor tooltips for all players
      const tooltipsContainer = target.querySelector('.cursor-tooltips')
      if (tooltipsContainer) {
        const tooltipHTML = Object.entries(players || {})
          .filter(([pid, player]) => pid !== playerId && player.activelyDrawing)
          .map(([pid, player]) => {
            return `
              <div class="cursor-tooltip" style="left: ${player.cursorX}px; top: ${player.cursorY}px; background: ${player.color || 'rgba(0,0,0,0.8)'}">
                Player ${pid.slice(0, 6)}
              </div>
            `
          })
          .join('')

        innerHTML(tooltipsContainer, tooltipHTML)
      }
    }

    {
      const { color } = $.learn()
      target.style.setProperty("--active-color", color);
    }

    {
      const partialContainer = target.querySelector('.partial')
      const cameraStatus = target.querySelector('.camera-status')

      innerHTML(partialContainer, partial)

      if(recording !== target.lastRecording) {
        target.lastRecording = recording
        target.dataset.recording = recording
        cameraStatus.setAttribute('name', recording ? 'camera-video-off' : 'camera-video')
      }
    }

    {
      const { devicesByKind } = $.learn()
      const deviceList = target.querySelector('.device-list')
      if(devicesByKind !== target._lastDevicesByKind) {
        target._lastDevicesByKind = devicesByKind
        innerHTML(deviceList, deviceMenu(target))
      }
    }

    if(showList) {
      const area = document.querySelector('.panel-area')
      const clips = $.learn().history.map(x => {
        return `
          <div class="memex-row">
            <div>
              <button data-play="${x.src}" class="clip standard-button -stealth">
                <div class="clip-title">${x.title}</div>
                <div class="clip-author">${x.author}</div>
                <div class="clip-time">${x.when}</div>
              </button>
            </div>
            <div>
              <button data-edit="${x.id}" class="standard-button -round -stealth">
                <sl-icon name="pencil"></sl-icon>
              </button>
            </div>
          </div>
        `
      }).join('')

      const copyId = self.crypto.randomUUID()
      const permalink = `${self.location.origin}/app/${$.link}?id=${target.id}`

      area.innerHTML = `
        <div style="display: flex;">
          <button data-copy="${copyId}" class="branded-button">
            Copy Link
          </button>
          <button style="margin-left: auto;" data-cancel class="branded-button">
            Close
          </button>
        </div>
        <div class="share-area">
          <div id="${copyId}" style="height: 0px; overflow: hidden; opacity: 0;">${permalink}</div>
          </div>
        </div>
        <div class="playlist">${clips}</div>
        <div class="instructions">Record a video and it will display here.</div>
      `
      target.dataset.showList = true
    } else {
      const area = document.querySelector('.panel-area')
      target.dataset.showList = false
      if(area.innerHTML) area.innerHTML = ''
    }

    if(showOverlay) {
      const area = document.querySelector('.overlay-area')
      const html = (viewRenderers[view] || (() => '404'))(target)
      if(html) {
        innerHTML(area, html)
      }
      target.dataset.showOverlay = true
    } else {
      const area = document.querySelector('.overlay-area')
      target.dataset.showOverlay = false
      if(area.innerHTML) area.innerHTML = ''
    }

    {
      const { background } = $.learn()

      if(target.background !== background) {
        target.background = background
        target.style.setProperty('--background', background)

        if (!target._historyRedrawScheduled) {
          target._historyRedrawScheduled = true
          requestAnimationFrame(() => {
            if (!target._isDestroyed) drawHistoricalStrokes(target)
            target._historyRedrawScheduled = false
          })
        }
      }
    }

    {
      const { xrEnabled } = $.learn()
      if(target.xrEnabled !== xrEnabled) {
        target.xrEnabled = xrEnabled

        if (xrEnabled) {
          enableCameraRigging(target)
        } else {
          disableCameraRigging(target)
        }
      }
    }

    target.view = view
  }
}

$.when('click', '[data-mode]', (event) => {
  $.teach({ mode: event.target.dataset.mode })
})

$.when('click', '[data-mode-toggle]', (event) => {
  $.teach({ showModeList: !$.learn().showModeList })
})

$.when('click', '[data-device-toggle]', (event) => {
  $.teach({ showDeviceList: !$.learn().showDeviceList })
})

$.when('click', '[data-kind]', (event) => {
  const { kind } = $.learn()

  if(kind !== event.target.dataset.kind) {
    $.teach({ kind: event.target.dataset.kind })
  } else {
    $.teach({ kind: null })
  }
})

$.style(`

  & .device-list {
    display: none;
    position: absolute;
    top: 0;
    transform: translateY(-100%);
  }

  & .mode-list {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    transform: translateY(-100%);
  }

  & .device-options {
    display: none;
  }

   &[data-device="audioinput"] [data-device-kind="audioinput"] .device-options,
  &[data-device="audiooutput"] [data-device-kind="audiooutput"] .device-options,
  &[data-device="videoinput"] [data-device-kind="videoinput"] .device-options {
    display: block;
  } 

  &[data-device="audioinput"] [data-kind="audioinput"],
  &[data-device="audiooutput"] [data-kind="audiooutput"],
  &[data-device="videoinput"] [data-kind="videoinput"] {
    background: dodgerblue;
    text-shadow: revert;
  }

  & .device-options .branded-button.active {
    background: gold;
    text-shadow: revert;
  }

  &[data-active-mode="photo"] .mode-list [data-mode="photo"],
  &[data-active-mode="video"] .mode-list [data-mode="video"] {
    background: mediumseagreen;
    text-shadow: revert;
  }

  &[data-show-device-list="true"] .device-list {
    display: block;
  }

  &[data-show-device-list="true"] [data-device-toggle] {
    background: darkorange;
    text-shadow: revert;
  }

  &[data-show-mode-list="true"] .mode-list {
    display: block;
  }

  &[data-show-mode-list="true"] [data-mode-toggle] {
    background: mediumpurple;
    text-shadow: revert;
  }

  & [data-show-mode] {
    display: none;
    width: 46px;
    height: 46px;
    border: 3px solid black;
    border-radius: 100%;
    border-radius: 100%;
    place-items: center;
    background: white;
    color: black;
  }

  &[data-active-mode="video"] [data-show-mode="video"] {
    display: grid;
  }

  &[data-active-mode="photo"] [data-show-mode="photo"] {
    display: grid;
  }

  &[data-recording="true"] [data-show-mode="video"] {
    background: firebrick;
    border: 3px solid white;
    color: white;
  }
`)

$.when('click', '*:not([data-device-toggle])', (event) => {
  if(event.target.closest('.device-list')) {
    return
  }
  $.teach({ showDeviceList: false })
})

$.when('click', '*:not([data-mode-toggle])', (event) => {
  if(event.target.closest('.mode-list')) {
    return
  }
  $.teach({ showModeList: false })
})


function deviceMenu(target) {
  const { devicesByKind, selectedVideoDeviceId, selectedAudioDeviceId, selectedAudioOutputDeviceId } = $.learn()

  const menuItems = []
  for(const kind in devicesByKind) {
    const devices = devicesByKind[kind].map(x => {
      // Check if this device is currently selected
      const isSelected =
        (kind === 'videoinput' && selectedVideoDeviceId === x.deviceId) ||
        (kind === 'audiooutput' && selectedAudioOutputDeviceId === x.deviceId) ||
        (kind === 'audioinput' && selectedAudioDeviceId === x.deviceId)

      return `
        <button
          class="branded-button ${isSelected ? 'active' : ''}"
          data-${kind}="${x.deviceId}"
        >
          ${x.label || `${kind} ${x.deviceId.slice(0, 8)}`}
        </button>
      `
    }).join('')

     menuItems.push(`
      <div data-device-kind="${kind}" class="device-kind">
        <div class="device-options">
          ${devices}
        </div>
        <button data-kind="${kind}" class="branded-button">
          ${kind}
        </button>
      </div>
    `)
  }

  return `
    ${menuItems.join('')}
  `
}

/*

And dog demanded resolution and quality

*/

function calculateCanvasDimensions(target) {
  const { videoEnabled } = $.learn()

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const isPortrait = windowHeight > windowWidth
  const isSquare = Math.abs(windowWidth - windowHeight) < 100

  let width, height

  if (isSquare) {
    width = height = 1080
  } else if (isPortrait) {
    width = 1080
    height = 1920
  } else {
    width = 1920
    height = 1080
  }

  return { width, height, isPortrait, isSquare }
}

async function setMediaStream(target) {
  if (cameraLock) {
    return
  }

  cameraLock = true

  try {
    const {
      facingMode,
      videoEnabled,
      audioEnabled,
      selectedVideoDeviceId,
      selectedAudioDeviceId
    } = $.learn()

    if (!videoEnabled && !audioEnabled) {
      if (target.webcamStream) {
        target.webcamStream.getTracks().forEach(track => track.stop());
        target.webcamStream = null
      }
      if (target.video) {
        target.video.srcObject = null
      }
      return
    }

    if (target.webcamStream) {
      if (target.video) {
        target.video.srcObject = null
      }
      target.webcamStream.getTracks().forEach(track => {
        track.stop();
      });
      target.webcamStream = null
    }

    const constraints = {}

    if (videoEnabled) {
      const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }

      if (selectedVideoDeviceId) {
        videoConstraints.deviceId = { exact: selectedVideoDeviceId }
      } else {
        videoConstraints.facingMode = facingMode
      }

      constraints.video = videoConstraints
    }

    if (audioEnabled) {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate
      }

      if (selectedAudioDeviceId) {
        audioConstraints.deviceId = { exact: selectedAudioDeviceId }
      }

      constraints.audio = audioConstraints
    }

    // Try with exact constraints first
    try {
      target.webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (exactError) {
      console.warn('⚠️ Exact constraints failed, trying ideal:', exactError.message)

      // Fallback: try with ideal
      if (videoEnabled && constraints.video) {
        const { isPortrait, isSquare } = calculateCanvasDimensions(target)

        if (isPortrait) {
          constraints.video.width = { ideal: 1080 }
          constraints.video.height = { ideal: 1920 }
        } else if (isSquare) {
          constraints.video.width = { ideal: 1440 }
          constraints.video.height = { ideal: 1440 }
        } else {
          constraints.video.width = { ideal: 1920 }
          constraints.video.height = { ideal: 1080 }
        }

        target.webcamStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Flag that we need to crop
        target.needsVideoCrop = true
      } else {
        throw exactError
      }
    }

    if (videoEnabled && target.webcamStream) {
      const videoTrack = target.webcamStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      const { isPortrait } = calculateCanvasDimensions(target)
      const gotPortrait = settings.height > settings.width

      if (isPortrait !== gotPortrait) {
        console.error('❌ Still got wrong orientation - enabling crop mode')
        target.needsVideoCrop = true
      } else {
        target.needsVideoCrop = false
      }
    }

    if (videoEnabled && target.video) {
      target.video.srcObject = target.webcamStream;
      target.video.muted = true;
      target.video.autoplay = true;

      await new Promise((resolve, reject) => {
        if (target.video.readyState >= 2) {
          resolve();
        } else {
          target.video.addEventListener('loadedmetadata', resolve, { once: true });
          target.video.addEventListener('error', reject, { once: true });
        }
      });

      try {
        await target.video.play();
      } catch (e) {
        console.log('Video autoplay blocked (this is normal):', e.message);
      }
    }

    if (target.webcamStream) {
      const videoTrack = target.webcamStream.getVideoTracks()[0]
      const audioTrack = target.webcamStream.getAudioTracks()[0]
      const updates = {}

      if (videoTrack && !$.learn().selectedVideoDeviceId) {
        const settings = videoTrack.getSettings()
        if (settings.deviceId) {
          updates.selectedVideoDeviceId = settings.deviceId
        }
      }

      if (audioTrack && !$.learn().selectedAudioDeviceId) {
        const settings = audioTrack.getSettings()
        if (settings.deviceId) {
          updates.selectedAudioDeviceId = settings.deviceId
        }
      }

      if (Object.keys(updates).length > 0) {
        $.teach(updates)
      }
    }

    const { transcriptionEnabled } = $.learn()
    if (transcriptionEnabled && audioEnabled && !target.voskContext) {
      await initializeVosk(target)
    }
  } catch (error) {
    console.error('Error setting media stream:', error)
    toast(`Failed to access media devices: ${error.message}`)
    if (error.name === 'NotAllowedError') {
      toast('Camera/microphone permission denied')
    } else if (error.name === 'NotReadableError' || error.message.includes('videosource')) {
      toast('Camera is busy or unavailable. Please close other apps using the camera.')
    }
  } finally {
    cameraLock = false
  }

  await loadAllDevices()

  // Sync default audio output after devices are enumerated
  if (!$.learn().selectedAudioOutputDeviceId) {
    const { devicesByKind } = $.learn()
    if (devicesByKind.audiooutput?.length > 0) {
      $.teach({ selectedAudioOutputDeviceId: devicesByKind.audiooutput[0].deviceId })
    }
  }
}

async function handleOrientationChange(target) {
  const { videoEnabled } = $.learn()

  // If video is enabled, restart the stream FIRST with new constraints
  if (videoEnabled) {
    await setMediaStream(target)

    // Wait for video to be ready
    if (target.video && target.video.srcObject) {
      await new Promise((resolve) => {
        if (target.video.readyState >= 2) {
          resolve()
        } else {
          target.video.addEventListener('loadedmetadata', resolve, { once: true })
        }
      })
    }
  }

  // NOW detect orientation and get dimensions (potentially from updated video)
  const { width, height } = calculateCanvasDimensions(target)

  // Update canvas dimensions
  if (target.inputCanvas) {
    target.inputCanvas.width = width
    target.inputCanvas.height = height
  }

  if (target.outputCanvas) {
    target.outputCanvas.width = width
    target.outputCanvas.height = height
  }

  // Update all player canvases
  for (const pid in target.playerCanvases) {
    const canvas = target.playerCanvases[pid]
    canvas.width = width
    canvas.height = height
  }

  // Redraw everything with new dimensions
  drawHistoricalStrokes(target)
}

async function loadAllDevices() {
  const devicesByKind = {}

  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {
    // List cameras and microphones.
    await navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if(!devicesByKind[device.kind]) {
            devicesByKind[device.kind] = []
          }
          if(device.deviceId) {
            devicesByKind[device.kind].push(device)
          }
        });

        $.teach({ devicesByKind })
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

/*

And dog saw it fit for man to see their mistakes.

*/

$.when('click', '[data-play]', (event) => {
  const { play } = event.target.dataset
  showModal(`
    <div style="height: 100%; background: rgba(128,128,128,1); overflow: auto; width: 100%;">
      <was-video src="${play}"></was-video>
    </div>
  `, {
    blockExit: false,
    onHide: () => $.teach({ popped: false })
  })
})

/*

And man was vain while dog was not.

So rather than only allow dog photos, dog allowed man to turn the camera in.

*/

$.when('click', '[data-background]', async (event) => {
  const { background } = event.target.dataset
  $.teach({ background })
  drawHistoricalStrokes(event.target.closest($.link))
})

$.when('click', '[data-flip]', async (event) => {
  const { facingMode } = $.learn()

  if(facingMode === 'environment') {
    $.teach({ facingMode: 'user' })
  } else {
    $.teach({ facingMode: 'environment' })
  }

  const target = event.target.closest($.link)
  await setMediaStream(target)
})

/*

Toggle video on/off

*/

$.when('click', '[data-toggle-video]', async (event) => {
  const { videoEnabled, selectedVideoDeviceId, devicesByKind } = $.learn()
  const newState = !videoEnabled

  // If enabling video and no device selected yet, pick the first one
  if (newState && !selectedVideoDeviceId && devicesByKind.videoinput?.length > 0) {
    const firstVideoDevice = devicesByKind.videoinput[0]
    $.teach({
      videoEnabled: newState,
      selectedVideoDeviceId: firstVideoDevice.deviceId
    })
  } else {
    $.teach({ videoEnabled: newState })
  }

  const target = event.target.closest($.link)
  await setMediaStream(target)

  // Update video element and reinitialize canvases with proper dimensions
  if (newState && target.webcamStream && target.video) {
    target.video.srcObject = target.webcamStream
    target.video.muted = true
    target.video.autoplay = true

    // Explicitly play the video
    try {
      await target.video.play()
    } catch (e) {
      console.error('Error playing video:', e)
    }

    // Wait for video metadata to load
    await new Promise((resolve) => {
      if (target.video.readyState >= 2) {
        resolve()
      } else {
        target.video.addEventListener('loadedmetadata', resolve, { once: true })
      }
    })

    // Update canvas dimensions based on actual video
    const { width, height } = calculateCanvasDimensions(target)

    if (target.inputCanvas && target.outputCanvas) {
      target.inputCanvas.width = width
      target.inputCanvas.height = height
      target.outputCanvas.width = width
      target.outputCanvas.height = height

      // Update all player canvases
      for (const pid in target.playerCanvases) {
        const canvas = target.playerCanvases[pid]
        canvas.width = width
        canvas.height = height
      }

      // Redraw with new dimensions
      drawHistoricalStrokes(target)
    }
  } else if (!newState && target.video) {
    // Turn off video
    target.video.srcObject = null
  }
})

/*

Toggle audio on/off

*/

$.when('click', '[data-toggle-audio]', async (event) => {
  const { audioEnabled, selectedAudioDeviceId, devicesByKind } = $.learn()
  const newState = !audioEnabled

  // If enabling audio and no device selected yet, pick the first one
  if (newState && !selectedAudioDeviceId && devicesByKind.audioinput?.length > 0) {
    const firstAudioDevice = devicesByKind.audioinput[0]
    $.teach({
      audioEnabled: newState,
      selectedAudioDeviceId: firstAudioDevice.deviceId
    })
  } else {
    $.teach({ audioEnabled: newState })
  }

  const target = event.target.closest($.link)
  await setMediaStream(target)

  // Handle Vosk transcription when audio changes
  const { transcriptionEnabled } = $.learn()
  if (transcriptionEnabled) {
    if (newState && !target.voskContext) {
      await initializeVosk(target)
    } else if (!newState && target.voskContext) {
      const { audioContext, recognizerProcessor, source } = target.voskContext
      source.disconnect()
      recognizerProcessor.disconnect()
      await audioContext.close()
      target.voskContext = null
    }
  }
})

/*

And dog provided a panel with a list of all memories

*/

$.when('click', '[data-color-picker]', () => {
  $.teach({ showOverlay: true, view: views.color })
})

$.when('click', '[data-brush-picker]', () => {
  $.teach({ showOverlay: true, view: views.brush })
})

$.when('click', '[data-share]', () => {
  $.teach({ showOverlay: true, view: views.share })
})


$.when('click', '[data-settings]', () => {
  $.teach({ showOverlay: true, view: views.settings })
})

$.when('click', '[data-social]', () => {
  $.teach({ showOverlay: true, view: views.social })
})

/*

And dog let man assume the role of producer with a clipboard

*/

function copyToClipboard(target) {
  if (document.selection) {
    const range = document.body.createTextRange();
    range.moveToElementText(target);
    range.select().createTextRange();
    document.execCommand("copy");
    toast("Copied to clipboard")
  } else if (self.getSelection) {
    const range = document.createRange();
    range.selectNode(target);
    self.getSelection().addRange(range);
    document.execCommand("copy");
    toast("Copied to clipboard")
  }
  self.getSelection().removeAllRanges()
}

/*

And a button to easily copy the dailies to share back with dog

*/

$.when('click', '[data-copy]', (event) => {
  const { copy } = event.target.dataset
  const targetToCopy = event.target.closest($.link).querySelector(`[id="${copy}"]`)
  copyToClipboard(targetToCopy)
})

/*


*/

$.when('click', '[data-edit]', (event) => {
  const { edit } = event.target.dataset
  const { showOverlay, history } = $.learn()

  const object = history.find(x => edit === x.id)

  if(object) {
    $.teach({ showOverlay: true, view: views.edit, objectId: object.id, draft: object })
  }
})

/*

And dog gave man the ability to close without changes

*/

$.when('click', '[data-cancel]', (event) => {
  $.teach({
    showOverlay: false,
    view: null,
    objectId: null
  })
})

/*

And the ability to save to dog with them

*/

$.when('click', '[data-save]', (event) => {
  const { draft } = $.learn()
  $.teach(draft, replaceInHistoricalRecord)
  $.teach({ view: null, objectId: null, showOverlay: false })
  toast("Memex updated.")
})

/*

And dog provided a way to declaratively bind data and views

*/


$.when('input', '[data-bind]', function handleBind(event) {
  const { bind } = event.target.dataset
  if(bind) {
    $.whisper({
      name: event.target.name,
      value: event.target.value
    }, bound(bind))
  } else {
    $.whisper({
      [event.target.name]: event.target.value,
    })
  }
})

/*

And dog taught man the lambda calculus

*/

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  }
}

/*

And dog allowed man some control of hyper space, but not all

*/

function escapeHyperText(text = '') {
  if(!text) return ''
  return text.replace(/[&<>'"]/g,
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

/*

And once again, Dog committed lines of syntax to satiate the higher powers

*/
try {
  customElements.define(tag, VLog);
} catch (e) {
  console.error(e)
}

function engine(target) {
  const root = target.closest($.link)
  const inputCanvas = root.querySelector('.input-canvas')
  const outputCanvas = root.querySelector('.output-canvas')

  if(!inputCanvas) return {}
  const rectangle = inputCanvas.getBoundingClientRect()

  // Calculate scales accounting for object-fit: contain
  const canvasAspect = inputCanvas.width / inputCanvas.height
  const displayAspect = rectangle.width / rectangle.height

  let scaleX, scaleY, offsetX = 0, offsetY = 0

  if (canvasAspect > displayAspect) {
    // Canvas is wider - letterboxed top/bottom
    scaleX = inputCanvas.width / rectangle.width
    scaleY = scaleX
    // Calculate vertical offset due to letterboxing
    const displayedHeight = rectangle.width / canvasAspect
    offsetY = (rectangle.height - displayedHeight) / 2
  } else {
    // Canvas is taller - letterboxed left/right
    scaleY = inputCanvas.height / rectangle.height
    scaleX = scaleY
    // Calculate horizontal offset due to letterboxing
    const displayedWidth = rectangle.height * canvasAspect
    offsetX = (rectangle.width - displayedWidth) / 2
  }

  return {
    root,
    inputCanvas,
    outputCanvas,
    rectangle,
    scaleX,
    scaleY,
    offsetX,
    offsetY
  }
}

$.when('click', '[data-new]', function (event) {
  event.preventDefault()
  $.teach({ strokeHistory: [], strokeRevisory: [] })
  drawHistoricalStrokes(event.target.closest($.link))
})

$.when('click', '[data-undo]', function undoDraw (event) {
  event.preventDefault()
  const { strokeHistory } = $.learn()
  if(strokeHistory.length === 0) {
    return
  }

  $.teach({}, (state, _payload) => {
    const newState = { ...state }
    const stroke = newState.strokeHistory.pop()
    newState.strokeRevisory.unshift(stroke)
    return {
      ...newState
    }
  })
  drawHistoricalStrokes(event.target.closest($.link))
})

$.when('click', '[data-redo]', function redoDraw (event) {
  event.preventDefault()
  const { strokeRevisory } = $.learn()
  if(strokeRevisory.length === 0) return


  $.teach({}, (state, _payload) => {
    const newState = { ...state }
    const stroke = newState.strokeRevisory.shift()
    newState.strokeHistory.push(stroke)
    return {
      ...newState
    }
  })

  drawHistoricalStrokes(event.target.closest($.link))
})

/*

OPTIMIZED DRAWING FUNCTIONS - MULTIPLAYER AWARE

*/

function getOrCreatePlayerCanvas(target, playerId) {
  if (target.playerCanvases[playerId]) {
    return {
      canvas: target.playerCanvases[playerId],
      ctx: target.playerCanvasContexts[playerId]
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = target.inputCanvas.width
  canvas.height = target.inputCanvas.height
  canvas.classList.add('player-canvas')
  canvas.dataset.playerId = playerId
  target.playerCanvasContainer.appendChild(canvas)

  const ctx = canvas.getContext('2d', { willReadFrequently: false })

  target.playerCanvases[playerId] = canvas
  target.playerCanvasContexts = target.playerCanvasContexts || {}
  target.playerCanvasContexts[playerId] = ctx

  return { canvas, ctx }
}

function removePlayerCanvas(target, playerId) {
  const canvas = target.playerCanvases[playerId]
  if (canvas) {
    canvas.remove()
    delete target.playerCanvases[playerId]
  }
}

function drawHistoricalStrokes(target) {
  const { inputCanvas, inputCanvasCtx } = target
  if (!inputCanvas || !inputCanvasCtx) return

  const { strokeHistory, background } = $.learn()
  const context = inputCanvasCtx

  // Clear and draw background
  context.clearRect(0, 0, inputCanvas.width, inputCanvas.height)
  context.globalAlpha = 1
  context.fillStyle = background
  context.fillRect(0, 0, inputCanvas.width, inputCanvas.height)

  // Draw only completed historical strokes
  strokeHistory.forEach(stroke => {
    if (stroke.length < 2) return
    drawStroke(context, stroke)
  })
}

function drawPlayerStroke(target, playerId, stroke) {
  if (!stroke || stroke.length < 2) return

  const { canvas, ctx } = getOrCreatePlayerCanvas(target, playerId)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawStroke(ctx, stroke)
}

function drawStroke(context, stroke) {
  context.beginPath()
  context.moveTo(stroke[0].x, stroke[0].y)

  for (let i = 1; i < stroke.length; i++) {
    const point = stroke[i]
    context.strokeStyle = point.color || 'dodgerblue'
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.globalAlpha = point.opacity ?? 1
    context.lineWidth = point.lineWidth || 16

    if (i < stroke.length - 1) {
      const xc = (stroke[i].x + stroke[i + 1].x) / 2
      const yc = (stroke[i].y + stroke[i + 1].y) / 2
      context.quadraticCurveTo(point.x, point.y, xc, yc)
    } else {
      context.lineTo(point.x, point.y)
    }
  }

  context.stroke()
}

function setupCompositeLoop(target) {
  const ctx = target.outputCanvas.getContext('2d')

  const drawComposite = () => {
    if (target._isDestroyed) return
    const { videoEnabled, chromakeyEnabled, chromakeyColor, chromakeyTolerance } = $.learn()
    const currentWidth = target.outputCanvas.width
    const currentHeight = target.outputCanvas.height

    ctx.clearRect(0, 0, currentWidth, currentHeight)

    // LAYER 1: Draw video if enabled
    if (videoEnabled && target.video && target.video.videoWidth > 0) {
      const videoWidth = target.video.videoWidth
      const videoHeight = target.video.videoHeight
      const videoAspect = videoWidth / videoHeight
      const canvasAspect = currentWidth / currentHeight

      let drawWidth, drawHeight, offsetX, offsetY

      if (videoAspect > canvasAspect) {
        // Video is wider than canvas - fit to width, letterbox top/bottom
        drawWidth = currentWidth
        drawHeight = currentWidth / videoAspect
        offsetX = 0
        offsetY = (currentHeight - drawHeight) / 2
      } else {
        // Video is taller than canvas - fit to height, letterbox left/right
        drawHeight = currentHeight
        drawWidth = currentHeight * videoAspect
        offsetX = (currentWidth - drawWidth) / 2
        offsetY = 0
      }

      ctx.drawImage(target.video, offsetX, offsetY, drawWidth, drawHeight)
    }

    // LAYER 2+3: Draw strokes with chromakey processing if enabled
    if (chromakeyEnabled && videoEnabled && target._chromakeyProcessor?.gl) {
      const tempCanvas = target._chromakeyCanvas
      const tempCtx = target._chromakeyCtx

      if (tempCanvas.width !== currentWidth || tempCanvas.height !== currentHeight) {
        tempCanvas.width = currentWidth
        tempCanvas.height = currentHeight
      } else {
        tempCtx.clearRect(0, 0, currentWidth, currentHeight)
      }

      // Composite all drawing layers
      tempCtx.drawImage(target.inputCanvas, 0, 0, currentWidth, currentHeight)
      for (const pid in target.playerCanvases) {
        tempCtx.drawImage(target.playerCanvases[pid], 0, 0, currentWidth, currentHeight)
      }

      // GPU chromakey processing
      const keyRgb = hexToRgb(chromakeyColor)
      const processedCanvas = target._chromakeyProcessor.process(tempCanvas, keyRgb, chromakeyTolerance)
      ctx.drawImage(processedCanvas, 0, 0)

    } else if (chromakeyEnabled && videoEnabled) {
      const tempCanvas = target._chromakeyCanvas
      const tempCtx = target._chromakeyCtx

      if (tempCanvas.width !== currentWidth || tempCanvas.height !== currentHeight) {
        tempCanvas.width = currentWidth
        tempCanvas.height = currentHeight
      } else {
        tempCtx.clearRect(0, 0, currentWidth, currentHeight)
      }

      // Composite all drawing layers
      tempCtx.drawImage(target.inputCanvas, 0, 0, currentWidth, currentHeight)

      for (const pid in target.playerCanvases) {
        tempCtx.drawImage(target.playerCanvases[pid], 0, 0, currentWidth, currentHeight)
      }

      // Apply chromakey effect
      const keyRgb = hexToRgb(chromakeyColor)
      const imageData = tempCtx.getImageData(0, 0, currentWidth, currentHeight)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        if (a === 0) continue // Skip already transparent

        const distance = colorDistance(r, g, b, keyRgb.r, keyRgb.g, keyRgb.b)

        // Make chromakey pixels transparent (revealing video)
        if (distance <= chromakeyTolerance) {
          data[i + 3] = 0
        }
      }

      tempCtx.putImageData(imageData, 0, 0)
      ctx.drawImage(tempCanvas, 0, 0)

    } else {
      // No chromakey - draw normally
      ctx.drawImage(target.inputCanvas, 0, 0, currentWidth, currentHeight)

      for (const pid in target.playerCanvases) {
        ctx.drawImage(target.playerCanvases[pid], 0, 0, currentWidth, currentHeight)
      }
    }

    target._animationFrameId = requestAnimationFrame(drawComposite)
  }

  drawComposite()
}

/*

Merge function for updating individual player state

*/

function mergePlayer(pid) {
  return (state, payload) => {
    return {
      ...state,
      players: {
        ...state.players,
        [pid]: {
          ...state.players[pid],
          ...payload
        }
      }
    }
  }
}

function mergePlayerNotes(pid, note) {
  return (state, payload) => {
    return {
      ...state,
      players: {
        ...state.players,
        [pid]: {
          ...state.players[pid],
          activeNotes: {
            ...state.players[pid].activeNotes,
            [note]: payload
          }
        }
      }
    }
  }
}


/*

Drawing interaction handlers - OPTIMIZED

*/

$.when('touchstart', '.input-canvas', start)
$.when('mousedown', '.input-canvas', start)

function start(e) {
  const { inputCanvas, rectangle, scaleX, scaleY, offsetX, offsetY } = engine(e.target)
  $.teach({ touching: true })
  const { thickness, opacity, color } = $.learn()
  let pressure = 0.1;
  let clientX, clientY;

  if (e.touches && e.touches[0]) {
    const touch = e.touches[0]
    if (typeof touch["force"] !== "undefined" && touch["force"] > 0) {
      pressure = touch["force"]
    }
    clientX = touch.clientX
    clientY = touch.clientY
  } else {
    // Mouse event
    pressure = 1.0
    clientX = e.clientX
    clientY = e.clientY
  }

  const relativeX = clientX - rectangle.left - offsetX;
  const relativeY = clientY - rectangle.top - offsetY;

  const x = relativeX * scaleX;
  const y = relativeY * scaleY;

  isMousedown = true
  points = [] // Reset local points array

  lineWidth = Math.log(pressure + 1) * thickness

  const newPoint = { x, y, lineWidth, color, opacity }
  points.push(newPoint)

  // Initialize this player's current stroke
  $.teach({
    currentStroke: [newPoint],
    cursorX: relativeX,
    cursorY: relativeY,
    activelyDrawing: true,
    color
  }, {
    mergeHandler: mergePlayer,
    parameters: [playerId]
  }, {
    bypassSecurity: true
  })
}

$.when('touchmove', '.input-canvas', move)
$.when('mousemove', '.input-canvas', move)

function move (e) {
  e.preventDefault()

  if (!isMousedown) return

  const target = e.target.closest($.link)
  const { rectangle, scaleX, scaleY, offsetX, offsetY } = engine(e.target)
  const { thickness, opacity, color } = $.learn()

  let pressure = 0.1
  let clientX, clientY;

  if (e.touches && e.touches[0]) {
    const touch = e.touches[0]
    if (typeof touch["force"] !== "undefined" && touch["force"] > 0) {
      pressure = touch["force"]
    }
    clientX = touch.clientX
    clientY = touch.clientY
  } else {
    // Mouse event
    pressure = 1.0
    clientX = e.clientX
    clientY = e.clientY
  }

  const relativeX = clientX - rectangle.left - offsetX;
  const relativeY = clientY - rectangle.top - offsetY;

  const x = relativeX * scaleX;
  const y = relativeY * scaleY;

  lineWidth = (Math.log(pressure + 1) * thickness * 4 * 0.2 + lineWidth * 0.8)

  const newPoint = { x, y, lineWidth, color, opacity }
  points.push(newPoint)

  // Immediately draw to local player's canvas
  drawPlayerStroke(target, playerId, points)

  // Throttle network state updates with RAF
  if (!target._drawRafId) {
    target._drawRafId = requestAnimationFrame(() => {
      $.teach({
        currentStroke: [...points],
        cursorX: relativeX,
        cursorY: relativeY,
        color
      }, {
        mergeHandler: mergePlayer,
        parameters: [playerId]
      }, {
        bypassSecurity: true
      })
      target._drawRafId = null
    })
  }
}

$.when('touchend', '.input-canvas', end)
$.when('touchleave', '.input-canvas', end)
$.when('mouseup', '.input-canvas', end)

function end (e) {
  $.teach({ touching: false })
  isMousedown = false

  const state = $.learn()
  const playerStroke = state.players?.[playerId]?.currentStroke

  if (playerStroke && playerStroke.length > 0) {
    const target = e.target.closest($.link)

    // Draw to historical canvas FIRST, before clearing player canvas
    if (target && target.inputCanvas) {
      const context = target.inputCanvas.getContext('2d')
      drawStroke(context, playerStroke)
    }

    // Now safe to update state
    $.teach({
      strokeHistory: [...state.strokeHistory, playerStroke]
    })

    $.teach({
      currentStroke: [],
      activelyDrawing: false,
    }, {
      mergeHandler: mergePlayer,
      parameters: [playerId]
    }, {
      bypassSecurity: true
    })
  }

  points = []
  lineWidth = 0
}

async function enableCameraRigging(target) {
}

async function disableCameraRigging(target) {
}

async function initializeVosk(target) {
  const { audioEnabled } = $.learn()

  if (!audioEnabled || !target.webcamStream) {
    console.log('Cannot initialize Vosk: audio not enabled or no stream')
    return
  }

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

  const source = audioContext.createMediaStreamSource(target.webcamStream);
  source.connect(recognizerProcessor);

  target.voskContext = { audioContext, recognizerProcessor, source }
}

$.when('click', '[data-toggle-transcription]', async (event) => {
  const { transcriptionEnabled, audioEnabled } = $.learn()
  const newState = !transcriptionEnabled

  const target = event.target.closest($.link)

  if (newState && !audioEnabled) {
    toast('Please enable audio first to use transcription')
    return
  }

  if (newState && !target.voskContext) {
    // Enable transcription
    await initializeVosk(target)
  } else if (!newState && target.voskContext) {
    // Disable transcription - clean up
    const { audioContext, recognizerProcessor, source } = target.voskContext
    source.disconnect()
    recognizerProcessor.disconnect()
    await audioContext.close()
    target.voskContext = null
  }

  $.teach({ transcriptionEnabled: newState })
})

$.when('click', '[data-videoinput]', async (event) => {
  const deviceId = event.target.dataset.videoinput
  $.teach({ selectedVideoDeviceId: deviceId })

  const target = event.target.closest($.link)
  await setMediaStream(target)
})

// Handle audio device selection
$.when('click', '[data-audioinput]', async (event) => {
  const deviceId = event.target.dataset.audioinput
  $.teach({ selectedAudioDeviceId: deviceId })

  const target = event.target.closest($.link)
  await setMediaStream(target)
})

// Handle audio output device selection (if supported)
$.when('click', '[data-audiooutput]', async (event) => {
  const deviceId = event.target.dataset.audiooutput
  $.teach({ selectedAudioOutputDeviceId: deviceId })

  // Set sink ID on video element if supported
  const target = event.target.closest($.link)
  if (target.video && typeof target.video.setSinkId === 'function') {
    try {
      await target.video.setSinkId(deviceId)
      toast('Audio output device changed')
    } catch (error) {
      console.error('Failed to set audio output:', error)
      toast('Failed to change audio output')
    }
  }
})

/*
Toggle chromakey on/off
*/
$.when('click', '[data-toggle-chromakey]', async (event) => {
  const { chromakeyEnabled, videoEnabled } = $.learn()

  if (!videoEnabled && !chromakeyEnabled) {
    toast('Please enable video first to use chromakey')
    return
  }

  $.teach({ chromakeyEnabled: !chromakeyEnabled })
})

$.when('pointerdown', '[data-drag]', grabToolbelt)
$.when('pointermove', '[data-drag]', dragToolbelt)
$.when('pointermove', '.viewport', dragToolbelt)
$.when('pointerup', '[data-drag]', ungrabToolbelt)
$.when('pointerup', '.viewport', ungrabToolbelt)

// grab a pane
function grabToolbelt(event) {
  event.preventDefault()
  const { clientX, clientY } = event;

  $.teach({
    grabStartX: clientX,
    grabStartY: clientY,
    beltGrabbed: true,
    beltDragged: false
  });
}

// drag a pane
let lastBeltX, lastBeltY;
function dragToolbelt(event) {
  const { clientX, clientY } = event;
  const { beltDragged, beltGrabbed, beltOffsetX, beltOffsetY, grabStartX, grabStartY } = $.learn();

  if(!beltGrabbed) return

  // Check if we've moved enough to be considered a drag
  if (grabStartX !== undefined && grabStartY !== undefined) {
    const deltaX = Math.abs(clientX - grabStartX);
    const deltaY = Math.abs(clientY - grabStartY);

    // If we've moved more than 5px, it's a drag
    if ((deltaX > 5 || deltaY > 5) && !beltDragged) {
      event.preventDefault();
      $.teach({
        beltOffsetX: beltOffsetX || 0,
        beltOffsetY: beltOffsetY || 0,
        beltDragged: true
      });
    }
  }


  if (!$.learn().beltDragged) return;

  event.preventDefault();

  if (lastBeltX !== undefined && lastBeltY !== undefined) {
    const movementX = clientX - lastBeltX;
    const movementY = clientY - lastBeltY;

    $.teach({
      beltOffsetX: beltOffsetX + movementX,
      beltOffsetY: beltOffsetY + movementY,
    });
  }

  lastBeltX = clientX;
  lastBeltY = clientY;
}

// release a pane
function ungrabToolbelt(event) {
  event.target.releasePointerCapture(event.pointerId);
  const { beltDragged } = $.learn();
  // Only prevent default if we were actually dragging
  if (beltDragged) {
    event.preventDefault();
  } else {
    // Didn't drag, so this was just a click - toggle the menu
    if (event.target.closest('[data-menu]')) {
      const { menuOpen } = $.learn()
      $.teach({ menuOpen: !menuOpen })
    }
  }

  $.teach({
    beltGrabbed: false,
    beltDragged: false,
    grabStartX: undefined,
    grabStartY: undefined,
  });
  lastBeltX = undefined;
  lastBeltY = undefined;
}

function audioFactory(url) {
  const audioPool = [];
  const poolSize = 3;
  let poolIndex = 0;

  // Initialize pool
  for (let i = 0; i < poolSize; i++) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();
    audioPool.push(audio);
  }

  return function play() {
    const sound = audioPool[poolIndex];
    sound.currentTime = 0; // Reset to start
    sound.play().catch(e => console.log('Play failed:', e));

    // Cycle through pool
    poolIndex = (poolIndex + 1) % poolSize;
  }
}

const playSwipeSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/a.mp3')
const playStuckSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/b.mp3')

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const manualNotes = {}

function maybe(id, value, note) {
  if(manualNotes[note]) return
  if(value === 1) {
    yes(id, note)
  } else {
    no(id, note)
  }
}

function yes(id, note) {
  attack(note)
  mark(id, note)
}

function no(id, note) {
  release(note)
  unmark(id, note)
}

function mark(id, note) {
  updateNote({ id, note }, true)
}

function unmark(id, note) {
  const { activeNotes } = $.learn().players[id]
  if(activeNotes[note]) {
    updateNote({ id, note }, false)
  }
}

function updateNote({ id, note }, payload) {
  $.teach(payload, {
    mergeHandler: mergePlayerNotes,
    parameters: [id, note]
  }, {
    bypassSecurity: true
  })
}


function noteFromGrid(column, row) {
  const { columns } = $.learn()

  const base = center + 30;

  const evenColumn = column % 2 === 0

  const aboveMedian = column > parseInt(columns / 2)
  const octave = row * -12
  const interval = (parseInt(column / 2) * 2)

  return evenColumn
    ? base + octave + interval
    : base - 5 + octave + interval + (aboveMedian?12:0)
}

const musicRPC = {
  'a': (params) => {
    const note = params.root
    maybe(params.id, params.value, note)
  },
  'b': (params) => {
    const note = params.root + 7
    maybe(params.id, params.value, note)
  },
  'x': (params) => {
    const note = params.root + 2
    maybe(params.id, params.value, note)
  },
  'y': (params) => {
    const note = params.root + 9
    maybe(params.id, params.value, note)
  },
  'lb': (params) => {
    const note = params.root + 4
    maybe(params.id, params.value, note)
  },
  'rb': (params) => {
    const note = params.root + 11
    maybe(params.id, params.value, note)
  },
  'lt': (params) => {
    const note = params.root + 6
    maybe(params.id, params.value, note)
  },
  'rt': (params) => {
    const note = params.root + 13
    maybe(params.id, params.value, note)
  },
  'up': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('up', 150, () => {
        slideMusicUp(params.id)
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('down', 150, () => {
        slideMusicDown(params.id)
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('left', 150, () => {
        slideMusicLeft(params.id)
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('right', 150, () => {
        slideMusicRight(params.id)
      })
    }
  },
  'os': (params) => {
    toggleSpam('os', params.value, () => {
      const { menuOpen } = $.learn()
      $.teach({
        menuOpen: !menuOpen,
      })
    })
  }
}

function slideMusicLeft(id) {
  const playerState = $.learn().players[id]
  const { musicX, activeNotes } = playerState

  if(musicX <= 0) return

  // Release all active notes before sliding
  releaseAllNotes(id, activeNotes)

  $.teach({
    musicX: musicX - 1
  }, {
    mergeHandler: mergePlayer,
    parameters: [id]
  }, {
    bypassSecurity: true
  })
}

function slideMusicRight(id) {
  const playerState = $.learn().players[id]
  const { musicX, columns, activeNotes } = playerState

  if(musicX >= columns - 1) return

  releaseAllNotes(id, activeNotes)

  $.teach({
    musicX: musicX + 1
  }, {
    mergeHandler: mergePlayer,
    parameters: [id]
  }, {
    bypassSecurity: true
  })
}

function slideMusicUp(id) {
  const playerState = $.learn().players[id]
  const { musicY, activeNotes } = playerState

  if(musicY <= -spatialOffset) return

  releaseAllNotes(id, activeNotes)

  $.teach({
    musicY: musicY - 1
  }, {
    mergeHandler: mergePlayer,
    parameters: [id]
  }, {
    bypassSecurity: true
  })
}

function slideMusicDown(id) {
  const playerState = $.learn().players[id]
  const { musicY, rows, activeNotes } = playerState

  if(musicY >= rows - 1 - spatialOffset) return

  releaseAllNotes(id, activeNotes)

  $.teach({
    musicY: musicY + 1
  }, {
    mergeHandler: mergePlayer,
    parameters: [id]
  }, {
    bypassSecurity: true
  })
}

function releaseAllNotes(id, activeNotes) {
  if (!activeNotes) return

  for (const note in activeNotes) {
    if (activeNotes[note]) {
      release(parseInt(note))
      updateNote({ id, note: parseInt(note) }, false)
    }
  }
}

function streamFactory(key, handler) {
  return (value, id) => {
    toggleSpam(key, value, () => {
      handler(id)
    })
  }
}

function gameLoop(time) {
  const { id } = this
  const { view, menuOpen } = $.ear()
  const player = {
    a: checkButton(0, 0),
    b: checkButton(0, 1),
    x: checkButton(0, 3),
    y: checkButton(0, 2),
    lb: checkButton(0, 4),
    rb: checkButton(0, 5),
    lt: checkButton(0, 6),
    rt: checkButton(0, 7),
    select: checkButton(0, 8),
    start: checkButton(0, 9),
    ls: checkButton(0, 10),
    rs: checkButton(0, 11),
    up: checkButton(0, 12),
    down: checkButton(0, 13),
    left: checkButton(0, 14),
    right: checkButton(0, 15),
    os: checkButton(0, 16),
  }

  if(!view && !menuOpen) {
    gamepadMusicTools(player, id)
  }

  if(!view && menuOpen) {
    gamepadDrawingTools(player, id)
  }

  requestAnimationFrame(gameLoop.bind(this))
}

function gamepadDrawingTools(player, id) {
  const streamOs = streamFactory('os', (id) => {
    $.mouth({
      menuOpen: false,
    })
    playSwipeSound()
  })

  const streamStart = streamFactory('start', (id) => {
    $.mouth({
      showOverlay: true,
      view: views.settings
    })
    playSwipeSound()
  })


  const streamSelect = streamFactory('select', (id) => {
    $.mouth({
      showOverlay: true,
      view: views.share
    })
    playSwipeSound()
  })

  const streamUp = streamFactory('up', (id) => {
    playStuckSound()
  })
  const streamLeft = streamFactory('left', (id) => {
    playStuckSound()
  })

  const streamRight = streamFactory('right', (id) => {
    playStuckSound()
  })
  const streamDown = streamFactory('down', (id) => {
    playStuckSound()
  })

  streamOs(player.os, id)
  streamStart(player.start, id)
  streamSelect(player.select, id)
  streamUp(player.up, id)
  streamLeft(player.left, id)
  streamRight(player.right, id)
  streamDown(player.down, id)
}

function gamepadMusicTools(player, id) {
  const state = $.learn()
  const playerState = state.players?.[playerId]
  if (!playerState) return

  const { musicX, musicY } = playerState
  const root = noteFromGrid(musicX, musicY + spatialOffset)  // <-- Dynamic root!

  const codes = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'ls', 'rs', 'up', 'down', 'left', 'right', 'os']

  for (const code of codes) {
    if (!musicRPC[code]) continue

    musicRPC[code]({
      root,
      id: playerId,
      type: 'click',
      value: player[code] ? 1 : 0
    })
  }
}

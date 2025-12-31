/*

In the beginning,

Dog created man. Man's best friend.

Man's first instruction: fetch

The fetch command instructs the human to chase and fetch the ball

*/

import Self from '@plan98/elf'
import { get, put } from './plan98-wallet.js'

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

/*

And for performance reasons, included an additional dependency when bootstrapping reality

*/

import { innerHTML } from 'diffhtml'

/*

Every universe needs a number. Some like Earth 616, others like it 48000

*/

const sampleRate = 48000;

/*

Data means nothing without a tag or a label or a lens through which to see

*/

const tag = 'v-log'

/*

An app is a nanobot, a machine elf

*/

// Generate a unique player ID for this session
const playerId = self.crypto.randomUUID()

let lineWidth = 0
let isMousedown = false
let points = []
const thicknoids = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 9001, 9002, 9004, 9008]
const opacities = [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]
const $ = Self(tag, {
  menuOpen: false,
  recording: false,
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
  opacity: .5,
  color: 'dodgerblue',
  background: 'transparent',
  players: {} // { [playerId]: { currentStroke: [], cursorX: 0, cursorY: 0, color: 'color' } }
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

async function startStream() {
  return await safeAsync(async () => {
    const response = await fetch('/rtmp/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        rtmpUrl: 'rtmp://localhost:1935/live',
        streamKey: 'abc123'
      })
    });

    return response.json()
  })
}

$.when('click', '[data-record]', async (event) => {
  if (!supportedVideoType) {
    return
  }

  try {
    const root = event.target.closest($.link)
    $.teach({ recording: true, transcription: '' })
    const audioTrack = root.webcamStream.getAudioTracks()[0]
    const compositedVideoStream = root.outputCanvas.captureStream(24)
    const product = new MediaStream([
      compositedVideoStream.getVideoTracks()[0],
      audioTrack
    ])


    const { data, error } = await startStream()

    if(!error) {
      const { streamId } = data
      $.teach({ streamId })
    }


    mediaRecorder = new MediaRecorder(product, {
      videoBitsPerSecond: 8000000
    });
    const recordedVideo = root.querySelector('video')

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
      recordedVideo.src = videoUrl;

      recordedVideo.play()
        .catch(e => console.error("Error playing recorded audio:", e));

      recordedVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(videoUrl);
      };

      const now = new Date();
      const timestamp = now.toJSON()
      const documentSrc = root.getAttribute('src') || `/private/${$.link}/${timestamp}.json`

      const { transcription } = $.learn()
      const videoSrc = `/private/${$.link}/${timestamp}.${extensions[supportedVideoType]}`
      const historicalNugget = {
        id: self.crypto.randomUUID(),
        src: videoSrc,
        title: 'Recorded Entry',
        author: 'Wally Wollaston',
        description: 'A video recorded now about another time or place',
        when: new Date().toLocaleString('en-us'),
        transcription
      }

      $.teach(historicalNugget, appendToHistoricalRecord)
      $.mouth({ videoSrc: videoSrc })
      put(documentSrc, JSON.stringify($.ear()), { type: 'application/json' }).then(response => {
      }).catch(error => {
        console.warn(error);
      });

      put(videoSrc, videoBlob, { type: supportedVideoType }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

      }).catch(error => {
      });
    };

    mediaRecorder.start(1000);

    recordedVideo.src = ''; // Clear previous recording

    console.log('Recording started...');

  } catch (err) {
    $.teach({ recording: false })
    console.error('Error accessing microphone:', err);
    alert('Could not access microphone. Please ensure you have a microphone and have granted permission.');
  }
});

/*

And a button to stop the record

*/

$.when('click', '[data-stop]', async () => {
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
    console.log('Recording stopped.');
  }
});

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
    inset: 0 0 2rem 0;
    background: var(--background, black);
    display: grid;
    place-content: center;
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

  & video {
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
  }

  & .letterbox canvas {
    position: absolute;
    inset: 0;
    max-width: 100%;
  }

  & .input-video {
    opacity: 0;
  }

  & .input-canvas {
    opacity: 0;
  }

  & .output-canvas {
    pointer-events: none;
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
    background: var(--active-color, black);
    height: 2rem;
    position: absolute;
    gap: .5rem;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    align-content: center;
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

  & .toolbelt-actions button[data-menu] {
    padding: 0;
  }

  & .toolbelt-actions button[data-menu] .nonce {
    width: 3rem;
  }

  &[data-belt="true"] .toolbelt-actions .menu-group {
    overflow: hidden;
  }

  & .toolbelt-grabber,
  & canvas {
    touch-action: none;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }

  & .action-bar {
    display: flex;
    gap: 0;
  }

  & .action-bar[data-open="false"] [data-mode] {
    display: none;
  }

  &[data-belt="true"] .linguistics,
  &[data-belt="true"] .letterbox,
  &[data-belt="true"] button[data-menu],
  &[data-belt="true"] .toolbelt-debugger,
  &[data-belt="true"] [data-tooltip],
  &[data-belt="true"] .action-bar {
    pointer-events: none !important;
  }


  & .toolbelt-actions {
    z-index: 10;
    background: transparent;
    position: absolute;
    bottom: 0;
    right: 0;
    display: none;
    max-width: 75%;
    width: 100%;
    padding: .5rem;
    overflow: hidden;
    display: inline-block;
    transform: translate(var(--belt-offset-x, 0), var(--belt-offset-y, 0));
    pointer-events: none;
  }

  & .toolbelt-actions button {
    pointer-events: all;
  }

  & .toolbelt-actions .toolbelt-grabber:focus,
  & .toolbelt-actions .toolbelt-grabber.active,
  & .toolbelt-actions .toolbelt-grabber:hover {
    background: var(--root-theme, mediumseagreen);
    color: white;
  }

  & .toolbelt-grabber {
    position: sticky;
    left: 0;
  }

  & .menu-group button.toolbelt-grabber {
    padding: .75rem .25rem;
    color: var(--root-theme, mediumseagreen);
  }

  @media screen {
    & .toolbelt-actions {
      display: flex;
    }
  }

  & .action-bar button,
  & .toolbelt-actions button {
    background: black;
    color: rgba(255,255,255,.85);
    border: none;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
    font-size: 1.5rem;
    padding: .75rem;
    line-height: 1;
    display: inline-flex;
  }

  & .action-bar button:focus,
  & .action-bar button.active,
  & .action-bar button:hover,
  & .toolbelt-actions button:focus,
  & .toolbelt-actions button.active,
  & .toolbelt-actions button:hover {
    color: #fff;
    background: var(--root-theme, mediumseagreen);
  }

  & .action-bar button.enabled,
  & .toolbelt-actions button.enabled {
    background: black;
    color: var(--root-theme, mediumseagreen);
  }

  & .menu-group {
    display: flex;
    margin-right: auto;
    pointer-events: all;
    overflow: auto;
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
    return `
      <plan98-palette></plan98-palette>
    `
  },
  [views.brush]: function (target) {
    return `
      <div style="text-align: right;">
        <button data-cancel class="branded-button">
          Close
        </button>
      </div>

      <div class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">
             </div>
    `
  },

  [views.settings]: function (target) {
    const { xrEnabled, transcriptionEnabled } = $.learn()
    return `
      <div style="text-align: right; position: sticky; top: 0;">
        <button data-cancel class="branded-button">
          Close
        </button>
      </div>
      <div class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">
        <h3>Background</h3>
        <div class="settings-grid">
          <button class="branded-button -black" data-background="transparent">
            Transparent
          </button>
          <button class="branded-button -black" data-background="black">
            Black
          </button>
          <button class="branded-button -white" data-background="white">
            White
          </button>
          <button class="branded-button -chroma-blue" data-background="#0047bb">
            Blue
          </button>
          <button class="branded-button -chroma-green" data-background="#00b140">
            Green
          </button>
          <button class="branded-button -plan98-red" data-background="firebrick">
            Red
          </button>
          <button class="branded-button -plan98-orange" data-background="darkorange">
            Orange
          </button>
          <button class="branded-button -plan98-yellow" data-background="gold">
            Yellow
          </button>
          <button class="branded-button -plan98-green" data-background="mediumseagreen">
            Green
          </button>
          <button class="branded-button -plan98-blue" data-background="dodgerblue">
            Blue
          </button>
          <button class="branded-button -plan98-indigo" data-background="slateblue">
            Indigo
          </button>
          <button class="branded-button -plan98-violet" data-background="mediumpurple">
            Violet
          </button>
          <button class="branded-button -otr" data-background="lemonchiffon">
            Otr
          </button>
          <button class="branded-button -wally" data-background="#54796d">
            Wally
          </button>
        </div>

        <h3>Thickness</h3>
        <div class="settings-grid">
          ${thicknoids.map(x => `
            <button class="branded-button" data-tooltip="Set thicknoid to ${x}" data-thickness="${x}">
              ${x}
            </button>
          `).join('')}
        </div>
        <h3>Opacities</h3>
        <div class="settings-grid">
          ${opacities.map(x => `
            <button class="branded-button" data-tooltip="Set opacity to ${x}" data-opacity="${x}">
              ${x}
            </button>
          `).join('')}
        </div>

        <h3>Extend Reality</h3>
        <div>
          <button class="branded-button" data-toggle-xr>${xrEnabled?'on':'off'}</button>
        </div>

        <h3>Devices</h3>
        ${deviceMenu(target)}

        <h3>Transcription</h3>
        <div>
          <button class="branded-button" data-toggle-transcription>${transcriptionEnabled?'on':'off'}</button>
        </div>
      </div>
    `
  },
  [views.share]: function share(target) {
    const { viewMetadata } = $.ear()
    const shareLink = `${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}`
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
          <qr-code src="${window.location.origin}/app/${$.link}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
        </div>
      </div>
    `
  }
}

$.when('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.teach({ color, showOverlay: false, view: null, objectId: null })
})

$.when('click', '[data-thickness]', function  (event) {
  event.preventDefault()
  $.mouth({
    thickness: parseInt(event.target.dataset.thickness) || 1,
  })
})

$.when('click', '[data-opacity]', function  (event) {
  event.preventDefault()
  $.mouth({
    opacity: event.target.dataset.opacity,
  })
})



/*

And while dog created man, he imbued them with free will

Free to make their own mistakes, they did.

*/

class VLog extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $.draw(() => null, {
      beforeUpdate: this.beforeUpdate,
      afterUpdate: this.afterUpdate
    })

    setMediaStream(this).then(() => {
      this.init(this)
    })
  }

  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
    }

    {
      const { beltGrabbed } = $.learn()
      target.dataset.belt = beltGrabbed ? 'true' : 'false'
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
  }

  async init(target) {
    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="footer" data-color-picker>
          <button data-new class="branded-button">
            New
          </button>
          <button data-share  style="margin-left: auto;" class="branded-button">
            Share
          </button>
        </div>
        <div class="taskbar -top">
          <div class="left">
            <button data-settings class="branded-button">
              Settings
            </button>
          </div>
          <div class="center"></div>
          <div class="right">
            <button data-list class="branded-button">
              List
            </button>
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
            <div class="cursor-tooltips"></div>
          </div>
          <div class="toolbelt-actions">
            <div class="menu-group">
              <button data-menu data-drag data-tooltip="Menu" class="toolbelt-actuator">
                <plan98-icon></plan98-icon>
              </button>
              <div class="action-bar toolbelt-actuator" data-open="false">
                <button data-mode="cursor" data-tooltip="Open Windows">
                  <sl-icon name="cursor"></sl-icon>
                </button>
                <button data-mode="move"  data-tooltip="Pan Canvas">
                  <sl-icon name="arrows-move"></sl-icon>
                </button>
                <button data-mode="chat" data-tooltip="Quick Chat">
                  <sl-icon name="chat"></sl-icon>
                </button>
                <button data-mode="camera"  data-tooltip="Conference">
                  <sl-icon name="camera-reels"></sl-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-area"></div>
        <div class="overlay-area"></div>
      `
      this.afterUpdate(target)
    }

    {
      target.video = target.querySelector('video')
      target.video.muted = true
      target.video.srcObject = target.webcamStream;
      target.video.autoplay = true;

      await new Promise((resolve) => {
        target.video.addEventListener('loadedmetadata', resolve, { once: true });
      });
    }

    {
      const width = target.video.videoWidth
      const height = target.video.videoHeight

      {
        const letterbox = target.querySelector('.letterbox')
        target.inputCanvas = document.createElement('canvas')
        target.inputCanvas.classList.add('input-canvas')
        target.inputCanvas.width = width;
        target.inputCanvas.height = height;
        letterbox.appendChild(target.inputCanvas)
      }

      {
        const letterbox = target.querySelector('.letterbox')
        target.outputCanvas = document.createElement('canvas')
        target.outputCanvas.classList.add('output-canvas')
        target.outputCanvas.width = width;
        target.outputCanvas.height = height;
        letterbox.appendChild(target.outputCanvas)
      }

      const ctx = target.outputCanvas.getContext('2d'); 
      const drawComposite = () => {
        ctx.drawImage(target.video, 0, 0, width, height);
        ctx.drawImage(target.inputCanvas, 0, 0, width, height);
        requestAnimationFrame(drawComposite);
      }

      drawComposite();
    }

    {
      const { transcriptionEnabled } = $.learn()
      if (transcriptionEnabled) {
        initializeVosk(target)
      }
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

    {
      // Check if we need to redraw (any player's stroke changed or history changed)
      const currentPlayerStrokeLengths = {}
      for (const pid in (players || {})) {
        currentPlayerStrokeLengths[pid] = players[pid].currentStroke?.length || 0
      }

      const needsRedraw = 
        target.strokeHistoryLength !== strokeHistory.length || 
        target.strokeRevisoryLength !== strokeRevisory.length ||
        JSON.stringify(target.playerStrokeLengths) !== JSON.stringify(currentPlayerStrokeLengths)

      if (needsRedraw) {
        target.strokeHistoryLength = strokeHistory.length
        target.strokeRevisoryLength = strokeRevisory.length
        target.playerStrokeLengths = currentPlayerStrokeLengths
        drawAllStrokes(target)
      }
    }

    {
      // Update cursor tooltips for all players
      const tooltipsContainer = target.querySelector('.cursor-tooltips')
      if (tooltipsContainer) {
        const tooltipHTML = Object.entries(players || {})
          .filter(([pid, player]) => pid !== playerId && player.cursorX !== undefined)
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
      const { beltOffsetX, beltOffsetY } = $.learn()
      const toolbelt = target.querySelector('.toolbelt-actions')

      toolbelt.style = `--belt-offset-x: ${beltOffsetX}px; --belt-offset-y: ${beltOffsetY}px;`
    }

    {
      const bar = target.querySelector('.action-bar')
      bar.dataset.open = $.learn().menuOpen
    }


    {
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
              <button data-record class="standard-button bias-positive -large -round">
                <sl-icon name="record-circle-fill"></sl-icon>
              </button>
            </div3>
          `
        )
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
      const permalink = `${window.location.origin}/app/${$.link}?id=${target.id}`

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
      innerHTML(area, (viewRenderers[view] || (() => '404'))(target))
      target.dataset.showOverlay = true
    } else {
      const area = document.querySelector('.overlay-area')
      target.dataset.showOverlay = false
      if(area.innerHTML) area.innerHTML = ''
    }

    { // menu items
      const { activeMenu } = $.learn()
      const currentlyActive = target.querySelector('[data-menu-target].active')
      if(currentlyActive) {
        currentlyActive.classList.remove('active')
      }
      const activeItem = target.querySelector(`[data-menu-target="${activeMenu}"]`)
      if(activeItem) {
        activeItem.classList.add('active')
      }
    }

    {
      const { color } = $.ear()
      if(target.color !== color) {
        target.style.setProperty('--active-color', color)
      }
    }

    {
      const { background } = $.ear()
      if(target.background !== background) {
        target.style.setProperty('--background', background)
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

    {
      recoverElves(target, 'qr-code')
      recoverElves(target, 'plan98-palette')
    }
  }
}

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}

function deviceMenu(target) {
  const { devicesByKind } = $.learn()

  const menuItems = []
  for(const kind in devicesByKind) {
    const devices = devicesByKind[kind].map(x => `
      <button  class="branded-button" data-${kind}="${x.deviceId}">
        ${x.label}
      </button>
    `).join('')

    menuItems.push(`
      <div class="device-kind">
        <div class="device-label">
          ${kind}
        </div>
        <div class="device-options">
          ${devices}
        </div>
      </div>
    `)
  }

  return `
    <div class="device-list">
      ${menuItems.join('')}
    </div>
  `
}



/*

And dog demanded resolution and quality

*/

async function setMediaStream(target) {
  const { facingMode } = $.learn()
  target.webcamStream = await navigator.mediaDevices.getUserMedia({
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

  loadAllDevices()
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
          devicesByKind[device.kind].push(device)
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
  drawAllStrokes(event.target)
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
  target.video.srcObject = target.webcamStream;
  target.video.autoplay = true;
})

/*

And dog provided a panel with a list of all memories

*/

$.when('click', '[data-list]', () => {
  const { showList } = $.learn()

  $.teach({ showList: !showList })
  event.stopImmediatePropagation()
})

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
  } else if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(target);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    toast("Copied to clipboard")
  }
  window.getSelection().removeAllRanges()
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
    showList: false,
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
    $.teach({
      name: event.target.name,
      value: event.target.value
    }, bound(bind))
  } else {
    $.teach({ 
      name: event.target.name,
      value: event.target.value
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

$.when('click', '[data-menu-target]', (event) => {
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
})

$.when('click', '*', (event) => {
  if(event.target.closest('.action-item')) {
    // child of a menu item
    return
  }

  if(event.target.closest('.panel-area')) {
    return
  }

  $.teach({ activeMenu: null, showList: false })
})

function engine(target) {
  const root = target.closest($.link)
  const canvas = root.querySelector('.input-canvas')

  if(!canvas) return {}
  const rectangle = canvas.getBoundingClientRect()

  const scaleX = canvas.width / rectangle.width;
  const scaleY = canvas.height / rectangle.height;

  return {
    root,
    canvas,
    rectangle,
    scaleX,
    scaleY
  }
}


$.when('click', '[data-new]', function (event) {
  event.preventDefault()
  $.teach({ activeMenu: null, strokeHistory: [], strokeRevisory: [] })
  drawAllStrokes(event.target)
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
  drawAllStrokes(event.target)
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

  drawAllStrokes(event.target)
})

/*

Unified drawing function - draws all historical strokes plus all current player strokes

*/

function drawAllStrokes(target) {
  const { canvas } = engine(target)
  if (!canvas) return

  const { strokeHistory, players } = $.learn()
  const context = canvas.getContext('2d')

  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background
  context.globalAlpha = 1
  context.fillStyle = $.learn().background
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Collect all strokes to draw: historical + current from all players
  const allStrokes = [...strokeHistory]

  // Add current strokes from all players
  for (const pid in players) {
    const player = players[pid]
    if (player.currentStroke && player.currentStroke.length > 0) {
      allStrokes.push(player.currentStroke)
    }
  }

  // Draw all strokes
  allStrokes.forEach(stroke => {
    if (stroke.length < 2) return

    context.beginPath()
    context.moveTo(stroke[0].x, stroke[0].y)

    for (let i = 1; i < stroke.length; i++) {
      const point = stroke[i]
      context.strokeStyle = point.color || 'dodgerblue'
      context.lineCap = 'round'
      context.lineJoin = 'round'
      const opacity = point.opacity === null ? 1 : point.opacity
      context.globalAlpha = opacity
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
  })
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

/*

Drawing interaction handlers

*/

$.when('touchstart', '.input-canvas', start)
$.when('mousedown', '.input-canvas', start)

function start(e) {
  const { canvas, rectangle, scaleX, scaleY } = engine(e.target)
  $.teach({ touching: true, activeMenu: null })
  const { thickness, opacity, color } = $.learn()
  const context = canvas.getContext('2d')
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

  const relativeX = clientX - rectangle.left;
  const relativeY = clientY - rectangle.top;

  const x = relativeX * scaleX;
  const y = relativeY * scaleY;

  isMousedown = true
  points = [] // Reset local points array

  lineWidth = Math.log(pressure + 1) * thickness
  context.lineWidth = lineWidth

  const newPoint = { x, y, lineWidth, color, opacity }
  points.push(newPoint)

  // Initialize this player's current stroke
  $.teach({
    currentStroke: [newPoint],
    cursorX: relativeX,
    cursorY: relativeY,
    color
  }, {
    mergeHandler: mergePlayer,
    parameters: [playerId]
  })
}

$.when('touchmove', '.input-canvas', move)
$.when('mousemove', '.input-canvas', move)

function move (e) {
  e.preventDefault()
  const { canvas, rectangle, scaleX, scaleY } = engine(e.target)
  const { thickness, opacity, color } = $.learn()
  const context = canvas.getContext('2d')
  if (!isMousedown) return

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

  const relativeX = clientX - rectangle.left;
  const relativeY = clientY - rectangle.top;

  const x = relativeX * scaleX;
  const y = relativeY * scaleY;

  lineWidth = (Math.log(pressure + 1) * thickness * 4 * 0.2 + lineWidth * 0.8)
  context.lineWidth = lineWidth

  const newPoint = { x, y, lineWidth, color, opacity }
  points.push(newPoint)

  // Update this player's current stroke
  $.teach({
    currentStroke: [...points],
    cursorX: relativeX,
    cursorY: relativeY,
    color
  }, {
    mergeHandler: mergePlayer,
    parameters: [playerId]
  })

  requestIdleCallback(() => {
    $.teach({ pressure })

    const touch = e.touches ? e.touches[0] : null
    if (touch) {
      $.teach({
        touchesHTML: `
          touchType = ${touch.touchType} ${touch.touchType === 'direct' ? '👆' : '✏️'} <br/>
          radiusX = ${touch.radiusX} <br/>
          radiusY = ${touch.radiusY} <br/>
          rotationAngle = ${touch.rotationAngle} <br/>
          altitudeAngle = ${touch.altitudeAngle} <br/>
          azimuthAngle = ${touch.azimuthAngle} <br/>
        `
      })
    }
  })
}

$.when('touchend', '.input-canvas', end)
$.when('touchleave', '.input-canvas', end)
$.when('mouseup', '.input-canvas', end)

function end (e) {
  $.teach({ touching: false })

  isMousedown = false

  // Move current stroke to history - need to handle this specially
  // First get the current stroke, then update both history and clear player stroke
  const state = $.learn()
  const playerStroke = state.players?.[playerId]?.currentStroke

  if (playerStroke && playerStroke.length > 0) {
    // Add to history
    $.teach({
      strokeHistory: [...state.strokeHistory, playerStroke]
    })

    // Clear player's current stroke
    $.teach({
      currentStroke: []
    }, {
      mergeHandler: mergePlayer,
      parameters: [playerId]
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
  const { transcriptionEnabled } = $.learn()
  const newState = !transcriptionEnabled

  const target = event.target.closest($.link)

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

$.when('pointerdown', '[data-drag]', grabToolbelt)
$.when('pointermove', '.viewport', dragToolbelt)
$.when('pointermove', '[data-drag]', dragToolbelt)
$.when('pointermove', '.toolbelt-actuator', dragToolbelt)
$.when('pointerup', '.viewport', ungrabToolbelt)
$.when('pointerup', '[data-drag]', ungrabToolbelt)

// grab a pane
function grabToolbelt(event) {
  const { clientX, clientY } = event;

  // Capture the pointer so we receive all pointer events
  event.target.setPointerCapture(event.pointerId);

  $.teach({
    grabStartX: clientX,
    grabStartY: clientY,
    capturedPointerId: event.pointerId
  });
}

// drag a pane
let lastBeltX, lastBeltY;
function dragToolbelt(event) {
  const { clientX, clientY } = event;
  const { beltGrabbed, beltOffsetX, beltOffsetY, grabStartX, grabStartY } = $.learn();

  // Check if we've moved enough to be considered a drag
  if (grabStartX !== undefined && grabStartY !== undefined) {
    const deltaX = Math.abs(clientX - grabStartX);
    const deltaY = Math.abs(clientY - grabStartY);

    // If we've moved more than 5px, it's a drag
    if ((deltaX > 5 || deltaY > 5) && !beltGrabbed) {
      event.preventDefault();
      $.teach({
        beltOffsetX: beltOffsetX || 0,
        beltOffsetY: beltOffsetY || 0,
        beltGrabbed: true
      });
    }
  }

  if (!beltGrabbed) return;

  event.preventDefault();

  if (lastBeltX !== undefined && lastBeltY !== undefined) {
    const movementX = clientX - lastBeltX;
    const movementY = clientY - lastBeltY;

    $.teach({
      beltOffsetX: beltOffsetX + movementX,
      beltOffsetY: beltOffsetY + movementY
    });
  }

  lastBeltX = clientX;
  lastBeltY = clientY;
}

// release a pane
function ungrabToolbelt(event) {
  const { beltGrabbed, capturedPointerId } = $.learn();

  // Release pointer capture
  if (capturedPointerId !== undefined) {
    event.target.releasePointerCapture(capturedPointerId);
  }

  // Only prevent default if we were actually dragging
  if (beltGrabbed) {
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
    grabStartX: undefined,
    grabStartY: undefined,
    capturedPointerId: undefined
  });
  lastBeltX = undefined;
  lastBeltY = undefined;
}

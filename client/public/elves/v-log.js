/*

In the beginning,

Dog created man. Man's best friend.

Man's first instruction: fetch

The fetch command instructs the human to chase and fetch the ball

*/

import app, { get, getSpace, put, del} from '@plan68/app'

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

An app is a nanobot.

*/


let lineWidth = 0
let isMousedown = false
let points = []
const $ = app(tag, {
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
  showPanel: false,
  showOverlay: false,
  view: null,
  objectId: null,
  strokeHistory: [],
  strokeRevisory: [],
  thickness: 4,
  color: 'white',
  background: 'transparent'
})

/*
  
*/

/*


*/

async function initialize(target) {
}


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

$.when('click', '[data-record]', async (event) => {
  if (!supportedVideoType) {
    return
  }

  try {
    const root = event.target.closest($.link)
    $.teach({ recording: true, transcription: '' })

    mediaRecorder = new MediaRecorder(root.webcamStream);
    const recordedVideo = root.querySelector('video')

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
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
      const src = root.getAttribute('src') || `/private/video-notes/${timestamp}.${extensions[supportedVideoType]}`

      const { transcription } = $.learn()

      const historicalNugget = {
        id: self.crypto.randomUUID(),
        src,
        title: 'Recorded Entry',
        author: 'Wally Wollaston',
        description: 'A video recorded now about another time or place',
        when: new Date().toLocaleString('en-us'),
        transcription
      }

      POST(historicalNugget, appendToHistoricalRecord)

      const space = getSpace(root.id)

      put.call({ space }, src, videoBlob, { type: supportedVideoType }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

      }).catch(error => {
      });
    };

    mediaRecorder.start();

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
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
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
  }

  & .viewport {
    position: absolute;
    inset: 0 0 2rem 0;
    background: black;
    display: grid;
    place-content: center;
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
    z-index: 5;
  }

  & .partial {
    display: inline-block;
    background: black;
  }

  & video {
    object-fit: contain;
  }

  & .taskbar {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
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

  & .output-canvas {
    pointer-events: none;
  }
`)

/*

And after filling the mind of man with fantasy, dog gave visions and dreams

*/

const views = {
  edit: 'edit'
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
  }
}

/*

And while dog created man, he imbued them with free will

Free to make their own mistakes, they did.

*/

class CulturalPreservation extends HTMLElement {
  constructor() {
    super();
  }


  connectedCallback() {
    $.draw(() => null, {
      beforeUpdate: this.beforeUpdate,
      afterUpdate: this.afterUpdate
    })
    this.init(this)
  }

  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      initialize(target)
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
    await setMediaStream(target)

    if(!target.innerHTML) {
      target.innerHTML = `
        <div data-dom="devices">
          ${deviceMenu(target)}
        </div>
        <div class="taskbar">
          <div class="left">
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
          <div class="letterbox">
            <video playsinline disablePictureInPicture></video>
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
    }

    {
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
    }

    {
      const letterbox = target.querySelector('.letterbox')
      target.inputCanvas = document.createElement('canvas')
      target.inputCanvas.classList.add('input-canvas')
      target.inputCanvas.width = target.video.videoWidth
      target.inputCanvas.height = target.video.videoHeight
      letterbox.appendChild(target.inputCanvas)
    }

    {
      const letterbox = target.querySelector('.letterbox')
      target.outputCanvas = document.createElement('canvas')
      target.outputCanvas.classList.add('output-canvas')
      target.outputCanvas.width = target.video.videoWidth
      target.outputCanvas.height = target.video.videoHeight
      letterbox.appendChild(target.outputCanvas)
    }
  }

  afterUpdate(target) {
    if(!target.innerHTML) return

    const {
      partial='',
      recording,
      showPanel,
      showOverlay,
      strokeHistory,
      strokeRevisory,
      view,
    } = $.learn()

    {
      {
        if(target.strokeHistoryLength !== strokeHistory.length || target.strokeRevisoryLength !== strokeRevisory.length) {
          target.strokeHistoryLength = strokeHistory.length
          target.strokeRevisoryLength = strokeRevisory.length
          redraw(target)
        }
      }
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
              <button data-record class="standard-button -large -round">
                <sl-icon name="record-circle-fill"></sl-icon>
              </button>
            </div3>
          `
        )
      }
    }

    if(showPanel) {
      const area = document.querySelector('.panel-area')
      const clips = GET(topEight).map(x => {
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
        <div class="share-area">
          <div class="action-bar">
            <button data-copy="${copyId}" class="standard-button" style="display: inline-grid; grid-template-columns: auto 1fr; gap: .5rem">
              <span>
                <sl-icon name="copy"></sl-icon>
              </span>
              Copy Link
            </button>
          </div>
          <div id="${copyId}" style="height: 0px; overflow: hidden; opacity: 0;">${permalink}</div>
          </div>
        </div>
        <div class="playlist">${clips}</div>
        <div class="instructions">Record a video and it will display here.</div>
      `
      target.dataset.showPanel = true
    } else {
      const area = document.querySelector('.panel-area')
      target.dataset.showPanel = false
      if(area.innerHTML) area.innerHTML = ''
    }

    if(showOverlay) {
      const area = document.querySelector('.overlay-area')
      innerHTML(area, (viewRenderers[view] || (() => '404'))())
      target.dataset.showOverlay = true
    } else {
      const area = document.querySelector('.overlay-area')
      target.dataset.showOverlay = false
      if(area.innerHTML) area.innerHTML = ''
    }

    {
      innerHTML(target.querySelector('[data-dom="devices"]'), deviceMenu(target))
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
  }
}


function deviceMenu(target) {
  const { devicesByKind } = $.learn()

  const menuItems = []
  for(const kind in devicesByKind) {
    const devices = devicesByKind[kind].map(x => `
      <button data-${kind}="${x.deviceId}">
        ${x.label}
      </button>
    `).join('')

    menuItems.push(`
      <div class="action-item">
        <button data-menu-target="${kind}">
          ${kind}
        </button>
        <div class="actions-menu" data-menu="${kind}">
          ${devices}
        </div>
      </div>
    `)
  }

  return `
    <div class="actions -attach-bottom">
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

/*

And man was vain while dog was not.

So rather than only allow dog photos, dog allowed man to turn the camera in.

*/

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
  const { showPanel } = $.learn()

  $.teach({ showPanel: !showPanel })
  event.stopImmediatePropagation()
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
  $.teach({ showOverlay: false, view: null, objectId: null })
})

/*

And the ability to save to dog with them

*/

$.when('click', '[data-save]', (event) => {
  const { draft } = $.learn()
  POST(draft, replaceInHistoricalRecord)
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
  customElements.define(tag, CulturalPreservation);
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

  $.teach({ activeMenu: null, showPanel: false })
})

function clearCanvas(canvas) {
  canvas.width = self.innerWidth;
  canvas.height = self.innerHeight;
  const context = canvas.getContext('2d')
  context.fillStyle = $.learn().background
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function redraw(target) {
  const { canvas } = engine(target)

  if(!canvas) return
  const { strokeHistory } = $.learn()
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = $.learn().background
  context.fillRect(0, 0, canvas.width, canvas.height)

  strokeHistory.map(function (stroke) {
    if (strokeHistory.length === 0) return

    context.beginPath()

    let strokePath = [];
    stroke.map(function (point) {
      strokePath.push(point)
      drawOnCanvas(target, strokePath)
    })
  })
}

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
  redraw(event.target)
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
  redraw(event.target)
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

  redraw(event.target)
})


$.when('touchstart', '.input-canvas', start)
$.when('mousedown', '.input-canvas', start)

function start(e) {
  const { canvas, rectangle, scaleX, scaleY } = engine(e.target)
  $.teach({ touching: true, activeMenu: null })
  const { thickness } = $.learn()
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

  lineWidth = Math.log(pressure + 1) * thickness
  context.lineWidth = lineWidth

  points.push({ x, y, lineWidth })
  drawOnCanvas(e.target, points)
}

$.when('touchmove', '.input-canvas', move)
$.when('mousemove', '.input-canvas', move)

function move (e) {
  e.preventDefault()
  const { canvas, rectangle, scaleX, scaleY } = engine(e.target)
  const { thickness, color } = $.learn()
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

  points.push({ x, y, lineWidth, color })
  drawOnCanvas(e.target, points)

  requestIdleCallback(() => {
    $.teach({ pressure })

    const touch = e.touches ? e.touches[0] : null
    if (touch) {
      $.teach({
        touchesHTML: `
          touchType = ${touch.touchType} ${touch.touchType === 'direct' ? '👆' : '✍️'} <br/>
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

  $.teach(points, (state, payload) => {
    const newState = { ...state }
    newState.strokeHistory.push([...payload])
    return {
      ...newState
    }
  })

  points = []

  lineWidth = 0
};

function drawOnCanvas (target, stroke) {
  const { canvas } = engine(target)
  const context = canvas.getContext('2d')
  context.strokeStyle = stroke.color
  context.lineCap = 'round'
  context.lineJoin = 'round'

  const l = stroke.length - 1
  if (stroke.length >= 3) {
    const xc = (stroke[l].x + stroke[l - 1].x) / 2
    const yc = (stroke[l].y + stroke[l - 1].y) / 2
    context.lineWidth = stroke[l - 1].lineWidth
    context.quadraticCurveTo(stroke[l - 1].x, stroke[l - 1].y, xc, yc)
    context.stroke()
    context.beginPath()
    context.moveTo(xc, yc)
  } else {
    const point = stroke[l];
    context.lineWidth = point.lineWidth
    context.strokeStyle = point.color
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.stroke()
  }
}



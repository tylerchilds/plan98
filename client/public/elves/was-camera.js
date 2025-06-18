import elf from '@silly/elf'
// To use Html5Qrcode (more info below)
import {Html5Qrcode} from "html5-qrcode";
import { systemMenu, getTheme } from './paper-pocket.js'
import { savePhoto } from './time-machine.js'
import { get, put } from './was-wallet.js'

const initial = {
}

const $ = elf('was-camera', initial)

function engine(target) {
  const canvas = target.closest($.link).querySelector('.terminal-canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function render(target) {
  const container = target.querySelector('.trays')
  return function runtime(tray) {
    const {
      suggestions,
      suggestIndex,
      focusedTray
    } = $.learn()
    const {
      maximized,
      systemPane,
      minimized,
      grabbed,
      width,
      height,
      x,
      y,
      z,
      url,
      focused
    } = $.learn()[tray]

    let node = container.querySelector(`[data-id="${tray}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('tray');
      node.dataset.id = tray
      node.innerHTML = `
        <button class="tray-wake" data-tray="${tray}"></button>
        <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
          <button class="tray-action tray-close" data-tray="${tray}">
          </button>
          <button class="tray-action tray-min " data-tray="${tray}">
          </button>
          <button class="tray-action tray-max" data-tray="${tray}">
          </button>
          <div class="grabber"></div>
        </div>
        <div class="tray-body">
          ${url ? `
            <iframe src="${url}" title="${url}"></iframe>
          ` : renderSystemMenu(tray)}
        </div>
        <div class="resize-actions">
          <button aria-label="resize" data-direction="sw" class="tray-resize minimizable resize-left-bottom" data-tray="${tray}">
          </button>
          <button aria-label="resize" data-direction="se" class="tray-resize minimizable resize-right-bottom" data-tray="${tray}">
          </button>

          <button aria-label="resize" data-direction="nw" class="tray-resize minimizable resize-left-top" data-tray="${tray}">
          </button>
          <button aria-label="resize" data-direction="ne" class="tray-resize minimizable resize-right-top" data-tray="${tray}">
          </button>
        </div>
      `
      container.appendChild(node)
    }

    node.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`

    if(systemPane && node.lastPane !== systemPane) {
      node.lastPane = systemPane
      const groups = node.querySelector('.groups')
      const applications = node.querySelector('.applications')
      groups.innerHTML = renderGroups(tray, systemPane)
      applications.innerHTML = renderApplications(systemPane)
    }

    if(focusedTray === tray) {
      node.dataset.focused = true
    } else {
      node.dataset.focused = false
    }

    if(maximized) {
      node.setAttribute('class', 'tray maximized')
    } else if(minimized) {
      node.setAttribute('class', 'tray minimized')
    } else {
      node.setAttribute('class', 'tray')
    }

    if(node.dataset.url !== url) {
      node.dataset.url = url
      node.querySelector('iframe').src = url
    }

    node.dataset.grabbed = grabbed
    node.persist = true
  }
}

async function getVideoConstraints() {
  try {
    // Attempt to get native camera capabilities
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    // Stop the stream to free up camera resources
    track.stop();

    // Default constraints if no specific capabilities found
    const defaultConstraints = {
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };

    // If camera capabilities are available, use them
    if (capabilities.width && capabilities.height) {
      return {
        video: {
          facingMode: "environment",
          width: {
            min: capabilities.width.min || 1280,
            ideal: capabilities.width.max,
            max: capabilities.width.max
          },
          height: {
            min: capabilities.height.min || 720,
            ideal: capabilities.height.max,
            max: capabilities.height.max
          },
          aspectRatio: { ideal: capabilities.width.max / capabilities.height.max }
        },
        audio: false
      };
    }

    // Fallback to default constraints
    return defaultConstraints;
  } catch (error) {
    console.error('Error getting video constraints:', error);

    // Fallback constraints if everything else fails
    return {
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };
  }
}

function scan(target) {
  const video = target.querySelector('video')
  const canvasElement = target.querySelector('.qr-canvas')
  const canvas = canvasElement.getContext("2d");

  let lastProcessTime = 0;
  const PROCESS_INTERVAL = 250;

  function scanQR() {
    // Ensure html5-qrcode is loaded
    if (typeof Html5Qrcode === 'undefined') {
        console.error('html5-qrcode library not loaded');
        return;
    }

    // Create an instance of Html5Qrcode
    const html5QrCode = new Html5Qrcode('reader');

    // Convert canvas to a file
    canvasElement.toBlob(function(blob) {
      // Create a file from the blob
      const file = new File(
        [blob],
        'canvas-image.png',
        { type: 'image/png' }
      );

      // Scan the file
      html5QrCode.scanFile(file)
        .then(decodedText => {
          $.teach({
            activeQr: decodedText
          })
        })
        .catch(err => {
            console.error('Error scanning QR code:', err);
        });
    }, 'image/png');
  }


  function tick() {
    const now = performance.now();
    const { scanCode } = $.learn()

    if(scanCode && now - lastProcessTime >= PROCESS_INTERVAL) {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        scanQR()
        //const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        /*const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, "lemonchiffon");
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "lemonchiffon");
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "lemonchiffon");
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "lemonchiffon");

          $.teach({
            activeQr: code.data
          })
        }
        */
      }

      lastProcessTime = now;
    }
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

async function mountCamera(target) {
  if(target.cameraMounted) return
  target.cameraMounted = true

  const video = target.querySelector('video')
  navigator.mediaDevices.getUserMedia(await getVideoConstraints())
    .then(stream => {
      video.srcObject = stream;
      // Display video stream in a video element, etc.
      video.playsInline = true
      video.autoplay = true;
      scan(target)
    })
    .catch(error => {
      console.error('Error accessing video stream:', error);
    });
}

$.draw((target) => {
  if(target.innerHTML) return
  const src = target.getAttribute('src')
  if(src) {
    requestIdleCallback(() => {
      const tray = $.learn().trays[0]
      if(tray) {
        setState(tray, { url, focused: false, minimized: false })
      } else {
        $.teach(self.crypto.randomUUID(), (state, payload) => {
          const tray = payload
          const newState = {...state}
          newState.trays.push(tray)
          newState.focusedTray = tray
          newState.trayZ += 1
          newState[tray] = {
            systemPane: Object.keys(systemMenu)[0],
            width: 300,
            height: 150,
            x: 0,
            y: 0,
            z: newState.trayZ,
            url: src,
            maximized: true,
            focused: true
          }
          return newState
        })
      }
    })
  }
  return `
    <div class="viewport">
    <video disablepictureinpicture></video>
    <canvas class="qr-canvas"></canvas>
    </div>
    <div class="taskbar">
      <div class="qr-container">
        <button class="qr-activate" data-qr=""></button>
      </div>
      <div class="left">

      </div>
      <div class="center">
        <button data-snap>
          <sl-icon name="camera"></sl-icon>
        </button>
      </div>
      <div class="right">
        <!--
        <button data-scan class="taskbar-button">
          <sl-icon name="qr-code-scan"></sl-icon>
        </button>
        -->
      </div>
    </div>
    <div style="display: none" id="reader"></div>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(list) {
      target.dataset.scrollpos = list.scrollTop
    }
  }
}

function afterUpdate(target) {
  {
    mountCamera(target)
  }

  {
    const { scanCode } = $.learn()

    if(`${scanCode}` !== target.dataset.scanner) {
      target.dataset.scanner = `${scanCode}`
    }
  }

  {
    const { activeQr } = $.learn()

    if(activeQr !== target.activeQr) {
      target.activeQr = activeQr
      const button = target.querySelector('.qr-activate')
      const container = target.querySelector('.qr-container')

      if(activeQr) {
        button.dataset.qr = activeQr;
        button.innerText = new URL(activeQr).hostname;
        container.style.display = 'block'
      } else {
        button.dataset.qr = null;
        button.innerText = '';
        container.style.display = 'none'
      }
    }
  }

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
}

function setState(tray, payload) {
  $.teach(payload, function merge(state) {
    return {
      ...state,
      [tray]: {
        ...state[tray],
        ...payload
      }
    }
  })
}

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
  }

  & .desktop {
    position: relative;
    overflow: hidden;
    height: 100%;
    z-index: 4;
  }

  &[data-scanner="true"] .desktop > * {
    display: none !important;
  }

  &[data-scanner="false"] .qr-container {
    display: none !important;
  }

  & .qr-container {
    display: none;
    padding-bottom: 1rem;
  }
  &[data-scanner="true"] .desktop > * {
    display: none !important;
  }

  & .taskbar {
    background: rgba(0,0,0,.5);
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    position: relative;
  }

  & [data-snap] {
    padding: 0;
    width: 50px;
    height: 50px;
    border-radius: 100%;
    display: grid;
    place-items: center;
    border: none;
    margin: auto;
    font-size: 25px;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: white;
  }

  & [data-snap]:hover,
  & [data-snap]:focus {
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .taskbar .left,
  & .taskbar .center,
  & .taskbar .right {
    display: flex;
    align-items: center;
  }

  & .taskbar-button {
    padding: 0;
    width: 35px;
    height: 35px;
    border-radius: 100%;
    display: grid;
    place-items: center;
    border: none;
    font-size: 18px;
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.15));
    color: white;
  }

  & .taskbar-button:hover,
  & .taskbar-button:focus {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.35));
  }

  & .qr-container {
    position: absolute;
    transform: translateY(-100%);
    left: 0;
    right: 0;
    text-align: center;
  }

  & .qr-activate {
    border: none;
    border-radius: 1rem;
    padding: .5rem 1rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: white;
    margin: auto;
  }

  & .qr-activate:hover,
  & .qr-hover:focus {
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  &[data-scanner="true"] [data-scan] {
    background-color: mediumseagreen;
  }

  & .viewport .qr-canvas,
  & .viewport video {
    pointer-events: none;
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & > .qr-canvas {
    z-index: 1;
  }

  & .viewport > video {
    z-index: 2;
  }

  &.cinema {
    --draw-term-bg: #54796d;
    --draw-term-fg: #54796d;
  }

  & .resize-right-bottom,
  & .resize-left-bottom {
    position: absolute;
    bottom: -5px;
    width: 30px;
    height: 30px;
    border: none;
    padding: 0;
    background-color: #333333;
    cursor: resize;
  }

  & .resize-left-bottom {
    left: -5px;
    cursor: sw-resize;
  }

  & .resize-right-bottom {
    right: -5px;
    cursor: se-resize;
  }

  & .resize-right-top,
  & .resize-left-top {
    position: absolute;
    top: -5px;
    width: 30px;
    height: 30px;
    border: none;
    padding: 0;
    background-color: #333333;
    cursor: resize;
  }

  & .resize-left-top {
    left: -5px;
    cursor: nw-resize;
  }

  & .resize-right-top {
    right: -5px;
    cursor: ne-resize;
  }

  & .resize-right-bottom,
  & .resize-left-bottom,
  & .resize-right-top,
  & .resize-left-top {
    opacity: .5;
  }

  & .resize-right-bottom:hover,
  & .resize-left-bottom:hover,
  & .resize-right-top:hover,
  & .resize-left-top:hover {
    opacity: 1;
  }


  &.inline {
    display: inline-block;
    height: 2.2rem;
  }

  &.inline .tray:not(.minimized) {
    transform: translate(0, 0) !important;
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  &.online {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 100;
  }

  & .grabber {
    display: block;
    width: 100%;
    padding: 0 .25rem;
  }

  & .grabber::before {
    content: '';
    box-shadow:
      0px 2px 0 1px var(--red),
      0px 10px 0 1px var(--orange),
      0px 18px 0 1px var(--yellow);
    display: block;
    margin: 0;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  & .terminal-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & .terminal-canvas {
    background-size: cover;
    background-position: cover;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
  }

  & .cursor {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: var(--x);
    height: var(--y);
    background: var(--draw-term-bg, var(--color, lemonchiffon));
    transform: var(--transform);
    pointer-events: none;
    z-index: 9001;
    opacity: 1;
    display: grid;
    place-items: center;
  }

  & .zero-state {
    pointer-events: none;
    display: none;
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    padding: 1rem;
    max-width: 320px;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & .system {
    height: 100%;
  }

  & .groups {
    display: flex;
    overflow: auto;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), var(--root-theme, mediumseagreen);
    gap: .5rem;
    padding: .5rem;
    max-height: 100%;
  }

  & .pane-select {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: left;
    border-radius: 1rem;
  }

  & .pane-select.active {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }


  & .applications {
  }

  & .application-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 8px;
  }

  & .iconography {
    background: lemonchiffon;
    aspect-ratio: 1;
    transform: rotateZ(15deg);
    margin: 16px;
  }

  & .app-select {
    border: none;
    background: transparent;
    display: grid;
    grid-template-rows: 1fr auto;
    border-radius: 0;
    padding: .5rem;
  }

  & .app-label {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: center;
    border-radius: 1rem;
    position: relative;
    z-index: 2;
    max-height: 3.5rem;
    overflow: hidden;
  }

  & .app-label {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }




  @container tray-body (min-width: 36rem) {
    & .system {
      display: grid;
      grid-template-columns: auto 1fr;
    }

    & .groups {
      flex-direction: column;
    }


  }

  & .pane-select {
    
  }

`)

$.when('click', '[data-scan]', (event) => {
  event.preventDefault()
  $.teach({ scanCode: !$.learn().scanCode, activeQr: null })
})

$.when('click', '.qr-activate', (event) => {
  event.preventDefault()
  const { qr } = event.target.dataset
  newTray({
    url: qr,
    width: 300,
    height: 300,
    maximized: true,
    x: 0,
    y: 0
  })

  $.teach({ activeQr: null, scanCode: false })
})


$.when('click', '[data-snap]', (event) => {
  event.preventDefault()
  const video = event.target.closest($.link).querySelector('video')
  // Create a temporary canvas to draw the video frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the current video frame on the canvas
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get current date and time for filename
  const now = new Date();
  const timestamp = now.toJSON()

  // Convert canvas to data URL with JPEG format
  const dataURL = canvas.toDataURL('image/jpeg');

  const byteCharacters = atob(dataURL.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const src = `/private/camera-roll/${timestamp}.jpg`

  // Attempt to upload to server
  put(src, byteArray, { type: 'image/jpeg' }).then(response => {
    if (!response.ok) {
      // Explicitly throw for non-200 responses
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    savePhoto({ src })
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
})

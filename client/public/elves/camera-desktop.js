import elf from '@silly/elf'
// To use Html5Qrcode (more info below)
import {Html5Qrcode} from "html5-qrcode";
import { systemMenu, getTheme } from './paper-pocket.js'
import { savePhoto } from './time-machine.js'

const initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  trayZ: 3,
  focusedTray: null,
  trays: [],
  profile: {
    banner: null
  }
}

const $ = elf('camera-desktop', initial)

function renderGroups(tray, systemPane) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  return groups.map((x) => {
    return `
      <button class="pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}" data-tray="${tray}">
        ${systemMenu[x.key].label}
      </button>
    `
  }).join('')
}

function renderApplications(pane) {
  return pane ? `
    <div class="application-list">
      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <button class="app-select" data-url="${url}">
            <div class="iconography">
            </div>
            <span class="app-label">
              ${label}
            </span>
          </button>
        `
      }).join('')}
    </div>

  ` : `
    <sillyz-computer></sillyz-computer>
  `
}

function renderSystemMenu(tray) {
  const {
    systemPane
  } = $.learn()[tray]


  return `
    <div class="system">
      <div class="groups">
        ${renderGroups(tray, systemPane)}
      </div>
      <div class="applications">
        ${renderApplications(systemPane)}
      </div>
    </div>
  `

}

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
    <video disablepictureinpicture></video>
    <canvas class="qr-canvas"></canvas>
    <div class="desktop">
      <div class="trays"></div>
      <div class="zero-state">Camera Desktop. Slice open a window by dragging anywhere. Snap a photo.</div>
      <div class="cursor"></div>
      <canvas class="terminal-canvas"></canvas>
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
        <button data-scan class="taskbar-button">
          <sl-icon name="qr-code-scan"></sl-icon>
        </button>
      </div>
    </div>
    <div style="display: none" id="reader"></div>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  saveCursor(target) // first things first

  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(list) {
      target.dataset.scrollpos = list.scrollTop
    }
  }

  {
    const { profile } = $.learn()

    if(profile.banner && target.banner !== profile.banner) {
      target.banner = profile.banner
      target.setAttribute('background', `url('${profile.banner}')`)
    }
  }

  {
    const { startX, startY, x, y, invertX, invertY } = $.learn()
    const background = target.getAttribute('background')
    const color = target.getAttribute('color')
    
    target.style = `--start-x: ${startX}px; --start-y: ${startY}px; --x: ${Math.abs(x)}px; --y: ${Math.abs(y)}px; --transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%); ${background ? `--background: ${background};` : ``} ${color ? `--color: ${color}` : ``}`
  }

  {
    [...(target.querySelectorAll('.tray') || [])].map(x => {
      x.persist = false
    })
  }

  {
    const { isMouseDown } = $.learn()
    target.dataset.mouse = isMouseDown
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
    const { grabbing } = $.learn()
    const trays = target.querySelector('.trays')
    trays.dataset.grabbing = !!grabbing
  }

  {
    const { resizing } = $.learn()
    const trays = target.querySelector('.trays')
    trays.dataset.resizing = !!resizing
  }


  {
    const { isMouseDown } = $.learn()
    const cursor = target.querySelector('.cursor')
    cursor.style = `${isMouseDown ? 'display: grid;' : 'display: none;'};`
  }

  {
    const { trays } = $.learn()
    trays.map(render(target))
  }

  {
    if(target.matches('.inline')) {
      const { trays } = $.learn()
      const somethingMaxed = trays.some(x => {
        const tray = $.learn()[x]
        return tray.maximized
      })

      if(somethingMaxed) { 
        target.classList.remove('inline'); 
        target.classList.add('online')
      }
    }
  }

  {
    [...(target.querySelectorAll('.tray') || [])].filter(x => {
      return !x.persist
    }).map(x => x.remove())
  }

  replaceCursor(target) // first things first

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
}

function toggleMax(event) {
  const tray = event.target.closest('.tray').dataset.id
  const { maximized } = $.learn()[tray]
  maximized ? restoreMax(tray) : maximize(tray)
}

function maximize(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].maximized = true
    newState[payload].minimized = false
    return newState
  })
}

// restore a pane
function restoreMax(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].maximized = false
    return newState
  })
}

function toggleMin(event) {
  const tray = event.target.closest('.tray').dataset.id
  const { minimized } = $.learn()[tray]
  minimized ? restoreMin(tray) : minimize(tray)
}

function selectPane(event) {
  const { pane, tray } = event.target.dataset
  $.teach(null, (state) => {
    const newState = {...state} 
    newState[tray].systemPane = pane
    return newState
  })

}

function selectApp(event) {
  const { x, y } = event
  const { url } = event.target.dataset
  newTray({
    url,
    x: x > window.innerWidth / 2 ? window.innerWidth - x : x,
    y: y > window.innerHeight / 2 ? window.innerHeight - y : y,
  })
}



function minimize(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].minimized = true
    newState[payload].maximized = false
    return newState
  })
}

// restore a pane
function restoreMin(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].minimized = false
    return newState
  })
}

function closeTray(event) {
  const { tray } = event.target.dataset
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    const trayIndex = state.trays.indexOf(payload)

    if(trayIndex >= 0) {
      newState.trays.splice(trayIndex, 1)
      delete newState[payload]
    }

    return newState
  })
}

// grab a pane
let grabTimeout
let grabOffsetX, grabOffsetY
function grab(event) {
  event.preventDefault()
  const { offsetX, offsetY } = event
  const { tray } = event.target.dataset
  const { trayZ } = $.learn()
  const newZ = trayZ + 1
  $.teach({ trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ })
  grabTimeout = setTimeout(() => {
    setState(tray, { grabbed: true })
    $.teach({ grabbing: tray })
    grabOffsetX = offsetX
    grabOffsetY = offsetY
  }, 250)
}

// drag a pane
let lastX, lastY;
function drag(event) {
  let { target, clientX, clientY } = event
  const { grabbing, resizing } = $.learn()
  const tray = grabbing || resizing
  if(!tray) return
  const { grabbed, resize, x, y, width, height } = $.learn()[tray]

  const panX = getComputedStyle(event.target).getPropertyValue("--pan-x") || 0;
  const panY = getComputedStyle(event.target).getPropertyValue("--pan-y") || 0;

  if (lastX !== undefined && lastY !== undefined) {
    const movementX = clientX - lastX;
    const movementY = clientY - lastY;
    // Use movementX and movementY here
    if(grabbed) {
      setState(tray, {
        x: x + movementX,
        y: y + movementY
      })
    }
    if(resize) {
      if(resize === 'sw') {
        setState(tray, {
          x: x + movementX,
          height: height + movementY,
          width: width - movementX
        })
      }
      if(resize === 'se') {
        setState(tray, {
          height: height + movementY,
          width: width + movementX
        })
      }
      if(resize === 'ne') {
        setState(tray, {
          y: y + movementY,
          height: height - movementY,
          width: width + movementX
        })
      }
      if(resize === 'nw') {
        setState(tray, {
          x: x + movementX,
          y: y + movementY,
          height: height - movementY,
          width: width - movementX
        })
      }

    }
  } else {
    if(grabbed) {
      setState(tray, {
        x: clientX - grabOffsetX - parseInt(panX, 10),
        y: clientY - grabOffsetY - parseInt(panY, 10)
      })
    }

  }

  lastX = clientX;
  lastY = clientY;
}

// release a pane
function ungrab(event) {
  clearTimeout(grabTimeout)
  const tray = $.learn().grabbing
  if(!tray) return
  setState(tray, { grabbed: false })
  $.teach({ grabbing: null })
  lastX = undefined;
  lastY = undefined;
  grabOffsetX = undefined
  grabOffsetY = undefined
}

// grab a pane
function resize(event) {
  event.preventDefault()
  const { offsetX, offsetY } = event
  const { tray } = event.target.dataset
  const { trayZ } = $.learn()
  const newZ = trayZ + 1
  $.teach({ resizing: tray, trayZ: newZ, focusedTray: tray })
  setState(tray, { resize: event.target.dataset.direction, z: newZ })
  grabOffsetX = offsetX
  grabOffsetY = offsetY
}
function unresize({ target }) {
  const tray = $.learn().resizing
  if(!tray) return
  setState(tray, { resize: null })
  $.teach({ resizing: null })
  lastX = undefined;
  lastY = undefined;
  grabOffsetX = undefined
  grabOffsetY = undefined
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

  & > .qr-canvas,
  & > video {
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

  & > video {
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

  & .trays[data-resizing="true"],
  & .trays[data-grabbing="true"] {
    pointer-events: none !important;
  }

  & .tray {
    pointer-events: none;
    filter: grayscale(1);
  }

  &[data-mouse="true"] .tray {
    pointer-events: none !important;
  }

  & .tray[data-focused="true"] {
    pointer-events: all;
    filter: grayscale(0);
  }

  & .tray-wake {
    background: none;
    position: absolute;
    inset: 0;
    background: 0;
    border: 0;
    padding: 0;
    pointer-events: all;
  }

  & .tray-wake:hover,
  & .tray-wake:focus {
    background: rgba(0,0,0,.85);
    outline: 2px solid mediumseagreen;
    outline-offset: 2px;
  }

  & .tray[data-focused="true"] .tray-wake {
    display: none;
  }

  & [data-resizing="true"] .tray[data-focused="true"],
  & [data-grabbing="true"] .tray[data-focused="true"],
  &[data-mouse="true"] .tray[data-focused="true"],
  & [data-resizing="true"] .tray-wake,
  & [data-grabbing="true"] .tray-wake,
  &[data-mouse="true"] .tray-wake {
    pointer-events: none !important;
  }

  & .grabber {
    pointer-events: none;
  }

  & [data-grabbed="true"] {
    transform: scale(1.1);
    outline: 2px solid var(--green);
    outline-offset: 2px;
  }
  & [data-grabbed="true"] .grabber::before {
    box-shadow:
      0px 2px 0 1px var(--purple),
      0px 10px 0 1px var(--blue),
      0px 18px 0 1px var(--green);
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

  & .trays:empty + .zero-state {
    display: block;
  }

  & .trays[data-mousedown="true"] {
    pointer-events: none;
  }

  & .trays:empty::before {
    content: 'Draw a rectangle that is not tiny."
    position: absolute;
    inset: 0;
    margin: auto;
  }

  & .tray {
    position: absolute;
    width: var(--width, 160px);
    height: var(--height, 90px);
    background: black;
    padding: 1px;
    display: grid;
    grid-template-rows: auto 1fr;
    max-width: 100vw;
    max-height: 100vh;
  }

  & .tray iframe {
    position: absolute;
    inset: 0;
  }

  & .tray-title-bar {
    background: black;
    z-index: 2;
    padding: 5px 4px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    gap: 10px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    overflow-x: auto;
  }

  & .tray-title-bar input {
    border: none;
    border-radius: 0;
    background: transparent;
    color: rgba(255,255,255,.65);
    width: 100%;
    padding: 0 4px 0;
    height: 100%;
  }

  & .tray-title-bar input:focus {
    color: rgba(255,255,255,.85);
    column-span: 2;
  }

  & .tray-body {
    background: white;
    color: black;
    height: 100%;
    position: relative;
    z-index: 2;
    overflow: auto;
    container-type: inline-size;
    container-name: tray-body;
  }

  & .tray-resize {
    pointer-events: all;
  }

  &:not(.infinite) .tray.maximized {
    transform: translate(0, 0) !important;
 }

  & .tray.maximized {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  & .tray.minimized .tray-title-bar {
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) {
    width: auto;
    height: auto;
    grid-template-rows: auto 0 0;
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) .tray-title-bar {
    grid-template-columns: auto auto auto 2rem;
  }

  & .tray.minimized:not(.maximized) .minimizable {
    display: none;
  }

  & .tray [type="color"] {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0;
  }

  & .tray-action {
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
    padding: 0;
    opacity: .65;
    transition: opacity 100ms;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
  }

  & .tray-action:hover,
  & .tray-action:focus {
    opacity: 1;
  }

  & .tray-toggle {
  }

  & .tray-close {
    margin-left: auto;
  }

  & .tray-close {
    border-radius: 100%;
    background: firebrick;
  }

  & .tray-min {
    border-radius: 100%;
    background: gold;
  }

  & .tray-max {
    border-radius: 100%;
    background: mediumseagreen;
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

$.when('pointerdown', '.terminal-canvas', start)

function start(e) {
  const { grabbing, resizing } = $.learn()
  if(grabbing || resizing) return
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  let startX, startY, x, y;
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    startX = e.touches[0].clientX - rectangle.left
    startY = e.touches[0].clientY - rectangle.top
  } else {
    startX = e.clientX - rectangle.left
    startY = e.clientY -rectangle.top
  }

  x = 0
  y = 0

  $.teach({ startX, startY, isMouseDown: true, x, y })
}

$.when('pointermove', '.terminal-canvas', move)

function move (e) {
  e.preventDefault()
  const { startX, isMouseDown, startY, grabbing, resizing } = $.learn()
  if(grabbing || resizing) return
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  if (!isMouseDown) return

  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    x = e.touches[0].clientX - startX - rectangle.left
    y = e.touches[0].clientY - startY - rectangle.top
  } else {
    x = e.clientX - startX - rectangle.left
    y = e.clientY - startY - rectangle.top
  }

  $.teach({ x, y, invertX: x < 0, invertY: y < 0 })
}

$.when('click', '.tray-wake', wake)
function wake (e) {
  const { trayZ } = $.learn()
  const newZ = trayZ + 1
  const { tray } = event.target.dataset
  $.teach({ trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ })
}
$.when('pointerup', '.terminal-canvas', end)
function end (e) {
  const { grabbing, resizing } = $.learn()
  if(grabbing || resizing) return
  const { focusedTray, startX, x, y, invertX, invertY, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')

  const newX = invertX ? startX + x : startX
  const newY = invertY ? startY + y : startY

  const width = Math.max(300, Math.abs(x))
  const height = Math.max(300, Math.abs(y))
  newTray({
    systemPane: Object.keys(systemMenu)[0],
    width,
    height,
    x: newX,
    y: newY
  })
  $.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

function newTray(overrides) {
  const tray = self.crypto.randomUUID()
  $.teach(tray, (state, payload) => {
    const newState = {...state}
    newState.trays.push(payload)
    newState.trayZ += 1
    newState.focusedTray = tray
    newState[payload] = {
      width: 300,
      height: 150,
      z: newState.trayZ,
      ...overrides
    }
    return newState
  })
}

const tags = ['TEXTAREA', 'INPUT']
let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  } else {
    target.dataset.paused = null
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}

function launchTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  const { url } = $.learn()[tray]

  window.top.location.href = url
}

function preventDefault(e) { e.preventDefault() }
$.when('contextmenu', '.tray-title-bar', preventDefault)
$.when('pointerdown', '.tray-title-bar', grab)
$.when('pointerdown', '.tray-wake', grab)
$.when('pointerdown', '.tray-resize', resize)

$.when('pointermove', '.terminal-canvas', drag)
$.when('pointermove', '.tray-title-bar', drag)
$.when('pointermove', '.tray-wake', drag)
$.when('pointermove', '.tray-resize', drag)

// ungrab is important to come fairly last so early returns grab grabbing right
$.when('dblclick', '.tray-title-bar', toggleMax)
//$.when('click', '.tray-maxer', toggleMax)
$.when('pointerup', '.terminal-canvas', ungrab)
$.when('pointerup', '.terminal-canvas', unresize)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('pointerup', '.tray-wake', ungrab)
$.when('pointerup', '.tray-resize', unresize)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-launch', launchTray)
$.when('click', '.tray-min', toggleMin)
$.when('click', '.tray-max', toggleMax)

$.when('click', '.pane-select', selectPane)
$.when('dblclick', '.app-select', selectApp)

$.when('click', '[data-scan]', (event) => {
  $.teach({ scanCode: !$.learn().scanCode, activeQr: null })
})

$.when('click', '.qr-activate', (event) => {
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
  const blob = new Blob([byteArray], { type: 'image/jpeg' });

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);

  const src = `/private/camera-roll/${timestamp}.jpg`

  // Attempt to upload to server
  fetch(src, {
      method: 'POST',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
        "Authorization": `Basic ${authorization}`
      }
  }).then(response => {
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

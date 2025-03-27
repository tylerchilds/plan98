import elf from '@silly/elf'
import { systemMenu } from './paper-pocket.js'

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

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
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
          <iframe src="${url}" title="${url}"></iframe>
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
    <div class="desktop">
    <plan98-console style="position: absolute;"></plan98-console>
      <div class="trays"></div>
      <div class="zero-state">Welcome to desktop mode. Slice open a window by dragging anywhere and then select your app.</div>
      <div class="cursor"></div>
      <canvas></canvas>
    </div>
    <div class="taskbar">
      <button data-snap>
        Snap
      </button>
    </div>
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
}

function syncTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  let { buffer, url } = $.learn()[tray]
  buffer ||= url
  url = buffer.startsWith('/')
    ? buffer
    : buffer.indexOf('://')
      ? buffer
      : '/app/giggle-search?query=' + buffer

  event.target.closest('.tray').querySelector('iframe').src = url
  setState(tray, { url, focused: false, minimized: false })
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
  }

  & .taskbar {
    background: rgba(0,0,0,.85);
    z-index: 2;
    padding: .5rem;
  }

  & > video {
    pointer-events: none;
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
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
      0px .2rem 0 1px var(--red),
      0px .7rem 0 1px var(--orange),
      0px 1.2rem 0 1px var(--yellow);
    display: block;
    margin: 0;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & canvas {
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
      0px .2rem 0 1px var(--purple),
      0px .7rem 0 1px var(--blue),
      0px 1.2rem 0 1px var(--green);
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



  & .input-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    text-align: left;
  }

  & *:focus {
    outline: 3px solid var(--underline-color, mediumseagreen);
  }

  & .hyper-name {
    display: flex;
    overflow: hidden;
  }

  & .file-name {
    white-space: nowrap;
    padding-right: 2rem;
  }
  & .hyper-sentence {
    white-space: nowrap;
    margin-left: auto;
    overflow: hidden;
    color: rgba(255,255,255,.65);
  }

`)

$.when('pointerdown', 'canvas', start)

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

$.when('pointermove', 'canvas', move)

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
$.when('pointerup', 'canvas', end)
function end (e) {
  const { grabbing, resizing } = $.learn()
  if(grabbing || resizing) return
  const { focusedTray, startX, x, y, invertX, invertY, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')

  const tray = self.crypto.randomUUID()
  $.teach(tray, (state, payload) => {
    const width = Math.max(300, Math.abs(x))
    const height = Math.max(150, Math.abs(y))
    const newState = {...state}
    newState.trays.push(payload)
    newState.trayZ += 1
    newState.focusedTray = tray
    newState[payload] = {
      width,
      height,
      x: invertX ? startX + x : startX,
      y: invertY ? startY + y : startY,
      z: newState.trayZ,
      url: `/app/paper-pocket`
    }
    return newState
  })

  $.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

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
$.when('pointerdown', '.tray-resize', resize)

$.when('pointermove', 'canvas', drag)
$.when('pointermove', '.tray-title-bar', drag)
$.when('pointermove', '.tray-resize', drag)

// ungrab is important to come fairly last so early returns grab grabbing right
$.when('dblclick', '.tray-title-bar', toggleMax)
//$.when('click', '.tray-maxer', toggleMax)
$.when('pointerup', 'canvas', ungrab)
$.when('pointerup', 'canvas', unresize)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('pointerup', '.tray-resize', unresize)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-sync', syncTray)
$.when('click', '.tray-launch', launchTray)
$.when('click', '.tray-min', toggleMin)
$.when('click', '.tray-max', toggleMax)

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
  const timestamp = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + '-' +
      String(now.getHours()).padStart(2, '0') + '-' +
      String(now.getMinutes()).padStart(2, '0') + '-' +
      String(now.getSeconds()).padStart(2, '0');

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

  // Attempt to upload to server
  fetch(`/private/camera-roll/${timestamp}.jpg`, {
      method: 'POST',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
        "Authorization": `Basic ${authorization}`
      }
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

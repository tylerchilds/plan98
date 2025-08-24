import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import $paperPocket, { getTheme, afterUpdateTheme } from './paper-pocket.js'
import { updateDraft } from './time-machine.js'
import { launch } from './plan98-synthia.js'

import { get, put } from './plan98-wallet.js'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
let strokeRevisory = []
const thicknoids = [1, 4, 16, 64, 256]
const overlays = { color: 'color' }

const $ = elf('joke-book', {
  background: 'lemonchiffon',
  color: 'saddlebrown',
  drawer: 'size',
  thickness: 4
})

function engine(target) {
  const root = target.closest($.link)
  const canvas = root.querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return {
    canvas,
    rectangle,
    src: root.getAttribute('src')
  }
}

$.draw(target => {
  if(target.innerHTML) {
    requestAnimationFrame(() => update(target))
    return null
  }
  mount(target)
})

function update(target) {
  {
    afterUpdateTheme($paperPocket, target)
  }

  {
    const { touching } = $.learn()
    target.dataset.touching = touching
  }

  {
    const { thickness } = $.learn()
    target.dataset.size = thickness
  }

  {
    const { color } = $.learn()
    if(target.color !== color) {
      target.style.setProperty('--active-color', color)
    }
  }

  {
    const { drawer } = $.learn()
    target.dataset.drawer = drawer
  }

  {
    const { overlay } = $.learn()
    if(target.overlay !== overlay) {
      target.dataset.overlay = overlay
    }
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

function mount(target) {
  target.innerHTML = `
    <div class="island">
      <span>
        <button data-undo class="standard-button -round bias-generic">
          <sl-icon name="arrow-counterclockwise"></sl-icon>
        </button>
      </span>
      <span class="home">
        <button class="standard-button -round bias-positive" data-assistant>
          <sl-icon name="house-heart-fill"></sl-icon>
        </button>
      </span>
      <span>
        <button data-redo class="standard-button -round bias-generic">
          <sl-icon name="arrow-clockwise"></sl-icon>
        </button>
      </span>
    </div>
    <div class="overlays">
      <div class="overlay-color">
        <plan98-palette></plan98-palette>
      </div>
    </div>
    <button data-stroke-color class="color-sample">
    </button>
  `

  const canvas = document.createElement('canvas')
  self.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = self.innerWidth - 32;
    canvas.height = self.innerHeight - 32;
    const context = canvas.getContext('2d')
    context.fillStyle = $.learn().background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  resizeCanvas();
  target.appendChild(canvas)
  update(target)

  const src = target.getAttribute('src')
  if(src) {
    get(src).then(blob => {
      if(blob) {
        blob.text().then(str => JSON.parse(str)).then(data => {
          if(data.strokeHistory) {
            strokeHistory = data.strokeHistory
          }

          if(data.strokeRevisory) {
            strokeRevisory = data.strokeRevisory
          }
          redraw(target)
        })
      }
    })
  }
}

const requestIdleCallback = window.requestIdleCallback || function (fn) { setTimeout(fn, 1) };

/**
 * This function takes in an array of points and draws them onto the canvas.
 * @param {array} stroke array of points to draw on the canvas
 * @return {void}
 */
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

$.when('click', '[data-assistant]', (event) => {
  launch()
})

$.when('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.teach({ color, overlay: 'none' })
})

$.when('click', '[data-help]', function  (event) {
  event.preventDefault()
  window.location.href = "/app/cool-chat"
})

$.when('click', '[data-stroke-color]', function  (event) {
  event.preventDefault()
  $.teach({
    overlay: overlays.color,
    activeMenu: null,
  })
})

$.when('click', '[data-drawer]', function  (event) {
  event.preventDefault()
  const { drawer } = event.target.dataset
  $.teach({ drawer: drawer === $.learn().drawer ?null:drawer })
})

$.when('click', '[data-thickness]', function  (event) {
  event.preventDefault()
  $.teach({
    activeMenu: null,
    thickness: parseInt(event.target.dataset.thickness) || 1
  })
})


$.when('click', '[data-journal]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/time-machine'
})

$.when('click', '[data-violion]', function  (event) {
  event.preventDefault()
  window.location.href = '/app/tiniest-violin'
})


$.when('click', '[data-save]', ({ target }) => publish(target))

function publish (target) {
  const { canvas, src } = engine(target)
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

  const image = `/private/${$.link}/${timestamp}.jpg`

  const data = { src: image, strokeHistory, strokeRevisory }

  // Attempt to upload to server
  put(image, byteArray, { type: 'image/jpeg' }).then(res => {
    if(res.ok) {
      updateDraft(data)
    } else {
      throw new Error('Upload failed')
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

  $.teach({ activeMenu: null })
}

$.when('click', '[data-new]', function (event) {
  event.preventDefault()
  strokeHistory = []
  redraw(event.target)
  $.teach({ activeMenu: null })
})

$.when('click', '[data-download]', function (event) {
  event.preventDefault()
  const { canvas } = engine(event.target)
  const now = new Date();
  const timestamp = now.toJSON()
  const dataURL = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.download = `${timestamp}.jpg`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  $.teach({ activeMenu: null })
})

/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
$.when('click', '[data-undo]', function undoDraw (event) {
  event.preventDefault()
  if(strokeHistory.length === 0) {
    return
  }
  const stroke = strokeHistory.pop()
  strokeRevisory.unshift(stroke)
  redraw(event.target)
})

function redraw(target) {
  const { canvas, src } = engine(target)
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

  if(src) {
    publish(target)
  }
}

$.when('click', '[data-redo]', function redoDraw (event) {
  event.preventDefault()
  if(strokeRevisory.length === 0) return

  const stroke = strokeRevisory.shift()
  strokeHistory.push(stroke)
  redraw(event.target)
})

function getThicknessWithEasing(x, y, rectangle, easingFunction) {
  const centerX = rectangle.width / 2;
  const centerY = rectangle.height / 2;

  // Calculate distance from center in both dimensions
  const distanceX = Math.abs(x - centerX);
  const distanceY = Math.abs(y - centerY);

  // Maximum possible distances
  const maxDistanceX = rectangle.width / 2;
  const maxDistanceY = rectangle.height / 2;

  // Normalize both distances (0 to 1)
  const normalizedX = distanceX / maxDistanceX;
  const normalizedY = distanceY / maxDistanceY;

  // Use the maximum of the two distances for "rectangular" zones
  const maxDistance = Math.max(normalizedX, normalizedY);

  // Apply easing
  const easedDistance = easingFunction(maxDistance);

  return 1 + easedDistance * 125;
}

$.when('touchstart', 'canvas', start)
$.when('mousedown', 'canvas', start)

function start(e) {
  const { canvas, rectangle } = engine(e.target)
  $.teach({ touching: true })
  const context = canvas.getContext('2d')
  let pressure = 0.1;
  let x, y;
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  const thickness = getThicknessWithEasing(x, y, rectangle, x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  isMousedown = true

  lineWidth = Math.log(pressure + 1) * thickness
  context.lineWidth = lineWidth// pressure * 50;

  points.push({ x, y, lineWidth })
  drawOnCanvas(e.target, points)

  $.teach({ thickness })
}

$.when('touchmove', 'canvas', move)
$.when('mousemove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { canvas, rectangle } = engine(e.target)
  const { thickness, color } = $.learn()
  const context = canvas.getContext('2d')
  if (!isMousedown) return

  let pressure = 0.1
  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  // smoothen line width
  lineWidth = (Math.log(pressure + 1) * thickness * 4 * 0.2 + lineWidth * 0.8)
  points.push({ x, y, lineWidth, color })

  drawOnCanvas(e.target, points);

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

$.when('touchend', 'canvas', end)
$.when('touchleave', 'canvas', end)
$.when('mouseup', 'canvas', end)
function end (e) {
  const { src, canvas, rectangle } = engine(e.target)
  $.teach({ touching: false })
  const context = canvas.getContext('2d')
  let pressure = 0.1;
  let x, y;

  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"]
    }
    x = e.touches[0].clientX - rectangle.left
    y = e.touches[0].clientY - rectangle.top
  } else {
    pressure = 1.0
    x = e.clientX - rectangle.left
    y = e.clientY - rectangle.top
  }

  isMousedown = false

  strokeHistory.push([...points]); points = []

  lineWidth = 0

  if(src) {
    publish(e.target)
  }
};

const paneByTarget = (target) => {
  const { id } = target.closest('window-pane')
  return paneById(id)
}

function setState(tray, payload) {
  $.teach(payload, {
    mergeHandler: mergeByTray,
    parameters: [tray]
  })
}

function mergeByTray(state) {
  return {
    ...state,
    [tray]: {
      ...state[tray],
      ...payload
    }
  }
}

$.when('mousedown', '.tray-title-bar', grab)
$.when('mousemove', '.tray-title-bar', drag)
$.when('mouseup', '.tray-title-bar', ungrab)
$.when('mouseout', '.tray-title-bar', ungrab)
$.when('input', '.picker', setColor)
$.when('click', '.tray-close', closeTray)

function setColor(event) {
  event.preventDefault()
  const { target } = event.target.dataset
  const { value } = event.target

  $.teach({ [target]: value })
  redraw(event.target)
}

function closeTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  setState(tray, { visible: false })
}

// grab a pane
function grab({ target }) {
  const { tray } = event.target.dataset
  const { z } = $.learn()[tray]
  const { trayZ } = $.learn()
  const newZ = trayZ + 1

  setState(tray, { grabbed: true, z: newZ })
  $.teach({ trayZ: newZ })
}

// drag a pane
function drag(event) {
  const { target, movementX, movementY } = event

  const { tray } = target.dataset
  const { grabbed, x, y } = $.learn()[tray]

  if(grabbed) {
    setState(tray, {
      x: x + movementX,
      y: y + movementY
    })
  }
}

// release a pane
function ungrab({ target }) {
  const { tray } = target.dataset
  setState(tray, { grabbed: false })
}

$.style(`

  time-machine & .home {
    display: none;
  }

  & {
    display: block;
    height: 100%;
    position: relative;
    z-index: 1;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }

  & .logo-area {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 100%;
  }

  &[data-touching="true"] .palette {
    pointer-events: none;
    opacity: .15;
    transition: opacity 1000ms ease-in-out;
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }

  & .palette {
    z-index: 10;
    background: var(--active-color, black);
    position: absolute;
    top: 0;
    left: 0;
    right: auto;
    display: none;
    background: rgab(0,0,0,.85);
    transition: opacity 100ms ease-in-out;
  }

  @media screen {
    & {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: 2rem 1fr;
    }

    & .palette {
      display: inline-block;
    }
  }

  & .palette button {
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    padding: 1rem;
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .palette button > * {
    pointer-events: none;
  }

  & .palette button:focus,
  & .palette button.active,
  & .palette button:hover {
    background: rgba(255,255,255,.35);
  }

  & .menu-item {
    position: relative;
  }

  & .palette-items {
    display: none;
    background: rgba(0,0,0,1);
    position: absolute;
    top: 40px;
    left: 40px;
    max-height: calc(100vh - 40px);
    max-width: calc(100vw - 40px);
    overflow: auto;
  }

  & [data-menu-target].active + .palette-items {
    display: block;
  }

  & .palette-items  button {
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    padding: .5rem;
    gap: .5rem;
    text-align: left;
    display: block;
  }

  & [data-pocket] {
    display: none;
    background: rgba(255,255,255,.25);
  }
  &[data-drawer="size"] [data-pocket="size"] {
    display: flex;
    max-width: 100%;
    overflow-x: auto;
  }

  ${thicknoids.map(x => `
    &[data-size="${x}"] [data-thickness="${x}"] {
      background: rgba(255,255,255,.85) !important;
      color: rgba(0,0,0,.85) !important;
    }
  `).join('')}

  & .overlays {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 4;
  }

  & canvas {
    inset: 16px;
    position: absolute;
    z-index: 1;
  }

  & .island {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    pointer-events: none;
    z-index: 3;
    display: inline-flex;
    place-content: center;
    gap: 1rem;
  }

  & .island  button {
    pointer-events: all;
  }

  &[data-overlay="color"] .overlays {
    display: grid;
  }

  &[data-overlay="color"] .palette {
    display: none;
  }

  & .color-sample {
    background: var(--active-color, saddlebrown);
    position: absolute;
    inset: 0;
    border: 0;
    border-radius: 0;
  }
`)

/*
$.when('pointerdown', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})
*/

$.when('click', '[data-menu-target]', (event) => {
  event.preventDefault()
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

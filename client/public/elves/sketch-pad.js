import elf from '@plan98/elf'
import { toast } from './plan98-toast.js'
import $paperPocket, { getTheme, afterUpdateTheme } from './paper-pocket.js'
import { save } from './time-machine.js'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
const strokeRevisory = []
const thicknoids = [1, 4, 16, 64, 256]
const overlays = { color: 'color' }

const $ = elf('sketch-pad', {
  background: 'lemonchiffon',
  color: 'saddlebrown',
  drawer: 'size',
  thickness: 1
})

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
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

  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }
}

function mount(target) {
  target.innerHTML = `
    <div class="drop-down">
      <div class="menu-item">
        <button data-menu-target="edit">
          <plan98-icon></plan98-icon>
        </button>
        <div class="dropdown-items" data-menu="edit">
          <button data-stroke-color><span class="color-sample"></span>Color</button>
          <button data-drawer="size">Size</button>
          <div data-pocket="size">
            ${thicknoids.map(x => `
              <button data-thickness="${x}">${x}</button>
            `).join('')}
          </div>
          <button data-undo>Undo</button>
          <button data-redo>Redo</button>
          <button data-journal>Journal</button>
          <button data-help>
            Help
          </button>
          <button data-download>Download</button>
          <button data-save>Save</button>
          <!--<button data-save-as>Save As</button>-->
          <button data-new>New</button>
        </div>
      </div>
    </div>
    <div class="overlays">
      <div class="overlay-color">
        <plan98-palette></plan98-palette>
      </div>
    </div>
  `

  const canvas = document.createElement('canvas')
  self.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    const context = canvas.getContext('2d')
    context.fillStyle = $.learn().background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  resizeCanvas();
  target.appendChild(canvas)
  update(target)
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

$.when('input', 'plan98-palette', (event) => {
  const { color } = event.detail
  $.teach({ color, overlay: 'none' })
})

$.when('click', '[data-help]', function  (event) {
  window.location.href = "/app/cool-chat"
})

$.when('click', '[data-stroke-color]', function  (event) {
  $.teach({
    overlay: overlays.color,
    activeMenu: null,
  })
})

$.when('click', '[data-drawer]', function  (event) {
  const { drawer } = event.target.dataset
  $.teach({ drawer: drawer === $.learn().drawer ?null:drawer })
})

$.when('click', '[data-thickness]', function  (event) {
  $.teach({
    activeMenu: null,
    thickness: parseInt(event.target.dataset.thickness) || 1
  })
})


$.when('click', '[data-journal]', function  (event) {
  window.location.href = '/app/time-machine'
})

$.when('click', '[data-save]', function (event) {
  const { canvas } = engine(event.target)
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

  // Attempt to upload to server
  fetch(`/private/${$.link}/${timestamp}.jpg`, {
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

    toast('Saved!', { type: 'success' })
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
})

$.when('click', '[data-new]', function (event) {
  strokeHistory = []
  redraw(event)
  $.teach({ activeMenu: null })
})

$.when('click', '[data-download]', function (event) {
  const { canvas } = engine(event.target)
  
  const data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href = data
  $.teach({ activeMenu: null })
})

/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
$.when('click', '[data-undo]', function undoDraw (event) {
  if(strokeHistory.length === 0) {
    return
  }
  const stroke = strokeHistory.pop()
  strokeRevisory.unshift(stroke)
  redraw(event)
})

function redraw(event) {
  const { canvas } = engine(event.target)
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
      drawOnCanvas(event.target, strokePath)
    })
  })
}

$.when('click', '[data-redo]', function redoDraw (event) {
  if(strokeRevisory.length === 0) return

  const stroke = strokeRevisory.shift()
  strokeHistory.push(stroke)
  redraw(event)
})


$.when('touchstart', 'canvas', start)
$.when('mousedown', 'canvas', start)

function start(e) {
  const { canvas, rectangle } = engine(e.target)
  $.teach({ touching: true })
  const { thickness } = $.learn()
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

  isMousedown = true

  lineWidth = Math.log(pressure + 1) * thickness
  context.lineWidth = lineWidth// pressure * 50;

  points.push({ x, y, lineWidth })
  drawOnCanvas(e.target, points)
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
  const { canvas, rectangle } = engine(e.target)
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

  requestIdleCallback(function () { strokeHistory.push([...points]); points = []})

  lineWidth = 0
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
  const { target } = event.target.dataset
  const { value } = event.target

  $.teach({ [target]: value })
  redraw(event)
}

function closeTray(event) {
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
  & {
    display: block;
    height: 100%;
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
  }

  &[data-touching="true"] .drop-down {
    pointer-events: none;
    opacity: .15;
    transition: opacity 1000ms ease-in-out;
  }

  & .drop-down {
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

    & .drop-down {
      display: inline-block;
    }
  }

  & .drop-down button {
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

  & .drop-down button > * {
    pointer-events: none;
  }

  & .drop-down button:focus,
  & .drop-down button.active,
  & .drop-down button:hover {
    background: rgba(255,255,255,.35);
  }

  & .menu-item {
    position: relative;
  }

  & .dropdown-items {
    display: none;
    background: rgba(0,0,0,1);
    position: absolute;
    top: 40px;
    left: 40px;
    max-height: calc(100vh - 40px);
    overflow: auto;
  }

  & [data-menu-target].active + .dropdown-items {
    display: block;
  }

  & .dropdown-items  button {
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
  }

  &[data-overlay="color"] .overlays {
    display: grid;
  }

  &[data-overlay="color"] .drop-down {
    display: none;
  }

  & .color-sample {
    width: .85rem;
    height: .85rem;
    background: var(--active-color, saddlebrown);
    border-radius: 100%;
    display: inline-block;
    margin-right: .5rem;
  }
`)


$.when('pointerdown', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

$.when('click', '[data-menu-target]', (event) => {
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

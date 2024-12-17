import module from '@silly/elf'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
const strokeRevisory = []

const $ = module('story-board', {
  color: 'white',
  background: '#54796d',
  trays: ['stroke-tray', 'fill-tray', 'sound-tray', 'silly-tray'],
  trayZ: 3,
  'stroke-tray': {
    label: "Set Stroke",
    visible: false,
    x: 20,
    y: 50,
    z: 1,
    body: `
      <input class="picker" type="color" data-target="color" />
    `
  },
  'fill-tray': {
    label: "Set Fill",
    visible: false,
    x: 50,
    y: 100,
    z: 2,
    body: `
      <input class="picker" type="color" data-target="background" />
    `
  },
  'sound-tray': {
    label: "Sound",
    visible: false,
    width: 320,
    height: 480,
    x: 30,
    y: 30,
    z: 4,
    body: `
      <iframe src="/app/dial-tone"></iframe>
    `
  },
  'silly-tray': {
    label: "Blueprint",
    visible: false,
    width: 640,
    height: 480,
    x: 100,
    y: 150,
    z: 3,
    body: `
      <iframe src="/app/draw-term"></iframe>
    `
  }

})

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

$.draw(target => {
  if(target.innerHTML) return update(target)
  mount(target)
})

function update(target) {
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

  { // windows
    const { trays } = $.learn()
    trays.map(tray => {
      const {x, y, z, visible} = $.learn()[tray]
      const node = target.querySelector('#'+tray)
      node.style.setProperty("--x", `${x}px`);
      node.style.setProperty("--y", `${y}px`);
      node.style.setProperty("--z", `${z}`);
      node.style.display = visible ? 'grid' : 'none'
      const icon = target.querySelector(`[data-menu="view"] [data-tray="${tray}"] sl-icon`)
      icon.name = visible ? 'check-square' : 'square'
    })
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

  return null // don't send anything back
}

function mount(target) {
  const { trays } = $.learn()
  const trayViews = trays.map(tray => {
    const { width, height, x, y, z, visible, label, body } = $.learn()[tray]

    return `
      <div class="tray" id="${tray}" style="--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z); display: ${visible ? 'grid' : 'none'}">
        <div class="tray-title-bar" data-tray="${tray}">
          ${label}
          <button class="tray-close" data-tray="${tray}">
            <sl-icon name="x-circle"></sl-icon>
          </button>
        </div>
        <div class="tray-body">
          ${body}
        </div>
      </div>
    `
  }).join('')
  target.innerHTML = `
    <div class="actions">
      <a href="/app/saga-about" style="height: 2rem; width: 2rem;" class="nonce">

      </a>
      <div class="menu-item">
        <button data-menu-target="file">
          File
        </button>
        <div class="menu-actions" data-menu="file">
          <button data-new>New</button>
          <button data-save-as>Save As</button>
          <button data-save>Save</button>
          <button data-download>Download</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="edit">
          Edit
        </button>
        <div class="menu-actions" data-menu="edit">
          <button data-undo>Undo</button>
          <button data-redo>Redo</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="view">
          View
        </button>
        <div class="menu-actions" data-menu="view">
          <button data-set-fill data-tray="fill-tray">
            <span>
              <sl-icon name="square"></sl-icon>
            </span>
            <span>Set Fill</span>
          </button>
          <button data-set-stroke data-tray="stroke-tray">
            <span>
              <sl-icon name="square"></sl-icon>
            </span>
            <span>Set Stroke</span>
          </button>
          <button data-set-silly data-tray="silly-tray">
            <span>
              <sl-icon name="square"></sl-icon>
            </span>
            <span>Terminal</span>
          </button>
          <button data-set-sound data-tray="sound-tray">
            <span>
              <sl-icon name="square"></sl-icon>
            </span>
            <span>Audio Notes</span>
          </button>

        </div>
      </div>
    </div>

    ${trayViews}
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


$.when('click', '[data-new]', function download (event) {
  strokeHistory = []
  redraw(event)
})

$.when('click', '[data-download]', function download (event) {
  const { canvas } = engine(event.target)
  
  const data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href = data
})

$.when('click', '[data-set-fill]', function setFill (event) {
  const visible = !$.learn()['fill-tray'].visible
  setState('fill-tray', { visible })
})

$.when('click', '[data-set-silly]', function setSilly (event) {
  const visible = !$.learn()['silly-tray'].visible
  setState('silly-tray', { visible })
})

$.when('click', '[data-set-sound]', function setSilly (event) {
  const visible = !$.learn()['sound-tray'].visible
  setState('sound-tray', { visible })
})


$.when('click', '[data-set-stroke]', function setStroke (event) {
  const visible = !$.learn()['stroke-tray'].visible
  setState('stroke-tray', { visible })
})
/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
$.when('click', '[data-undo]', function undoDraw (event) {
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

  lineWidth = Math.log(pressure + 1)
  context.lineWidth = lineWidth// pressure * 50;

  points.push({ x, y, lineWidth })
  drawOnCanvas(e.target, points)
}

$.when('touchmove', 'canvas', move)
$.when('mousemove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { color } = $.learn()
  const { canvas, rectangle } = engine(e.target)
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
  lineWidth = (Math.log(pressure + 1) * 4 * 0.2 + lineWidth * 0.8)
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

  & .actions {
    z-index: 10;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: none;
    background: lemonchiffon;
    height: 2rem;
  }

  @media screen {
    & {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: 2rem 1fr;
    }

    & .actions {
      display: flex;
    }
  }

  & .actions button {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    padding: .25rem .5rem;
    font-size: 1rem;
    height: 100%;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .actions button.active,
  & .actions button:hover {
    color: #fff;
    background: #54796d;
  }

  & .menu-item {
    position: relative;
  }

  & .menu-actions {
    display: none;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    background: #54796d;
  }

  & [data-menu-target].active + .menu-actions {
    display: block;
  }

  & .menu-actions  button {
    width: 100%;
    text-align: left;
    white-space: nowrap;
  }

  & .tray {
    position: absolute;
    width: var(--width, 160px);
    height: var(--height, 90px);
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 2px;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .tray-title-bar {
    padding: 9px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none;
    position: relative;
    display: flex;
  }

  & .tray-body {
    background: white;
    color: black;
    height: 100%;
  }

  & .tray [type="color"] {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0;
  }

  & .tray-close {
    margin-left: auto;
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
  }
`)

$.when('click', '*', (event) => {
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

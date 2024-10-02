import module from '@silly/tag'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
const strokeRevisory = []

const modes = {
  draw: 'draw',
  cursor: 'cursor',
  chat: 'chat',
  move: 'move',
  camera: 'camera',
  calendar: 'calendar'
}

const $ = module('bulletin-board', {
  mode: modes.move,
  panX: -2500 + document.documentElement.clientWidth / 2,
  panY: -2500 + document.documentElement.clientHeight / 2,
  color: 'white',
  background: '#54796d',
  displays: ['display-self', 'display-iphone', 'display-watch', 'display-ipad'],
  'display-self': {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
  'display-ipad': {
    width: 1024,
    height: 768,
  },
  'display-iphone': {
    width: 320,
    height: 480,
  },
  'display-watch': {
    width: 140,
    height: 160,
  },
})

function engine(target) {
  const canvas = target.closest($.link).querySelector('.canvas.stack')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

$.draw(target => {
  if(target.innerHTML) return update(target)
  mount(target)
}, { afterUpdate })

function afterUpdate(target) {
  {
    const { displays } = $.learn()
    displays.map(renderDisplays(target))
  }

  {
    const workspace = target.querySelector('.workspace')
    const { mode } = $.learn()
    if(workspace.dataset.mode !== mode) {
      workspace.dataset.mode = mode
      const buttons = [...target.querySelectorAll('[data-mode]')]
      buttons.map(x => x.classList.remove('active'))
      target.querySelector(`[data-mode="${mode}"]`).classList.add('active')
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const camera = target.querySelector('.camera')
    if(camera && mode === modes.camera) {
      camera.innerHTML = `
        <live-help room="${src}" class="stack"></live-help>
      `
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

function renderDisplays(target) {
  const container = target.querySelector('.displays')
  return function runtime(display) {
    const {
      width,
      height,
    } = $.learn()[display]

    let node = container.querySelector(`[data-id="${display}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('display');
      node.dataset.id = display
      container.appendChild(node)
    }

    node ? node.style = `--width: ${width}px; --height: ${height}px;` : null
  }
}

function update(target) {
  {
    const { panX, panY } = $.learn()
    const workspace = target.querySelector('.workspace')
    workspace.style.setProperty("--pan-x", panX + 'px');
    workspace.style.setProperty("--pan-y", panY + 'px');
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
  const { panX, panY } = $.learn()
  target.innerHTML = `
    <div class="actions">
      <div class="menu-group">
        <button data-mode="move">
          <sl-icon name="arrows-move"></sl-icon>
        </button>
        <button data-mode="draw">
          <sl-icon name="pencil"></sl-icon>
        </button>
        <button data-mode="cursor">
          <sl-icon name="cursor"></sl-icon>
        </button>
        <button data-mode="camera">
          <sl-icon name="camera-reels"></sl-icon>
        </button>
        <button data-mode="chat">
          <sl-icon name="chat"></sl-icon>
        </button>
        <button data-mode="calendar">
          <sl-icon name="calendar3"></sl-icon>
        </button>
      </div>
      <div class="menu-item">
        <button data-menu-target="edit">
          <sl-icon name="watch"></sl-icon>
        </button>
        <div class="menu-actions" data-menu="edit">
          <button data-undo>
            <span>
            <sl-icon name="arrow-counterclockwise"></sl-icon>
            </span>
            Undo
          </button>
          <button data-redo>
            <span>
            <sl-icon name="arrow-clockwise"></sl-icon>
            </span>
            Redo
          </button>
        </div>
      </div>
    </div>
    <div class="workspace" style="--pan-x: ${panX}px; --pan-y: ${panY}px;">
      <div class="stack camera"></div>
      <draw-term background="transparent" color="lemonchiffon" class="stack"></draw-term>
      <div class="displays stack"></div>
    </div>
  `

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.classList.add('stack')
  canvas.classList.add('canvas')

  canvas.width = 5000;
  canvas.height = 5000;
  context.fillStyle = $.learn().background
  context.fillRect(0, 0, canvas.width, canvas.height)

  target.querySelector('.workspace').appendChild(canvas)
}

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

$.when('click', '[data-mode]', function updateMode (event) {
  const { mode } = event.target.dataset
  $.teach({ mode })
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


$.when('pointerdown', 'canvas', start)
$.when('pointermove', 'canvas', move)
$.when('pointerup', 'canvas', end)

const startModes = {
  'draw': startDraw,
  'move': startMove,
}

const moveModes = {
  'draw': moveDraw,
  'move': moveMove,
}

const endModes = {
  'draw': endDraw,
  'move': endMove,
}



function start(e) {
  const { mode } = $.learn()

  if(startModes[mode]) {
    startModes[mode](e)
  }
}

function move(e) {
  const { mode } = $.learn()

  if(moveModes[mode]) {
    moveModes[mode](e)
  }
}

function end(e) {
  const { mode } = $.learn()

  if(endModes[mode]) {
    endModes[mode](e)
  }
}



function startDraw(e) {
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

function startMove(e) {
  const { rectangle } = engine(e.target)
  const panStartX = e.clientX - rectangle.left
  const panStartY = e.clientY - rectangle.top

  $.teach({ panStartX, panStartY, panHappening: true })
}

function moveDraw(e) {
  e.preventDefault()

  const { color } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  if (!isMousedown) return

  console.log(e)
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

function moveMove(e) {
  const { rectangle } = engine(e.target)
  let { panX, panY, panStartX, panStartY, panHappening } = $.learn()

  if(!panHappening) return

  panX += e.clientX - panStartX - rectangle.left
  panY += e.clientY - panStartY - rectangle.top

  console.log(panX, panY)
  $.teach({ panX, panY })
}

function endDraw(e) {
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

function endMove(e) {

  $.teach({ startX: null, startY: null, panHappening: false })
}


$.style(`
  & {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: block;
    background: black;
  }

  & .workspace {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    grid-template-areas: "root-of-${$.link}";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0));
  }

  & canvas {
    touch-action: none;
  }

  & .actions {
    z-index: 10;
    background: transparent;
    position: absolute;
    bottom: 0;
    right: 0;
    display: none;
  }

  & .display {
    width: var(--width, 160px);
    height: var(--height, 90px);
    border: 5px solid rgba(255,255,255,.85);
    position: absolute;
    inset: 0;
    margin: auto;
  }

  @media screen {
    & .actions {
      display: flex;
    }
  }

  & .actions button {
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
    font-size: 2rem;
    padding: 1rem;
    line-height: 1;
    display: inline-flex;
  }

  & .actions button:focus,
  & .actions button.active,
  & .actions button:hover {
    color: #fff;
    background: #54796d;
  }

  & .menu-group {
    display: flex;
  }

  & .menu-item {
    position: relative;
  }

  & .menu-actions {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateY(-100%);
    background: #54796d;
  }

  & [data-menu-target].active + .menu-actions {
    display: block;
  }

  & .menu-actions  button {
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    padding: .5rem;
    gap: .5rem;
  }

  & .stack {
    grid-area: root-of-${$.link};
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & live-help,
  & draw-term {
    pointer-events: none;
    opacity: .5;
  }

  & draw-term .tray[data-focused="true"] {
    pointer-events: none;
  }

  & [data-mode="${modes.cursor}"] draw-term .tray[data-focused="true"] {
    pointer-events: all;
  }

  & [data-mode="${modes.camera}"] live-help,
  & [data-mode="${modes.cursor}"] draw-term {
    pointer-events: all;
    opacity: 1;
  }

  & draw-term.stack {
    width: 5000px;
    height: 5000px;
  }
  & .canvas.stack {
    width: auto;
    height: auto;
  }
  & .displays.stack {
    display: grid;
    width: 5000px;
    height: 5000px;
    position: relative;
    pointer-events: none;
    mix-blend-mode: soft-light;
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

self.addEventListener("resize", function () {
  $.teach({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  }, (s,p) => {
    return {
      ...s,
      'display-self': {
        ...s['display-self'],
        ...p
      }
    }
  })
});

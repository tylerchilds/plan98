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
  note: 'note',
  move: 'move',
  map: 'map',
  gallery: 'gallery',
  camera: 'camera',
  calendar: 'calendar',
  gaming: 'gaming',
}

const $ = module('bulletin-board', {
  mode: modes.cursor,
  panX: -2500 + document.documentElement.clientWidth / 2,
  panY: -2500 + document.documentElement.clientHeight / 2,
  panXmod: 0,
  panYmod: 0,
  zoom: 1,
  color: 'white',
  background: 'dodgerblue',
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
    const { mode } = $.learn()
    if(target.dataset.mode !== mode) {
      target.dataset.mode = mode
      const buttons = [...target.querySelectorAll('[data-mode]')]
      buttons.map(x => x.classList.remove('active'))
      target.querySelector(`[data-mode="${mode}"]`).classList.add('active')
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const camera = target.querySelector('.camera')
    if(!camera.innerHTML && mode === modes.camera) {
      camera.innerHTML = `
        <live-help src="${src}" class="stack"></live-help>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const note = target.querySelector('.note')
    if(!note.innerHTML && mode === modes.note) {
      note.innerHTML = `
        <simpleton-client src="${src || '/404'}"></simpleton-client>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const gallery = target.querySelector('.gallery')
    if(!gallery.innerHTML && mode === modes.gallery) {
      gallery.innerHTML = `
        <comedy-day src="${src}" class="stack"></comedy-day>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const gaming = target.querySelector('.gaming')
    if(!gaming.innerHTML && mode === modes.gaming) {
      gaming.innerHTML = `
        <generic-park src="/public/elves" class="stack"></generic-park>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const map = target.querySelector('.map')
    if(!map.innerHTML && mode === modes.map) {
      map.innerHTML = `
        <middle-earth src="${src}" class="stack"></middle-earth>
      `
    }

    if(map && map.querySelector('middle-earth')) {
      map.querySelector('middle-earth')?.map.invalidateSize()
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const chat = target.querySelector('.chat')
    if(!chat.innerHTML && mode === modes.chat) {
      chat.innerHTML = `
        <time-team room="1" src="${src}" class="stack"></time-team>
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
    const { panX, panY, panXmod, panYmod, zoom } = $.learn()
    const workspace = target.querySelector('.workspace')
    const stars = target.querySelector('.stars')
    workspace.style.setProperty("--pan-x", panX + 'px');
    workspace.style.setProperty("--pan-y", panY + 'px');
    workspace.style.setProperty("--zoom", zoom);
    stars.style.setProperty("--pan-x-mod", panXmod + 'px');
    stars.style.setProperty("--pan-y-mod", panYmod + 'px');
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
  const { panX, panY, panXmod, panYmod, zoom } = $.learn()

  const stars = getStars(target)
  target.innerHTML = `
    <div class="actions">
      <div class="menu-item">
        <button data-menu-target="file">
          File
        </button>
        <div class="menu-actions" data-menu="file">
          <button data-file-open>
            <span>
            <sl-icon name="folder2-open"></sl-icon>
            </span>
            Open
          </button>
          <button data-file-save>
            <span>
            <sl-icon name="floppy"></sl-icon>
            </span>
            Save
          </button>
          <input value="${window.location.href}" data-share>
        </div>
      </div>

      <div class="menu-item">
        <button data-menu-target="view">
          View
        </button>
        <div class="menu-actions" data-menu="view">
          <button data-zoom-in>
            <span>
            <sl-icon name="zoom-in"></sl-icon>
            </span>
            Zoom In
          </button>
          <button data-zoom-out>
            <span>
            <sl-icon name="zoom-out"></sl-icon>
            </span>
            Zoom Out
          </button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="edit">
          Edit
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
    <div class="toolbelt-actions">
      <div class="menu-group">
        <button data-mode="cursor">
          <sl-icon name="cursor"></sl-icon>
        </button>
        <button data-mode="move">
          <sl-icon name="arrows-move"></sl-icon>
        </button>
        <button data-mode="draw" class="">
          <sl-icon name="pencil"></sl-icon>
        </button>
        <button data-mode="note">
          <sl-icon name="file-text"></sl-icon>
        </button>
        <button data-mode="chat">
          <sl-icon name="chat"></sl-icon>
        </button>
        <button data-mode="camera">
          <sl-icon name="camera-reels"></sl-icon>
        </button>
        <button data-mode="map">
          <sl-icon name="compass"></sl-icon>
        </button>
        <button data-mode="gallery">
          <sl-icon name="images"></sl-icon>
        </button>
        <button data-mode="calendar">
          <sl-icon name="calendar3"></sl-icon>
        </button>
        <button data-mode="gaming">
          <sl-icon name="joystick"></sl-icon>
        </button>
      </div>
    </div>
    <div class="workspace" style="--pan-x: ${panX}px; --pan-y: ${panY}px; --zoom: ${zoom};">
      <shared-terminal src="/app/sillyz-computer" background="transparent" color="lemonchiffon" class="infinite stack"></shared-terminal>
      <div class="displays stack"></div>
    </div>
    <div class="viewport">
      <div class="pane">
        <div class="note" data-pane="note"></div>
        <div class="camera" data-pane="camera"></div>
        <div class="chat" data-pane="chat"></div>
        <div class="map" data-pane="map"></div>
        <div class="gallery" data-pane="gallery"></div>
        <div class="calendar" data-pane="calendar"></div>
        <div class="gaming" data-pane="gaming"></div>
      </div>
    </div>
  `

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.classList.add('stack')
  canvas.classList.add('canvas')
  canvas.classList.add('bulletin-canvas')
  canvas.classList.add('stars')

  canvas.width = 5000;
  canvas.height = 5000;
  canvas.style=`background-image: ${stars}, linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));`

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

$.when('click', '[data-file-open]', function updateMode (event) {
})

$.when('click', '[data-file-save]', function updateMode (event) {
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

$.when('click', '[data-zoom-in]', function redoDraw (event) {
  let { zoom } = $.learn()

  zoom += .1
  if(zoom <= 2) {
    $.teach({ zoom })
  }
})

$.when('click', '[data-zoom-out]', function redoDraw (event) {
  let { zoom } = $.learn()

  zoom -= .1
  if(zoom >= 0) {
    $.teach({ zoom })
  }
})


$.when('pointerdown', '.bulletin-canvas', start)
$.when('pointermove', '.bulletin-canvas', move)
$.when('pointerup', '.bulletin-canvas', end)

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
  e.preventDefault()
  const { mode } = $.learn()

  if(startModes[mode]) {
    startModes[mode](e)
  }
}

function move(e) {
  e.preventDefault()
  const { mode } = $.learn()

  if(moveModes[mode]) {
    moveModes[mode](e)
  }
}

function end(e) {
  e.preventDefault()
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
  const { color } = $.learn()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    if (e.touches[0]["force"] > 0) {
      pressure = e.touches[0]["force"] || 1
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
  points.push({ x, y, lineWidth, color })
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

  console.log(e, lineWidth)
  points.push({ x, y, lineWidth, color })

  drawOnCanvas(e.target, points);
}

function moveMove(e) {
  const { rectangle } = engine(e.target)
  let { panX, panY, panStartX, panStartY, panHappening } = $.learn()

  if(!panHappening) return

  panX += e.clientX - panStartX - rectangle.left
  panY += e.clientY - panStartY - rectangle.top

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
  const { panX, panY } = $.learn()
  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const panXmod = panX % rhythm
  const panYmod = panY % rhythm
  $.teach({ panXmod, panYmod, startX: null, startY: null, panHappening: false })
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
    transform: translate(var(--pan-x, 0), var(--pan-y, 0)) scale(var(--zoom, 1));
    position: relative;
    z-index: 2;
  }

  & .stars {
    background-color: dodgerblue;
  }

  & canvas {
    touch-action: none;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
  }

  & .toolbelt-actions {
    z-index: 10;
    background: transparent;
    position: absolute;
    bottom: 0;
    right: 0;
    display: none;
    max-width: 100%;
    width: 100%;
    padding: .5rem;
    overflow: auto;
    display: inline-block;
  }

  & .actions {
    z-index: 10;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: none;
    background: black;
    height: 2rem;
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
    padding: 0 .5rem;
    height: 100%;
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

  & .actions button:focus,
  & .actions button.active,
  & .actions button:hover {
    color: #fff;
    background: #54796d;
  }


  & .display {
    width: var(--width, 160px);
    height: var(--height, 90px);
    border: 5px solid lemonchiffon;
    position: absolute;
    inset: 0;
    margin: auto;
    transform: translate3d(0,0,0);
    mix-blend-mode: soft-light;
  }

  @media screen {
    & .toolbelt-actions {
      display: flex;
    }
  }

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

  & .toolbelt-actions button:focus,
  & .toolbelt-actions button.active,
  & .toolbelt-actions button:hover {
    color: #fff;
    background: dodgerblue;
  }

  & .menu-group {
    display: flex;
    margin-right: auto;
    pointer-events: all;
  }

  & .menu-item {
    position: relative;
  }

  & .menu-item.disabled {
    filter: grayscale(1);
    opacity: .5;
    pointer-events: none;
  }

  & .menu-actions {
    display: none;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    background: #54796d;
  }


  & [data-menu-target] {
    aspect-ratio: 1;
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
  }

  & live-help,
  & shared-terminal {
    pointer-events: none;
    opacity: .5;
    position: relative;
  }

  & simpleton-client {
    mix-blend-mode: multiply;
    opacity: 0;
  }

  &:not([data-mode="${modes.cursor}"]) shared-terminal .tray .tray-wake,
  &:not([data-mode="${modes.cursor}"]) shared-terminal .tray[data-focused="true"] {
    pointer-events: none !important;
  }

  &[data-mode="${modes.draw}"] .workspace .displays *,
  &[data-mode="${modes.draw}"] .workspace shared-terminal * {
    pointer-events: none !important;
  }
  &[data-mode="${modes.move}"] .workspace shared-terminal * {
    pointer-events: none !important;
  }
  &[data-mode="${modes.note}"] simpleton-client {
    pointer-events: all;
    opacity: 1;
  }

  &[data-mode="${modes.camera}"] live-help,
  &[data-mode="${modes.cursor}"] shared-terminal {
    pointer-events: all;
    opacity: 1;
  }

  & .viewport {
    position: fixed;
    display: none;
    inset: 0;
  }

  & .viewport .pane {
    grid-area: viewport-of-${$.link};
    display: grid;
    grid-template-areas: "viewport-of-${$.link}";
    width: 100%;
    height: 100%;
    padding-top: 2rem;
    padding-bottom: 4rem;
  }

  & .viewport [data-pane] {
    display: none;
    position: absolute;
    inset: 2rem 0 4rem;
  }

  &[data-mode="${modes.note}"] .viewport,
  &[data-mode="${modes.calendar}"] .viewport,
  &[data-mode="${modes.map}"] .viewport,
  &[data-mode="${modes.gallery}"] .viewport,
  &[data-mode="${modes.gaming}"] .viewport,
  &[data-mode="${modes.chat}"] .viewport,
  &[data-mode="${modes.camera}"] .viewport {
    display: block;
    z-index: 3;
  }

  &[data-mode="${modes.note}"] [data-pane="${modes.note}"],
  &[data-mode="${modes.calendar}"] [data-pane="${modes.calendar}"],
  &[data-mode="${modes.map}"] [data-pane="${modes.map}"],
  &[data-mode="${modes.gallery}"] [data-pane="${modes.gallery}"],
  &[data-mode="${modes.gaming}"] [data-pane="${modes.gaming}"],
  &[data-mode="${modes.chat}"] [data-pane="${modes.chat}"],
  &[data-mode="${modes.camera}"] [data-pane="${modes.camera}"] {
    display: block;
  }

  & shared-terminal.stack {
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
  }

  & [data-share] {
    border: none;
    background: black;
    color: white;
    padding: .25rem;
  }
`)

function getStars(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  let color = 'rgba(255,255,255,.85)';
  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  color = 'rgba(0,0,0,.85)';
  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2 + 1, rhythm / 2 + 1, 1, 1);

  return `url(${canvas.toDataURL()})`;
}

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

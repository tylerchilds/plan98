import module from '@silly/tag'
import { consoleShow, consoleHide } from './plan98-console.js'

let lineWidth = 0
let isMousedown = false
let points = []
let strokeHistory = []
const strokeRevisory = []

const modes = {
  draw: 'draw',
  files: 'files',
  music: 'music',
  cursor: 'cursor',
  chat: 'chat',
  note: 'note',
  move: 'move',
  map: 'map',
  gallery: 'gallery',
  camera: 'camera',
  calendar: 'calendar',
  collaborate: 'collaborate',
  gaming: 'gaming',
}

const $ = module('virtual-machine', {
  menuOpen: true,
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
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  {
    const { beltGrabbed } = $.learn()
    target.dataset.belt = beltGrabbed ? 'true' : 'false'
  }
}

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
    const uuid = target.getAttribute('uuid')
    const camera = target.querySelector('.camera')
    if(!camera.innerHTML && mode === modes.camera) {
      camera.innerHTML = `
        <live-help room="${uuid}" class="stack"></live-help>
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
    const calendar = target.querySelector('.calendar')
    if(!calendar.innerHTML && mode === modes.calendar) {
      calendar.innerHTML = `
        <impromptu-stagehand src="${src}"></impromptu-stagehand>
      `
    }
  }

  {
    const { mode } = $.learn()
    const collaborate = target.querySelector('.collaborate')
    if(!collaborate.innerHTML && mode === modes.collaborate) {
      collaborate.innerHTML = `
        <div style="display: grid; height: 100%; place-items: center">
          <button class="toolbelt-export">
            <sticky-note>
              <qr-code src="${window.location.href}"></qr-code>
            </sticky-note>
          </button>
        </div>
      `
    } else {
      collaborate.innerHTML = ''
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const files = target.querySelector('.files')
    if(!files.innerHTML && mode === modes.files) {
      files.innerHTML = `
        <iframe src="/app/file-system"></iframe>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const draw = target.querySelector('.draw')
    if(!draw.innerHTML && mode === modes.draw) {
      draw.innerHTML = `
        <iframe src="/app/story-board?src=${src}"></iframe>
      `
    }
  }

  {
    const { mode } = $.learn()
    const src = target.getAttribute('src')
    const music = target.querySelector('.music')
    if(!music.innerHTML && mode === modes.music) {
      music.innerHTML = `
        <iframe src="/app/dial-tone?src=${src}"></iframe>
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
        <iframe class="stack" src="/app/party-chat"></iframe>
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

  {
    const bar = target.querySelector('.action-bar')
    bar.dataset.open = $.learn().menuOpen
  }

  {
    const { beltOffsetX, beltOffsetY } = $.learn()
    const toolbelt = target.querySelector('.toolbelt-actions')

    toolbelt.style = `--belt-offset-x: ${beltOffsetX}px; --belt-offset-y: ${beltOffsetY}px;`
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
    <!--
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
    </div>
    -->
    <div class="toolbelt-actions">
      <div class="menu-group">
        <button class="toolbelt-grabber">
          <sl-icon name="grip-vertical"></sl-icon>
        </button>
        <button data-menu data-tooltip="Menu" class="toolbelt-actuator">
          <div class="nonce"></div>
        </button>
        <div class="action-bar toolbelt-actuator">
          <button data-mode="cursor" data-tooltip="Open Windows">
            <sl-icon name="cursor"></sl-icon>
          </button>
          <button data-mode="move"  data-tooltip="Pan Canvas">
            <sl-icon name="arrows-move"></sl-icon>
          </button>
          <button data-mode="map" data-tooltip="Relevant Places">
            <sl-icon name="compass"></sl-icon>
          </button>
          <button data-mode="chat" data-tooltip="Quick Chat">
            <sl-icon name="chat"></sl-icon>
          </button>
          <button data-mode="camera"  data-tooltip="Conference">
            <sl-icon name="camera-reels"></sl-icon>
          </button>
          <button class="toolbelt-debugger" data-tooltip="Toggle Debugger">
            <sl-icon name="bug"></sl-icon>
          </button>
        </div>
        <button class="toolbelt-grabber toolbelt-actuator">
          <sl-icon name="grip-vertical"></sl-icon>
        </button>
      </div>
    </div>
    <div class="workspace" style="--pan-x: ${panX}px; --pan-y: ${panY}px; --zoom: ${zoom};">
      <crossover-episode src="about:blank" background="transparent" color="lemonchiffon" class="infinite stack"></crossover-episode>
      <div class="displays stack"></div>
    </div>
    <div class="viewport">
      <div class="pane">
        <div class="note" data-pane="note"></div>
        <div class="camera" data-pane="camera"></div>
        <div class="chat" data-pane="chat"></div>
        <div class="map" data-pane="map"></div>
        <div class="gallery" data-pane="gallery"></div>
        <div class="draw" data-pane="draw"></div>
        <div class="files" data-pane="files"></div>
        <div class="music" data-pane="music"></div>
        <div class="calendar" data-pane="calendar"></div>
        <div class="gaming" data-pane="gaming"></div>
        <div class="collaborate" data-pane="collaborate"></div>
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

$.when('click', '[data-menu]', function updateMode (event) {
  const { menuOpen } = $.learn()
  $.teach({ menuOpen: !menuOpen })
})

$.when('click', '[data-mode]', function updateMode (event) {
  const { mode } = event.target.dataset
  $.teach({ mode })
})

$.when('click', '.toolbelt-export', function updateMode (event) {
  window.top.location.href = window.location.href
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
  'move': startMove,
}

const moveModes = {
  'move': moveMove,
}

const endModes = {
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

function startMove(e) {
  e.preventDefault()
  const { rectangle } = engine(e.target)
  const panStartX = e.clientX - rectangle.left
  const panStartY = e.clientY - rectangle.top

  $.teach({ panStartX, panStartY, panHappening: true })
}

function moveMove(e) {
  e.preventDefault()
  const { rectangle } = engine(e.target)
  let { panX, panY, panStartX, panStartY, panHappening } = $.learn()

  if(!panHappening) return

  panX += e.clientX - panStartX - rectangle.left
  panY += e.clientY - panStartY - rectangle.top

  $.teach({ panX, panY })
}

function endMove(e) {
  e.preventDefault()
  const { panX, panY } = $.learn()
  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const panXmod = panX % rhythm
  const panYmod = panY % rhythm
  $.teach({ panXmod, panYmod, startX: null, startY: null, panHappening: false })
}

$.when('click', '.toolbelt-debugger', debugToolbelt)

function debugToolbelt(event) {
  let console = document.body.querySelector('plan98-console')
  if(!console) {
    document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
    console = document.body.querySelector('plan98-console')
  } else {
    console.classList.toggle('hidden')
  }

  if(console.matches('.hidden')) {
    consoleHide()
  } else {
    consoleShow()
  }

  event.target.classList.toggle('enabled')
}

$.when('pointerdown', '.toolbelt-grabber', grabToolbelt)
$.when('pointermove', 'canvas', dragToolbelt)
$.when('pointermove', '.toolbelt-grabber', dragToolbelt)
$.when('pointermove', '.toolbelt-actuator', dragToolbelt)
$.when('pointerup', 'canvas', ungrabToolbelt)
$.when('pointerup', '.toolbelt-grabber', ungrabToolbelt)


// grab a pane
function grabToolbelt(event) {
  event.preventDefault()
  const { beltOffsetX } = $.learn()
  if(!beltOffsetX) {
    $.teach({
      beltOffsetX: 0,
      beltOffsetY: 0,
      beltGrabbed: true
    })
  } else {
    $.teach({
      beltGrabbed: true
    })
  }
}

// drag a pane
let lastBeltX, lastBeltY;
function dragToolbelt(event) {
  event.preventDefault()
  const { target, clientX, clientY } = event
  const { beltGrabbed, beltOffsetX, beltOffsetY } = $.learn()
  if(!beltGrabbed) return

  if (lastBeltX !== undefined && lastBeltY !== undefined) {
    const movementX = clientX - lastBeltX;
    const movementY = clientY - lastBeltY;
    // Use movementX and movementY here
      $.teach({
        beltOffsetX: beltOffsetX + movementX,
        beltOffsetY: beltOffsetY + movementY
      })
  } else {
    $.teach({
      x: clientX - beltOffsetX,
      y: clientY - beltOffsetY
    })
  }

  lastBeltX = clientX;
  lastBeltY = clientY;
}

// release a pane
function ungrabToolbelt(event) {
  event.preventDefault()
  $.teach({
    beltGrabbed: false,
  })
  lastBeltX = undefined;
  lastBeltY = undefined;
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

  & .toolbelt-actions button[data-menu] {
    padding: 0;
  }

  & .toolbelt-actions button[data-menu] .nonce {
    width: 3rem;
  }

  &[data-belt="true"] .viewport,
  &[data-belt="true"] .workspace :not(canvas) {
    pointer-events: none;
  }

  &[data-belt="true"] .toolbelt-actions .menu-group {
    overflow: hidden;
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

  & .toolbelt-grabber,
  & canvas {
    touch-action: manipulation;
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
    color: #E83FB8;
    background: lemonchiffon;
  }

  & .toolbelt-grabber {
    position: sticky;
    left: 0;
  }

  & .menu-group button.toolbelt-grabber {
    padding: .75rem .25rem;
    color: #E83FB8;
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
    z-index: 2;
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
    background: dodgerblue;
  }

  & .action-bar button.enabled,
  & .toolbelt-actions button.enabled {
    background: black;
    color: dodgerblue;
  }

  & .menu-group {
    display: flex;
    margin-right: auto;
    pointer-events: all;
    overflow: auto;
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
  & crossover-episode {
    pointer-events: none;
    opacity: .5;
    position: relative;
  }

  & simpleton-client {
    mix-blend-mode: multiply;
    opacity: 0;
  }

  &:not([data-mode="${modes.cursor}"]) crossover-episode .tray .tray-wake,
  &:not([data-mode="${modes.cursor}"]) crossover-episode .tray[data-focused="true"] {
    pointer-events: none !important;
  }

  &[data-mode="${modes.draw}"] .workspace .displays *,
  &[data-mode="${modes.draw}"] .workspace crossover-episode * {
    pointer-events: none !important;
  }
  &[data-mode="${modes.move}"] .workspace crossover-episode * {
    pointer-events: none !important;
  }

  &[data-mode="${modes.move}"] .workspace crossover-episode .tray-body{
    background: rgba(0,0,0,.85);
  }
  &[data-mode="${modes.move}"] .workspace crossover-episode iframe{
    display: none;
  }
  &[data-mode="${modes.note}"] simpleton-client {
    pointer-events: all;
    opacity: 1;
  }

  &[data-mode="${modes.camera}"] live-help,
  &[data-mode="${modes.cursor}"] crossover-episode {
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
  }

  & .viewport [data-pane] {
    display: none;
    position: absolute;
    inset: 0;
  }
  
  &[data-mode="${modes.note}"] .viewport,
  &[data-mode="${modes.draw}"] .viewport,
  &[data-mode="${modes.files}"] .viewport,
  &[data-mode="${modes.music}"] .viewport,
  &[data-mode="${modes.calendar}"] .viewport,
  &[data-mode="${modes.collaborate}"] .viewport,
  &[data-mode="${modes.map}"] .viewport,
  &[data-mode="${modes.gallery}"] .viewport,
  &[data-mode="${modes.gaming}"] .viewport,
  &[data-mode="${modes.chat}"] .viewport,
  &[data-mode="${modes.camera}"] .viewport {
    display: block;
    z-index: 3;
  }

  &[data-mode="${modes.note}"] [data-pane="${modes.note}"],
  &[data-mode="${modes.draw}"] [data-pane="${modes.draw}"],
  &[data-mode="${modes.files}"] [data-pane="${modes.files}"],
  &[data-mode="${modes.music}"] [data-pane="${modes.music}"],
  &[data-mode="${modes.calendar}"] [data-pane="${modes.calendar}"],
  &[data-mode="${modes.collaborate}"] [data-pane="${modes.collaborate}"],
  &[data-mode="${modes.map}"] [data-pane="${modes.map}"],
  &[data-mode="${modes.gallery}"] [data-pane="${modes.gallery}"],
  &[data-mode="${modes.gaming}"] [data-pane="${modes.gaming}"],
  &[data-mode="${modes.chat}"] [data-pane="${modes.chat}"],
  &[data-mode="${modes.camera}"] [data-pane="${modes.camera}"] {
    display: block;
  }

  & .calendar {
    background: white;
  }

  & .collaborate {
    background: black;
  }


  & .collaborate button {
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  & crossover-episode.stack {
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

$.when('focus', '[data-share]', (event) => {
  event.target.select()
})

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


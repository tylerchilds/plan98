import elf from '@silly/tag'

const $ = elf('draw-term', {
  startX: null,
  startY: null,
  x: null,
  y: null,
  isMouseDown: false,
  trays: ['silly-tray'],
  trayZ: 3,
  'silly-tray': {
    label: "Sillyz.Computer",
    width: 640,
    height: 480,
    x: 100,
    y: 150,
    z: 3,
    body: `
      <iframe src="/9/app/plan98-welcome"></iframe>
    `
  }
})

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function render(target) {
  const container = target.querySelector('.trays')
  return function runtime(tray) {
    const { maximized, width, height, x, y, z, label, body } = $.learn()[tray]
    let node = container.querySelector(`[data-id="${tray}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('tray');
      node.dataset.id = tray
      node.innerHTML = `
        <div class="tray-title-bar" data-tray="${tray}">
          ${label}
          <button class="tray-close" data-tray="${tray}">
            <sl-icon name="x-circle"></sl-icon>
          </button>
        </div>
        <div class="tray-body">
          ${body}
        </div>

        <div class="tray" data-id="${tray}" style="--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);">
        </div>
      `
      container.appendChild(node)
    }

    node.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`
    node.setAttribute('class', maximized ? 'tray maximized' : 'tray')
    console.log({ maximized })
    node.persist = true
  }
}

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <div class="trays"></div>
    <div class="cursor"></div>
    <canvas></canvas>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  {
    const { startX, startY, x, y, invertX, invertY } = $.learn()
    target.style = `--start-x: ${startX}px; --start-y: ${startY}px; --x: ${Math.abs(x)}px; --y: ${Math.abs(y)}px; --transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%);` 
  }

  {
    [...(target.querySelectorAll('.tray') || [])].map(x => {
      x.persist = false
    })
  }
}

function afterUpdate(target) {
  {
    const { isMouseDown } = $.learn()
    const cursor = target.querySelector('.cursor')
    cursor.style = `position: absolute; left: var(--start-x); top: var(--start-y); width: var(--x); height: var(--y); background: dodgerblue; ${isMouseDown ? 'display: block;' : 'display: none;'}; transform: var(--transform); pointer-events: none;`
  }

  {
    const { trays } = $.learn()
    trays.map(render(target))
  }

  {
    [...(target.querySelectorAll('.tray') || [])].filter(x => {
      return !x.persist
    }).map(x => x.remove())
  }
}

$.when('mousedown', '.tray-title-bar', grab)
$.when('mousemove', '.tray-title-bar', drag)
$.when('dblclick', '.tray-title-bar', toggleFull)
$.when('mouseup', '.tray-title-bar', ungrab)
$.when('mouseout', '.tray-title-bar', ungrab)
$.when('click', '.tray-close', closeTray)

function toggleFull(event) {
  const tray = event.target.closest('.tray').dataset.id
  const { maximized } = $.learn()[tray]
  maximized ? restore(tray) : maximize(tray)
}

function maximize(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].maximized = true
    return newState
  })
}

// restore a pane
function restore(tray) {
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    newState[payload].maximized = false
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
    overflow: hidden;
  }

  &,
  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & canvas {
    background: lemonchiffon;
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

  & .tray iframe {
    position: absolute;
    inset: 0;
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
    position: relative;
  }

  & .tray.maximized {
    transform: translate(0, 0) !important;
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
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

$.when('touchstart', 'canvas', start)
$.when('mousedown', 'canvas', start)

function start(e) {
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  let startX, startY, x, y;
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  } else {
    startX = e.clientX
    startY = e.clientY
  }

  x = 0
  y = 0

  $.teach({ startX, startY, isMouseDown: true, x, y })
}

$.when('touchmove', 'canvas', move)
$.when('mousemove', 'canvas', move)

function move (e) {
  e.preventDefault()
  const { startX, isMouseDown, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  if (!isMouseDown) return

  let x, y
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    x = e.touches[0].clientX - startX
    y = e.touches[0].clientY - startY
  } else {
    x = e.clientX - startX
    y = e.clientY - startY
  }

  $.teach({ x, y, invertX: x < 0, invertY: y < 0 })
}

$.when('touchend', 'canvas', end)
$.when('touchleave', 'canvas', end)
$.when('mouseup', 'canvas', end)
function end (e) {
  const { startX, x, y, invertX, invertY, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')

  if(Math.abs(x) > 100 && Math.abs(y) > 100) {
    $.teach(self.crypto.randomUUID(), (state, payload) => {
      const newState = {...state}
      newState.trays.push(payload)
      newState.trayZ += 1
      newState[payload] = {
        label: "Draw Term",
        width: Math.abs(x),
        height: Math.abs(y),
        x: invertX ? startX + x : startX,
        y: invertY ? startY + y : startY,
        z: newState.trayZ,
        body: `
          <iframe src="/9/app/plan98-welcome"></iframe>
        `
      }
      return newState
    })
  }

  $.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};

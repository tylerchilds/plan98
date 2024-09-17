import elf from '@silly/tag'

const $ = elf('draw-term', {
  startX: null,
  startY: null,
  x: null,
  y: null,
  isMouseDown: false,
  trays: ['stroke-tray', 'fill-tray', 'silly-tray'],
  trayZ: 3,
  'stroke-tray': {
    label: "Set Stroke",
    width: 640,
    height: 480,
    x: 20,
    y: 50,
    z: 1,
    body: `
      <input class="picker" type="color" data-target="color" />
    `
  },
  'fill-tray': {
    label: "Set Fill",
    width: 640,
    height: 480,
    x: 50,
    y: 100,
    z: 2,
    body: `
      <input class="picker" type="color" data-target="background" />
    `
  },
  'silly-tray': {
    label: "Set Silly",
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
    const { width, height, x, y, z, label, body } = $.learn()[tray]
    let node = container.querySelector('#'+tray)
    if(node) {
      node.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`
    } else {
      node = document.createElement('div')
      container.appendChild(node)
      node.outerHTML = `
        <div class="tray" id="${tray}" style="--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);">
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
    }
    node.dataset.persist = true
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
    target.style = `--start-x: ${startX}px; --start-y: ${startY}px; --x: ${x}px; --y: ${y}px; --transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%);` 
  }

  {
    [...(target.querySelectorAll('.tray') || [])].map(x => {
      x.persist = false
    })
  }
}

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    const { isMouseDown } = $.learn()
    const cursor = target.querySelector('.cursor')
    cursor.style = `position: absolute; left: var(--start-x); top: var(--start-y); width: var(--x); height: var(--y); background: dodgerblue; ${isMouseDown ? 'display: block;' : 'display: none;'}; transform: var(--transform); pointer-events: none;`
  }

  {
    const { trays } = $.learn()
    trays.map(render(target))
  }
  /*
  {
    [...(target.querySelectorAll('.tray') || [])].filter(x => {
      return !x.persist
    }).map(x => x.remove())
  }
  */
}

$.when('mousedown', '.tray-title-bar', grab)
$.when('mousemove', '.tray-title-bar', drag)
$.when('mouseup', '.tray-title-bar', ungrab)
$.when('mouseout', '.tray-title-bar', ungrab)
$.when('click', '.tray-close', closeTray)

function closeTray(event) {
  const { tray } = event.target.dataset
  $.teach(tray, (state, payload) => {
    const newState = {...state} 
    const trayIndex = state.trays.indexOf(payload)

    if(trayIndex >= 0) {
      newState.trays.splice(trayIndex, 1)
      delete newState[tray]
    }

    return newState
  })
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

  $.teach({ x: Math.abs(x), y: Math.abs(y), invertX: x < 0, invertY: y < 0 })
}

$.when('touchend', 'canvas', end)
$.when('touchleave', 'canvas', end)
$.when('mouseup', 'canvas', end)
function end (e) {
  const { startX, isMouseDown, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')
  let x, y;

  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    x = e.touches[0].clientX - startX
    y = e.touches[0].clientY - startY
  } else {
    x = e.clientX - startX
    y = e.clientY - startY
  }

  $.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
};


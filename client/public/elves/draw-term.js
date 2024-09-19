import elf from '@silly/tag'
import { innerHTML } from 'diffhtml'
import natsort from 'natsort'
import { idx, documents } from './giggle-search.js'

const $ = elf('draw-term', {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  suggestions: [],
  trays: ['silly-tray'],
  trayZ: 3,
  'silly-tray': {
    width: 640,
    height: 480,
    maximized: true,
    focused: false,
    x: 100,
    y: 150,
    z: 3,
    url: '/app/startup-wizard'
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
    const {
      suggestions,
      suggestIndex,
    } = $.learn()
    const {
      maximized,
      grabbed,
      width,
      height,
      x,
      y,
      z,
      url,
      focused
    } = $.learn()[tray]

    const start = Math.max(suggestIndex - 5, 0)
    const end = Math.min(suggestIndex + 5, suggestions.length - 1)

    let node = container.querySelector(`[data-id="${tray}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('tray');
      node.dataset.id = tray
      node.innerHTML = `
        <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
          <button class="tray-toggle" data-tray="${tray}">
            <sl-icon name="${maximized ? 'fullscreen-exit' : 'fullscreen' }"></sl-icon>
          </button>
          <form class="search" method="get">
            <div class="input-grid">
              <input value="${url}" autocomplete="off" name="browser-${self.crypto.randomUUID()}" class="browser" data-tray="${tray}"/>

              <button class="tray-sync" data-tray="${tray}" tab-index="1" type="submit">
                <sl-icon name="arrow-down-up"></sl-icon>
              </button>
            </div>
          </form>
          <div class="grabber"></div>
          <button class="tray-close" data-tray="${tray}">
            <sl-icon name="x-circle"></sl-icon>
          </button>
        </div>
        <div class="suggestions" data-tray="${tray}"></div>
        <div class="tray-body">
          <iframe src="${url}" title="${url}"></iframe>
        </div>

        <div class="tray" data-id="${tray}" style="--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);">
        </div>
      `
      container.appendChild(node)
    }

    node.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`

    if(maximized) {
      node.setAttribute('class', 'tray maximized')
      node.querySelector('.tray-toggle sl-icon').name = 'fullscreen-exit'
    } else {
      node.setAttribute('class', 'tray')
      node.querySelector('.tray-toggle sl-icon').name = 'fullscreen'
    }

    const maybies = node.querySelector('.suggestions')
    if(focused) {
      innerHTML(maybies, `
        <div class="suggestion-box">
          ${suggestions.slice(start, end).map((x, i) => {
            const item = documents.find(y => {
              return x.ref === y.path
            })

            return `
              <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
                <div class="hyper-name">
                  <span class="file-name">
                    ${item.name}
                  </span>
                  <span class="hyper-sentence">
                    ${item.path.split('/').reverse().slice(1,-1).join(' ')}
                  </span>
                </div>
              </button>
            `
          }).join('')}
        </div>
      `)
    } else {
      maybies.innerHTML = null
    }

    if(node.dataset.url !== url) {
      node.dataset.url = url
      node.querySelector('iframe').src = url
      node.querySelector('.browser').value = url
    }

    node.dataset.grabbed = grabbed
    node.persist = true
  }
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '.browser', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const { tray } = event.target.dataset
      const url = '/app/media-plexer?src=' +item.path
      document.activeElement.blur()
      setState(tray, { url, focused: false })
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { tray } = event.target.closest('[data-tray]').dataset
  const { path } = event.target.dataset

  const url = '/app/media-plexer?src=' + path
  document.activeElement.blur()
  setState(tray, { url, focused: false })
  $.teach({
    suggestIndex: parseInt(event.target.dataset.index)
  })
})


$.when('input', '.browser', (event) => {
  const { value } = event.target;
  const { tray } = event.target.dataset
  setState(tray, { buffer: value })

  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({
    suggestions,
    suggestIndex: null,
  })
})

$.when('submit', '.search', (event) => {
  event.preventDefault()
  const { tray } = event.target.dataset
  const { buffer } = $.learn()[tray]
  const url = '/app/giggle-search?query=' + buffer
  setState(tray, { url, focused: false })
})

$.when('focus', '.browser', event => {
  const { tray } = event.target.dataset
  setState(tray, { focused: true })
})

$.when('blur', '.browser', event => {
  setTimeout(() => {
    const { tray } = event.target.dataset
    setState(tray, { focused: false })
  }, 250)
})


$.draw((target) => {
  if(target.innerHTML) return
  return `
    <div class="trays"></div>
    <div class="cursor"></div>
    <canvas></canvas>
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
    const { startX, startY, x, y, invertX, invertY } = $.learn()
    target.style = `--start-x: ${startX}px; --start-y: ${startY}px; --x: ${Math.abs(x)}px; --y: ${Math.abs(y)}px; --transform: translate(${invertX ? '-100' : '0' }%, ${invertY ? '-100' : '0'}%);` 
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
  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(list) {
      list.scrollTop = target.dataset.scrollpos
    }
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }


  {
    const { isMouseDown } = $.learn()
    const cursor = target.querySelector('.cursor')
    cursor.style = `${isMouseDown ? 'display: block;' : 'display: none;'};`
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

  replaceCursor(target) // first things first
}

$.when('mousedown', '.tray-title-bar', grab)
$.when('mousemove', '.tray-title-bar', drag)
$.when('dblclick', '.tray-title-bar', toggleFull)
$.when('mouseup', '.tray-title-bar', ungrab)
$.when('mouseout', '.tray-title-bar', ungrab)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-sync', syncTray)
$.when('click', '.tray-toggle', toggleFull)

function syncTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  const { buffer } = $.learn()[tray]

  const url = buffer.startsWith('/') ? buffer : '/app/giggle-search?query=' + buffer
  setState(tray, { url, focused: false })
}

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
    touch-action: none;
  }

  & .grabber::before {
    content: '';
    box-shadow:
      0px .3rem 0 .5px var(--red),
      0px .7rem 0 .5px var(--orange),
      0px 1.1rem 0 .5px var(--yellow);
    display: block;
    margin: 0 1rem;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  & .grabber:hover::before {
    content: '';
    box-shadow:
      0px .3rem 0 .5px var(--purple),
      0px .7rem 0 .5px var(--blue),
      0px 1.1rem 0 .5px var(--green);
    display: block;
    margin: 0 2rem;
    opacity: .6;
  }


  &,
  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & canvas {
    background: #54796d;
  }

  & .cursor {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: var(--x);
    height: var(--y);
    background: lemonchiffon;
    transform: var(--transform);
    pointer-events: none;
  }

  &[data-mouse="true"] .tray {
    pointer-events: none !important;
  }

  & .grabber {
    pointer-events: none;
  }

  & [data-grabbed="true"] .grabber::before {
    box-shadow:
      0px .3rem 0 .5px var(--purple),
      0px .7rem 0 .5px var(--blue),
      0px 1.1rem 0 .5px var(--green);
  }

  & .tray {
    position: absolute;
    width: var(--width, 160px);
    height: var(--height, 90px);
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 2px;
    display: grid;
    grid-template-rows: auto 1px 1fr;
  }

  & .tray iframe {
    position: absolute;
    inset: 0;
  }

  & .tray-title-bar {
    padding: 5px 4px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none;
    position: relative;
    display: grid;
    grid-template-columns: auto 1.618fr 1fr auto;
  }

  & .tray-title-bar input {
    border: none;
    border-radius: 0;
    background: transparent;
    color: rgba(255,255,255,.65);
    width: 100%;
    padding: 4px;
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

  & .tray-sync,
  & .tray-close,
  & .tray-toggle {
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
    padding: 3px 5px 0;
  }

  & .tray-toggle {
  }

  & .tray-close {
    margin-left: auto;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    text-align: left;
  }

  & *:focus {
    outline: 3px solid var(--underline-color, mediumseagreen);
  }

  & .suggestions .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .suggestions:not(:empty) {
    display: block;
    position: relative;
    background: var(--green, mediumseagreen);
    text-align: left;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    overflow: auto;
    z-index: 10;
    max-height: calc(100vh - 3rem);
    display: flex;
    flex-direction: column;
  }

  & .suggestion-box .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box .auto-item:focus,
  & .suggestion-box .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }

  & .hyper-name {
    display: flex;
    overflow: auto;
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

$.when('touchstart', 'canvas', start)
$.when('mousedown', 'canvas', start)

function start(e) {
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
    x = e.touches[0].clientX - startX - rectangle.left
    y = e.touches[0].clientY - startY - rectangle.top
  } else {
    x = e.clientX - startX - rectangle.left
    y = e.clientY - startY - rectangle.top
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
        width: Math.abs(x),
        height: Math.abs(y),
        x: invertX ? startX + x : startX,
        y: invertY ? startY + y : startY,
        z: newState.trayZ,
        url: '/app/sillyz-computer'
      }
      return newState
    })
  }

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

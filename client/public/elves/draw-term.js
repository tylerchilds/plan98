import elf from '@silly/elf'
import { innerHTML } from 'diffhtml'
import natsort from 'natsort'
import { idx, documents } from './giggle-search.js'

const initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  suggestions: [],
  trayZ: 3,
  focusedTray: null,
  trays: [],
}

const $ = elf('draw-term', initial)

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

    const start = Math.max(suggestIndex - 5, 0)
    const end = Math.min(suggestIndex + 5, suggestions.length - 1)

    let node = container.querySelector(`[data-id="${tray}"]`)
    if(!node) {
      node = document.createElement('div')
      node.classList.add('tray');
      node.dataset.id = tray
      node.innerHTML = `
        <button class="tray-wake" data-tray="${tray}"></button>
        <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
          <button class="tray-action tray-close" data-tray="${tray}">
            <sl-icon name="x-lg"></sl-icon>
          </button>
          <button class="tray-action tray-toggle" data-tray="${tray}">
            <sl-icon name="${minimized ? 'zoom-in' : 'zoom-out' }"></sl-icon>
          </button>
          <div class="grabber"></div>
          <form class="search minimizable" method="get">
            <div class="input-grid">
              <input placeholder="netdir://" value="${url}" autocomplete="off" name="browser-${self.crypto.randomUUID()}" class="browser" data-tray="${tray}"/>
              <button class="tray-action tray-sync" data-tray="${tray}" tab-index="1" type="submit">
                <sl-icon name="telephone"></sl-icon>
              </button>
            </div>
          </form>
          <div class="grabber minimizable"></div>
          <button class="tray-action tray-launch" data-tray="${tray}">
            <sl-icon name="box-arrow-up-right"></sl-icon>
          </button>
        </div>
        <div class="suggestions" data-tray="${tray}"></div>
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
    } else {
      node.setAttribute('class', 'tray')
    }
    const miniScreenIcon = node.querySelector('.tray-toggle sl-icon')
    if(minimized) {
      node.classList.add('minimized')
      miniScreenIcon.name = 'zoom-in'
    } else {
      miniScreenIcon.name = 'zoom-out'
    }

    const maybies = node.querySelector('.suggestions')
    if(focused) {
      innerHTML(maybies, `
        <div class="suggestion-box">${suggestions.slice(start, end).map((x, i) => {
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
          }).join('')}</div>
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
  const url = buffer.indexOf('://') ? buffer : '/app/giggle-search?query=' + buffer
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
    <div class="trays"></div>
    <div class="cursor"><div class="nonce"></div></div>
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
    const { grabbing } = $.learn()
    const trays = target.querySelector('.trays')
    trays.dataset.grabbing = !!grabbing
  }

  {
    const { resizing } = $.learn()
    const trays = target.querySelector('.trays')
    trays.dataset.resizing = !!resizing
  }

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
  }

  &.cinema {
    --draw-term-bg: #54796d;
    --draw-term-fg: #54796d;
  }

  & .resize-right-bottom,
  & .resize-left-bottom {
    position: absolute;
    bottom: -1rem;
    width: 1rem;
    height: 1rem;
    border: none;
    padding: 0;
    background-color: #E83FB8;
    border-radius: 100%;
    cursor: resize;
  }

  & .resize-left-bottom {
    left: -1rem;
    cursor: sw-resize;
  }

  & .resize-right-bottom {
    right: -1rem;
    cursor: se-resize;
  }

  & .resize-right-top,
  & .resize-left-top {
    position: absolute;
    top: -1rem;
    width: 1rem;
    height: 1rem;
    border: none;
    padding: 0;
    background-color: #E83FB8;
    border-radius: 100%;
    cursor: resize;
  }

  & .resize-left-top {
    left: -1rem;
    cursor: nw-resize;
  }

  & .resize-right-top {
    right: -1rem;
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
      0px .2rem 0 .5px var(--red),
      0px .7rem 0 .5px var(--orange),
      0px 1.2rem 0 .5px var(--yellow);
    display: block;
    margin: 0;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  &,
  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & canvas {
    background: var(--draw-term-bg, var(--background, dodgerblue));
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
      0px .2rem 0 .5px var(--purple),
      0px .7rem 0 .5px var(--blue),
      0px 1.2rem 0 .5px var(--green);
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
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 2px;
    display: grid;
    grid-template-rows: auto 0 1fr;
    max-width: 100vw;
    max-height: 100vh;
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
    position: relative;
    display: grid;
    grid-template-columns: auto auto 2rem minmax(100px, 1.618fr) 2rem auto;
    gap: 5px;
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

  & .tray.minimized:not(.maximized) {
    width: auto;
    height: auto;
    grid-template-rows: auto 0 0;
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) .tray-title-bar {
    grid-template-columns: auto auto 2rem auto;
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
    padding: 3px 5px;
    opacity: .65;
    transition: opacity 100ms;
    border-radius: 100%;
    display: grid;
    place-items: center;
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

  & .suggestion-box:empty {
    pointer-events: none;
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
      url: `/app/pro-teleprompter?src=/private/${$.link}/${new Date().toISOString()}/${self.crypto.randomUUID()}.saga`
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
$.when('click', '.tray-maxer', toggleMax)
$.when('pointerup', 'canvas', ungrab)
$.when('pointerup', 'canvas', unresize)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('pointerup', '.tray-resize', unresize)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-sync', syncTray)
$.when('click', '.tray-launch', launchTray)
$.when('click', '.tray-toggle', toggleMin)



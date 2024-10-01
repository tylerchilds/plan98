import elf from '@silly/tag'
import { innerHTML } from 'diffhtml'
import natsort from 'natsort'
import { idx, documents } from './giggle-search.js'
import { showPanel } from './plan98-panel.js'

let initial = {
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  suggestions: [],
  trayZ: 3,
  trays: [],
  displays: ['display-self', 'display-iphone', 'display-watch', 'display-ipad'],
  'display-self': {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    name: "Me",
    image: "/cdn/tychi.me/photos/unprofessional-headshot.jpg"
  },
  'display-ipad': {
    width: 1024,
    height: 768,
    name: "ipad",
    image: "/cdn/tychi.me/photos/unprofessional-headshot.jpg"
  },
  'display-iphone': {
    width: 320,
    height: 480,
    name: "iphone",
    image: "/cdn/tychi.me/photos/unprofessional-headshot.jpg"
  },
  'display-watch': {
    width: 140,
    height: 160,
    name: "watch",
    image: "/cdn/tychi.me/photos/unprofessional-headshot.jpg"
  },
}

if(plan98.parameters.get('tutorial')) {
  initial = {
    ...initial,
    trays: ['tray-silly'],
    'tray-silly': {
      width: 640,
      height: 480,
      maximized: true,
      minimized: false,
      focused: false,
      x: 20,
      y: 20,
      z: 3,
      url: '/app/startup-wizard'
    }
  }
}

const $ = elf('shared-space', initial)

function engine(target) {
  const canvas = target.closest($.link).querySelector('canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function renderDisplays(target) {
  const container = target.querySelector('.displays')
  const peoples = target.querySelector('.peoples')
  return function runtime(display) {
    const {
      width,
      height,
      name,
      image
    } = $.learn()[display]

    let node = container.querySelector(`[data-id="${display}"]`)
    let person = peoples.querySelector(`[data-person="${display}"]`)
    if(!node) {
      node = document.createElement('div')
      person = document.createElement('div')
      node.classList.add('display');
      person.classList.add('person');
      person.classList.add('display');
      node.dataset.id = display
      person.dataset.person = display
      person.innerHTML = `
        <div class="display-title-bar" data-display="${display}">
          <button class="profile" data-display="${display}">
            <img src="${image}" class="profile-image" alt="image of ${name}" />
            <span class="profile-name">
              ${name}
            </span>
          </button>
        </div>
      `
      container.appendChild(node)
      peoples.appendChild(person)
    }

    node ? node.style = `--width: ${width}px; --height: ${height}px;` : null
    person ? person.style = `--width: ${width}px; --height: ${height}px;` : null
  }
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
        <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
          <button class="tray-toggle" data-tray="${tray}">
            <sl-icon name="${minimized ? 'fullscreen-exit' : 'fullscreen' }"></sl-icon>
          </button>
          <div class="grabber"></div>
          <form class="search minimizable" method="get">
            <div class="input-grid">
              <input value="${url}" autocomplete="off" name="browser-${self.crypto.randomUUID()}" class="browser" data-tray="${tray}"/>

              <button class="tray-sync" data-tray="${tray}" tab-index="1" type="submit">
                <sl-icon name="telephone"></sl-icon>
              </button>
            </div>
          </form>
          <div class="grabber minimizable"></div>
          <button class="tray-close minimizable" data-tray="${tray}">
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
    } else {
      node.setAttribute('class', 'tray')
    }
    const fullScreenIcon = node.querySelector('.tray-toggle sl-icon')
    if(minimized) {
      node.classList.add('minimized')
      fullScreenIcon.name = 'fullscreen-exit'
    } else {
      fullScreenIcon.name = 'fullscreen'
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

$.when('click', '.profile', event => {
  const { display } = event.target.dataset
  const {
    width,
    height,
    name,
    image
  } = $.learn()[display]


  showPanel(`
    <div style="padding: 1rem;">
      width: ${width}<br/>
      height: ${height}<br/>
      name: ${name}<br/>
      image: ${image}<br/>
    </div>
  `)
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
  const src = target.getAttribute('src')
  if(src) {
    requestIdleCallback(() => {
      const tray = $.learn().trays[0]
      if(tray) {
        setState(tray, { url, focused: false, minimized: false })
      } else {
        $.teach(self.crypto.randomUUID(), (state, payload) => {
          const newState = {...state}
          newState.trays.push(payload)
          newState.trayZ += 1
          newState[payload] = {
            width: 300,
            height: 150,
            x: 0,
            y: 0,
            z: newState.trayZ,
            url: src
          }
          return newState
        })
      }
    })
  }
  return `
    <div class="displays stack"></div>
    <div class="trays stack"></div>
    <div class="cursor stack"></div>
    <canvas class="canvas stack"></canvas>
    <div class="peoples stack"></div>
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
    const { displays } = $.learn()
    displays.map(renderDisplays(target))
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

  {
    target.style.backgroundImage = getStars(target)
  }
}

function getStars(target) {
  const background = 'rgba(255,255,255,.85)';
  const color = 'rgba(0,0,0,.85)';
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  return `url(${canvas.toDataURL()})`;
}



function preventDefault(e) { e.preventDefault() }
$.when('contextmenu', '.tray-title-bar', preventDefault)
$.when('pointerdown', '.tray-title-bar', grab)

$.when('pointermove', 'canvas', drag)
$.when('pointermove', '.tray-title-bar', drag)

$.when('dblclick', '.tray-title-bar', toggleMax)
$.when('pointerup', 'canvas', ungrab)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-sync', syncTray)
$.when('click', '.tray-toggle', toggleMin)

function syncTray(event) {
  event.preventDefault()
  const { tray } = event.target.dataset
  let { buffer, url } = $.learn()[tray]
  buffer ||= url
  url = buffer.startsWith('/') ? buffer : '/app/giggle-search?query=' + buffer

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
  const { z } = $.learn()[tray]
  const { trayZ } = $.learn()
  const newZ = trayZ + 1

  grabTimeout = setTimeout(() => {
    setState(tray, { grabbed: true, z: newZ })
    $.teach({ trayZ: newZ, grabbing: tray })
    grabOffsetX = offsetX
    grabOffsetY = offsetY
  }, 100)
}

// drag a pane
let lastX, lastY;
function drag(event) {
  let { target, clientX, clientY } = event
  const tray = $.learn().grabbing
  if(!tray) return
  const { grabbed, x, y } = $.learn()[tray]

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
  } else {
    if(grabbed) {
      setState(tray, {
        x: clientX - grabOffsetX,
        y: clientY - grabOffsetY
      })
    }

  }

  lastX = clientX;
  lastY = clientY;
}

// release a pane
function ungrab({ target }) {
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
    overflow: hidden;
    position: relative;
    touch-action: none;
    background: rgba(0,0,0,.85);
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    grid-template-areas: "root-of-${$.link}";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    transform: translate(var(--pan-shared-space-x, 0), var(--pan-shared-spax-y, 0));
  }

  & .profile {
    background: linear-gradient(25deg, rgba(255,255,255,.65), rgba(255,255,255,.85));
    display: inline-grid;
    grid-template-columns: 1.2rem auto 1fr;
    grid-template-rows: 1.2rem;
    gap: .5rem;
    place-items: center;
    background: transparent;
    border: none;
    border-radius: none;
    background: rgba(255,255,255,.65);
    padding: .25rem;
    opacity: .5;
    pointer-events: all;
  }

  & .profile:hover,
  & .profile:focus {
    background: rgba(255,255,255,1);
    opacity: .85;
    z-index: 10000;
    position: relative;
  }

  & .profile-image {
    border-radius: 100%;
    aspect-ratio: 1;
  }

  & .profile-name {
    place-self: start;
  }

  & .displays.stack {
    display: grid;
    width: 100%;
    height: 100%;
    position: relative;
  }

  & .peoples.stack {
    display: grid;
    width: 100%;
    height: 100%;
    position: relative;
  }


  & .trays {
    z-index: 9003;
    pointer-events: none;
  }

  & .display {
    width: var(--width, 160px);
    height: var(--height, 90px);
    border: 5px solid rgba(255,255,255,.85);
    position: absolute;
    inset: 0;
    margin: auto;
  }

  & .display.person {
    border-color: transparent;
  }
  & .peoples {
    z-index: 9002;
    pointer-events: none;
  }
  & .display-title-bar {
    padding: 0 0 5px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none;
    position: relative;
    display: block;
    gap: 5px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
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
    height: 100%;
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

  & .stack {
    grid-area: root-of-${$.link};
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & .displays.stack {
    display: grid;
    width: 100%;
    height: 100%;
    position: relative;
  }


  & .canvas {
    z-index: 9002;
  }

  & .cursor {
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: var(--x);
    height: var(--y);
    background: var(--color, dodgerblue);
    transform: var(--transform);
    pointer-events: none;
    z-index: 9004;
    opacity: .65;
  }

  & .trays[data-grabbing="true"] {
    pointer-events: none !important;
  }

  &[data-mouse="true"] .tray {
    pointer-events: none !important;
  }

  & .grabber {
    pointer-events: none;
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

  & .tray {
    position: absolute;
    width: var(--width, 160px);
    height: var(--height, 90px);
    background: linear-gradient(25deg, rgba(0,0,0,.65), rgba(0,0,0,.85));
    padding: 2px;
    display: grid;
    grid-template-rows: auto 1px 1fr;
    pointer-events: all;
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
    grid-template-columns: auto 2rem 1.618fr 1fr auto;
    gap: 5px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    pointer-events: all;
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

  & .trays[data-grabbing="true"] .tray {
    pointer-events: none;
  }

  &[data-mouse="true"] .tray {
    pointer-events: none;
  }


    pointer-events: none !important;
  }

  &[data-mouse="true"] .tray {
    pointer-events: none !important;
  }

  &[data-mouse="true"] .profile {
    pointer-events: none !important;
  }



  & .tray.maximized {
    transform: translate(0, 0) !important;
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  & .tray.minimized:not(.maximized) {
    width: auto;
    height: auto;
    grid-template-rows: auto 1px 0;
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) .tray-title-bar {
    grid-template-columns: auto 2rem;
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

  & .tray-sync,
  & .tray-close,
  & .tray-toggle {
    background: transparent;
    border: none;
    border-radius: 0;
    color: white;
    padding: 3px 5px 0;
    opacity: .65;
    transition: opacity 100ms;
  }

  & .tray-sync:hover,
  & .tray-sync:focus,
  & .tray-close:hover,
  & .tray-close:focus,
  & .tray-toggle:hover,
  & .tray-toggle:focus {
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
  const { grabbing } = $.learn()
  if(grabbing) return
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
  const { startX, isMouseDown, startY, grabbing } = $.learn()
  if(grabbing) return
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

$.when('pointerup', 'canvas', end)
function end (e) {
  const { grabbing } = $.learn()
  if(grabbing) return
  const { startX, x, y, invertX, invertY, startY } = $.learn()
  const { canvas, rectangle } = engine(e.target)
  const context = canvas.getContext('2d')

  if(Math.abs(x) > 100 && Math.abs(y) > 100) {
    $.teach(`tray-${self.crypto.randomUUID()}`, (state, payload) => {
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

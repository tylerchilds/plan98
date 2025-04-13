import elf from '@silly/elf'
import { systemMenu, getTheme } from './paper-pocket.js'

const initial = {
  systemPane: Object.keys(systemMenu)[0],
  startX: null,
  startY: null,
  x: null,
  y: null,
  invertX: false,
  invertY: false,
  isMouseDown: false,
  trayZ: 3,
  focusedTray: null,
  trays: [],
  profile: {
    banner: null
  }
}

const $ = elf('door-man', initial)

function renderGroups(systemPane) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  return groups.map((x) => {
    return `
      <button class="pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}">
        ${systemMenu[x.key].label}
      </button>
    `
  }).join('')
}

function renderApplications(pane) {
  return pane ? `
    <div class="application-list">
      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <button class="app-select" data-url="${url}">
            <div class="iconography">
            </div>
            <span class="app-label">
              ${label}
            </span>
          </button>
        `
      }).join('')}
    </div>

  ` : `
    <sillyz-computer></sillyz-computer>
  `
}

function renderSystemMenu() {
  const {
    systemPane
  } = $.learn()


  return `
    <div class="system">
      <div class="groups">
        ${renderGroups(systemPane)}
      </div>
      <div class="applications">
        ${renderApplications(systemPane)}
      </div>
    </div>
  `

}

function engine(target) {
  const canvas = target.closest($.link).querySelector('.terminal-canvas')
  const rectangle = canvas.getBoundingClientRect()

  return { canvas, rectangle }
}

function render(target) {
  const trayContainer = target.querySelector('.trays')
  const taskContainer = target.querySelector('.tasks')
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

    { //tray logic
      let trayNode = trayContainer.querySelector(`[data-id="${tray}"]`)
      if(!trayNode) {
        trayNode = document.createElement('div')
        trayNode.classList.add('tray');
        trayNode.dataset.id = tray
        trayNode.innerHTML = `
          <button class="tray-wake" data-tray="${tray}"></button>
          <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
            <button class="tray-action tray-close" data-tray="${tray}">
            </button>
            <button class="tray-action tray-min " data-tray="${tray}">
            </button>
            <button class="tray-action tray-max" data-tray="${tray}">
            </button>
            <div class="grabber"></div>
          </div>
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
        trayContainer.appendChild(trayNode)
      }

      trayNode.style = `--width: ${width}px; --height: ${height}px;--x: ${x}px; --y: ${y}px; --z: ${z}; transform: translate(var(--x), var(--y)); z-index: var(--z);`

      if(focusedTray === tray) {
        trayNode.dataset.focused = true
      } else {
        trayNode.dataset.focused = false
      }

      if(maximized) {
        trayNode.setAttribute('class', 'tray maximized')
      } else if(minimized) {
        trayNode.setAttribute('class', 'tray minimized')
      } else {
        trayNode.setAttribute('class', 'tray')
      }

      if(trayNode.dataset.url !== url) {
        trayNode.dataset.url = url
        trayNode.querySelector('iframe').src = url
      }

      trayNode.dataset.grabbed = grabbed
      trayNode.persist = true
    }

    { //tray logic
      let taskNode = taskContainer.querySelector(`[data-id="${tray}"]`)
      if(!taskNode) {
        taskNode = document.createElement('div')
        taskNode.classList.add('task');
        taskNode.dataset.id = tray
        taskNode.innerHTML = `
          <button class="task-button" data-tray="${tray}">${url}</button>
        `
        taskContainer.appendChild(taskNode)
      }

      taskNode.style = ``

      if(focusedTray === tray) {
        taskNode.dataset.focused = true
      } else {
        taskNode.dataset.focused = false
      }

      taskNode.dataset.grabbed = grabbed
      taskNode.persist = true
    }
  }
}

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
    <div class="desktop">
      <div class="trays"></div>
      <div class="cursor"></div>
      <canvas class="terminal-canvas"></canvas>
    </div>
    <div class="taskbar">
      <div class="left">
        <button data-start-menu>
          Start
        </button>
        <div class="system-menu">
          ${renderSystemMenu()}
        </div>
      </div>
      <div class="center">
        <div class="tasks"></div>
      </div>
      <div class="right">
        <button data-settings-menu>
          Settings
        </button>
      </div>
    </div>
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
    const { profile } = $.learn()

    if(profile.banner && target.banner !== profile.banner) {
      target.banner = profile.banner
      target.setAttribute('background', `url('${profile.banner}')`)
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
    });

    [...(target.querySelectorAll('.task') || [])].map(x => {
      x.persist = false
    });
  }

  {
    const { isMouseDown } = $.learn()
    target.dataset.mouse = isMouseDown
  }
}

function afterUpdate(target) {
  {
    const { showStart } = $.learn()

    if(target.startState !== showStart) {
      target.startState = showStart
      target.dataset.menu = showStart
    }
  }

  {
    const { systemPane } = $.learn()

    if(systemPane && target.lastPane !== systemPane) {
      target.lastPane = systemPane
      const groups = target.querySelector('.groups')
      const applications = target.querySelector('.applications')
      groups.innerHTML = renderGroups(systemPane)
      applications.innerHTML = renderApplications(systemPane)
    }

  }

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
    }).map(x => x.remove());
    [...(target.querySelectorAll('.task') || [])].filter(x => {
      return !x.persist
    }).map(x => x.remove());

  }

  replaceCursor(target) // first things first

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
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

function selectPane(event) {
  const { pane } = event.target.dataset
  $.teach({ systemPane: pane })
}

function selectApp(event) {
  const { x, y } = event
  const { url } = event.target.dataset
  newTray({
    url,
    x: x > window.innerWidth / 2 ? window.innerWidth - x : x,
    y: y > window.innerHeight / 2 ? window.innerHeight - y : y,
  })

  $.teach({ showStart: false })
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
  }, 100)
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
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
  }

  & .desktop {
    position: relative;
    overflow: hidden;
    height: 100%;
    z-index: 4;
  }

  & .taskbar {
    background: rgba(0,0,0,.5);
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    position: relative;
  }

  & .system-menu {
    display: none;
    position: absolute;
    transform: translateY(-100%);
    top: 0;
    left: 0;
    right: 0;
    max-height: 80vh;
    overflow: auto;
  }

  &[data-menu="true"] .system-menu {
    display: block;
  }

  & [data-snap] {
    padding: 0;
    width: 50px;
    height: 50px;
    border-radius: 100%;
    display: grid;
    place-items: center;
    border: none;
    margin: auto;
    font-size: 25px;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: white;
  }

  & [data-snap]:hover,
  & [data-snap]:focus {
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .taskbar .left,
  & .taskbar .center,
  & .taskbar .right {
    display: flex;
    align-items: center;
  }

  & .taskbar-button {
    padding: 0;
    width: 35px;
    height: 35px;
    border-radius: 100%;
    display: grid;
    place-items: center;
    border: none;
    font-size: 18px;
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.15));
    color: white;
  }

  & .taskbar-button:hover,
  & .taskbar-button:focus {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.35));
  }

  &.cinema {
    --draw-term-bg: #54796d;
    --draw-term-fg: #54796d;
  }

  & .resize-right-bottom,
  & .resize-left-bottom {
    position: absolute;
    bottom: -5px;
    width: 30px;
    height: 30px;
    border: none;
    padding: 0;
    background-color: #333333;
    cursor: resize;
  }

  & .resize-left-bottom {
    left: -5px;
    cursor: sw-resize;
  }

  & .resize-right-bottom {
    right: -5px;
    cursor: se-resize;
  }

  & .resize-right-top,
  & .resize-left-top {
    position: absolute;
    top: -5px;
    width: 30px;
    height: 30px;
    border: none;
    padding: 0;
    background-color: #333333;
    cursor: resize;
  }

  & .resize-left-top {
    left: -5px;
    cursor: nw-resize;
  }

  & .resize-right-top {
    right: -5px;
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
      0px 0px 0 1px var(--red),
      0px 6px 0 1px var(--orange),
      0px 12px 0 1px var(--yellow);
    display: block;
    margin: 0;
    opacity: .4;
    transform: opacity 100ms ease-in-out;
  }

  & .terminal-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & .terminal-canvas {
    background-size: cover;
    background-position: cover;
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
      0px 0px 0 1px var(--purple),
      0px 6px 0 1px var(--blue),
      0px 12px 0 1px var(--green);
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
    background: black;
    padding: 1px;
    display: grid;
    grid-template-rows: auto 1fr;
    max-width: 100vw;
    max-height: 100vh;
  }

  & .tray iframe {
    position: absolute;
    inset: 0;
  }

  & .tray-title-bar {
    background: black;
    z-index: 2;
    padding: 5px 4px;
    font-size: 1rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    gap: 6px;
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
    z-index: 2;
    overflow: auto;
    container-type: inline-size;
    container-name: tray-body;
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

  & .tray.minimized .tray-title-bar {
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) {
    width: auto;
    height: auto;
    grid-template-rows: auto 0 0;
    border-radius: 1rem;
  }

  & .tray.minimized:not(.maximized) .tray-title-bar {
    grid-template-columns: auto auto auto 2rem;
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
    padding: 0;
    opacity: .65;
    transition: opacity 100ms;
    display: grid;
    place-items: center;
    width: 12px;
    height: 12px;
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

  & .tray-close {
    border-radius: 100%;
    background: firebrick;
  }

  & .tray-min {
    border-radius: 100%;
    background: gold;
  }

  & .tray-max {
    border-radius: 100%;
    background: mediumseagreen;
  }

  & .system {
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
  }

  & .groups {
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), var(--root-theme, mediumseagreen);
    gap: .5rem;
    padding: .5rem;
    max-height: 100%;
    justify-content: end;
  }

  & .pane-select {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: left;
    border-radius: 1rem;
  }

  & .pane-select.active {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }


  & .applications {
  }

  & .application-list {
    display: flex;
    flex-direction: column;
  }

  & .iconography {
    background: lemonchiffon;
    aspect-ratio: 1;
    transform: rotateZ(15deg);
    min-width: 2rem;
  }

  & .app-select {
    border: none;
    background: transparent;
    display: flex;
    gap: 1rem;
    border-radius: 0;
    padding: .5rem;
  }

  & .app-label {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 0;
    text-align: center;
    border-radius: 1rem;
    position: relative;
    z-index: 2;
    max-height: 3.5rem;
    overflow: hidden;
  }

  & .app-label {
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  & .pane-select {
    
  }

  & .tasks {
    display: flex;
  }
  & .task {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

`)

$.when('click', '[data-start-menu]', () => {
  $.teach({ showStart: !$.learn().showStart })
})

$.when('click', '.tray-wake', wake)
function wake (e) {
  const { trayZ } = $.learn()
  const newZ = trayZ + 1
  const { tray } = event.target.dataset
  $.teach({ trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ })
}

function newTray(overrides) {
  const tray = self.crypto.randomUUID()
  $.teach(tray, (state, payload) => {
    const newState = {...state}
    newState.trays.push(payload)
    newState.trayZ += 1
    newState.focusedTray = tray
    newState[payload] = {
      width: 300,
      height: 150,
      z: newState.trayZ,
      ...overrides
    }
    return newState
  })
}

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
$.when('pointerdown', '.tray-wake', grab)
$.when('pointerdown', '.tray-resize', resize)

$.when('pointermove', '.terminal-canvas', drag)
$.when('pointermove', '.tray-title-bar', drag)
$.when('pointermove', '.tray-wake', drag)
$.when('pointermove', '.tray-resize', drag)

// ungrab is important to come fairly last so early returns grab grabbing right
$.when('dblclick', '.tray-title-bar', toggleMax)
//$.when('click', '.tray-maxer', toggleMax)
$.when('pointerup', '.terminal-canvas', ungrab)
$.when('pointerup', '.terminal-canvas', unresize)
$.when('pointerup', '.tray-title-bar', ungrab)
$.when('pointerup', '.tray-wake', ungrab)
$.when('pointerup', '.tray-resize', unresize)
$.when('click', '.tray-close', closeTray)
$.when('click', '.tray-launch', launchTray)
$.when('click', '.tray-min', toggleMin)
$.when('click', '.tray-max', toggleMax)

$.when('click', '.pane-select', selectPane)
$.when('dblclick', '.app-select', selectApp)

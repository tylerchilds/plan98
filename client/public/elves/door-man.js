import elf from '@plan98/elf'
import diffHTML from 'diffhtml'

import $paperPocket, { sideEffects, systemMenu, getTheme, afterUpdateTheme } from './paper-pocket.js'

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
  trays: {},
  showSettings: false,
  profile: {
    banner: null
  }
}

const $ = elf('door-man', initial)

function renderGroups(systemPane) {
  const groups = Object.keys(systemMenu).map(key => ({ key, ...systemMenu[key] }))

  return `
    <div class="group-list">
      ${groups.map((x) => {
        return `
          <button class="pane-select ${systemPane === x.key?'active':''}" data-pane="${x.key}">
            ${systemMenu[x.key].label}
          </button>
        `
      }).join('')}
    </div>
  `
}

function renderApplications(pane) {
  return pane ? `
    <div class="application-list">
      ${systemMenu[pane].list.filter(x => x.url).map(({ label, url }) => {
        return `
          <button class="app-select" data-url="${url}" data-title="${label}">
            <div class="iconography">
            </div>
            <span class="app-label">
              ${label}
            </span>
          </button>
        `
      }).join('')}
    </div>
  ` : ``
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
    
    const data = $.learn()[tray]
    if(!data) return
    const {
      maximized,
      minimized,
      grabbed,
      width,
      height,
      x,
      y,
      z,
      title,
      url,
      focused
    } = data

    { //tray logic
      let trayNode = trayContainer.querySelector(`[data-id="${tray}"]`)
      if(!trayNode) {
        trayNode = document.createElement('div')
        trayNode.classList.add('tray');
        trayNode.dataset.id = tray
        diffHTML.innerHTML(trayNode, `
          <button class="tray-wake" data-tray="${tray}"></button>
          <div class="tray-title-bar" data-tray="${tray}" data-url="${url}">
            <button class="tray-action tray-close" data-tray="${tray}">
            </button>
            <button class="tray-action tray-min " data-tray="${tray}">
            </button>
            <button class="tray-action tray-max" data-tray="${tray}">
            </button>
            <div class="grabber"><span class="tray-title">${title}</span>
            </div>
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
        `)
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
      let taskNode = taskContainer.querySelector(`[data-tray="${tray}"]`)
      if(!taskNode) {
        taskNode = document.createElement('div')
        taskNode.classList.add('taskbar-button');
        taskNode.classList.add('task');
        taskNode.dataset.tray = tray
        diffHTML.innerHTML(taskNode, `
          ${title || url}
        `)
        taskContainer.appendChild(taskNode)
      }

      taskNode.style = ``

      if(focusedTray === tray) {
        taskNode.dataset.focused = true
      } else {
        taskNode.dataset.focused = false
      }

      taskNode.persist = true
    }
  }
}

$.draw((target) => {
  if(target.innerHTML) return
  const src = target.getAttribute('src')
  if(src) {
    requestIdleCallback(() => {
      if(src) {
        $.teach(self.crypto.randomUUID(), (state, payload) => {
          const tray = payload
          const newState = {...state}
          newState.trays[tray] = true
          newState.focusedTray = tray
          newState.trayZ += 1
          newState[tray] = {
            width: 300,
            height: 150,
            x: 0,
            y: 0,
            z: newState.trayZ,
            url: src,
            title: 'Welcome',
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
      <div class="system-menu">
        ${renderSystemMenu()}
      </div>
      <div class="settings-menu">
        ${settingsMenu(target)}
      </div>
    </div>
    <div class="taskbar">
      <div class="left">
        <button data-start-menu class="taskbar-button"></button>
      </div>
      <div class="center tasks"></div>
      <div class="right">
        <button data-settings-menu class="to-settings taskbar-button">
          <sl-icon name="gear-wide-connected"></sl-icon>
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

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}

function afterUpdate(target) {
  {
    afterUpdateTheme($paperPocket, target)
  }

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
      diffHTML.innerHTML(groups, renderGroups(systemPane))
      diffHTML.innerHTML(applications, renderApplications(systemPane))
    }
  }

  {
    const { showSettings } = $.learn()
    const device = target.querySelector('.settings-menu mobile-device')

    if(`${showSettings}` !== target.dataset.showSettings) {
      target.dataset.showSettings = showSettings

      if(device && showSettings) {
        device.dispatchEvent(new CustomEvent('json-rpc', {
          detail: {
            jsonrpc: "2.0",
            method: 'pushState',
            params: { showSettings: true, showHome: false, systemPane: null  }
          }
        }))
      }

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
    Object.keys(trays).map(render(target))
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


function settingsMenu(target) {
  return `
    <div class="faux-mobile">
      <mobile-device id="did:${target.id}" settings="true" src="/app/file-surf?src=/app/paper-pocket&src=/public/cdn/sillyz.computer/en-us/hyper-text.saga&rom=hyper-script"></mobile-device>
    </div>
  `
}

$.when('click', '.to-settings', toSettings)

function toSettings() {
  $.teach({ showSettings: !$.learn().showSettings })
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
  event.stopPropagation()
  const { pane } = event.target.dataset
  $.teach({ systemPane: pane })
}

function selectApp(event) {
  const { x, y } = event
  const { url, title } = event.target.dataset
  newTray({
    url,
    title,
    x: x > window.innerWidth / 2 ? window.innerWidth - x : x,
    y: y > window.innerHeight / 2 ? window.innerHeight - y : y,
  })

  $.teach({ showStart: false })
}

function closeSystemMenu(event) {
  $.teach({ showStart: false })
}

function closeSettingsMenu(event) {
  $.teach({ showSettings: false })
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

    if(newState.trays[payload]) {
      delete newState.trays[payload]
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
  $.teach(payload, {
    mergeHandler: mergeTray,
    parameters: [tray]
  })
}

function mergeTray(tray) {
  return (state, payload) => {
    return {
      ...state,
      [tray]: {
        ...state[tray],
        ...payload
      }
    }
  }
}

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
    background:
      linear-gradient(335deg, rgba(255,255,255,.15), rgba(255,255,255,.25), rgba(255,255,255,0), rgba(0,0,0,0), rgba(0,0,0,.35)),
      radial-gradient(circle at bottom left, rgba(255,255,255,0.2), rgba(0,0,0,.2) 70%),
      conic-gradient(from 45deg at 25% 75%, rgba(255,255,255,0.2), rgba(0,0,0,0)),
      repeating-linear-gradient(180deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.1) 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,.1) 20px),
      repeating-radial-gradient(circle at bottom left, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0) 10px, rgba(255,255,255,0) 20px),
      var(--root-theme, mediumseagreen);
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    overflow-x: auto;
  }

  &[background="transparent"] {
    background: transparent;
  }

  & .desktop {
    position: relative;
    overflow: hidden;
    height: 100%;
    z-index: 4;
  }

  & .taskbar {
    background:
      linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
      linear-gradient(rgba(255,255,255,.15) 1%, rgba(255,255,255,.45) 10%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,.45)),
      var(--root-theme, mediumseagreen);
    z-index: 5;
    padding: 3px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    position: relative;
  }

  & .system-menu {
    display: none;
    position: absolute;
    overflow: hidden;
    inset: 0;
    z-index: 100;
    background: rgba(255,255,255,.25);
    backdrop-filter: blur(2px);
  }

  &[data-menu="true"] .system-menu {
    display: grid;
    place-items: end start;
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

  & .taskbar .center {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    gap: 3px;
  }

  & .taskbar-button {
    cursor: pointer;
    padding: 0;
    padding: .5rem;
    display: grid;
    place-items: center;
    border-radius: 4px;
    border: none;
    font-size: 1rem;
    color: white;
    text-shadow: 1px 1px var(--root-theme, mediumseagreen);
    backdrop-filter: blur(10px) opacity(20%);
    background: radial-gradient(
      at center top,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(0, 0, 0, 0.1) 31%
    ), var(--root-theme, mediumseagreen);
    background-repeat: no-repeat;
    background-size: 300% 100%;
    background-position: center -50%;
    box-shadow: 1px 1px 1px 0 rgba(0,0,0,.35);
    flex-shrink: 1; /* Allow buttons to shrink */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
    max-width: 100%;
  }

  & .taskbar-button:hover,
  & .taskbar-button:focus {
    background: radial-gradient(
      at center bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(255, 255, 255, 0.25) 31%
    ), var(--root-theme, mediumseagreen);
    background-repeat: no-repeat;
    background-size: 300% 100%;
    background-position: center -50%;
    box-shadow: 1px 1px 1px 0 rgba(0,0,0,.65);
  }

  & .taskbar-button[data-focused="true"] {
    background: radial-gradient(
      at center bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(255, 255, 255, 0.25) 31%
    ), var(--root-theme, mediumseagreen);
    background-repeat: no-repeat;
    background-size: 300% 100%;
    background-position: center -50%;
    box-shadow: 1px 1px 1px 0 rgba(0,0,0,.65) inset;
  }


  & .taskbar-button[data-start-menu] {
    font-weight: bold;
    aspect-ratio: 1;
    height: 2rem;
    width: 2rem;
    background: radial-gradient(
      at center top,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(0, 0, 0, 0.1) 31%
    ), lemonchiffon;
    background-repeat: no-repeat;
    background-size: 300% 100%;
    background-position: center -50%;
    color: var(--root-theme, mediumseagreen);
    text-shadow: none;
    border-radius: 0;
    animation: &-spin ease-in-out 5000ms alternate infinite;
  }

  @keyframes &-spin {
    0% {
      transform: rotate(-360deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes &-marquee-track {
    0% {
      transform: translateX(20px);
    }

    100% {
      transform: translateX(calc(-50%));
    }
  }



  & .taskbar-button[data-start-menu]:hover,
  & .taskbar-button[data-start-menu]:focus {
    background: radial-gradient(
      at center bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(255, 255, 255, 0.25) 31%
    ), lemonchiffon;
    background-repeat: no-repeat;
    background-size: 300% 100%;
    background-position: center -50%;
  }

  & .taskbar-button[data-settings-menu] {
    border-radius: 100%;
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
    border-radius: 0 0 0 4px;
  }

  & .resize-right-bottom {
    right: -5px;
    cursor: se-resize;
    border-radius: 0 0 4px 0;
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
    border-radius: 4px 0 0 0;
  }

  & .resize-right-top {
    right: -5px;
    cursor: ne-resize;
    border-radius: 0 4px 0 0;
  }

  & .resize-right-bottom,
  & .resize-left-bottom,
  & .resize-right-top,
  & .resize-left-top {
    opacity: 0;
  }

  & .resize-right-bottom:hover,
  & .resize-left-bottom:hover,
  & .resize-right-top:hover,
  & .resize-left-top:hover {
    opacity: .5;
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

  & .terminal-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  & .terminal-canvas {
    background-size: cover;
    background-position: cover;
    touch-action: none;
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
    outline: 2px solid var(--root-theme, mediumseagreen);
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
    outline: 2px solid var(--root-theme, mediumseagreen);
    outline-offset: 2px;
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
    background:
      linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)),
      var(--root-theme, mediumseagreen);
    display: grid;
    grid-template-rows: auto 1fr;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px rgba(0,0,0,.4);
    box-shadow: 0 0 2px 4px rgba(0,0,0,.2);
    box-shadow: 0 0 4px 8px rgba(0,0,0,.1);
  }

  & .tray iframe {
    position: absolute;
    inset: 0;
  }

  & .tray-title-bar {
    border-radius: 4px 4px 0 0;
    background:
      linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)),
      linear-gradient(rgba(255,255,255,.15) 1%, rgba(255,255,255,.45) 10%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,.45)),
      var(--root-theme, mediumseagreen);
    z-index: 2;
    padding: .5rem;
    font-size: 1rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    gap: .5rem;
    touch-action: none;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    overflow-x: auto;
    place-items: center;
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
    border-radius: 0 0 4px 4px;
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

  & .tray.maximized .tray-title-bar,
  & .tray.maximized .tray-body {
    border-radius: 0;
  }

  & .tray.minimized .tray-title-bar {
    border-radius: 1rem;
  }

  & .tray-title {
    line-height: 1;
    color: rgba(255,255,255,.65);
  }

  & .tray.minimized .tray-title {
    display: none;
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
    width: 1rem;
    height: 1rem;
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
    background: var(--green);
  }

  & .system {
    display: grid;
    grid-template-columns: auto 1fr;
    border: 3px solid var(--root-theme, mediumseagreen);
    border-left: 0;
    border-bottom: 0;
    border-top-right-radius: 1rem;
    overflow: hidden;
    height: 100%;
    max-height: 80%;
  }

  & .groups {
    overflow: hidden;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), var(--root-theme, mediumseagreen);
    padding: .5rem;
    max-height: 100%;
    justify-content: end;
  }

  & .pane-select {
    background: rgba(0,0,0,.25);
    color: rgba(255,255,255,.85);
    border: 0;
    padding: .5rem 1rem;
    text-align: left;
    border-radius: 1rem;
  }

  & .pane-select.active {
    background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }

  & .group-list,
  & .application-list {
    gap: .5rem;
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
    height: 100%;
  }

  & .applications {
    overflow: hidden;
    padding: .5rem;
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(10px);
  }

  & .iconography {
    background: lemonchiffon;
    aspect-ratio: 1;
    min-width: 2rem;
  }

  & .app-select {
    border: none;
    background: transparent;
    display: grid;
    grid-template-columns: auto 1fr;
    text-align: left;
    gap: .5rem;
    border-radius: 0;
    align-items: center;
  }

  & .app-label {
    background: rgba(0,0,0,.25);
    color: rgba(0,0,0,.85);
    border: 0;
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

  & .settings-menu:empty {
    display: none;
  }

  & .settings-menu {
    position: absolute;
    inset: 0;
    background: black;
    overflow: auto;
    z-index: 2;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    display: flex;
    flex-direction: column;
    padding: .5rem;
    gap: .5rem;
    z-index: 200;
    display: none;
  }

  &[data-show-settings="true"] .settings-menu {
    display: grid;
    place-items: end;
  }


  & .faux-mobile {
    max-width: 320px;
    max-height: 480px;
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    border: 5px solid var(--root-theme, mediumseagreen);
    overflow: hidden;
    right: .5rem;
    bottom: .5rem;
  }

`)

$.when('click', '[data-start-menu]', () => {
  $.teach({ showStart: !$.learn().showStart, showSettings: false })
})

$.when('click', '.tray-wake', wake)
function wake (e) {
  const { trayZ } = $.learn()
  const newZ = trayZ + 1
  const { tray } = event.target.dataset
  $.teach({ trayZ: newZ, focusedTray: tray })
  setState(tray, { z: newZ })
}

$.when('click', '.task', focusTray)
function focusTray (e) {
  const { trayZ } = $.learn()
  const { tray } = event.target.dataset

  const { z, maximized } = $.learn()[tray]

  if(z === trayZ) {
    setState(tray, { maximized: !maximized, minimized: false })
    $.teach({ showStart: false })
  } else {
    const newZ = trayZ + 1
    $.teach({ trayZ: newZ, focusedTray: tray, showStart: false })
    setState(tray, { z: newZ, minimized: false })
  }
}


function newTray(overrides) {
  const tray = self.crypto.randomUUID()
  $.teach(tray, {
    mergeHandler: mergeNewTray,
    parameters: [tray, overrides]
  })
}

function mergeNewTray(tray, overrides) {
  return (state, payload) => {
    const newState = {...state}
    newState.trays ||= {}
    newState.trays[payload] = true
    newState.trayZ += 1
    newState.focusedTray = tray
    newState[payload] = {
      width: 300,
      height: 150,
      z: newState.trayZ,
      ...overrides
    }
    return newState
  }
}

$.when('pointerdown', 'canvas', start)

function start(e) {
  e.preventDefault()
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
  e.preventDefault()
  const { grabbing } = $.learn()
  if(grabbing) return
  const { focusedTray, trayZ=1, startX, x, y, invertX, invertY, startY } = $.learn()

  if(Math.abs(x) > 50 && Math.abs(y) > 50) {
    const { canvas, rectangle } = engine(e.target)
    const context = canvas.getContext('2d')

    const tray = self.crypto.randomUUID()
    const width = Math.max(300, Math.abs(x))
    const height = Math.max(150, Math.abs(y))
    setState(tray, {
      width,
      height,
      x: invertX ? startX + x : startX,
      y: invertY ? startY + y : startY,
      z: trayZ + 1,
      title: 'Journal',
      url: `/app/ur-shell`
    })


    $.teach(tray, (state, payload) => {
      return {
        ...state,
        trays: {
          ...state.trays,
          [payload]: true
        }
      }
    })

    $.teach({ focusedTray: tray, startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
  } else {
    $.teach({ startX: null, startY: null, isMouseDown: false, x: 0, y: 0 })
  }
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

$.when('click', '.system-menu', closeSystemMenu)
$.when('click', '.settings-menu', closeSettingsMenu)
$.when('click', '.pane-select', selectPane)
$.when('click', '.app-select', selectApp)

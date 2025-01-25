import elf from '@silly/elf'
import { parseM3U, writeM3U } from "@iptv/playlist";
import { checkButton, checkAxis } from './debug-gamepads.js'
import { consoleShow, consoleHide } from './plan98-console.js'
import Hls from 'hls.js'

const modes = {
  game: 'game',
  settings: 'settings',
}


const $ = elf('public-broadcast', {
  instances: {},
  mode: modes.game,
  channels: [],
  player: {}
})

fetch('https://iptv-org.github.io/iptv/index.m3u')
  .then(res => res.text())
  .then((m3u) => {
    const { channels } = parseM3U(m3u)
    $.teach({ channels })
  }).catch(console.error)

function randomChannel() {
  const { channels } = $.learn()
  return channels[Math.floor(Math.random() * channels.length)]
}

$.draw((target) => {
  const { channels, state, mode, player, consented, instances, debuggerVisible } = $.learn()
  if(channels.length === 0) {
    return 'Loading Channels'
  }
  if(!consented) {
    return `
      <div style="display: grid; place-content: center">
        <div class="instructions">
          <div class="instructions-title">
            Public Broadcast
          </div>
          <p>
            Randomly browse public broadcast internet television stations.
          </p>
          <div class="instructions-subtitle">
            How To
          </div>
          <p>
            Touch:<br>Swipe up/down/left/right to switch channels
          </p>
          <p>
            Keyboard:<br>Arrow keys up/down/left/right to switch channels
          </p>
          <p>
            Gamepad:<br>Direcitonal pad up/down/left/right to switch channels
          </p>
          <button data-consent>Launch</button>
        </div>
      </div>
    `
  }
  seed(target)
  if(!instances[target.id]) return

  const instance = instances[target.id]
  const { x, y, boxes } = instance

  if(!target.mounted) {
    target.mounted = true
    return `
      <button data-options>
        Options
      </button>
      <div class="settings">
        <div class="title">Settings</div>

        <hr>
        <div class="controller"></div>
        <hr>

        <button class="toolbelt-debugger">
          ${ debuggerVisible ? 'Hide Debugger' : 'Show Debugger' }
        </button>
      </div>
      <div class="game">
        <div class="grid" data-x="${x}" data-y="${y}">
          <div class="tile top"></div>
          <div class="tile left"></div>
          <div class="tile center" data-id="${target.id}"></div>
          <div class="tile right"></div>
          <div class="tile bottom"></div>
        </div>
      </div>
    `
  }
}, {
  beforeUpdate: (target) => {
    const { instances } = $.learn()
    const instance = instances[target.id]
    if(!instance) return
    const lastX = parseInt(target.dataset.x)
    const lastY = parseInt(target.dataset.y)
    const error = target.dataset.error === 'true'
    const { x, y, boxes } = instance

    {
      if(x === lastX && y === lastY && !error) {
        return
      }
    }

    {
      const active = target.querySelector('.center')
      if(active) {
        const video = active.querySelector('video')
        if(video && video.playing) {
          video.pause()
          video.playing = false
        }
      }
    }

    {
      if(!boxes[`${y}:${x}`]) {
        updateBox({ x, y, id: target.id }, {
          content: `<video src="${randomChannel().url}"></video>`
        })
      }
    }
  },
  afterUpdate: (target) => {
    const { instances } = $.learn()
    const instance = instances[target.id]
    if(!instance) return
    const lastX = parseInt(target.dataset.x)
    const lastY = parseInt(target.dataset.y)
    const error = target.dataset.error === 'true'
    const { x, y, boxes } = instance

    {
      const { mode } = $.learn()
      if(target.dataset.mode !== mode) {
        target.dataset.mode = mode
      }
    }

    {
      const { tileGesture, tileDistance } = $.learn()

      if(tileGesture === 'swipe') {
        target.style.setProperty("--pan-x", `${tileDistance.x}px`);
      } else if(tileGesture === 'scroll') {
        target.style.setProperty("--pan-y", `${tileDistance.y}px`);
      } else {
        target.style.setProperty("--pan-x", `0`);
        target.style.setProperty("--pan-y", `0`);
      }
    }

    {
      const { mode, player } = $.learn()
      const controller = target.querySelector('.controller')
      if(mode === 'settings' && controller) {
        controller.innerHTML = Object.keys(player).map(key => {
          return `
            <div>
              ${key}: ${player[key]}
            </div>
          `
        }).join('')
      }
    }

    {
      if(x === lastX && y === lastY && !error) {
        return
      }
    }

    {
      const active = target.querySelector('.center')
      if(active) {
        if(boxes[`${y}:${x}`]) {
          active.innerHTML = boxes[`${y}:${x}`].content
        }
        const video = active.querySelector('video')
        if(video && !video.playing) {

          target.dataset.error = false
          const hls = new Hls();
          hls.on(Hls.Events.ERROR, (event, data) => {
            const { type, details, fatal } = data;

            console.error(`HLS.js Error: Type: ${type}, Details: ${details}, Fatal: ${fatal}`);

            if (fatal) {
              switch (type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error. Check your video source or CORS headers.');
                  // Attempt recovery or notify the user
                  break;

                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error. Try to recover.');
                  hls.recoverMediaError();
                  break;

                default:
                  console.error('Fatal error. Destroying HLS instance.');
                  hls.destroy();
                  break;
              }

              target.dataset.error = true
              updateBox({ x, y, id: target.id }, null)
            }
          });
          hls.loadSource(video.src);
          hls.attachMedia(video);
          video.play()
          video.playing = true
        }
      }
    }

    {
      target.dataset.x = x
      target.dataset.y = y
    }
  }
})

$.when('click', '[data-consent]', function consent(event) {
  $.teach({ consented: true })
})
$.when('click', '[data-options]', toggleMode)
function toggleMode (event) {
  const { mode } = $.learn()
  const newMode = mode !== modes.settings ? modes.settings : modes.game
  $.teach({ mode: newMode })
}

$.when('pointerdown', '.tile', function(e) {
  event.preventDefault()
  $.teach({ tileStartTime: e.timeStamp })
  let startX, startY;
  const rectangle = event.target.getBoundingClientRect()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    startX = e.touches[0].clientX - rectangle.left
    startY = e.touches[0].clientY - rectangle.top
  } else {
    startX = e.clientX - rectangle.left
    startY = e.clientY - rectangle.top
  }


  $.teach({
    tileFirstTouch: {
      x: startX,
      y: startY
    }
  })
})

$.when('pointermove', '.tile', function(e){
  event.preventDefault()
  const { tileStartTime, tileFirstTouch, tileGesture } = $.learn()
  if(!tileFirstTouch) return
  const tileEndTime = e.timeStamp;
  const tileDuration = tileEndTime - tileStartTime;
  let lastX, lastY;
  const rectangle = event.target.closest($.link).getBoundingClientRect()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    lastX = e.touches[0].clientX - rectangle.left
    lastY = e.touches[0].clientY - rectangle.top
  } else {
    lastX = e.clientX - rectangle.left
    lastY = e.clientY -rectangle.top
  }

  const tileLastTouch = {
    x: lastX,
    y: lastY
  }


  const tileDistance = {
    x: tileLastTouch.x - tileFirstTouch.x,
    y: tileLastTouch.y - tileFirstTouch.y
  }

  $.teach({
    tileEndTime,
    tileDuration,
    tileLastTouch,
    tileDistance
  })

  if(!tileGesture) {
    setGesture();
  }
})

$.when('pointerup', '.tile', function(event){
  const { id } = event.target.dataset
  const { instances, tileDistance, tileGesture, tileLastTouch, tileDuration } = $.learn()

  if(!tileDistance) {
    clearPointer()
    return
  }

  if(tileGesture === 'scroll') {
    const distance = Math.abs(tileDistance.y);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(tileDistance.y)===1) {
      slideUp(id)
    } else {
      slideDown(id)
    }

  } else if(tileGesture === 'swipe') {
    const distance = Math.abs(tileDistance.x);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(tileDistance.x)===1) {
      slideLeft(id)
    } else {
      slideRight(id)
    }
  }

  clearPointer()
})

function clearPointer() {
  const { tileFirstTouch } = $.learn()
  if(!tileFirstTouch) return
  $.teach({ 
    tileGesture: null,
    tileDistance: null,
    tileLastTouch: null,
    tileFirstTouch: null
  })
}

self.addEventListener('keydown', (event) => {
  const node = document.querySelector($.link)

  if(!node) return
  const id = node.id

  if (event.keyCode==37) {
    slideLeft(id)
  }
  if (event.keyCode==38) {
    slideUp(id)
  }
  if (event.keyCode==39) {
    slideRight(id)
  }
  if (event.keyCode==40) {
    slideDown(id)
  }
})

function slideLeft(id) {
  const { instances } = $.learn()

  if(!instances[id]) return
  const { x } = instances[id]

  updateInstance({ id }, { x: x - 1 })
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x } = instances[id]

  updateInstance({ id }, { x: x + 1 })
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  updateInstance({ id }, { y: y - 1 })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  updateInstance({ id }, { y: y + 1 })
}

function setGesture(){
  const { tileDistance } = $.learn()
  const y = Math.abs(tileDistance.y)
  const x = Math.abs(tileDistance.x)
  if(x < 5 && y < 5) return
  if(y > x){
    $.teach({ tileGesture: 'scroll' })
  } else {
    $.teach({ tileGesture: 'swipe' })
  }
}

$.style(`
  & {
    background: black;
    color: white;
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .instructions {
    position: absolute;
    margin: auto;
    inset: 1rem;
    overflow: auto;
    height: auto;
    max-width: 320px;
    max-height: calc(100% - 2rem);
    background: white;
    color: rgba(0,0,0,.85);
    border-radius: 1rem;
    padding: 1rem;
  }

  & .instructions-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  & .instructions-subtitle {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  & [data-consent] {
    border: none;
    border-radius: 0;
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.25)), mediumseagreen;
    color: white;
    padding: 1rem;
    margin: auto;
    display: block;
  }

  & :focus {
    outline: 1px solid black;
  }

  & video {
    height: 100%;
    pointer-events: none;
    position: relative;
    z-index: 2;
  }

  & .title {
    font-size: 2rem;
    font-weight: bold;
  }

  & [data-options] {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.25);
    color: rgba(255,255,255,.65);
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 4px 8px;
  }

  & [data-options]:hover,
  & [data-options]:focus {
    background: rgba(255,255,255,.25);
    color: rgba(0,0,0,1);
  }

  & .game,
  & .settings {
    display: none;
    height: 100%;
  }

  &[data-mode="settings"] .settings {
    display: block;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &[data-mode="game"] .game {
    display: block;
  }

  & .settings {
    padding: 2rem 1rem;
    color: white;
  }

  & select {
    background: #54796d;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 0;
    color: rgba(255,255,255,.65);
    padding: .5rem;
  }

  & .won {
    opacity: .85;
    pointer-events: none;
  }

  & .lost {
    opacity: 0;
    pointer-events: none;
  }

  & .grid {
    display: grid;
    grid-template-areas: 'tile';
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: 100%;
    transform-origin: bottom;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0))
  }

  & .tile.incoming,
  & .tile.center {
    display: block;
  }

  & .tile {
    grid-area: tile;
    display: grid;
    place-content: center;
    --tile-x: 0;
    --tile-y: 0;
    transform: translate(var(--tile-x), var(--tile-y));
    position: relative;
  }

  & .tile.left {
    --tile-x: -100%;
    background: mediumseagreen;
  }

  & .tile.right {
    --tile-x: 100%;
    background: dodgerblue;
  }

  & .tile.top {
    --tile-y: -100%;
    background: mediumpurple;
  }

  & .tile.bottom {
    --tile-y: 100%;
    background: darkorange;
  }


  & .tile.center {
    z-index: 2;
  }

  & .tile.center::before {
    content: '';
    position: absolute;
    inset: 0;
    width: 100px;
    height: 100px;
    margin: auto;
    border-radius: 100%;
    animation: &-pulse ease-in-out 1000ms alternate infinite;
    background: white;
  }
  @keyframes &-pulse {
     0% {
       opacity: .5;
       transform: scale(.5);
     }
     100% {
       opacity: 0;
       transform: scale(1);
     }
   }



  & .information {
    pointer-events: none;
    position: absolute;
    inset: 3px;
    display: grid;
    place-items: end center;
    z-index: 9001;
  }

  & .mini-overlay {
    pointer-events: all;
    background: rgba(0,0,0,.85);
    border: 1px solid rgba(255,255,255,.5);
    color: rgba(255,255,255,.85);
    border-radius: 2px;
    width: 100%;
    max-width: 55ch;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .game-dialog {
    padding: 1rem 1rem 0;
  }

  & .game-actions {
    padding: .5rem 0;
  }
  & .game-actions button {
    border: none;
    border-radius: none;
    background: transparent;
    color: dodgerblue;
    padding: .5rem 1rem;
  }

  & .flagged::before {
    content: '%';
  }

  & .alive::before {
    content: '';
    background: rgba(255,255,255,.15);
    pointer-events: none;
    inset: 0;
    position: absolute;
    mix-blend-mode: soft-light;
  }

`)

const lastFrame = {
  a: false,
  b: false,
  x: false,
  y: false,
  down: false,
  up: false,
  left: false,
  right: false,
}
function gameLoop(time) {
  const { id } = this
  const { instances } = $.learn()
  if(instances[id]) {
    const { x, y } = instances[id]
    const player = {
      a: checkButton(0, 0),
      b: checkButton(0, 1),
      x: checkButton(0, 3),
      y: checkButton(0, 2),
      lb: checkButton(0, 4),
      rb: checkButton(0, 5),
      lt: checkButton(0, 6),
      rt: checkButton(0, 7),
      select: checkButton(0, 8),
      start: checkButton(0, 9),
      ls: checkButton(0, 10),
      rs: checkButton(0, 11),
      up: checkButton(0, 12),
      down: checkButton(0, 13),
      left: checkButton(0, 14),
      right: checkButton(0, 15),
      os: checkButton(0, 16),
    }

    if(player.a) {
    } else {
    }

    if(player.b) {
    } else {
    }

    if(player.x) {
    } else {
    }

    if(player.y) {
    } else {
    }

    if(player.lb) {
    } else {
    }

    if(player.rb) {
    } else {
    }

    if(player.lt) {
    } else {
    }

    if(player.rt) {
    } else {
    }

    if(player.up) {
      if(!lastFrame.up) {
        lastFrame.up = true
        slideUp(id)
      }
    } else {
      lastFrame.up = false
    }

    if(player.down) {
      if(!lastFrame.down) {
        lastFrame.down = true
        slideDown(id)
      }
    } else {
      lastFrame.down = false
    }

    if(player.left) {
      if(!lastFrame.left) {
        lastFrame.left = true
        slideLeft(id)
      }
    } else {
      lastFrame.left = false
    }

    if(player.right) {
      if(!lastFrame.right) {
        lastFrame.right = true
        slideRight(id)
      }
    } else {
      lastFrame.right = false
    }

    if(player.os) {
      if(!lastFrame.os) {
        lastFrame.os = true
        toggleMode()
        //document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      }
    } else {
      lastFrame.os = false
    }

    $.teach({ player })
  }

  requestAnimationFrame(gameLoop.bind(this))
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true

  const x = 0
  const y = 0

  const boxes = {}
  boxes[`${y}:${x}`] = {
    content: `
      <video src="${randomChannel().url}"></video>
    `,
  }

  const id = target.id
  schedule(() => {
    updateInstance({ id }, {
      id,
      boxes,
      x,
      y
    })
  })

  requestAnimationFrame(gameLoop.bind({ id }))
}

function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function updateBox({ x, y, id }, payload) {
  $.teach({...payload}, (s, p) => {
    const key = `${y}:${x}`
    if(payload === null) {
      const nextState = { ...s }
      delete nextState.instances[id].boxes[key]
      return nextState
    }
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          boxes: {
            ...s.instances[id].boxes,
            [key]: {
              ...s.instances[id].boxes[key],
              ...p
            }
          }
        }
      }
    }
  })
}

function schedule(x, delay=1) { setTimeout(x, delay) }

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
    $.teach({ debuggerVisible: false })
  } else {
    consoleShow()
    $.teach({ debuggerVisible: true })
  }

  event.target.classList.toggle('enabled')
}

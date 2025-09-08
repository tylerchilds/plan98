import app from '@plan98/app'
import { checkButton, checkAxis } from './debug-gamepads.js'
import { consoleShow, consoleHide } from './plan98-console.js'
import { products } from './box-art.js'

const modes = {
  system: 'system',
  browse: 'browse',
  play: 'play',
  settings: 'settings',
  player: {}
}

const lolol = {
  '0': {
    '-1': products.memex,
    '0': products.jokebook,
    '1': products.memex,
  },
  '1': {
    '0': products.memex,
  },
  '-1': {
    '0': products.memex,
  },
}

function audioFactory(url) {
  const audioPool = [];
  const poolSize = 3;
  let poolIndex = 0;

  // Initialize pool
  for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
      audioPool.push(audio);
  }

  return function play() {
      const sound = audioPool[poolIndex];
      sound.currentTime = 0; // Reset to start
      sound.play().catch(e => console.log('Play failed:', e));

      // Cycle through pool
      poolIndex = (poolIndex + 1) % poolSize;
  }
}

const playSwipeSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor.sh/output/a.mp3')
const playStuckSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor.sh/output/b.mp3')

const $ = app('shirt-flicks', {
  rows: 1,
  columns: 1,
  instances: {},
  mode: modes.system,
  browserIndex: 0,
  src: null
})

$.draw((target) => {
  const { src, mode, player, instances, debuggerVisible, browserIndex } = $.learn()
  seed(target)
  if(!instances[target.id]) return

  if(mode === modes.settings) {
    return `
      <button class="logo" data-options>
        ShirtFlicks
      </button>
      <div class="settings">
        ${Object.keys(player).map(key => {
          return `
            <div>
              ${key}: ${player[key]}
            </div>
          `
        }).join('')}

        <button class="toolbelt-debugger">
          ${ debuggerVisible ? 'Hide Debugger' : 'Show Debugger' }
        </button>
        <button class="toolbelt-escape">
          Escape
        </button>
      </div>
    `
  }

  if(mode === modes.browse) {
    const flicks = Object.keys(products).map((key, index )=> {
      const product = products[key]

      return `
        <button class="standard-button -large ${browserIndex === index ? 'bias-generic' : '-dark'}" data-install="${key}" ${browserIndex === index?'data-focused':''}>
          ${product.title}
        </button>
      `
    }).join('')

    return `
      <div class="flicks">
        <div class="product-list">
          ${flicks}
        </div>
      </div>
    `
  }

  const instance = instances[target.id]
  const { finished, x, y, won, boxes, rows, columns, maxFlags, totalFlags } = instance

  function createRow(row, yIndex) {
    if(!boxes) return 'no boxes'

    return [x-1,x,x+1].map((column, xIndex) => {
      if((xIndex===0&&yIndex===0)||(xIndex===2&&yIndex===2)||(xIndex===0&&yIndex===2)||(xIndex===2&&yIndex===0)) return ''
      const box = boxes[`${row}:${column}`] || {}
      return `
        <div class="tile ${tilePosition(xIndex,yIndex)} ${ box.alive ? 'alive' : '' }" data-id="${target.id}">
          ${box.content}
        </div>
      `
    }).join('')
  }

  const grid = [y-1,y,y+1].map(createRow).join('')

  return `
    <button class="logo" data-options>
      ShirtFlicks
    </button>

    <div class="system">
      <div class="grid ${finished ? (won?'won':'lost') : ''}">
        ${grid}
      </div>
    </div>
    <iframe class="rom-slot" src="${src}"></iframe>
  `
}, {
  beforeUpdate: (target) => {
    {
      const { instances } = $.learn()
      const instance = instances[target.id]
      if(instance) {
        const { x, y, boxes } = instance
        if(!boxes[`${y}:${x}`]) {
          updateBox({ x, y, id: target.id }, { content: content(x, y) })
        }
      }
    }
  },
  afterUpdate: (target) => {
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
      const { mode } = $.learn()

      if(mode === modes.browse) {
        const active = target.querySelector('[data-focused]')

        if(active) {
          active.scrollIntoView({
            block: "center"
          })
        }
      }
    }
  }
})

function tilePosition(xIndex, yIndex) {
  const { tileGesture, tileDistance } = $.learn()
  const classes = []

  if(yIndex === 0) {
    classes.push('top')

    if(tileGesture === 'scroll' && Math.sign(tileDistance.y)===1) {
      classes.push('incoming')
    }
  } else if(yIndex === 2) {
    classes.push('bottom')
    if(tileGesture === 'scroll' && Math.sign(tileDistance.y)!==1) {
      classes.push('incoming')
    }
  }

  if(xIndex === 0) {
    classes.push('left')
    if(tileGesture === 'swipe' && Math.sign(tileDistance.x)===1) {
      classes.push('incoming')
    }
  } else if(xIndex === 2) {
    classes.push('right')
    if(tileGesture === 'swipe' && Math.sign(tileDistance.x)!==1) {
      classes.push('incoming')
    }
  }

  if(classes.length === 0) {
    classes.push('center')
  }

  return classes.join(' ')
}

$.when('click', '[data-options]', toggleMode)
function toggleMode (event) {
  const { mode } = $.learn()
  const newMode = mode !== modes.settings ? modes.settings : modes.system
  $.teach({ mode: newMode })
}

$.when('click', '[data-browse]', function launchInstallWizard (event) {
  $.teach({ mode: modes.browse })
})

$.when('click', '[data-launch]', (event) => {
  const { launch } = event.target.dataset
  $.teach({ src: launch, mode: modes.play })
})


function streamA(value, id) {
  const { instances } = $.learn()
  const instance = instances[id]

  if(instance) {
    const { x, y } = instance
    
    if(softBoundary(x, y)) {
      toggleSpam('a', value, () => {
        $.teach({ mode: modes.browse })
      })
    } else {
      toggleSpam('a', value, () => {
        const product = getProduct(x,y)
        $.teach({ src: product.url, mode: modes.play })
      })
    }
  }
}

function streamFactory(key, handler) {
  return (value, id) => {
    toggleSpam(key, value, () => {
      handler(id)
    })
  }
}

$.when('click', '[data-install]', installProduct)

function installProduct (event) {
  const { install } = event.target.dataset
  const { instances } = $.learn()
  const product = products[install]

  if(product) {
    const target = event.target.closest($.link)
    const instance = instances[target.id]
    const { x, y } = instance
    if(!lolol[`${y}`]) {
      lolol[`${y}`] = {}
    }
    lolol[`${y}`][`${x}`] = product
    updateBox({ x, y, id: target.id }, { content: content(x, y) })
    $.teach({ mode: modes.system })
  }
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
  $.teach({ 
    tileGesture: null,
    tileDistance: null,
    tileLastTouch: null,
    tileFirstTouch: null
  })
}

function slideLeft(id) {
  const { instances } = $.learn()

  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x-1,y)) {
    playStuckSound()
    return
  }

  updateInstance({ id }, { x: x - 1 })
  playSwipeSound()
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x+1,y)) {
    playStuckSound()
    return
  }

  updateInstance({ id }, { x: x + 1 })
  playSwipeSound()
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x,y-1)) {
    playStuckSound()
    return
  }

  updateInstance({ id }, { y: y - 1 })
  playSwipeSound()
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x,y+1)) {
    playStuckSound()
    return
  }

  updateInstance({ id }, { y: y + 1 })
  playSwipeSound()
}

function softBoundary(x, y) {
  if(!lolol[y]) {
    return true
  } else if(!lolol[y][x]) {
    return true
  } else {
    return false
  }
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

function browserUp(id) {
  const { browserIndex } = $.learn()
  const index = mod((browserIndex - 1), Object.keys(products).length)
  $.teach({ browserIndex: index })
  playSwipeSound()
}

function browserDown(id) {
  const { browserIndex } = $.learn()
  const index = mod((browserIndex + 1), Object.keys(products).length)
  $.teach({ browserIndex: index })
  playSwipeSound()
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

  & .rom-slot {
    opacity: 0;
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: opacity 250ms easeinout;
    z-index: 20;
  }

  &[data-mode="${modes.play}"] .rom-slot {
    opacity : 1;
    pointer-events: all;
  }

  & .title {
    font-size: 2rem;
    font-weight: bold;
  }

  & .logo {
    position: relative;
    font-weight: 100%;
    border-radius: 100%;
    padding: .25rem;
    font-weight: bold;
  }

  & .shirtflicks-s {

  }

  & .shirtflicks-f {

  }



  & [data-options] {
    background: rgba(0,0,0,1);
    border: none;
    color: rgba(255,255,255,.85);
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 4px 8px;
    border-radius: 2px;
    margin: .5rem;
  }

  & [data-options]:hover,
  & [data-options]:focus {
    color: rgba(255,255,255,1);
  }

  & .system,
  & .settings {
    display: none;
    height: 100%;
  }

  &[data-mode="settings"] .settings {
    display: block;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &[data-mode="system"] .system {
    display: block;
  }

  & .settings {
    padding: 2rem 1rem;
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
    display: grid;
  }

  & .tile {
    grid-area: tile;
    display: grid;
    place-items: center;
    --tile-x: 0;
    --tile-y: 0;
    transform: translate(var(--tile-x), var(--tile-y));
    position: relative;
    display: none;
  }

  & .tile.left {
    --tile-x: -100%;
  }

  & .tile.right {
    --tile-x: 100%;
  }

  & .tile.top {
    --tile-y: -100%;
  }

  & .tile.bottom {
    --tile-y: 100%;
  }


  & .tile.center {
    z-index: 2;
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

  & .system-dialog {
    padding: 1rem 1rem 0;
  }

  & .system-actions {
    padding: .5rem 0;
  }
  & .system-actions button {
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

  & .transclusion {
    height: 100%;
    width: 100%;
    display: grid;
    place-content: end start;
    padding: 1rem;
    pointer-events: none;
  }


  & .transclution button {
    pointer-events: all;
  }

  & .system-title {
    color: rgba(255,255,255, .95);
    font-size: 1.2rem;
    position: relative;
    font-weight: bold;
    z-index: 3;
    background: black;
    padding: .5rem;
  }

  & .system-keyart {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
  }

  & .system-keyart img {
    margin: auto;
  }

  & .system-artist {
    color: rgba(255,255,255, .85);
    background: black;
    position: relative;
    font-size: .9rem;
    padding: 4px;
    z-index: 3;
  }

  & .system-description {
    color: rgba(255,255,255, .85);
    background: black;
    position: relative;
    z-index: 3;
    margin-bottom: 1rem;
    padding: .5rem;
  }

  & .system-button {
    max-width: 100%;
    width: 240px;
    position: relative;
    z-index: 3;
  }

  & .action-area {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .flicks {
    height: 100%;
    overflow: auto;
  }

  & .product-list {
    max-width: 55ch;
    display: flex;
    flex-direction: column;
    margin: auto;
    gap: .5rem;
    padding: 1rem;
  }

  & .flicks button {
    width: 100%;
  }

  & .flicks button > * {
    pointer-events: none;
  }


`)

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const forceCache = {}

// essentially make sure the button was released to ensure the screen
function forceAcknowledge(code, value, callback) {
  if(value === 0 && !forceCache[code]) {
    forceCache[code] = 0
    return
  }
  if(forceCache[code] === 1 || (forceCache[code] === 0 && value === 1)) {
    forceCache[code] = 1
    callback()
  }
}

function clearAcknowledge(code) {
  delete forceCache[code]
}

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


function systemLoop(time) {
  const { id } = this
  const { mode, instances, browserIndex } = $.learn()
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

    if(mode === modes.play) {
      const streamOS = streamFactory('os', () => {
        $.teach({ mode: modes.system })
      })
      streamOS(player.os, id)
    }

    if(mode === modes.system) {
      const streamOS = streamFactory('os', toggleMode)

      const streamUp = streamFactory('up', slideUp)
      const streamDown = streamFactory('down', slideDown)
      const streamLeft = streamFactory('left', slideLeft)
      const streamRight = streamFactory('right', slideRight)
      const streamB = streamFactory('b', (id) => {
          $.teach({ mode: modes.browse })
      })

      streamOS(player.os, id)

      streamA(player.a, id)
      streamB(player.b, id)
      streamUp(player.up, id)
      streamDown(player.down, id)
      streamLeft(player.left, id)
      streamRight(player.right, id)
    }

    if(mode === modes.browse) {
      const streamUp = streamFactory('up', browserUp)
      const streamDown = streamFactory('down', browserDown)

      const streamA = streamFactory('a', (id) => {
        $.teach({ mode: modes.browse })
        const install = Object.keys(products)[browserIndex]
        const product = products[install]

        if(product) {
          const instance = instances[id]
          const { x, y } = instance
          if(!lolol[`${y}`]) {
            lolol[`${y}`] = {}
          }
          lolol[`${y}`][`${x}`] = product
          updateBox({ x, y, id }, { content: content(x, y) })
          $.teach({ mode: modes.system })
        }
      })
 
      const streamB = streamFactory('b', (id) => {
        $.teach({ mode: modes.browse })
      })

      streamUp(player.up, id)
      streamDown(player.down, id)

      streamA(player.a, id)
      streamB(player.b, id)
    }

    if(mode === modes.settings) {
      const streamOS = streamFactory('os', toggleMode)
      streamOS(player.os, id)
    }

    $.teach({ player })
  }

  requestAnimationFrame(systemLoop.bind(this))
}

function installFlick(x, y) {
  return `
    <div class="action-area">
      <div>
        <span class="system-title">
          Install Flick
        </span>
        <span class="system-artist">
          Plan98
        </span>
      </div>


      <div class="system-description">
        From the content catalog, pick your favorite flicks.
      </div>

      <button class="standard-button system-button" data-browse data-x="${x}" data-y="${y}">
        Browse
      </button>
    </div>
  `
}

function content(x, y) {
  let value

  if(softBoundary(x,y)) {
    value = installFlick(x, y)
  } else {
    value = lolol[`${y}`][`${x}`].boxart
  }

  return `
    <div${x}${y} class="transclusion">
      ${value}
    </div${x}${y}>
  `
}

function getProduct(x,y) {
  return lolol[`${y}`][`${x}`]
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns } = $.learn() || {}

  const boxes = {}
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      boxes[`${y}:${x}`] = {
        content: content(x,y),
        x,
        y
      }
    }
  }

  const id = target.id
  schedule(() => {
    updateInstance({ id }, {
      x: Math.floor(columns/2),
      y: Math.floor(rows/2),
      id,
      rows,
      columns,
      boxes,
    })
  })

  requestAnimationFrame(systemLoop.bind({ id }))
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

function mod(x, n) {
  return ((x % n) + n) % n;
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
    $.teach({ debuggerVisible: false })
  } else {
    consoleShow()
    $.teach({ debuggerVisible: true })
  }

  event.target.classList.toggle('enabled')
}

$.when('click', '.toolbelt-escape', (event) => {
  $.teach({ activated: false })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
})


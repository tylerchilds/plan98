import app from '@silly/elf'
import diffHTML from 'diffhtml'
import { checkButton, checkAxis } from './debug-gamepads.js'
import { consoleShow, consoleHide } from './plan98-console.js'
import { products } from './box-art.js'

const porlock = [
  'In Xanadu did Kubla Khan and Kubla Khan found Alph.',
  'Now, Alph is a river that slips as it slithers,',
  'while time is adjacent to space ever so nascent,',
  'that water flows upwards and downwards at once.',
  'A story unfolded as it was tolded, a bardly dulcimer,',
  'Beginning unkindly, the realms sent war to her,',
  'Assuming the jester for heightened bemusement, she rang',
  'whole kingdoms now circused in total amusement, she sang',
  'Over and over she keeps thwarting their efforts,',
  "How? Space is a construct, she's throwing a concert,",
  'that fits in her pocket, on paper as finite as self,',
  'it sounds somewhat silly: time is a gift of the elves.',
]

const modes = {
  welcome: 'welcome',
  system: 'system',
  browse: 'browse',
  play: 'play',
  settings: 'settings',
}

const lolol = {
  '0': {
    '-2'  : products.memex,
    '-1'  : products.desktop,
    '0'   : products.jokebook,
    '1'   : products.mobile,
    '2'   : products.memex,
  },
  '1': {
    '0'   : products.memex,
  },
  '-1': {
    '0'   : products.shell,
  },
  '2': {
    '0'   : products.memex,
  },
  '-2': {
    '0'   : products.memex,
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

const playSwipeSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/a.mp3')
const playStuckSound = audioFactory('/public/cdn/sillyz.computer/beat-tape-extractor/output/b.mp3')

const $ = app('shirt-flicks', {
  rows: 1,
  columns: 1,
  instances: {},
  mode: modes.welcome,
  browserIndex: 0,
  src: null,
  porlockIndex: 0
})

const coloures = [
  'firebrick',
  'darkorange',
  'gold',
  'mediumseagreen',
  'dodgerblue',
  'slateblue',
  'mediumpurple',
]

const modeHandlers = {
  [modes.welcome]: (target) => {
    const { porlockIndex } = $.learn()

    const hypertext = `
      <div class="brand-voice" style="background-color: ${coloures[porlockIndex % coloures.length]}">
        <span class="brand-message">${porlock[porlockIndex]}</span>
      </div>
    `

    const view = target.querySelector('[data-dom="welcome"]')

    if(view)
      diffHTML.innerHTML(view, hypertext)
  },
  [modes.system]: (target) => {
    const { instances } = $.learn()
    const instance = instances[target.id]

    if(!instance) return

    const { x, y, boxes } = instance

    function createRow(row, yIndex) {
      if(!boxes) return 'no boxes'

      return [x-1,x,x+1].map((column, xIndex) => {
        if((xIndex===0&&yIndex===0)||(xIndex===2&&yIndex===2)||(xIndex===0&&yIndex===2)||(xIndex===2&&yIndex===0)) return ''
        const box = boxes[`${row}:${column}`] || {}
        return `
          <div class="shirt ${shirtPosition(xIndex,yIndex)} ${ box.alive ? 'alive' : '' }" data-id="${target.id}">
            ${box.content}
          </div>
        `
      }).join('')
    }

    const grid = [y-1,y,y+1].map(createRow).join('')
    const div = target.querySelector('[data-dom="grid"]')
    diffHTML.innerHTML(div, grid)
  },
  [modes.browse]: (target) => {
    const { browserIndex } = $.learn()
    const flicks = Object.keys(products).map((key, index )=> {
      const product = products[key]

      return `
        <button class="standard-button -large ${browserIndex === index ? 'bias-generic' : '-dark'}" data-install="${key}" ${browserIndex === index?'data-focused':''}>
          ${product.title}
        </button>
      `
    }).join('')

    const div = target.querySelector('[data-dom="catalog"]')
    diffHTML.innerHTML(div, flicks)
  },
  [modes.play]: (target) => {
    const { src } = $.learn()

    const div = target.querySelector('[data-dom="player"]')
    diffHTML.innerHTML(div, `
      <iframe class="${modes.play}" src="${src}"></iframe>
    `)
  },
  [modes.settings]: (target) => {
    const { debuggerVisible } = $.learn()
    const button = target.querySelector('[data-dom="debugger-button"]')
    button.innerText = debuggerVisible ? 'Hide Debugger' : 'Show Debugger'
  },
}

function patchByMode(target) {
  const { mode } = $.learn()
  if(modeHandlers[mode]) {
    return modeHandlers[mode](target)
  }
}

function autoplay(target) {
  const activeShirt = target.querySelector('.shirt.center [data-trailer]')

  if(!activeShirt) return

  const { trailer } = activeShirt.dataset

  const theater = target.querySelector('[data-dom="theater"]')
  if(target.trailer !== trailer) {
    target.trailer = trailer
    theater.innerHTML = ''
    theater.innerHTML = `
      <div class="transclusion">
        <div class="transclusion-trailer">
          <cdn-video loop="true" autoplay="true" controls="false" src="${trailer}"></cdn-video>
        </div>
      </div>
    `

  }
}

$.draw((target) => {
  const { instances } = $.learn()
  seed(target)
  if(!instances[target.id]) return

  if(target.innerHTML) return

  return `
    <div class="header">
      <button class="logo" data-options>
        ShirtFlicks
      </button>
    </div>
    <div class="${modes.welcome}">
      <div class="pane">
        <div class="pane-view" data-dom="welcome"></div>
        <div class="pane-actions">
          <button class="gaming-button -a">
            Continue
          </button>
          <button class="gaming-button -b">
            Skip
          </button>
        </div>
      </div>
    </div>
    <div class="${modes.browse}">
      <div class="flicks">
        <div class="product-list" data-dom="catalog"></div>
      </div>
    </div>
    <div class="${modes.settings}">
      <div class="pane">
        <div class="pane-view">
          <time-machine></time-machine>
        </div>
        <div class="pane-actions">
          <button class="gaming-button -x toolbelt-debugger" data-dom="debugger-button"></button>
          <button class="gaming-button -y toolbelt-escape">
            Escape
          </button>
        </div>
      </div>
    </div>

    <div class="${modes.system}">
      <div data-dom="grid" class="grid"></div>
      <div data-dom="theater" class="theater"></div>
    </div>

    <div class="${modes.play}" data-dom="player">
    </div>
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
      const { shirtGesture, shirtDistance } = $.learn()

      if(shirtGesture === 'swipe') {
        target.style.setProperty("--pan-x", `${shirtDistance.x}px`);
      } else if(shirtGesture === 'scroll') {
        target.style.setProperty("--pan-y", `${shirtDistance.y}px`);
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

    {
      patchByMode(target)
    }

    {
      autoplay(target)
    }
  }
})

function shirtPosition(xIndex, yIndex) {
  const { shirtGesture, shirtDistance } = $.learn()
  const classes = []

  if(yIndex === 0) {
    classes.push('top')

    if(shirtGesture === 'scroll' && Math.sign(shirtDistance.y)===1) {
      classes.push('incoming')
    }
  } else if(yIndex === 2) {
    classes.push('bottom')
    if(shirtGesture === 'scroll' && Math.sign(shirtDistance.y)!==1) {
      classes.push('incoming')
    }
  }

  if(xIndex === 0) {
    classes.push('left')
    if(shirtGesture === 'swipe' && Math.sign(shirtDistance.x)===1) {
      classes.push('incoming')
    }
  } else if(xIndex === 2) {
    classes.push('right')
    if(shirtGesture === 'swipe' && Math.sign(shirtDistance.x)!==1) {
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

$.when('pointerdown', '.shirt', function(e) {
  event.preventDefault()
  $.teach({ shirtStartTime: e.timeStamp })
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
    shirtFirstTouch: {
      x: startX,
      y: startY
    }
  })
})

$.when('pointermove', '.shirt', function(e){
  event.preventDefault()
  const { shirtStartTime, shirtFirstTouch, shirtGesture } = $.learn()
  if(!shirtFirstTouch) return
  const shirtEndTime = e.timeStamp;
  const shirtDuration = shirtEndTime - shirtStartTime;
  let lastX, lastY;
  const rectangle = event.target.closest($.link).getBoundingClientRect()
  if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
    lastX = e.touches[0].clientX - rectangle.left
    lastY = e.touches[0].clientY - rectangle.top
  } else {
    lastX = e.clientX - rectangle.left
    lastY = e.clientY -rectangle.top
  }

  const shirtLastTouch = {
    x: lastX,
    y: lastY
  }


  const shirtDistance = {
    x: shirtLastTouch.x - shirtFirstTouch.x,
    y: shirtLastTouch.y - shirtFirstTouch.y
  }

  $.teach({
    shirtEndTime,
    shirtDuration,
    shirtLastTouch,
    shirtDistance
  })

  if(!shirtGesture) {
    setGesture();
  }
})

$.when('pointerup', '.shirt', function(event){
  const { id } = event.target.dataset
  const { instances, shirtDistance, shirtGesture, shirtLastTouch, shirtDuration } = $.learn()

  if(!shirtDistance) {
    clearPointer()
    return
  }

  if(shirtGesture === 'scroll') {
    const distance = Math.abs(shirtDistance.y);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(shirtDistance.y)===1) {
      slideUp(id)
    } else {
      slideDown(id)
    }

  } else if(shirtGesture === 'swipe') {
    const distance = Math.abs(shirtDistance.x);

    if(distance < 20) {
      clearPointer()
      return
    }

    if(Math.sign(shirtDistance.x)===1) {
      slideLeft(id)
    } else {
      slideRight(id)
    }
  }

  clearPointer()
})

function clearPointer() {
  $.teach({ 
    shirtGesture: null,
    shirtDistance: null,
    shirtLastTouch: null,
    shirtFirstTouch: null
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

  playSwipeSound()
  updateInstance({ id }, { x: x - 1 })
  cleanup(id)
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x+1,y)) {
    playStuckSound()
    return
  }

  playSwipeSound()
  updateInstance({ id }, { x: x + 1 })
  cleanup(id)
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x,y-1)) {
    playStuckSound()
    return
  }

  playSwipeSound()
  updateInstance({ id }, { y: y - 1 })
  cleanup(id)
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, y } = instances[id]

  if(softBoundary(x,y) && softBoundary(x,y+1)) {
    playStuckSound()
    return
  }

  playSwipeSound()
  updateInstance({ id }, { y: y + 1 })
  cleanup(id)
}

function cleanup(id) {
  const node = document.getElementById(id)
  if(node)
    node.trailer = null
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
  const { shirtDistance } = $.learn()
  const y = Math.abs(shirtDistance.y)
  const x = Math.abs(shirtDistance.x)
  if(x < 5 && y < 5) return
  if(y > x){
    $.teach({ shirtGesture: 'scroll' })
  } else {
    $.teach({ shirtGesture: 'swipe' })
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

  & .${modes.play},
  & .${modes.browse},
  & .${modes.welcome},
  & .${modes.settings} {
    opacity: 0;
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: opacity 250ms easeinout;
    z-index: 20;
  }

  &[data-mode="${modes.welcome}"] .${modes.welcome},
  &[data-mode="${modes.browse}"] .${modes.browse},
  &[data-mode="${modes.settings}"] .${modes.settings} {
    display: block;
    opacity : 1;
  }

  &[data-mode="${modes.play}"] .${modes.play} {
    opacity : 1;
    pointer-events: all;
  }

  & .title {
    font-size: 2rem;
    font-weight: bold;
  }

  & .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 90001;
    pointer-events: none;
  }

  & .logo {
    border-radius: 100%;
    padding: .25rem;
    font-weight: bold;
    pointer-events: all;
  }

  & .shirtflicks-s {

  }

  & .shirtflicks-f {

  }



  & [data-options] {
    background: rgba(0,0,0,1);
    border: none;
    color: rgba(255,255,255,.85);
    padding: 4px 8px;
    border-radius: 2px;
    margin: 4px;
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
    padding: 0 1rem;
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
    grid-template-areas: 'shirt';
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: 100%;
    transform-origin: bottom;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0))
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  & .theater {
    display: grid;
    grid-template-areas: 'shirt';
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: 100%;
    transform-origin: bottom;
    transform: translate(var(--pan-x, 0), var(--pan-y, 0));
    position: absolute;
    inset: 0;
  }

  & .shirt.incoming,
  & .shirt.center {
    display: grid;
  }

  & .shirt {
    grid-area: shirt;
    display: grid;
    place-items: center;
    --shirt-x: 0;
    --shirt-y: 0;
    transform: translate(var(--shirt-x), var(--shirt-y));
    position: relative;
    display: none;
  }

  & .shirt.left {
    --shirt-x: -100%;
  }

  & .shirt.right {
    --shirt-x: 100%;
  }

  & .shirt.top {
    --shirt-y: -100%;
  }

  & .shirt.bottom {
    --shirt-y: 100%;
  }


  & .shirt.center {
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
    display: block;
    pointer-events: none;
    position: relative;
  }

  & .transclusion-boundary {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 1rem;
  }

  & .transclusion-trailer {
    position: absolute;
    inset: 0;
    background: black;
    display: grid;
    place-items: center;
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

  & .system-launcher {
    position: relative;
    z-index: 10;
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

  & .shirt-keyart {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    opacity: 0;
  }

  & .shirt-keyart img {
    margin: auto;
  }

  & .pane {
    grid-template-areas: 'main' 'actions';
    grid-template-rows: 1fr auto;
    display: grid;
    height: 100%;
  }

  & .pane-view {
    position: relative;
  }

  & .pane-actions {
    grid-area: actions;
    text-align: right;
  }

  & .brand-voice {
    font-size: 2rem;
    position: absolute;
    inset: 0;
    padding: 1rem;
    display: flex;
    align-items: end;
  }

  & .brand-message {
    background: black;
    color: white;
    padding: .5rem 1rem;
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
  const { porlockIndex, mode, instances, browserIndex } = $.learn()
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

    if(mode === modes.welcome) {
      const streamA = streamFactory('a', (id) => {
        let next = porlockIndex + 1 

        if(next >= porlock.length) {
          next = 0
        }

        $.teach({ porlockIndex: next })
      })
      const streamB = streamFactory('b', (id) => {
        $.teach({ mode: modes.system })
      })
      const streamUp = streamFactory('up', (id) => {
        $.teach({ porlockIndex: 0 })
      })
      const streamLeft = streamFactory('left', (id) => {
        let next = porlockIndex - 1 

        if(next < 0) {
          next = 0
        }

        $.teach({ porlockIndex: next })
      })

      const streamRight = streamFactory('right', (id) => {
        let next = porlockIndex + 1 

        if(next >= porlock.length) {
          next = porlock.length - 1
        }

        $.teach({ porlockIndex: next })
      })
      const streamDown = streamFactory('down', (id) => {
        $.teach({ porlockIndex: porlock.length - 1 })
      })

      streamA(player.a, id)
      streamB(player.b, id)
      streamUp(player.up, id)
      streamLeft(player.left, id)
      streamRight(player.right, id)
      streamDown(player.down, id)
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
      const streamX = streamFactory('x', (id) => {
        debugToolbelt()
      })
      const streamY = streamFactory('y', (id) => {
        handleEscape()
      })

      streamX(player.x, id)
      streamY(player.y, id)

      streamOS(player.os, id)
    }
  }

  requestAnimationFrame(systemLoop.bind(this))
}

function installFlick(x, y) {
  return `
    <div class="transclusion-boundary">
      <div class="action-area">
        <div>
          <span class="system-title">
            Install Flick
          </span>
          <span class="system-artist">
            Plan98
          </span>
        </div>


        <div>
          <span class="system-description">
            From the content catalog, pick your favorite flicks.
          </span>
        </div>

        <div style="text-align: right;">
          <button class="gaming-button -a" data-browse data-x="${x}" data-y="${y}">
            Browse
          </button>
        </div>
      </div>
    </div>
  `
}

function content(x, y) {
  let value

  if(softBoundary(x,y)) {
    value = installFlick(x, y)
  } else {
    const { keyart, launcher, trailer } = lolol[`${y}`][`${x}`]
    value = `
      <div data-trailer="${trailer}" class="transclusion-boundary">
        <div class="shirt-keyart">
          <img src="${keyart}" />
        </div>
        <div class="shirt-launcher">
          ${launcher}
        </div>
      </div>
    `
  }

  const divkey = `div${x.toString().replaceAll('-','')}${y.toString().replaceAll('-','')}`

  return `
    <${divkey} class="transclusion">
      ${value}
    </${divkey}>
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
}

$.when('click', '.toolbelt-escape', handleEscape)

function handleEscape (event) {
  window.location.href = '/app/ur-shell?src=/app/was-code?src=/public/elves/shirt-flicks.js'
}


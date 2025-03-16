import elf from '@silly/elf'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { overrideButton, checkButton, checkAxis } from './debug-gamepads.js'

let current
// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

const themes = ['lightgray', 'firebrick','darkorange','gold','mediumseagreen','dodgerblue','mediumpurple']

const fontSizes = ['tiny', 'small', 'regular', 'large', 'huge']
const fontSizeMap = {
  tiny: '10px',
  small: '13px',
  regular: '16px',
  large: '18px',
  huge: '21px',
}

const fontFamilies = ['recursive', 'arial', 'verdana', 'helvetica', 'tahoma', 'times new roman', 'georgia', 'garamond', 'palatino']
const fontFamilyMap = {
  recursive: "'Recursive', 'Avenir', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', 'Verdana', sans-serif",
  arial: "'Arial', sans-serif",
  verdana: "'Verdana', sans-serif",
  helvetica: "'Helvetica', sans-serif",
  'times new roman': "'Times New Roman', serif",
  georgia: "'Georgia', serif",
  garamond: "'Garamond', serif",
  palatino: "'Palatino', serif",
}

const $ = elf('paper-pocket', {
  fullScreen: false,
  theme: localStorage.getItem('paper-pocket/theme') || 'lightgray',
  instrument: localStorage.getItem('paper-pocket/instrument') || 'violin',
  fontSize: localStorage.getItem('paper-pocket/fontSize') || 'regular',
  fontFamily: localStorage.getItem('paper-pocket/fontFamily') || 'recursive',
  rom: 'paper-nautiloids'
})

export function getFontSizeOptions() {
  return fontSizes
}

export function setFontSize(fontSize) {
  localStorage.setItem('paper-pocket/fontSize', fontSize)
  $.teach({ fontSize })
}

export function getFontSize() {
  return $.learn().fontSize || 'regular'
}

export function getFontFamilyOptions() {
  return fontFamilies
}

export function setFontFamily(fontFamily) {
  localStorage.setItem('paper-pocket/fontFamily', fontFamily)
  $.teach({ fontFamily })
}

export function getFontFamily() {
  return $.learn().fontFamily || 'Recursive'
}

export function getInstruments() {
  return instruments
}

export function setInstrument(instrument) {
  loadInstrument(instrument)
  localStorage.setItem('paper-pocket/instrument', instrument)
  $.teach({ instrument })
}

export function getInstrument() {
  return $.learn().instrument || 'violin'
}

let ready
function loadInstrument(instrument) {
  ready = false
  current = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/"
  })

  Tone.loaded().then(function() {
    ready = true
    current.release = .5;
    current.toDestination();
  })
}

loadInstrument(getInstrument())

export function getThemes() {
  return themes
}

export function setTheme(theme) {
  localStorage.setItem('paper-pocket/theme', theme)
  $.teach({ theme })
}

export function getTheme() {
  return $.learn().theme
}

const attacking = {}

export function attack(note) {
  if(!ready || attacking[note]) return
  current.triggerAttack(Tone.Frequency(note, "midi").toNote());
  attacking[note] = true
}

export function attackRelease(note, callback, time='2n') {
  if(ready) {
    current.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), time);
    attacking[note] = true
  }

  setTimeout(callback, Tone.Time(time).toMilliseconds())
}

export function release(note) {
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!ready) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
}


$.draw((target) => {
  if(target.innerHTML) return
  const { rom, fullScreen, theme } = $.learn()
  return `
    <div class="chrome" style="--theme: ${theme}" data-full="${fullScreen}">
      <div class="widget-frame">
        <div class="viewport">
          <div class="super-items">
            <button key="os" class="clear" data-press="os">
              PaperPocket
            </button>
          </div>
          <div class="app">
            <${rom}></${rom}>
          </div>
          <div class="menu-items">
            <button key="options" class="clear" data-press="select">
              Options
            </button>
            <button key="start" class="clear" data-press="start">
              Start
            </button>
          </div>
        </div>
      </div>

      <div class="controller">
        <fieldset class="gamepad-grid" tab-index="1">
          <button key="a" class="green" data-press="a">A</button>
          <button key="b" class="red" data-press="b">B</button>
          <button key="x" class="blue" data-press="x">X</button>
          <button key="y" class="yellow" data-press="y">Y</button>
          <button key="up" class="gray" data-press="up">
            <sl-icon name="caret-up-fill"></sl-icon>
          </button>
          <button key="down" class="gray" data-press="down">
            <sl-icon name="caret-down-fill"></sl-icon>
          </button>
          <button key="left" class="gray" data-press="left">
            <sl-icon name="caret-left-fill"></sl-icon>
          </button>
          <button key="right" class="gray" data-press="right">
            <sl-icon name="caret-right-fill"></sl-icon>
          </button>
        </fieldset>
      </div>
    </div>
  `
}, {
  beforeUpdate: (target) => {
    {
      if(!target.mounted) {
        target.mounted = true
        const rom = target.getAttribute('rom')
        if(rom) $.teach({ rom })
      }
    }
  },
  afterUpdate: (target) => {
    {
      const chrome = target.querySelector('.chrome')
      chrome.dataset.full = $.learn().fullScreen
    }

    {
      const { theme } = $.learn()
      if(target.theme !== theme) {
        console.log(theme)
        target.theme = theme
        document.body.style.setProperty('--root-theme', theme)
      }
    }

    {
      const { fontSize } = $.learn()
      if(target.fontSize !== fontSize) {
        target.fontSize = fontSize
        document.documentElement.style.setProperty('--font-size-root', fontSizeMap[fontSize])
      }
    }

    {
      const { fontFamily } = $.learn()
      if(target.fontFamily !== fontFamily) {
        target.fontSize = fontFamily
        document.documentElement.style.setProperty('--font-family', fontFamilyMap[fontFamily])
      }
    }

  },
})

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

function standardAction(code) {
  return (target, params) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, code, params)
  }
}

const buttons = {
  a: 0,
  b: 1,
  x: 3,
  y: 2,
  lb: 4,
  rb: 5,
  lt: 6,
  rt: 7,
  select: 8,
  start: 9,
  ls: 10,
  rs: 11,
  up: 12,
  down: 13,
  left: 14,
  right: 15,
  os: 16
}

const actions = {
  a: standardAction('a'),
  b: standardAction('b'),
  x: standardAction('x'),
  y: standardAction('y'),
  lb: standardAction('lb'),
  rb: standardAction('rb'),
  lt: standardAction('lt'),
  rt: standardAction('rt'),
  ls: standardAction('ls'),
  rs: standardAction('rs'),
  select: standardAction('select'),
  start: standardAction('start'),
  up: standardAction('up'),
  down: standardAction('down'),
  left: standardAction('left'),
  right: standardAction('right'),
}

function notification(node, method, params) {
  if(node) {
    node.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: method,
        params
      }
    }))
  }
}

$.when('contextmenu', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('dblclick', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('touchcancel', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('touchend', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('pointerdown', '[data-press]', (event) => {
  const { press } = event.target.dataset
  overrideButton(0, buttons[press], 1)
})

$.when('pointerup', '[data-press]', (event) => {
  const { press } = event.target.dataset
  overrideButton(0, buttons[press], 0)
})

const keyFlips = {
  Meta: keyFlipper(0, buttons.os),
  Enter: keyFlipper(0, buttons.start),
  Backspace: keyFlipper(0, buttons.select),
  ArrowUp: keyFlipper(0, buttons.up),
  w: keyFlipper(0, buttons.up),
  W: keyFlipper(0, buttons.up),
  ArrowDown: keyFlipper(0, buttons.down),
  S: keyFlipper(0, buttons.down),
  s: keyFlipper(0, buttons.down),
  ArrowRight: keyFlipper(0, buttons.right),
  d: keyFlipper(0, buttons.right),
  D: keyFlipper(0, buttons.right),
  ArrowLeft: keyFlipper(0, buttons.left),
  a: keyFlipper(0, buttons.left),
  A: keyFlipper(0, buttons.left),
  j: keyFlipper(0, buttons.a),
  J: keyFlipper(0, buttons.a),
  k: keyFlipper(0, buttons.b),
  K: keyFlipper(0, buttons.b),
  l: keyFlipper(0, buttons.x),
  L: keyFlipper(0, buttons.x),
  h: keyFlipper(0, buttons.y),
  H: keyFlipper(0, buttons.y),
  u: keyFlipper(0, buttons.lb),
  U: keyFlipper(0, buttons.lb),
  i: keyFlipper(0, buttons.rb),
  I: keyFlipper(0, buttons.rb),
  y: keyFlipper(0, buttons.lt),
  Y: keyFlipper(0, buttons.lt),
  o: keyFlipper(0, buttons.rt),
  O: keyFlipper(0, buttons.rt),
  q: keyFlipper(0, buttons.ls),
  Q: keyFlipper(0, buttons.ls),
  e: keyFlipper(0, buttons.rs),
  E: keyFlipper(0, buttons.rs),
}

function keyFlipper(slot, button) {
  return (value) => {
    overrideButton(slot, button, value)
  }
}


self.addEventListener('keydown', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](1)
  }
})

self.addEventListener('keyup', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](0)
  }
})

function standardFire(player, node, code) {
  if(player[code]) {
    actions[code](node, {
      type: 'click',
      value: 1
    })
  } else {
    actions[code](node, {
      type: 'click',
      value: 0
    })
  }
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

function player1(code) {
  return checkButton(0, buttons[code])
}

function gameLoop(time) {
  const { paused } = $.learn()

  if(!paused) {
    const node = document.querySelector($.link)

    if(node) {
      const player = {
        a: player1('a'),
        b: player1('b'),
        x: player1('x'),
        y: player1('y'),
        lb: player1('lb'),
        rb: player1('rb'),
        lt: player1('lt'),
        rt: player1('rt'),
        select: player1('select'),
        start: player1('start'),
        ls: player1('ls'),
        rs: player1('rs'),
        up: player1('up'),
        down: player1('down'),
        left: player1('left'),
        right: player1('right'),
        os: player1('os'),
      }

      standardFire(player, node, 'a')
      standardFire(player, node, 'b')
      standardFire(player, node, 'x')
      standardFire(player, node, 'y')
      standardFire(player, node, 'lb')
      standardFire(player, node, 'rb')
      standardFire(player, node, 'lt')
      standardFire(player, node, 'rt')
      standardFire(player, node, 'ls')
      standardFire(player, node, 'select')
      standardFire(player, node, 'start')
      standardFire(player, node, 'rs')
      standardFire(player, node, 'up')
      standardFire(player, node, 'down')
      standardFire(player, node, 'left')
      standardFire(player, node, 'right')

      toggleSpam('os', player.os, () => {
        toggleMode()
      })
    }
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()

export function pause() {
  $.teach({ paused: true })
}

export function resume() {
  $.teach({ paused: false })
}

function toggleMode (event) {
  const { fullScreen } = $.learn()
  $.teach({ fullScreen: !fullScreen })
}

$.style(`
  & {
    display: block;
    height: 100%;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .chrome {
    background: var(--root-theme, lightgray);
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
  }

  & .widget-frame {
    overflow: hidden;
    padding: 16px;
  }

  & .app {
    overflow: auto;
  }

  & .viewport {
    background: black;
    padding: 0 16px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    max-height: 100%;
    height: 100%;
  }

  & .yellow {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--yellow);
    color: rgba(255,255,255,.85);
  }

  & .yellow:hover,
  & .yellow:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--yellow);
    color: rgba(255,255,255,1);
  }

  & .blue {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--blue);
    color: rgba(255,255,255,.85);
  }

  & .blue:hover,
  & .blue:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--blue);
    color: rgba(255,255,255,1);
  }

  & .red {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--red);
    color: rgba(255,255,255,.85);
  }

  & .red:hover,
  & .red:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--red);
    color: rgba(255,255,255,1);
  }

  & .green {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--green);
    color: rgba(255,255,255,.85);
  }

  & .green:hover,
  & .green:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--green);
    color: rgba(255,255,255,1);
  }

  & .clear {
    color: var(--root-theme, lightgray);
    background: transparent;
    border-radius: none;
    border-radius: 0;
    border: none;
    padding: 8px 16px;
    opacity: .5;
  }

  & .clear:hover,
  & .clear:focus {
    opacity: 1;
  }


  & .gray {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--gray);
    color: rgba(255,255,255,.85);
  }

  & .gray:hover,
  & .gray:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--gray);
    color: rgba(255,255,255,1);
  }

  & .chrome[data-full="true"] .widget-frame {
    padding: 0;
  }

  & .chrome[data-full="true"] .viewport {
    padding: 0;
  }

  & .chrome[data-full="true"] .controller {
    display: none;
  }

  & .controller {
    text-align: center;
  }

  & .gamepad-grid {
    display: inline-grid;
    grid-template-columns: 45px 45px 45px 45px 45px;
    grid-template-rows: 45px 45px;
    grid-template-areas:
      ". y up x ."
      "b left down right a";
    border: none;
    padding: 10px;
    gap: 10px;
  }

  & .gamepad-grid:focus {
    background: white;
  }

  & .gamepad-grid button {
    pointer-events: all;
    width: 45px;
    height: 45px;
    display: grid;
    place-content: center;
    font-size: 24px;
    border: none;
    border-radius: 0;
    font-weight: bold;
    border-radius: 100%;
  }

  & [data-press="a"] {
    grid-area: a;
  }

  & [data-press="b"] {
    grid-area: b;
  }

  & [data-press="x"] {
    grid-area: x;
    transform: translateX(50%);
  }

  & [data-press="y"] {
    grid-area: y;
    transform: translateX(-50%);
  }

  & [data-press="up"] {
    grid-area: up;
    transform: translateY(5px);
  }

  & [data-press="left"] {
    grid-area: left;
    transform: translateX(5px);
  }

  & [data-press="down"] {
    grid-area: down;
  }

  & [data-press="right"] {
    grid-area: right;
    transform: translateX(-5px);
  }

  & .super-items {
    display: grid;
    place-items: center;
  }

  & .super-items button {
    font-weight: bold;
    font-style: italic;
  }

  & .menu-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
  }
`)

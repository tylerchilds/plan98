import elf from '@silly/elf'
import diffHTML from 'diffhtml'

import { overrideButton, checkButton, checkAxis } from './debug-gamepads.js'

import geckos from '@geckos.io/client'

let slotIndex
let rom

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

const $ = elf('couch-coop', {
  booting: true,
  slot: null,
  slots: [0,1,2,3],
  0: null,
  1: null,
  2: null,
  3: null
})


const config = plan98.env.PLAN98_REALTIME ?
  {
    url: plan98.env.PLAN98_REALTIME,
    cors: { origin: '*' }
  } :
  {
    port: 9208
  }

const channel = geckos(config) // default port is 9208

function joinParty(id, slot) {
  channel.emit('joinParty', {
    partyId: id,
    slot
  });
}

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  if(target.getAttribute('slot')) {
    const slot = target.getAttribute('slot')
    slotIndex = parseInt(slot)

    // controller
    $.teach({
      slot
    })

    channel.onConnect(error => {
      if (error) {
        console.error(error.message)
        return
      }

      joinParty(target.id, slotIndex)

      channel.on('error', (error) => {
        console.error("Geckos Error:", error);
      })
    })

    controllerLoop.call(target)
  } else {
    // host

    channel.onConnect(error => {
      if (error) {
        console.error(error.message)
        return
      }

      joinParty(target.id, 'host')

      channel.on('gamepadUpdate', ({ gamepad, slot, id }) => {
        $.teach({ [slot]: { id, gamepad } })
      })

      channel.on('error', (error) => {
        console.error("Geckos Error:", error);
      })
    })

    gameLoop.call(target)
  }

  /*
  const record = gun.get($.link).get(target.id)

  record.once((data) => {
    if (!data) {
      record.put(emptyConsole);
    }
  });

  record.open((data) => {
    $.teach({[target.id]: data})
  });

  */
  $.teach({ booting: false })
}

function get(id) {
  return $.learn()[id] || emptyConsole
}

function defaultMerge(node, data, key) {
  node.get(key).put(data[key])
}

function set(id, data, merge = defaultMerge) {
  const record = gun.get($.link).get(id)
  Object
    .keys(data)
    .forEach(key => {
      merge(record, data, key)
    })
}

$.draw((target) => {
  mount(target)
  const { slot, booting } = $.learn()
  rom = target.getAttribute('rom') || 'multiplayer-template'

  if(booting) {
    return `
      <boot>
        <flying-disk></flying-disk>
      </boot>
    `
  }

  if(slot) {
    if(target.querySelector('.controller')) return
    return renderController(slot)
  }

  if(target.querySelector('.viewport')) return
  return `
    <div class="viewport">
      <div class="game">
        <${rom}></${rom}>
      </div>
      <div class="lower-hud">
        <div class="hud-area" data-slot="0"></div>
        <div class="hud-area" data-slot="1"></div>
        <div class="hud-area" data-slot="2"></div>
        <div class="hud-area" data-slot="3"></div>
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      if(target.querySelector('.lower-hud')) {
        const { slots } = $.learn()
        return slots.map(renderHud.bind(target)).join('')
      }
    }

    {

    }
  }
})

function renderController(slot) {
  return `
    <div class="controller" data-slot="${slot}">
      <div class="gamepad-top">
        <button key="a" class="clear" data-slot="${slot}" data-press="select">
          <sl-icon name="gear-wide-connected"></sl-icon>
        </button>
        <button key="b" class="clear" data-press="os">
          <sl-icon name="grid-3x3-gap"></sl-icon>
        </button>
        <button key="x" class="clear" data-press="start">
          <sl-icon name="universal-access-circle"></sl-icon>
        </button>
      </div>
      <div class="gamepad-left">
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
      </div>
      <div class="gamepad-right">
        <button key="a" class="green" data-press="a">A</button>
        <button key="b" class="red" data-press="b">B</button>
        <button key="x" class="blue" data-press="x">X</button>
        <button key="y" class="yellow" data-press="y">Y</button>
        <button key="lb" class="orange" data-press="lb">
          L
        </button>
        <button key="rb" class="purple" data-press="rb">
          R
        </button>
        <button key="lb" class="gray" data-press="lt">
          l
        </button>
        <button key="rb" class="gray" data-press="rt">
          r
        </button>
      </fieldset>
    </div>

  `
}

function renderHud(slot) {
  const player = $.learn()[slot]

  if(this[slot] !== player) {
    this[slot] = player
    const hudArea = this.querySelector(`.hud-area[data-slot="${slot}"]`)
    if(!player) {
      const url = `${plan98.env.PLAN98_PEER?`http://${plan98.env.PLAN98_PEER}`:window.location.origin}/app/couch-coop?id=${this.id}&slot=${slot}&controller=true`
      hudArea.innerHTML = `
        <button class="show-qr" data-slot="${slot}" data-url="${url}">
          <qr-code data-bg="transparent" no-link="true" src="${url}" ></qr-code>
        </button>
      `
    } else {
      hudArea.innerHTML = ''
    }
  }
}

$.when('contextmenu', (event) => {
  event.preventDefault()
  return false
})

$.when('dblclick', (event) => {
  event.preventDefault()
  return false
})

$.when('touchcancel', (event) => {
  event.preventDefault()
  return false
})

$.when('touchend', (event) => {
  event.preventDefault()
  return false
})

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
  Alt: keyFlipper(0, buttons.start),
  Control: keyFlipper(0, buttons.select),
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

document.addEventListener('keydown', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](1)
  }
})

document.addEventListener('keyup', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](0)
  }
})

function gamepadButton(index, code) {
  return checkButton(index, buttons[code]) || 0
}

function controllerLoop(time) {
  const gamepad = {
    a: gamepadButton(0, 'a'),
    b: gamepadButton(0, 'b'),
    x: gamepadButton(0, 'x'),
    y: gamepadButton(0, 'y'),
    lb: gamepadButton(0, 'lb'),
    rb: gamepadButton(0, 'rb'),
    lt: gamepadButton(0, 'lt'),
    rt: gamepadButton(0, 'rt'),
    select: gamepadButton(0, 'select'),
    start: gamepadButton(0, 'start'),
    ls: gamepadButton(0, 'ls'),
    rs: gamepadButton(0, 'rs'),
    up: gamepadButton(0, 'up'),
    down: gamepadButton(0, 'down'),
    left: gamepadButton(0, 'left'),
    right: gamepadButton(0, 'right'),
    os: gamepadButton(0, 'os'),
  }

  Object.keys(gamepad).forEach(key => {
    const button = this.querySelector(`[data-press="${key}"]`)
    if(button) {
      gamepad[key] === 1
        ? button.classList.add('active')
        : button.classList.remove('active')
    }
  })

  channel.emit('gamepadSnapshot', {
    gamepad,
    slot: slotIndex
  });

  requestAnimationFrame(controllerLoop.bind(this))
}

function gameLoop(time) {
  const game = this.querySelector(rom)

  if(game) {
    const { slots } = $.learn()

    const frame = slots.map((index) => {
      return $.learn()[index]
    })

    notification(game, 'inputFrame', frame)
  }
  requestAnimationFrame(gameLoop.bind(this))
}



$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    -webkit-touch-callout: none;
    touch-action: none;
  }

  & * {
    -webkit-tap-highlight-color: transparent;
  }

  & .viewport {
    height: 100%;
  }

  & .game {
    height: 100%;
  }

  & .lower-hud {
    height: 15%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
  }

  & .hud-area {
    text-align: center;
    overflow: hidden;
    height: 100%;
  }

  & .show-qr {
    overflow: hidden;
    height: 100%;
    padding: 4px;
    border: 0;
    background: white;
  }

  & .show-qr[data-slot="0"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--green, mediumseagreen);
  }

  & .show-qr[data-slot="1"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--red, firebrick);
  }

  & .show-qr[data-slot="2"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--blue, dodgerblue);
  }

  & .show-qr[data-slot="3"] {
    background: linear-gradient(335deg, rgba(255,255,255,.85), rgba(255,255,255,.65)), var(--yellow, gold);
  }

  & boot {
    height: 100%;
    overflow: hidden;
  }

  & flying-disk {
    height: 100%;
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  & .track {
    margin: auto;
  }

  & .zero-state {
    height: 100%;
    background: lemonchiffon;
    display: flex;
    flex-direction: column;
    place-content: center;
    gap: 2rem;
    padding: 40px;
    text-align: center;
  }

  & qr-code {
    margin: 0 auto;
    max-width: 100%;
  }

  & .controller {
    pointer-events: none;
    text-align: center;
    background: black;
    height: 100%;
    display: grid;
    grid-template-rows: auto 10px 1fr;
    grid-template-areas: "toppad" "leftpad" "rightpad";
  }

  & .controller[data-slot="0"] {
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,1)), var(--green, mediumseagreen);
  }

  & .controller[data-slot="1"] {
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,1)), var(--red, firebrick);
  }

  & .controller[data-slot="2"] {
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,1)), var(--blue, dodgerblue);
  }

  & .controller[data-slot="3"] {
    background: linear-gradient(335deg, rgba(0,0,0,.85), rgba(0,0,0,1)), var(--yellow, gold);
  }

  @media (min-width: 480px) {
    & .controller {
      grid-template-rows: auto 1fr;
      grid-template-columns: auto 1fr;
      grid-template-areas: "toppad toppad" "leftpad rightpad";
    }
  }

  & .gamepad-top {
    display: flex;
    justify-content: center;
    border: none;
    padding: 0;
    grid-area: toppad;
  }

  & .gamepad-left {
    gap: 8px;
    display: inline-grid;
    grid-template-columns: 60px 60px 60px;
    grid-template-rows: 60px 60px 60px;
    grid-template-areas:
      "....  up  ....."
      "left .... right"
      ".... down .....";
    place-self: start;
    grid-area: leftpad;
  }

  & .gamepad-right {
    gap: 8px;
    display: inline-grid;
    grid-template-columns: 45px 45px 45px 45px 45px;
    grid-template-rows: 45px 45px 45px 45px 45px;
    grid-template-areas:
      ".. .. rb .. rt"
      ".. .. .. y  .."
      "lb .. b  .. .."
      ".. x  .. a  a "
      "lt .. .. a  a ";
    place-self: end;
    grid-area: rightpad;
    padding-right: 1rem;
    padding-bottom: 1rem;
  }


  & .gamepad-grid:focus {
    background: white;
  }

  & .controller button {
    pointer-events: all;
    width: 45px;
    height: 45px;
    padding: 0;
    display: grid;
    place-content: center;
    font-size: 24px;
    border: none;
    border-radius: 0;
    font-weight: bold;
    border-radius: 100%;
    opacity: .65;
  }

  & .controller button.active,
  & .controller button:hover,
  & .controller button:focus {
    opacity: 1;
  }

  & .controller button[data-press="a"] {
    grid-area: a;
    width: 90px;
    height: 90px;
  }

  & .controller button[data-press="b"] {
    grid-area: b;
    width: 60px;
    height: 60px;
  }

  & .controller button[data-press="x"] {
    grid-area: x;
    transform: translate(50%, 50%);
    width: 60px;
    height: 60px;
  }

  & .controller button[data-press="y"] {
    grid-area: y;
    transform: translate(50%, 50%);
    width: 60px;
    height: 60px;
  }

  & .controller button[data-press="up"] {
    grid-area: up;
    width: 60px;
    height: 60px;
    transform: translate(0, 25%);
  }

  & .controller button[data-press="left"] {
    grid-area: left;
    width: 60px;
    height: 60px;
    transform: translate(25%, 0);
  }

  & .controller button[data-press="down"] {
    grid-area: down;
    width: 60px;
    height: 60px;
    transform: translate(0, -25%);
  }

  & .controller button[data-press="right"] {
    grid-area: right;
    width: 60px;
    height: 60px;
    transform: translate(-25%, 0);
  }

  & [data-press="lb"] {
    grid-area: lb;
    transform: translate(75%, 50%);
  }

  & [data-press="rb"] {
    grid-area: rb;
    transform: translate(50%, 75%);
  }

  & [data-press="lt"] {
    grid-area: lt;
    transform: translateX(25%);
  }

  & [data-press="rt"] {
    grid-area: rt;
    transform: translateY(25%);
  }

  & .yellow {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--yellow);
    color: rgba(255,255,255,.85);
  }

  & .yellow.active,
  & .yellow:hover,
  & .yellow:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--yellow);
    color: rgba(255,255,255,1);
  }

  & .blue {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--blue);
    color: rgba(255,255,255,.85);
  }

  & .blue.active,
  & .blue:hover,
  & .blue:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--blue);
    color: rgba(255,255,255,1);
  }

  & .red {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--red);
    color: rgba(255,255,255,.85);
  }

  & .red.active,
  & .red:hover,
  & .red:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--red);
    color: rgba(255,255,255,1);
  }

  & .green {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--green);
    color: rgba(255,255,255,.85);
  }

  & .green.active,
  & .green:hover,
  & .green:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--green);
    color: rgba(255,255,255,1);
  }

  & .orange {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--orange);
    color: rgba(0,0,0,.85);
  }

  & .orange.active,
  & .orange:hover,
  & .orange:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--orange);
    color: rgba(0,0,0,1);
  }

  & .purple {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--purple);
    color: rgba(0,0,0,.85);
  }

  & .purple.active,
  & .purple:hover,
  & .purple:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--purple);
    color: rgba(0,0,0,1);
  }

  & .clear {
    background: transparent;
    color: white;
    border-radius: none;
    border-radius: 0;
    border: none;
    padding: .5rem;
    opacity: .65;
  }

  & .clear.active,
  & .clear:hover,
  & .clear:focus {
    background: rgba(255,255,255,.25);
    opacity: 1;
  }

  & .gray {
    background: linear-gradient(rgba(255,255,255,.25), rgba(0,0,0,.5)), var(--gray);
    color: rgba(255,255,255,.85);
  }

  & .gray.active,
  & .gray:hover,
  & .gray:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(0,0,0,.5)), var(--gray);
    color: rgba(255,255,255,1);
  }

`)

// Prevent double-tap from triggering share menu on all elements
document.addEventListener('dblclick', function(event) {
  event.preventDefault();
  return false;
}, { passive: false });

// Additional prevention for specific touch events
document.addEventListener('touchstart', function(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function(event) {
  event.preventDefault();
}, { passive: false });

import { checkButton, checkAxis } from './debug-gamepads.js'
import elf from '@silly/elf'

const $ = elf('paper-pocket', {
  fullScreen: true,
  rom: 'elf-tag'
})

$.draw((target) => {
  const { rom, fullScreen } = $.learn()
  return `
    <div class="chrome ${fullScreen?'full':''}">
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
      const { rom } = $.learn()
      recoverElves(target, rom)
      recoverElves(target, 'sl-icon')
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

const intervals = {}

$.when('pointerdown', '[data-press]', (event) => {
  const { press } = event.target.dataset
  const action = actions[press]

  if(action) {
    action(event.target.closest($.link), {
      type: 'click',
      value: 1
    })

    intervals[press] = setInterval(() => {
      action(event.target.closest($.link), {
        type: 'click',
        value: 1
      })
    }, 1000/60)
  }
})

$.when('pointerup', '[data-press]', (event) => {
  const { press } = event.target.dataset
  clearInterval(intervals[press])
})


self.addEventListener('keydown', (event) => {
  const node = document.querySelector($.link)

  if(!node) return

  if (event.keyCode==37) {
    actions.left(node, {
      type: 'click',
      value: 1
    })
  }
  if (event.keyCode==38) {
    actions.up(node,{
      type: 'click',
      value: 1
    })
  }
  if (event.keyCode==39) {
    actions.right(node, {
      type: 'click',
      value: 1
    })
  }
  if (event.keyCode==40) {
    actions.down(node, {
      type: 'click',
      value: 1
    })
  }
})

let lastFrame = {
  a: false,
  b: false,
  x: false,
  y: false,
  lb: false,
  rb: false,
  lt: false,
  rt: false,
  select: false,
  start: false,
  ls: false,
  rs: false,
  down: false,
  up: false,
  left: false,
  right: false,
  os: false
}

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

function gameLoop(time) {
  const node = document.querySelector($.link)

  if(node) {

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

    if(player.os) {
      if(!lastFrame.os) {
        toggleMode()
      }
    }

    lastFrame = player
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()

$.when('click', '[data-press="os"]', toggleMode)
function toggleMode (event) {
  const { fullScreen } = $.learn()
  $.teach({ fullScreen: !fullScreen })
}

$.style(`
  & {
    display: block;
    height: 100%;
    background: gold;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .chrome {
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
    color: rgba(255,255,255,.75);
    background: transparent;
    border-radius: none;
    border-radius: 0;
    border: none;
    padding: 8px 0;
  }

  & .clear:hover,
  & .clear:focus {
    color: rgba(255,255,255,.95);
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

  & .chrome.full .widget-frame {
    padding: 0;
  }

  & .chrome.full .viewport {
    padding: 0;
  }

  & .chrome.full .controller {
    display: none;
  }

  & .chrome.full .menu-items {
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
  }

  & .super-items button {
    font-weight: bold;
    font-style: italic;
  }

  & .menu-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`)

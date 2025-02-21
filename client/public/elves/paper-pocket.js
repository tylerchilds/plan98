import elf from '@silly/elf'

const $ = elf('paper-pocket', {
  rom: 'elf-tag'
})

$.draw((target) => {
  const { rom, light } = $.learn()
  return `
    <div class="watch ${light?'light':''}">
      <div class="widget-frame">
        <div class="viewport">
          <div class="super-items">
            <button key="os" class="clear" data-press="OS">
              PaperPocket
            </button>
          </div>
          <${rom}></${rom}>
          <div class="menu-items">
            <button key="options" class="clear" data-press="options">
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
          <button key="a" class="green" data-press="A">A</button>
          <button key="b" class="red" data-press="B">B</button>
          <button key="x" class="blue" data-press="X">X</button>
          <button key="y" class="yellow" data-press="Y">Y</button>
          <button key="up" class="gray" data-press="UP">
            <sl-icon name="caret-up-fill"></sl-icon>
          </button>
          <button key="down" class="gray" data-press="DOWN">
            <sl-icon name="caret-down-fill"></sl-icon>
          </button>
          <button key="left" class="gray" data-press="LEFT">
            <sl-icon name="caret-left-fill"></sl-icon>
          </button>
          <button key="right" class="gray" data-press="RIGHT">
            <sl-icon name="caret-right-fill"></sl-icon>
          </button>
        </fieldset>
      </div>
    </div>
  `
}, {
  beforeUpdate: (target) => {},
  afterUpdate: (target) => {},
})

const actions = {
  A: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    console.log(rom, type)
    notification(node, 'a', type)
  },
  B: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'b', type)
  },
  X: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'x', type)
  },
  Y: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'y', type)
  },
  UP: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'up', type)
  },
  DOWN: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'down', type)
  },
  LEFT: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'left', type)
  },
  RIGHT: (target, type) => {
    const { rom } = $.learn()
    const node = target.querySelector(rom)
    notification(node, 'right', type)
  },
}

function notification(node, method, type) {
  if(node) {
    node.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: method,
        params: {
          type
        }
      }
    }))
  }
}

$.when('pointerdown', '[data-press]', (event) => {
  const { press } = event.target.dataset
  const action = actions[press]

  if(action) {
    action(event.target.closest($.link), 'click')
  }
})

self.addEventListener('keydown', (event) => {
  const node = document.querySelector($.link)

  if(!node) return

  if (event.keyCode==37) {
    actions.LEFT(node, 'click')
  }
  if (event.keyCode==38) {
    actions.UP(node, 'click')
  }
  if (event.keyCode==39) {
    actions.RIGHT(node, 'click')
  }
  if (event.keyCode==40) {
    actions.DOWN(node, 'click')
  }
})

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

  & .watch {
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
  }

  & .widget-frame {
    overflow: hidden;
    padding: 16px;
  }

  & .viewport {
    background: black;
    padding: 0 16px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    max-height: 100%;
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

  & [data-press="A"] {
    grid-area: a;
  }

  & [data-press="B"] {
    grid-area: b;
  }

  & [data-press="X"] {
    grid-area: x;
    transform: translateX(50%);
  }

  & [data-press="Y"] {
    grid-area: y;
    transform: translateX(-50%);
  }

  & [data-press="UP"] {
    grid-area: up;
    transform: translateY(5px);
  }

  & [data-press="LEFT"] {
    grid-area: left;
    transform: translateX(5px);
  }

  & [data-press="DOWN"] {
    grid-area: down;
  }

  & [data-press="RIGHT"] {
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

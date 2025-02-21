import elf from '@silly/elf'

const $ = elf('paper-pocket', {
  rom: 'elf-tag'
})

$.draw((target) => {
  const { rom, light } = $.learn()
  return `
    <div class="watch ${light?'light':''}">
      <div class="action-row">
        <button key="y" class="yellow" data-press="Y">Y</button>
        <button key="x" class="blue" data-press="X">X</button>
      </div>

      <div class="widget-frame">
        <div class="viewport">
          <${rom}></${rom}>
        </div>
      </div>

      <div class="action-row">
        <button key="b" class="red" data-press="B">B</button>
        <button key="a" class="green" data-press="A">A</button>
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
  }
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

$.when('click', '[data-press]', (event) => {
  const { press } = event.target.dataset
  const action = actions[press]

  if(action) {
    action(event.target.closest($.link), 'click')
  }
})

$.style(`
  & {
    display: block;
    height: 100%;
    background: black;
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
    grid-template-rows: auto 1fr auto;
  }

  & .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0;
  }

  & .action-row button {
    border: none;
    border-radius: 0;
    font-weight: bold;
    padding: .5rem 1rem;
  }

  & .widget-frame {
    overflow: auto;
  }

  & .viewport {
    background: white;
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
`)

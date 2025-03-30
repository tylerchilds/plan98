import elf from '@silly/elf'
import diffHTML from 'diffhtml'

import geckos from '@geckos.io/client'

const $ = elf('couch-coop', {
  booting: true,
  slot: null,
  slots: ['slot1', 'slot2', 'slot3', 'slot4'],
  slot1: null,
  slot2: null,
  slot3: null,
  slot4: null
})

const channel = geckos({ port: 5674 }) // default port is 9208

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  $.teach({ connected: true })

  channel.on('chatMessage', message => {
    $.teach(message, mergeMessage)
  });

  channel.on('setNickSuccess', data => {
    const { nickname, password } = data

    localStorage.setItem('multiplayer/nickname', nickname)
    localStorage.setItem('multiplayer/password', password)

    $.teach(data)
  });

  channel.on('setNickError', error => {
    console.error(error)
  });

  channel.on('userList', participants => {
    $.teach({
      participants
    })
  });
  channel.on('error', (error) => {
    console.error("Geckos Error:", error);
  })
})

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  if(target.getAttribute('slot')) {
    $.teach({
      slot: target.getAttribute('slot')
    })
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
  const rom = target.getAttribute('rom') || 'debug-gamepads'

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
      <div class="lower-hud"></div>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      const hudArea = target.querySelector('.lower-hud')

      if(hudArea) {
        diffHTML.innerHTML(hudArea, hud(target))
      }
    }
  }
})

function hud(target) {
  const { slots } = $.learn()
  return slots.map(renderHud.bind(target.id)).join('')
}

function renderController(slot) {
  return `
    <div class="controller">
      <div class="gamepad-top">
        <button key="a" class="clear" data-press="select">
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

  if(!player) {
    const url = `${plan98.env.PLAN98_PEER?`http://${plan98.env.PLAN98_PEER}`:window.location.origin}/app/couch-coop?id=${this}&slot=${slot}&controller=true`
    return `
      <div class="ready-area">
        <button class="show-qr" data-url="${url}">
          <qr-code no-link="true" src="${url}" ></qr-code>
        </button>
      </div>
    `
  }

  const { mode } = player

  if(mode === modes.settings) {
    return `
      Settings
    `
  }

  if(mode === modes.play) {
    return `
      show button inputs
    `
  }
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
    touch-action: none;

  }

  & .viewport {
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
  }

  & .ready-area {
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

  & .yellow:hover,
  & .yellow:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--yellow);
    color: rgba(255,255,255,1);
  }

  & .blue {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--blue);
    color: rgba(255,255,255,.85);
  }

  & .blue:hover,
  & .blue:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--blue);
    color: rgba(255,255,255,1);
  }

  & .red {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--red);
    color: rgba(255,255,255,.85);
  }

  & .red:hover,
  & .red:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--red);
    color: rgba(255,255,255,1);
  }

  & .green {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--green);
    color: rgba(255,255,255,.85);
  }

  & .green:hover,
  & .green:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--green);
    color: rgba(255,255,255,1);
  }

  & .orange {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--orange);
    color: rgba(0,0,0,.85);
  }

  & .orange:hover,
  & .orange:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--orange);
    color: rgba(0,0,0,1);
  }

  & .purple {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--purple);
    color: rgba(0,0,0,.85);
  }

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

  & .clear:hover,
  & .clear:focus {
    background: rgba(255,255,255,.25);
    opacity: 1;
  }

  & .gray {
    background: linear-gradient(rgba(255,255,255,.25), rgba(0,0,0,.5)), var(--gray);
    color: rgba(255,255,255,.85);
  }

  & .gray:hover,
  & .gray:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(0,0,0,.5)), var(--gray);
    color: rgba(255,255,255,1);
  }

`)

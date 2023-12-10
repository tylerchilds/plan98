import module from '@sillonious/module'

const fantasyController = {
  osc: {
    '/button/0/pressed': false,
    '/button/1/pressed': false,
    '/button/2/pressed': false,
    '/button/3/pressed': false,
  },
  gamepad: {
    id: 'fantasy-stock',
    buttons: [0,0,0,0],
    axes: []
  }
}

export function hostPressesStartStop(party) { 
  const host = party()[0]
  return host.osc['/button/0/pushed']
}

export function hostPressesReset(party) { 
  const host = party()[0]
  return host.osc['/button/1/pushed']
}

export function hostPressesLight(party) { 
  const host = party()[0]
  return host.osc['/button/2/pushed']
}

export function hostPressesMode(party) { 
  const host = party()[0]
  return host.osc['/button/3/pushed']
}


export function anybodyPressesStartStop(party) { 
  return party().some(ip => ip.osc['/button/0/pushed'])
}

export function anybodyPressesReset(party) { 
  return party().some(ip => ip.osc['/button/1/pushed'])
}

export function anybodyPressesLight(party) { 
  return party().some(ip => ip.osc['/button/2/pushed'])
}

export function anybodyPressesMode(party) { 
  return party().some(ip => ip.osc['/button/3/pushed'])
}

const $ = module('sillonious-party', { fantasyController })

const UPPER_THRESHOLD = 1
const LOWER_THRESHOLD = -1
const EMPTY_REMAP = { buttonOrder: [], axesOrder: [] }

const controllers = {}
const remaps = {
  0: {
    buttonOrder: [],
    axesOrder: []
  }
}

export default function party() {
  scangamepads()
  const ids = Object.keys(controllers) || []

	let group = ids
    .map(x => controllers[x])
    .map(gatherInputs)
    .map(exposeUserRemaps)
    .map(addOSC)

  if(group.length === 0) {
    group = [$.learn().fantasyController]
  }

  return group
}

(function tick(timestamp) {
  $.teach({ timestamp })
  requestAnimationFrame(tick)
})(performance.timeOrigin)

$.draw((target) => {
  const { timestamp } = $.learn()

  const list = party()
    .map((service, index) => {
      const keys = Object.keys(service.osc)
      const buttonKeys = keys.filter(x => x.startsWith('/button/'))
      const axesKeys = keys.filter(x => x.startsWith('/axis/'))
      return `
        <li class="gamepad" id="${service.gamepad.id}">
          <label>${index+1}: ${service.gamepad.id}</label>
          <div class="buttons">
            ${buttonKeys.map((key, i) => renderButton(service.osc, key, i)).join('')}
          </div>
          <div class="axes">
            ${axesKeys.map((key, i) => renderAxis(service.osc, key, i)).join('')}
          </div>
        </li>
      `
    }).join('')

  return `
    <ul class="gamepads" data-timestamp="${timestamp}">
      ${list}
    </ul>
  `
})

function connecthandler(e) {
  const { index } = e.gamepad
  controllers[index] = e.gamepad;
  remaps[index] = { ...EMPTY_REMAP }
}

function disconnecthandler(e) {
  const { index } = e.gamepad
  delete controllers[index];
  delete remaps[index];
}

function renderButton(osc, key, index) {
  const pushed = osc[key]
  const offset = (pushed ? -1 : -2) + 'rem'
  return `
    <button
      data-type="button"
      data-key="${key}"
      class="input"
      style="--value: ${offset};"
    >${index}</button>
  `
}

function renderAxis(osc, key, index) {
  const pushed = osc[key]
  const offset = (pushed ? -1 : -2) + 'rem'
  return `
    <button
      data-type="axis"
      data-key="${key}"
      class="input"
      style="--value: ${offset};"
    >${index}</button>
  `
}


function renderInputs(_$, flags) {
  const { gamepad } = flags

  return `
      `
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

function gatherInputs(gamepad, slot) {
  const buttons = [...gamepad.buttons].map((button, i) => {
    let value = button

    if (typeof(value) == "object") {
      value = value.value;
    }

    remappableButton(slot, i, value)

    return value
  })

  const axes = [...gamepad.axes].map((axis, i) => {
    const value = axis

    remappableAxes(slot, i, value)
    return value
  })

  return { buttons, axes, id: gamepad.id, index: gamepad.index }
}

function remappableButton(slot, button, value) {
  const { buttonOrder } = remaps[slot]
  if(buttonOrder.includes(button)) return
  if(value !== UPPER_THRESHOLD) return
  remaps[slot].buttonOrder = [...buttonOrder, button]
}

function remappableAxes(slot, axis, value) {
  const { axesOrder } = remaps[slot]
  if(axesOrder.includes(axis)) return
  if(value !== LOWER_THRESHOLD && value !== UPPER_THRESHOLD) return
  remaps[slot].axesOrder = [...axesOrder, axis]
}

function exposeUserRemaps(gamepad, slot) {
  const { buttonOrder, axesOrder } = remaps[slot]
  const buttons = buttonOrder.map(i => {
    return gamepad.buttons[i]
  })
  const axes = axesOrder.map(i => {
    return gamepad.axes[i]
  })

  return {
    buttons,
    axes,
    id: gamepad.id,
    index: gamepad.index
  }
}

function addOSC(remappedGamepad, slot) {
  return {
    osc: {
      ...remappedGamepad.buttons.reduce((accumulator, current, i) => {
        const pushed = current === 1
        accumulator[`/button/${i}/pushed`] = pushed
        return accumulator
      }, {}),
      ...remappedGamepad.axes.reduce((accumulator, current, i) => {
        const pushed = current === 1
        const pulled = current === -1
        accumulator[`/axis/${i}/pushed`] = pushed
        accumulator[`/axis/${i}/pulled`] = pulled
        return accumulator
      }, {})
    },
    gamepad: remappedGamepad
  }
}

globalThis.addEventListener("gamepadconnected", connecthandler);
globalThis.addEventListener("gamepaddisconnected", disconnecthandler);

$.style(`
  & .gamepads {
    background: rgba(0,0,0,.04);
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 1rem;
    list-style-type: none;
    padding: 0 1rem;
  }
  & .gamepad {
    border-bottom: 1px solid rgba(0,0,0,.1);
    padding: 1rem 0;
  }
  & .gamepad:last-child {
    border-bottom: none;

  }
  & .buttons,
  & .axes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    list-style-type: none;
    padding: .5rem 0 0;
  }
  & .input {
    background: linear-gradient(lime 0%, orange 50%, rebeccapurple 100%);
    background-size: 1px 6rem;
    background-repeat: repeat-x;
    background-position-y: var(--value);
    border-radius: 2rem;
    width: 2rem;
    height: 2rem;
    display: grid;
    place-content: center;
  }
`)

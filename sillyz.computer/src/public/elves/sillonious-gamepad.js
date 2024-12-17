import module from '@silly/tag'
const $ = module('sillonious-gamepad')

const UPPER_THRESHOLD = 1
const LOWER_THRESHOLD = -1
const EMPTY_REMAP = { buttonOrder: [], axesOrder: [] }

const controllers = {}
const remaps = {}

export default function gamepads() {
  scangamepads()
  const ids = Object.keys(controllers) || []

	return ids
    .map(x => controllers[x])
    .map(gatherInputs)
    .map(exposeUserRemaps)
}

(function tick(timestamp) {
  $.teach({ timestamp })
  requestAnimationFrame(tick)
})(performance.timeOrigin)

$.draw((target) => renderGamepads(target, $))

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

function renderValue(value, index) {
  const offset = parseFloat(value) - 2 + 'rem'
  return `
    <li
      class="input"
      style="--value: ${offset};"
    >${index}</li>
  `
}

function renderInputs(_$, flags) {
  const { gamepad } = flags

  return `
    <ul class="buttons">
      ${gamepad.buttons.map(renderValue).join('')}
    </ul>
    <ul class="axes">
      ${gamepad.axes.map(renderValue).join('')}
    </ul>
  `
}

function renderGamepads(_target, $) {
  const { timestamp } = $.learn()

  const list = gamepads()
    .map((gamepad, index) => `
      <li class="gamepad" id="${gamepad.id}">
        <label>${index+1}: ${gamepad.id}</label>
        ${renderInputs($, { gamepad })}
      </li>
    `).join('')

  return `
    <ul class="gamepads" data-timestamp="${timestamp}">
      ${list}
    </ul>
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

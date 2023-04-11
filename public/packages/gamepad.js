import module from '../module.js'
const controllers = {};

export default function gamepads() {
  const ids = Object.keys(controllers) || []

	return ids
    .map(x => controllers[x])
    .map(gatherInputs)
}

const initialState = {}

const $ = module('gamepad-debug', initialState)

$.draw((target) => renderGamepads(target, $))

function connecthandler(e) {
  const { index } = e.gamepad
  controllers[index] = e.gamepad;
}

function disconnecthandler(e) {
  const { index } = e.gamepad
  delete controllers[index];
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

  const list = gamepads()
    .map((gamepad, index) => `
      <li class="gamepad" id="${gamepad.id}">
        <label>${index+1}: ${gamepad.id}</label>
        ${renderInputs($, { gamepad })}
      </li>
    `).join('')

  return `<ul class="gamepads">${list}</ul>`
}

function gatherInputs(gamepad, _index) {
  const buttons = [...gamepad.buttons].map((button, _i) => {
    let value = button

    if (typeof(value) == "object") {
      value = value.value;
    }

    return value
  })

  const axes = [...gamepad.axes].map((axis, _i) => {
    const value = axis

    return value
  })

  return { buttons, axes, id: gamepad.id, index: gamepad.index }
}

globalThis.addEventListener("gamepadconnected", connecthandler);
globalThis.addEventListener("gamepaddisconnected", disconnecthandler);

$.flair(`
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

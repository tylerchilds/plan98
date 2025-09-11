import elf from '@silly/elf'
const controllers = {};

export const BUTTON_CODES = {
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



const initialState = {
  gamepads: [{buttons:[], axes: []}]
}

const $ = elf('debug-gamepads', initialState)

$.draw((target) => renderGamepads(target, $))

function connecthandler(e) {
  const { index } = e.gamepad
  controllers[index] = e.gamepad;
  requestAnimationFrame(gamepadLoop);
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
  const { gamepads } = $.learn()

  const list = gamepads
    .map((gamepad, index) => `
      <li class="gamepad" id="${gamepad.id}">
        <label>${index+1}: ${gamepad.id}</label>
        ${renderInputs($, { gamepad })}
      </li>
    `).join('')

  return `<ul class="gamepads">${list}</ul>`
}

function gamepadLoop(time) {
  scanGamepads()
  const ids = Object.keys(controllers) || []

	const gamepads = ids
    .map(x => controllers[x])
    .map(gatherInputs)

  $.teach({ time, gamepads })

  requestAnimationFrame(gamepadLoop);
}

function scanGamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
        controllers[gamepads[i].index] = gamepads[i];
    }
  }
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

const overrides = {}

export function overrideButton(slot, button, value) {
  overrides[`button:${slot}:${button}`] = value
}

self.addEventListener('beforeunload', () => {
  const keys = Object.keys(overrides)
  keys.forEach((key) => {
    delete overrides[key]
  })
})

export function checkButton(slot, button) {
  const { gamepads } = $.learn()
  if(!gamepads[slot]) return
  return overrides[`button:${slot}:${button}`] || gamepads[slot].buttons[button]
}

export function overrideAxis(slot, axis, value) {
  overrides[`axis:${slot}:${button}`] = value
}

export function checkAxis(slot, axis) {
  const { gamepads } = $.learn()
  if(!gamepads[slot]) return
  return overrides[`axis:${slot}:${axis}`] ||  gamepads[slot].axes[axis]
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

export default $

const keyFlips = {
  Meta: keyFlipper(0, BUTTON_CODES.os),
  Alt: keyFlipper(0, BUTTON_CODES.start),
  Control: keyFlipper(0, BUTTON_CODES.select),
  ArrowUp: keyFlipper(0, BUTTON_CODES.up),
  w: keyFlipper(0, BUTTON_CODES.up),
  W: keyFlipper(0, BUTTON_CODES.up),
  ArrowDown: keyFlipper(0, BUTTON_CODES.down),
  S: keyFlipper(0, BUTTON_CODES.down),
  s: keyFlipper(0, BUTTON_CODES.down),
  ArrowRight: keyFlipper(0, BUTTON_CODES.right),
  d: keyFlipper(0, BUTTON_CODES.right),
  D: keyFlipper(0, BUTTON_CODES.right),
  ArrowLeft: keyFlipper(0, BUTTON_CODES.left),
  a: keyFlipper(0, BUTTON_CODES.left),
  A: keyFlipper(0, BUTTON_CODES.left),
  j: keyFlipper(0, BUTTON_CODES.a),
  J: keyFlipper(0, BUTTON_CODES.a),
  k: keyFlipper(0, BUTTON_CODES.b),
  K: keyFlipper(0, BUTTON_CODES.b),
  l: keyFlipper(0, BUTTON_CODES.x),
  L: keyFlipper(0, BUTTON_CODES.x),
  h: keyFlipper(0, BUTTON_CODES.y),
  H: keyFlipper(0, BUTTON_CODES.y),
  u: keyFlipper(0, BUTTON_CODES.lb),
  U: keyFlipper(0, BUTTON_CODES.lb),
  i: keyFlipper(0, BUTTON_CODES.rb),
  I: keyFlipper(0, BUTTON_CODES.rb),
  y: keyFlipper(0, BUTTON_CODES.lt),
  Y: keyFlipper(0, BUTTON_CODES.lt),
  o: keyFlipper(0, BUTTON_CODES.rt),
  O: keyFlipper(0, BUTTON_CODES.rt),
  q: keyFlipper(0, BUTTON_CODES.ls),
  Q: keyFlipper(0, BUTTON_CODES.ls),
  e: keyFlipper(0, BUTTON_CODES.rs),
  E: keyFlipper(0, BUTTON_CODES.rs),
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



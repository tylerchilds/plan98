import module from '@sillonious/module'

const DEFAULT_ACTUATION = .75

function gamepadButton(index, value=0) {
  return {
    index,
    value,
    osc: `/button/${index}`,
    actuated: false,
    pushed: false,
  }
}

const fantasyController = {
  osc: {
    '/button/0': gamepadButton(0),
    '/button/1': gamepadButton(1),
    '/button/2': gamepadButton(2),
    '/button/3': gamepadButton(3),
  },
  gamepad: {
    id: 'fantasy-stock',
    buttons: [
      gamepadButton(0),
      gamepadButton(1),
      gamepadButton(2),
      gamepadButton(3),
    ],
    axes: []
  }
}

const check = (player, osc) => {
  const { value } = player.osc[osc] || {}
  if(!value) return false
  return Math.abs(value) >= DEFAULT_ACTUATION
}

export function hostPressesStartStop(party) {
  return check(party(0), '/button/0')
}

export function hostPressesReset(party) {
  return check(party(0), '/button/1')
}

export function hostPressesLight(party) {
  return check(party(0), '/button/2')
}

export function hostPressesMode(party) {
  return check(party(0), '/button/3')
}

export function anybodyPressesStartStop(party) {
  return party().some(p => check(p,'/button/0'))
}

export function anybodyPressesReset(party) {
  return party().some(p => check(p,'/button/1'))
}

export function anybodyPressesLight(party) {
  return party().some(p => check(p,'/button/2'))
}

export function anybodyPressesMode(party) {
  return party().some(p => check(p,'/button/3'))
}

const $ = module('sillonious-party', {
	fantasyController,
	remaps: {
		0: {
			buttonOrder: [],
			axesOrder: [],
			osc: {}
		}
	}
})

export function fantasyGamepadEvent(slot, osc, value) {
	$.teach({ [osc]: value }, (state, payload) => {
		return {
			...state,
			remaps: {
				...state.remaps,
				[slot]: {
					...state.remaps[slot],
					osc: {
						...state.remaps[slot].osc,
						...payload
					}
				}
			}
		}
	})
}


const UPPER_THRESHOLD = 1
const LOWER_THRESHOLD = -1
const EMPTY_REMAP = { buttonOrder: [], axesOrder: [], osc: {} }

const controllers = {}

export default function party(slot) {
  scangamepads()
  const ids = Object.keys(controllers) || []

	let group = ids
    .map(x => controllers[x])
    .map(gatherInputs)
    .map(addOSC)

  if(group.length === 0) {
    group = [$.learn().fantasyController]
  }

  return slot ? group[slot] : group
}

(function tick(timestamp) {
  $.teach({ timestamp })
  requestAnimationFrame(tick)
})(performance.timeOrigin)

$.draw((target) => {
  const { timestamp } = $.learn()

  const list = party()
    .map((p, index) => {
      const keys = Object.keys(service.osc)
      const buttonKeys = keys.filter(x => x.startsWith('/button/'))
      const axesKeys = keys.filter(x => x.startsWith('/axis/'))
      return `
        <li class="gamepad" id="${service.gamepad.id}">
          <label>${index+1}: ${service.gamepad.id}</label>
          <div class="buttons">
            ${buttonKeys.map((osc, i) => renderButton(p, osc, i)).join('')}
          </div>
          <div class="axes">
            ${axesKeys.map((osc, i) => renderAxis(p, osc, i)).join('')}
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
	$.teach(EMPTY_REMAP, (state, payload) => {
		return {
			...state,
			remaps: {
				...state.remaps,
				[index]: payload
			}
		}
	})
}

function disconnecthandler(e) {
  const { index } = e.gamepad
  delete controllers[index];
	$.teach(null, (state) => {
		const remaps = Object
			.keys(state.remaps)
			.filter(x => x !== index)
			.reduce((all, key) => {
				all[key] = state.remaps[key]
				return all
			}, {})
		return {
			...state,
			remaps
		}
	})
}

function renderButton(player, osc, index) {
  const pushed = player[osc]
  const offset = (pushed ? -1 : -2) + 'rem'
  return `
    <button
      data-type="button"
      data-osc="${osc}"
      class="input"
      style="--value: ${offset};"
    >${index}</button>
  `
}

function renderAxis(player, osc, index) {
  const pushed = player[osc]
  const offset = (pushed ? -1 : -2) + 'rem'
  return `
    <button
      data-type="axis"
      data-osc="${osc}"
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
  const { remaps } = $.learn()
  const { buttonOrder } = remaps[slot]
  if(buttonOrder.includes(button)) return
  if(value !== UPPER_THRESHOLD) return
	$.teach(button, (state, payload) => {
		return {
			...state,
			remaps: {
				...state.remaps,
				[slot]: {
					...state.remaps[slot],
					buttonOrder: [...state.remaps[slot].buttonOrder, payload]
					}
				}
			}
	})
}

function remappableAxes(slot, axis, value) {
  const { remaps } = $.learn()
  const { axesOrder } = remaps[slot]
  if(axesOrder.includes(axis)) return
  if(value !== LOWER_THRESHOLD && value !== UPPER_THRESHOLD) return
	$.teach(axis, (state, payload) => {
		return {
			...state,
			remaps: {
				...state.remaps,
				[slot]: {
					...state.remaps[slot],
					axesOrder: [...state.remaps[slot].axesOrder, payload]
					}
				}
			}
	})

}

function addOSC(gamepad, slot) {
  const { remaps } = $.learn()
  const { buttonOrder, axesOrder } = remaps[slot]
  const buttons = buttonOrder.map(i => {
    const osc = `/button/${i}`
    let value = gamepad.buttons[i]
    const actuated = value >= DEFAULT_ACTUATION
    value = !actuated && remaps[slot].osc[osc]
      ? remaps[slot].osc[osc].value
      : value
    return {
      index: i,
      osc,
      actuated,
      pushed: value === UPPER_THRESHOLD,
      value
    }
  })
  const axes = axesOrder.map(i => {
    const osc = `/axis/${i}`
    let value = gamepad.axes[i]
    const actuated = Math.abs(value) >= DEFAULT_ACTUATION
    return {
      index: i,
      osc,
      actuated,
      pushed: value === UPPER_THRESHOLD,
      pulled: value === LOWER_THRESHOLD,
      value
    }
  })

  return {
    osc: {
      ...fantasyController.osc,
      ...buttons.reduce(toPath, {}),
      ...axes.reduce(toPath, {})
    },
    gamepad: {
      buttons: buttons.reduce((all, real, index) => {
        all[index] = real
        return all
      }, [...fantasyController.gamepad.buttons]),
      axes,
      id: gamepad.id,
      index: gamepad.index
    }
  }
}

function toPath (accumulator, current){
  accumulator[current.osc] = current.value
  return accumulator
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

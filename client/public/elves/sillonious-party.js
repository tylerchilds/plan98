import module from '@silly/tag'

const DEFAULT_ACTUATION = .75

const buttonIcons = [
  '/public/icons/elf-dash-down.svg',
  '/public/icons/elf-dash-right.svg',
  '/public/icons/elf-dash-left.svg',
  '/public/icons/elf-dash-up.svg',
]

const axesIcons = [
  {
    iconAbove: '/public/icons/dash-up.svg',
    iconBelow: '/public/icons/dash-down.svg',
  },
  {
    iconAbove: '/public/icons/dash-right.svg',
    iconBelow: '/public/icons/dash-left.svg',
  },
]

function gamepadButton(index, value=0) {
  return {
    index,
    value,
    icon: buttonIcons[index],
    osc: `/button/${index}`,
    actuated: false,
    pushed: false,
  }
}

function gamepadAxis(index, value=0) {
  const { iconAbove, iconBelow } = axesIcons[index];
  return {
    index,
    value,
    iconAbove,
    iconBelow,
    osc: `/axis/${index}`,
    actuated: false,
    pushed: false,
    pulled: false,
  }
}

const fantasyController = {
  osc: {
    '/button/0': gamepadButton(0),
    '/button/1': gamepadButton(1),
    '/button/2': gamepadButton(2),
    '/button/3': gamepadButton(3),
    '/button/4': gamepadButton(4),
    '/button/5': gamepadButton(5),
    '/button/6': gamepadButton(6),
    '/button/7': gamepadButton(7),
    '/button/8': gamepadButton(8),
    '/button/9': gamepadButton(9),
    '/button/10': gamepadButton(10),
    '/button/11': gamepadButton(11),
    '/button/12': gamepadButton(12),
    '/button/13': gamepadButton(13),
    '/axis/0': gamepadAxis(0),
    '/axis/1': gamepadAxis(1),
  },
  gamepad: {
    id: 'fantasy-stock',
    buttons: [
      gamepadButton(0),
      gamepadButton(1),
      gamepadButton(2),
      gamepadButton(3),
    ],
    axes: [
      gamepadAxis(0),
      gamepadAxis(1),
    ]
  }
}

const checkAxisPushed = (player, osc) => {
  const { pushed } = player.osc[osc] || {}
  return pushed
}

const checkAxisPulled = (player, osc) => {
  const { pulled } = player.osc[osc] || {}
  return pulled
}

const checkButton = (player, osc) => {
  const { value } = player.osc[osc] || {}
  if(!value) return false
  return Math.abs(value) >= DEFAULT_ACTUATION
}

export function hostPressesLeft(party) {
  return checkAxisPushed(party(0), '/axis/0')
}

export function hostPressesRight(party) {
  return checkAxisPulled(party(0), '/axis/0')
}

export function hostPressesUp(party) {
  return checkAxisPushed(party(0), '/axis/1')
}

export function hostPressesDown(party) {
  return checkAxisPulled(party(0), '/axis/1')
}

export function anybodyPressesLeft(party) {
  return party().some(p => checkAxisPushed(p,'/axis/0'))
}

export function anybodyPressesRight(party) {
  return party().some(p => checkAxisPulled(p,'/axis/0'))
}

export function anybodyPressesUp(party) {
  return party().some(p => checkAxisPushed(p,'/axis/1'))
}

export function anybodyPressesDown(party) {
  return party().some(p => checkAxisPulled(p,'/axis/1'))
}

export function hostPressesStartStop(party) {
  return checkButton(party(0), '/button/0')
}

export function hostPressesReset(party) {
  return checkButton(party(0), '/button/1')
}

export function hostPressesLight(party) {
  return checkButton(party(0), '/button/2')
}

export function hostPressesMode(party) {
  return checkButton(party(0), '/button/3')
}

export function anybodyPressesStartStop(party) {
  return party().some(p => checkButton(p,'/button/0'))
}

export function anybodyPressesReset(party) {
  return party().some(p => checkButton(p,'/button/1'))
}

export function anybodyPressesLight(party) {
  return party().some(p => checkButton(p,'/button/2'))
}

export function anybodyPressesMode(party) {
  return party().some(p => checkButton(p,'/button/3'))
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

$.draw((target) => {
  return `<sillonious-joypro></sillonious-joypro>`
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
    console.log(payload)
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
  const buttons = buttonOrder.map((position, i) => {
    const icon = buttonIcons[i];
    const osc = `/button/${position}`
    let value = gamepad.buttons[position]
    const actuated = value >= DEFAULT_ACTUATION
    value = !actuated && remaps[slot].osc[osc]
      ? remaps[slot].osc[osc].value
      : value
    return {
      index: position,
      osc,
      actuated,
      icon,
      pushed: value === UPPER_THRESHOLD,
      value
    }
  })
  const axes = axesOrder.map((position, i) => {
    const { iconAbove, iconBelow } = axesIcons[i % axesIcons.length];
    const osc = `/axis/${position}`
    let value = gamepad.axes[position]
    const actuated = Math.abs(value) >= DEFAULT_ACTUATION
    return {
      index: position,
      osc,
      actuated,
      iconAbove,
      iconBelow,
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
  accumulator[current.osc] = current
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

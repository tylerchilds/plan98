import module from '@silly/tag'
import gamepads from "./sillyz-gamepad.js"

const initialState = {
  activeFrets: [],
  activeRegisters: [],
  activeMotions: [],
  frames: {},
}

const $ = module('sillyz-guitar', initialState)
const fretMap = [0, 1, 3, 2, 4]

const registers = [
  "     ",

  "x    ",
  " x   ",
  "  x  ",
  "   x ",
  "    x",

  "xx   ",
  " xx  ",
  "  xx ",
  "   xx",

  "xxx  ",
  " xxx ",
  "  xxx",

  "x x x",
  "xxxxx"
]

requestAnimationFrame(loop)
function loop(time) {
  const activeFrets = gamepads().map(x => toFrets($, x))
  const activeRegisters = activeFrets.map(x => toRegisters($, x))
  const activeMotions = gamepads().map(x => toMotion($, x))

  $.teach({
    time,
    activeFrets,
    activeRegisters,
    activeMotions,
  })

  requestAnimationFrame(loop)
}

$.draw(() => {
  const {
    activeRegisters,
    activeMotions,
  } = $.learn()

  const classes = (i) => {
    return ['up', 'down', 'left', 'right']
      .map(x => activeMotions[i][x] ? x : '')
      .join(' ')
  }

  return activeRegisters.map((x, i) => `
    <div class="${classes(i)}">
      ${x}
    </div>
  `).join('')
})

function toFrets(_$, flags) {
  const pressed = value => value === 1 ? "x" : " "
  const frets = flags.buttons.map(pressed).slice(0, 5)
  return fretMap.map(i => frets[i]).join('')
}

function toRegisters(_$, frets) {
  return registers.indexOf(frets)
}

function toMotion(_$, flags) {
  const [vertical] = [...flags.axes].splice(-1)
  const [horizontal] = [...flags.axes].splice(-2)

  return {
    up: vertical === -1,
    down: vertical === 1,
    left: horizontal === -1,
    right: horizontal === 1
  }
}

function throttle($, flags) {
  const { frames = {}} = $.learn()
  const frame = frames[flags.key] || {}

  if((flags.time - flags.fps) > (frame.time || 0)) {
    flags.activate()
    $.teach({ time: flags.time }, (state, payload) => {
      return {
        ...state,
        frames: {
          ...frames,
          [flags.key]: {
            time: payload.time
          }
        }
      }
    })
  }
}

$.style(`
  & {
    display: block;
  }
`)

export default $


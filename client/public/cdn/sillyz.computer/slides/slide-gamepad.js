import { tag } from "/deps.js"

let gamepads = []
const $ = tag('data-gamepads')

addEventListener("message", () => {
  if(event.data.event == 'tick') {
    gamepads = [...event.data.gamepads]
  }
}, false)

function gamepadLoop(time) {
  const isLeft = gamepads.map(x => x.buttons).some(buttons => buttons['DPadLeft'] === 1)
  const isRight = gamepads.map(x => x.buttons).some(buttons => buttons['DPadRight'] === 1)

  console.log(isLeft, isRight)
  let signal = null

  if(isLeft) signal = 'left'
  if(isRight) signal = 'right'

  const events = []
  const codes = {
    'left': 37,
    'right': 39
  }

  
  if(codes[signal]) {
    const activate = () => {
      events.push(new KeyboardEvent("keydown", {
        view: window,
        keyCode: codes[signal],
        bubbles: true,
        cancelable: true
      }))
    }

    throttle($, {
      key: 'strum',
      activate,
      time,
      fps: 1000 / 4
    })
  }

  events.map(x => document.dispatchEvent(x))
  requestAnimationFrame(gamepadLoop);
}
debugger
gamepadLoop()

function throttle($, flags) {
  const { frames = {}} = $.read()
  const frame = frames[flags.key] || {}

  if((flags.time - flags.fps) > (frame.time || 0)) {
    flags.activate()
    $.write({ time: flags.time }, (state, payload) => {
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

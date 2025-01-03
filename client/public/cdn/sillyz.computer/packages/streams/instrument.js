import { tag, listen } from "/deps.js"
import gamepads from "./gamepad.js"

let Tone;

const initialState = {
  activeChords: [],
  activeNotes: [],
  activeStrums: [],
  frames: {},
}

const $ = tag('z-instrument', initialState)
const fretMap = [0, 1, 3, 2, 4]
export const notes = ["c", "d", "e", "f", "g", "a", "b"]

const chords = [
  "x    ", // a ( c - 2 )

  " x   ",
  "  x  ", // c
  "   x ",
  "    x",

  "xx   ",
  "x x  ", // g
  "x  x ",
  "x   x",

  "xxx  ", // c
  "xx x ",
  "xx  x",
  "xxxx ",

  "xxx x", // g
  "xxxxx",
  " xx  ",
  " x x ", // c

  " x  x",
  " xxx ",
  " xx x",
  " xxxx", // g

  "  xx ",
  "  x x",
  "  xxx", // c
  "   xx",
]

const colors = {
  "x    ": [-1, -1],
  " x   ": [0, 0],
  "  x  ": [0, 1],
  "   x ": [0, 2],
  "    x": [0, 3],

  "xx   ": [0, 4],
  "x x  ": [0, 5],
  "x  x ": [0, 6],
  "x   x": [1, 0],

  "xxx  ": [1, 1],
  "xx x ": [1, 2],
  "xx  x": [1, 3],
  "xxxx ": [1, 4],

  "xxx x": [1, 5],
  "xxxxx": [1, 6],
  " xx  ": [2, 0],
  " x x ": [2, 1],

  " x  x": [2, 2],
  " xxx ": [2, 3],
  " xx x": [2, 4],
  " xxxx": [2, 5],

  "  xx ": [2, 6],
  "  x x": [3, 0],
  "  xxx": [3, 1],
  "   xx": [3, 2]
}

export const octaves = [2, 3, 4, 5, 6, -2, -1, 0]

let baseOctave = 0
const eventMap = {
  37: () => baseOctave--,
  39: () => baseOctave++
};

document.addEventListener('keydown', (event) => {
  const handler = eventMap[event.keyCode] || console.log
  handler()
});

let synths = [...Array(12)]
let once = async () => { once = () => null
  let off
  await new Promise((done) => off = listen('click', '*',
    async () => {
      if(off) {
        off();
        off = false;
        Tone = await import('https://esm.sh/tone@next')
        done()
      }
    }
  ))

  synths = synths.map(() => new Tone.Synth().toDestination())
}

(async function loop(time) {
  await once()

  const activeFrets = gamepads().map(x => toFrets($, x))
  const activeChords = activeFrets.map(x => toChords($, x))
  const activeNotes = activeChords.map(getNote)
  const activeStrums = gamepads().map(x => toStrums($, x))
  const activeMotion = gamepads().map(x => toMotion($, x))

  const activeKeys = activeFrets.map(getColor)
  const activeThemes = activeKeys.map(([block, inline], i) => toTheme($, {
    block,
    inline,
  }))

  $.write({
    time,
    activeFrets,
    activeChords,
    activeNotes,
    activeStrums,
    activeMotion,
    activeKeys,
    activeThemes
  })

  activeStrums.map((strum, i) => {
    if(isActuated(strum)) {
      const snapshot = () => playNote($, {
        index: i,
        theme: activeThemes[i],
        keys: activeKeys[i],
      })
      throttle($, {
        key: `strum-${i}`,
        activate: snapshot,
        time,
        fps: 1000 / 4
      })
    }
  })


  activeMotion.map(({ horizontal }, i) => {
    if(isActuated(horizontal)) {
      const cheat = {[-1]: 37, [1]: 39}[horizontal]
			const activate = () => {
				document.dispatchEvent(new KeyboardEvent("keydown", {
					view: window,
					keyCode: cheat,
					bubbles: true,
					cancelable: true
				}))
			}

			throttle($, {
				key: 'slide',
				activate,
				time: Date.now(),
				fps: 1000 / 4
			})
    }
  })


  requestAnimationFrame(loop)
})()

$.render(() => {
  const {
    activeChords,
    activeNotes,
    activeStrums,
  } = $.read()

  const classes = (i) => `note ${activeStrums[i] ? 'strummed' : ''}`

  return activeChords.map((_chord, i) => `
    <div class="${classes(i)}">
      ${activeNotes[i]}
    </div>
  `).join('')
})

function toFrets(_$, flags) {
  const pressed = value => value === 1 ? "x" : " "
  const frets = flags.buttons.map(pressed).slice(0, 5)
  return fretMap.map(i => frets[i]).join('')
}

function toChords(_$, frets) {
  return chords.indexOf(frets) - 2
}

function toStrums(_$, flags) {
  const [strumbar] = [...flags.axes].splice(-1)
  return strumbar
}

function toMotion(_$, flags) {
  const [vertical] = [...flags.axes].splice(-1)
  const [horizontal] = [...flags.axes].splice(-2)
  return {horizontal, vertical}
}


function getNote(chord) {
  return notes[mod(chord, notes.length)]
}

function getOctave(chord) {
  const rawOctave = Math.floor(divide(chord, notes.length))
  console.log(baseOctave)
  return mod(baseOctave + rawOctave, octaves.length)
}

function getColor(frets) {
  return colors[frets] || [-1, -2]
}

function toTheme(_$, flags) {
  const { block, inline } = flags
  const x = mod(baseOctave + block, octaves.length);
  const y = mod(inline, notes.length);
  return `var(--wheel-${x}-${y})`
}

function divide(x, n) {
  return Math.floor((x + n) / n) - 1;
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

function isActuated(value) {
  return [-1, 1].includes(value)
}

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

export function playNote(_$, flags) {
  const { keys, theme, index } = flags
  const [block, inline] = keys

  const note = notes[(parseInt(inline) + 6) % notes.length]
  const octave = octaves.at(parseInt(mod(block + baseOctave, octaves.length)))
  const now = Tone.now()

  synths[index].triggerAttackRelease(`${note}${octave}`, "8n", now);

  if(theme) {
    const html = document.querySelector('html')
    html.style = `
      --theme: ${theme};
    `
  }
}

$.style(`
  & {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    width: 100vw;
    place-items: center;
  }
  & .note {
    font-size: 10vh;
    line-height: 1;
  }

  & .strummed {
    transform: scale(2);
  }
`)

export default $

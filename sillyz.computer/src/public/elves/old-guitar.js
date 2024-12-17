import * as Tone from 'https://esm.sh/tone@next'
import tag from '@silly/tag'
import gamepad from "./old-gamepad.js"

const synth = new Tone.Synth().toDestination()

const initialState = {
  activeChords: [],
  activeNotes: [],
  activeOctaves: [],
  activeStrums: [],
  frames: {},
  ready: false
}

const $ = tag('old-guitar', initialState)
const baseOctave = 3
const fretMap = [0, 1, 3, 2, 4]
const notes = ["c", "d", "e", "f", "g", "a", "b"]

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
  "x    ": 'green',
  " x   ": 'red',
  "  x  ": 'yellow',
  "   x ": 'blue',
  "    x": 'orange',

  "xx   ": 'yellow',
  "x x  ": 'orange',
  "x  x ": 'chartruese',
  "x   x": 'teal',

  "xxx  ": 'amber',
  "xx x ": 'indigo',
  "xx  x": 'chartruese',
  "xxxx ": 'magenta',

  "xxx x": 'amber',
  "xxxxx": 'green',
  " xx  ": 'orange',
  " x x ": 'violet',

  " x  x": 'flame',
  " xxx ": 'fuschia',
  " xx x": 'orange',
  " xxxx": 'chartruese',

  "  xx ": 'green',
  "  x x": 'amber',
  "  xxx": 'amber',
  "   xx": 'fuschia'
}

const shades = {
  [1]: [6, 2],
  [-1]: [1, 5],
}

function ready() {
  return new Promise((ready) => {
    (function loop() {
      if($.learn().ready) {
        return ready()
      }

      if(gamepad.learn().gamepads) {
        $.teach({ ready: true })
        return ready()
      }

      requestAnimationFrame(loop)
    })()
  })
}

(async function loop(time) {
  await ready()
  const { gamepads } = gamepad.learn()

  const activeFrets = gamepads.map(x => toFrets($, x))
  const activeChords = activeFrets.map(x => toChords($, x))
  const activeNotes = activeChords.map(getNote)
  const activeOctaves = activeChords.map(getOctave)
  const activeStrums = gamepads.map(x => toStrums($, x))

  const activeColors = activeFrets.map(getColor)
  const activeShades = activeStrums.map(getShades)
  const activeThemes = activeColors.map((x, i) => toTheme($, {
    color: x,
    shades: activeShades[i]
  }))

  $.teach({
    time,
    activeFrets,
    activeChords,
    activeNotes,
    activeOctaves,
    activeStrums,
    activeColors,
    activeShades,
    activeThemes
  })

  activeStrums.map((strum, i) => {
    if(isStrummed(strum)) {
      const snapshot = () => playNote($, {
        note: activeNotes[i],
        octave: activeOctaves[i],
        theme: activeThemes[i]
      })
      throttle($, {
        key: `strum-${i}`,
        activate: snapshot,
        time,
        fps: 1000 / 4
      })
    }
  })

  requestAnimationFrame(loop)
})()

$.draw(() => {
  const {
    activeChords,
    activeNotes,
    activeStrums,
    activeThemes
  } = $.learn()

  const classes = (i) => `note ${activeStrums[i] ? 'strummed' : ''}`
  const styles = (i) => {
    const { foreground, background } = activeThemes[i]
    return `
      background: ${background};
      foreground: ${foreground};
    `
  }

  return activeChords.map((_chord, i) => `
    <div class="${classes(i)}" style="${styles(i)}">
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
  const [strumbar] = [...flags.axes.map(x => x)].splice(-1)
  return strumbar
}

function getNote(chord) {
  return notes[mod(chord, notes.length)]
}

function getOctave(chord) {
  const rawOctave = Math.floor(divide(chord, notes.length))
  return rawOctave + baseOctave
}

function getColor(frets) {
  return colors[frets] || 'silver'
}

function getShades(strum) {
  return shades[strum] || [1, 7]
}

function toTheme(_$, flags) {
  const { color, shades } = flags
  const [x, y] = shades
  return {
    background: `var(--${color}${x})`,
    foreground: `var(--${color}${y})`
  }
}

function divide(x, n) {
  return Math.floor((x + n) / n) - 1;
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

function isStrummed(value) {
  return [-1, 1].includes(value)
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

function playNote(_$, flags) {
  const { note, octave, theme } = flags
  synth.triggerAttackRelease(`${note}${octave}`, "8n");

  const html = document.querySelector('html')
  html.style = `
    --bg: ${theme.background};
    --fg: ${theme.foreground};
  `
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
  }

  & .strummed {
    transform: scale(2);
  }
`)

export default $

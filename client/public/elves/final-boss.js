import elf from '@silly/elf'
import {
  attack,
  release,
  attackRelease
} from './paper-pocket.js'

import Color from "colorjs.io"

const strumVelocity = 150

const $ = elf('final-boss', {
  colors: [],
  root: 60,
  start: 0,
  length: 360,
  reverse: false,
  consent: false
})

const lightnessStops = [
  [5, 30],
  [20, 45],
  [35, 60],
  [50, 75],
  [65, 90],
  [80, 105],
  [95, 120]
]

const initialColors = recalculate()
$.teach({ colors: initialColors, colorVariables: print(initialColors) })

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

function recalculate() {
  const { start, length, reverse } = $.learn()

  const colors = [...Array(12)].map((_, hueIndex) => {
    const hueFifths = mod(hueIndex * 7, 12)
    const step = ((length / 12) * hueFifths)
    const hue = reverse
      ? start - step
      : start + step

    return lightnessStops.map(([l, c], i) => {
      const name = `--wheel-${hueFifths}-${i}`
      const value = new Color('lch', [l, c, hue])
        .display()
        .toString()

      return {
        name,
        value,
        block: hueFifths,
        inline: i
      }
    })
  })

  $.teach({ colorVariables: print(colors) })

  return colors
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.draw((target) => {
  const { root, colors, colorVariables, consent } = $.learn()

  if(!consent) {
    return `
      <div class="fake-overlay">
        <div class="fake-modal">
          <div class="fake-title">
            Photosensitive Warning: Read Before Playing!
          </div>
          <div class="fake-context">
            <p>
              A very small percentage of individuals may experience epileptic seizures when exposed to certain light patterns or flashing lights. Exposure to certain patterns or backgrounds on a computer screen, or while playing video games, may induce an epileptic seizure in these individuals. Certain conditions may induce previously undetected epileptic symptoms even in persons who have no history of prior seizures or epilepsy.
            </p>
          <p>
            If you, or anyone in your family, have an epileptic condition, consult your physician prior to playing. If you experience any of the following symptoms while playing a video or computer game -- dizziness, altered vision, eye or muscle twitches, loss of awareness, disorientation, any involuntary movement, or convulsions -- IMMEDIATELY discontinue use and consult your physician before resuming play.
          </p>

          </div>

          <div class="fake-actions">
            <button class="fake-button bad">
              Decline
            </button>
            <button class="fake-button good">
              Accept
            </button>
          </div>
        </div>
      </div>
    `
  }

  const wheel = colors.map((lightness, i) => {
    const steps = lightness.map((x, ii) => {
      const noteAlgorithm = ((ii * 12) + mod(i * 7, 12))
      return`
        <button
          class="step"
          data-note="${noteAlgorithm}"
          style="background: var(${x.name})">
        </button>
      `
    }).join('')
    return `
      <div class="group" style="transform: rotate(${i * 30}deg)">
        ${steps}
      </div>
    `
  }).join('')

  return `
    <div class="root-note">${root}</div>
    <div class="grid">
      <div class="wheel" style="${colorVariables}">
        ${wheel}
      </div>
    </div>
  `
})
function accept() {
  $.teach({ consent: true });
}

function decline() {
  window.location.href = 'https://hivelabworks.com'
}

$.when('click', '.fake-button.good', accept)
$.when('click', '.fake-button.bad', decline)

$.when('pointerenter', '.step', (event) => {
  const { note } = event.target.dataset
  attack(note)
})

$.when('pointerleave', '.step', (event) => {
  const { note } = event.target.dataset
  release(note)
})

$.style(`
  & {
    background: black;
    display: block;
    height: 100%;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
    position: relative;
  }

  & .root-note {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: white;
    font-weight: bold;
    font-size: 2rem;
    pointer-events: none;
    z-index: 2;
  }

  & [data-escape] {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
  }

  & .action-button {
    position: absolute;
    top: 0;
    right: 0;
    left: auto;
    bottom: auto;
    z-index: 10;
    width: 50px;
    height: 50px;
  }

  & .grid {
    position: relative;
    height: 100%;
  }
  & .grid > * {
    position: absolute;
    inset: 0;
    margin: auto;
    height: 50cqmin;
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 25cqmin;
    grid-template-columns: 17cqmin;
    place-content: start center;
    overflow: hidden;
  }

  & .wheel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(rgba(255,255,255,1), rgba(255,255,255,.5), rgba(0,0,0,.5), rgba(0,0,0,1));
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: plus-lighter;
  }
  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
    clip-path: polygon(10% 0%, 50% 100%, 90% 0%);
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
    opacity: 1;
    transition: opacity calc(1000ms / 8);
  }

  & .step.active,
  & .step:hover,
  & .step:focus {
    opacity: .1;
  }

  & .fake-overlay {
    height: 100%;
    background: linear-gradient(45deg rgba(0,0,0,.15), rgba(0,0,0,.5));
  }

  & .fake-modal {
    max-width: 55ch;
    margin: 0 auto;
    background: white;
    display: grid;
    grid-template-rows: auto 1fr auto;
    max-height: 100%;
  }
  & .fake-title {
    background: rgba(0,0,0,.85);
    font-weight: bold;
    font-size: 1rem;
    padding: 1rem;
    margin 1rem 0;
    color: rgba(255,255,255,.65);
  }

  & .fake-context {
    padding: 0 1rem;
    margin-bottom: 1rem;
    color: rgba(0,0,0,.85);
    max-height: 100%;
    overflow: auto;
  }
  & .fake-actions {
    display: flex;
    justify-content: end;
    padding: 1rem;
    background: rgba(0,0,0,.25);
    gap: .5rem;
  }

  & .fake-button {
    padding: .5rem 1rem;
    border: none;
    background: grey;
    color: black;
    border-radius: 1rem;
  }

  & .fake-button.good {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), mediumseagreen;
    color: rgba(255,255,255,.85);
  }
`)

$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { consent, root } = $.learn()

  if(consent) {
    const more = { root }

    if(musicRPC[method]) {
      musicRPC[method]({...params, ...more})
    }
  }

  if(!consent) {
    if(consentRPC[method]) {
      consentRPC[method](params)
    }
  }
})

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const strings = [0,0,0,0,0,0]

function maybe(index, value) {
  if(value === 1) {
    if(strings[index] === 1) return
    strings[index] = value
  } else {
    if(strings[index] === 0) return
    strings[index] = value
  }
}

const majorScales = {
  '0000': [0, 4, 7], // c major
  '1010': [1, 5, 8], // c#/db major
  '1000': [2, 6, 9], // d major
  '1001': [3, 7, 10], // d#/eb major
  '0100': [4, 8, 11], // e major
  '0001': [5, 9, 12], // f major
  '0110': [6, 10, 13], // f#/gb major
  '0010': [7, 11, 14], // g major
  '0101': [8, 12, 15], // g#/ab major
  '1100': [9, 13, 16], // a major
  '0111': [10, 14, 17], // a#/bb major
  '0011': [11, 15, 18], // b major
}

const minorScales = {
  '0000': [0, 3, 7], // c minor
  '1010': [1, 4, 8], // c#/db minor
  '1000': [2, 5, 9], // d minor
  '1001': [3, 6, 10], // d#/eb minor
  '0100': [4, 7, 11], // e minor
  '0001': [5, 8, 12], // f minor
  '0110': [6, 9, 13], // f#/gb minor
  '0010': [7, 10, 14], // g minor
  '0101': [8, 11, 15], // g#/ab minor
  '1100': [9, 12, 16], // a minor
  '0111': [10, 13, 17], // a#/bb minor
  '0011': [11, 14, 18], // b minor
}

const activeNotes = []

function releaseAll() {
  while(activeNotes.length > 0) {
    release(activeNotes.pop())
  }
}

function queueAttack(shift, i) {
  const { root } = $.learn()
  const note = root + shift
  activeNotes.push(note)
  setTimeout(() => {
    if(activeNotes.includes(note)) {
      attack(note)
    }
  }, i * strumVelocity)
}

let upCache, downCache

const musicRPC = {
  'a': (params) => {
    maybe(0, params.value)
  },
  'b': (params) => {
    maybe(1, params.value)
  },
  'x': (params) => {
    maybe(2, params.value)
  },
  'y': (params) => {
    maybe(3, params.value)
  },
  'lb': (params) => {
    maybe(4, params.value)
  },
  'rb': (params) => {
    maybe(5, params.value)
  },
  'lt': (params) => {
    octaveDown()
  },
  'rt': (params) => {
    octaveUp()
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', 300, () => {
        const cache = strings.slice(0,5).join('')
        if(upCache === cache) return
        upCache = cache
        releaseAll()

        const key = strings.slice(0,4).join('')
        if(strings[4] === 1) {
          if(minorScales[key]) {
            [...minorScales[key]].reverse().map(queueAttack)
          }
        } else {
          if(majorScales[key]) {
            [...majorScales[key]].reverse().map(queueAttack)
          }
        }
      })
    } else {
      if(upCache) {
        releaseAll()
        upCache = null
      }
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      debounceSpam('down', 300, () => {
        const cache = strings.slice(0,5).join('')
        if(downCache === cache) return
        downCache = cache
        releaseAll()

        const key = strings.slice(0,4).join('')
        if(strings[4] === 1) {
          if(minorScales[key]) {
            minorScales[key].map(queueAttack)
          }
        } else {
          if(majorScales[key]) {
            majorScales[key].map(queueAttack)
          }
        }
      })
    } else {
      if(downCache) {
        releaseAll()
        downCache = null
      }
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      debounceSpam('left', 250, () => {
        slideLeft()
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      debounceSpam('right', 250, () => {
        slideRight()
      })
    }
  },
  'select': (params) => {
    toggleSpam('select', params.value, () => {
      console.log('select')
    })
  },
  'start': (params) => {
    toggleSpam('start', params.value, () => {
      console.log('start')
    })
  },
}

function slideLeft() {
  const { root } = $.learn()

  if(root < 24) return
  $.teach({ root: root-1 })
}

function slideRight() {
  const { root } = $.learn()
  if(root>96) return
  $.teach({ root: root+1 })
}

function octaveDown() {
  const { root } = $.learn()
  const nextRoot = root - 12
  if(nextRoot<24) {
    $.teach({ root: 24 })
  } else {
    $.teach({ root: nextRoot })
  }
}

function octaveUp() {
  const { root } = $.learn()
  const nextRoot = root + 12
  if(nextRoot>96) {
    $.teach({ root: 96 })
  } else {
    $.teach({ root: nextRoot })
  }
}

const consentRPC = {
  'a': (params) => {
    if(params.value === 1) {
      accept()
    }
  },
  'b': (params) => {
    if(params.value === 1) {
      decline()
    }
  },
}

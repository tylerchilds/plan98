import elf from '@silly/elf'
import {
  attack,
  release,
  attackRelease,
  getNoteDuration,
  setTheme
} from './paper-pocket.js'
import { colors as paletteColors, light, matrix } from './plan98-palette.js'

import * as Tone from 'tone@next'
import Color from "colorjs.io"

const $ = elf('final-boss', {
  activeNotes: [],
  colors: [],
  root: 60,
  start: 0,
  length: 360,
  reverse: false,
  consent: false
})

const initialColors = recalculate()
$.teach({ colors: initialColors, colorVariables: print(initialColors) })

function print(colors) {
  return colors.flatMap(x => x).map(({ value }) => `
    ${name}: ${value};
  `).join('')
}

function recalculate() {
  const wheel = [...Array(12)].map(() => [])
  const c = paletteColors
  const l = light
  const length = c.length * l.length

  for(let i = 0; i < length; i++) {
    const x = i % c.length
    const y = Math.floor(i / c.length)

    const data = matrix[mod(x, matrix.length)][y]

    const wheelIndex = mod(i, wheel.length)
    const hueFifths = mod(wheelIndex * 7, 12)
    const name = `--wheel-${hueFifths}-${y}`

    wheel[wheelIndex].push({
      name,
      value: data.rgba,
      color: data.color,
      light: data.light,
      block: hueFifths,
      inline: i
    })
  }

  $.teach({ colorVariables: print(wheel) })

  return wheel
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.draw((target) => {
  const { activeNotes, root, colors, colorVariables, consent } = $.learn()

  if(!consent) {
    return `
      <div class="fake-overlay">
        <div class="fake-modal">
          <div class="fake-scroll">
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
          </div>

          <div class="fake-actions">
            <button class="bad-button standard-button bias-negative">
              Quit
            </button>
            <button class="good-button standard-button bias-positive">
              Continue
            </button>
          </div>
        </div>
      </div>
    `
  }

  const wheel = colors.map((lightness, i) => {
    const steps = lightness.map((x, ii) => {
      const note = ((ii * 12) + mod(i, 12))
      return`
        <button
          class="step ${activeNotes.includes(note) ? 'active':''}"
          data-note="${note}"
          data-value="${x.value}"
          data-color="${x.color}"
          data-light="${x.light}"
          style="background: ${x.value}">
          <div class="active-indicator"></div>
        </button>
      `
    }).join('')
    return `
      <div class="group" style="transform: rotate(${i * 7 * 30}deg)">
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
  window.location.href = 'https://ncity.executiontime.pub'
}

$.when('click', '.good-button', accept)
$.when('click', '.bad-button', decline)

$.when('pointerenter', '.step', (event) => {
  const { note } = event.target.dataset
  attackRelease(note)
})

$.when('pointerleave', '.step', (event) => {
  const { note } = event.target.dataset
  release(note)
})

$.when('click', '.step', (event) => {
  const { value } = event.target.dataset
  setTheme(value)
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
    overflow: hidden;
  }
  & .grid > * {
    position: absolute;
    inset: 0;
    margin: auto;
    height: 100cqmin;
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 50cqmin;
    grid-template-columns: 34cqmin;
    place-content: start center;
    overflow: hidden;
  }

  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(11, 1fr);
    clip-path: polygon(10% 0%, 50% 100%, 90% 0%);
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
    opacity: 1;
    position: relative;
  }

  & .step.active .active-indicator,
  & .step:hover .active-indicator,
  & .step:focus .active-indicator {
    opacity: 1;
  }

  & .active-indicator {
    opacity: 0;
    transition: opacity calc(1000ms / 8);
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(255,255,255,.5) 33%, transparent 33%, transparent 67%, rgba(0,0,0,.5) 67%);
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
    grid-template-rows: 1fr auto;
    max-height: 100%;
  }
  & .fake-title {
    background: rgba(0,0,0,.85);
    font-weight: bold;
    font-size: 1rem;
    padding: .5rem;
    margin 1rem 0;
    color: rgba(255,255,255,.65);
  }

  & .fake-scroll {
    max-height: 100%;
    overflow: auto;
  }

  & .fake-context {
    padding: 0 .5rem;
    margin-bottom: 1rem;
    color: rgba(0,0,0,.85);
  }
  & .fake-actions {
    display: flex;
    justify-content: end;
    padding: .5rem;
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

  const node = event.target.closest($.link)

  if(consent) {
    const more = { root }

    if(musicRPC[method]) {
      musicRPC[method]({...params, ...more}, node)
    }
  }

  if(!consent) {
    if(consentRPC[method]) {
      consentRPC[method](params, node)
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
  '1001': [1, 5, 8], // c#/db major
  '1000': [2, 6, 9], // d major
  '1010': [3, 7, 10], // d#/eb major
  '0100': [4, 8, 11], // e major
  '0010': [5, 9, 12], // f major
  '0101': [6, 10, 13], // f#/gb major
  '0001': [7, 11, 14], // g major
  '0110': [8, 12, 15], // g#/ab major
  '1100': [9, 13, 16], // a major
  '0111': [10, 14, 17], // a#/bb major
  '0011': [11, 15, 18], // b major
}

const minorScales = {
  '0000': [0, 3, 7], // c minor
  '1001': [1, 4, 8], // c#/db minor
  '1000': [2, 5, 9], // d minor
  '1010': [3, 6, 10], // d#/eb minor
  '0100': [4, 7, 11], // e minor
  '0010': [5, 8, 12], // f minor
  '0101': [6, 9, 13], // f#/gb minor
  '0001': [7, 10, 14], // g minor
  '0110': [8, 11, 15], // g#/ab minor
  '1100': [9, 12, 16], // a minor
  '0111': [10, 13, 17], // a#/bb minor
  '0011': [11, 14, 18], // b minor
}

const playing = {}

function releaseAll() {
  const { activeNotes } = $.learn()
  activeNotes.map(release)
  $.teach({ activeNotes: [] })
}

function queueAttack(shift, i) {
  const { root } = $.learn()
  const note = root + shift
  setTimeout(() => {
    if(!playing[note]) {
      playing[note] = 0
    }
    playing[note] += 1
    attackRelease(note, () => {
      playing[note] -= 1
      if(!playing[note]) {
        $.teach(note, (state, payload) => {
          return {
            ...state,
            activeNotes: [...state.activeNotes].filter(x => x !== payload)
          }
        })
      }
    }, '4m')
    $.teach(note, (state, payload) => {
      return {
        ...state,
        activeNotes: [...state.activeNotes, payload]
      }
    })
  }, i * Tone.Time(getNoteDuration()).toMilliseconds())
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
    maybe(3, params.value)
  },
  'y': (params) => {
    maybe(2, params.value)
  },
  'lb': (params) => {
    maybe(4, params.value)
  },
  'rb': (params) => {
    maybe(5, params.value)
  },
  'lt': (params) => {
    //octaveDown()
  },
  'rt': (params) => {
    //octaveUp()
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', Tone.Time(getNoteDuration()).toMilliseconds(), () => {
        const cache = strings.slice(0,5).join('')
        if(upCache === cache) return
        releaseAll()
        upCache = cache

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
      debounceSpam('down', Tone.Time(getNoteDuration()).toMilliseconds(), () => {
        const cache = strings.slice(0,5).join('')
        if(downCache === cache) return
        releaseAll()
        downCache = cache

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

let nextRhythm = 1
const algoRhythm = [1,5,7,9]

function slideLeft() {
  const { root } = $.learn()

  const nextRoot = root - algoRhythm[nextRhythm]
  nextRhythm = mod(nextRhythm - 1, algoRhythm.length)

  if(nextRoot < 0) return
  $.teach({ root: nextRoot })
}

function slideRight() {
  const { root } = $.learn()
  const nextRoot = root + algoRhythm[nextRhythm]
  nextRhythm = mod(nextRhythm - 1, algoRhythm.length)
  if(nextRoot>127) return
  $.teach({ root: nextRoot })
}

const consentCache = {}

function forceAcknowledge(code, value, callback) {
  if(value === 0 && !consentCache[code]) {
    consentCache[code] = 0
    return
  }
  if(consentCache[code] === 0 && value === 1) {
    callback()
  }
}

const consentRPC = {
  'a': (params) => {
    forceAcknowledge('a', params.value, accept)
  },
  'b': (params) => {
    if(params.value === 1) {
      decline()
    }
  },
  'up': (params, node) => {
    if(params.value === 1) {
      const container = node.querySelector('.fake-scroll')
      if(container) {
        fakeScrollUp(container, 40)
      }
    }
  },
  'down': (params, node) => {
    if(params.value === 1) {
      const container = node.querySelector('.fake-scroll')
      if(container) {
        fakeScrollDown(container, 40)
      }
    }
  },
}

function fakeScrollUp(container, scrollStep=10) {
  container.scrollBy({ top: -scrollStep, behavior: 'smooth' });
}

function fakeScrollDown(container, scrollStep=10) {
  container.scrollBy({ top: scrollStep, behavior: 'smooth' });
}

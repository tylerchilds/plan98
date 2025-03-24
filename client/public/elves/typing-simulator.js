import elf from '@silly/elf'
import {
  attack,
  release,
  attackRelease,
  getNoteDuration
} from './paper-pocket.js'

import Color from "colorjs.io"

const characterMapping = {
  '00000': [' ', '.'],
  '10101': ['?', '!'],
  '11101': ['@', '#'],
  '10111': [':', ';'],
  '11111': ['<', '>'],
  '10110': [',', '"'],

  '10000': ['a', 'A'],
  '01000': ['e', 'E'],
  '00100': ['i', 'I'],
  '00010': ['o', 'O'],
  '00001': ['u', 'U'],

  '11000': ['t', 'T'],
  '01100': ['n', 'N'],
  '00110': ['s', 'S'],
  '00011': ['h', 'H'],
  '10010': ['r', 'R'],
  '01010': ['d', 'D'],
  '00101': ['l', 'L'],
  '10100': ['c', 'C'],
  '01001': ['m', 'M'],
  '11100': ['w', 'W'],
  '01110': ['f', 'F'],
  '00111': ['g', 'G'],
  '10011': ['y', 'Y'],
  '11010': ['p', 'P'],
  '01101': ['b', 'B'],

  '01011': ['v', 'V'],
  '11001': ['k', 'K'],
  '11110': ['j', 'J'],
  '01111': ['x', 'X'],
  '10001': ['q', 'Q'],
  '11011': ['z', 'Z']
}

const majorScales = {
  '0000': [0], // c major
  '1001': [1], // c#/db major
  '1000': [2], // d major
  '1010': [3], // d#/eb major
  '0100': [4], // e major
  '0010': [5], // f major
  '0101': [6], // f#/gb major
  '0001': [7], // g major
  '0110': [8], // g#/ab major
  '1100': [9], // a major
  '0111': [10], // a#/bb major
  '0011': [11], // b major
}

const minorScales = {
  '0000': [7], // c minor
  '1001': [8], // c#/db minor
  '1000': [9], // d minor
  '1010': [10], // d#/eb minor
  '0100': [11], // e minor
  '0010': [12], // f minor
  '0101': [13], // f#/gb minor
  '0001': [14], // g minor
  '0110': [15], // g#/ab minor
  '1100': [16], // a minor
  '0111': [17], // a#/bb minor
  '0011': [18], // b minor
}


const $ = elf('typing-simulator', {
  activeNotes: [],
  colors: [],
  root: 60,
  start: 0,
  length: 360,
  reverse: false,
  consent: false,
  message: '',
})

const lightnessStops = [
  [5, 25],
  [20, 40],
  [35, 55],
  [50, 70],
  [65, 85],
  [80, 100],
  [95, 115]
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

function type(character) {
  $.teach(character, (state, payload) => {
    return {
      ...state,
      message: state.message+payload
    }
  })
}

$.when('input', 'textarea', (event) => {
  const { value } = event.target
  $.teach({ message: value })
})

$.draw((target) => {
  const { root, message, colorVariables, consent } = $.learn()

  if(!consent) {
    return `
      <div class="fake-overlay">
        <div class="fake-modal">
          <div class="fake-title">
            Typing Simulator
          </div>
          <div class="fake-context">
            <p>
              Learn how to type in the old school way that resembles augmented morse code. Hold a chord and strum it to play and type a character.
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

  return `
    <div class="typing-container" style="${colorVariables}">
      <div class="hero-bar">
        <div class="app-title">Typing Simulator</div>
        <div class="root-note">${root}</div>
      </div>
      <div class="typing-region">
        <textarea value="${escapeHyperText(message)}"></textarea>
      </div>
      <div class="typing-bar">
        <div class="active-phrase">
          The quick brown fox jumped over the lazy dog.
        </div>
        <div class="character-chord">
          ${drawChord('a')}
        </div>
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      recoverElves(target, 'sl-icon')
    }

    {
      const { message } = $.learn()

      const text = target.querySelector('textarea')
      if(text && target.message !== message) {
        target.message = message
        text.scrollTop = text.scrollHeight
      }
    }
  }
})

function drawChord(character) {
  const chord = Object.keys(characterMapping).find(key => {
    return characterMapping[key].includes(character)
  })

  if(chord) {
    const direction = characterMapping[chord][0] === character ? 'up' : 'down'
    const buttons = chord.split('').map(x => {
      const value = parseInt(x)

      return `
        <div class="chord-key ${value ? 'on':'off'}"></div>
      `
    }).join('')

    return `
      ${buttons}
      <div class="strum-key">
        <sl-icon name="arrow-${direction}"></sl-icon>
      </div>
    `
  }

  return '??????'
}

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}



function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

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
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
    padding: 0 .5rem;
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

  & .app-title {
    background: rgba(0,0,0,.85);
    font-weight: bold;
    font-size: 1rem;
    padding: .5rem;
    margin 1rem 0;
    color: rgba(255,255,255,.65);
  }

  & .typing-container {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  & .typing-region {
    height: 100%;
  }

  & .typing-region textarea {
    height: 100%;
    width: 100%;
    resize: none;
    padding: .5rem;
    line-height: 1.25;
    font-size: 1.5rem;
  }

  & .hero-bar {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  & .typing-bar {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: .5rem;
  }

  & .active-phrase {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: rgba(255,255,255,.65);
    line-height: 1.5rem;
  }

  & .active-phrase:first-letter {
    font-weight: bold;
    color: white;
    font-size: 1.5rem;
  }

  & .character-chord {
    display: flex;
    color: white;
    gap: .25rem;
  }

  & .strum-key,
  & .chord-key {
    height: 1.5rem;
    width: 1.5rem;
    border: 2px solid;
    background: transparent;
    border-radius: 100%;
  }

  & .chord-key:nth-child(1) {
    border-color: var(--green, mediumseagreen);
  }

  & .chord-key.on:nth-child(1) {
    background: var(--green, mediumseagreen);
  }

  & .chord-key:nth-child(2) {
    border-color: var(--red, firebrick);
  }

  & .chord-key.on:nth-child(2) {
    background: var(--red, firebrick);
  }

  & .chord-key:nth-child(3) {
    border-color: var(--yellow, gold);
  }

  & .chord-key.on:nth-child(3) {
    background: var(--yellow, gold);
  }

  & .chord-key:nth-child(4) {
    border-color: var(--blue, dodgerblue);
  }

  & .chord-key.on:nth-child(4) {
    background: var(--blue, dodgerblue);
  }

  & .chord-key:nth-child(5) {
    border-color: var(--orange, darkorange);
  }

  & .chord-key.on:nth-child(5) {
    background: var(--orange, darkorange);
  }

  & .strum-key {
    display: grid;
    place-items: center;
    border-color: transparent;
  }

  & .wheel-wrapper {
    height: 3rem;
    width: 3rem;
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
    opacity: .5;
  }

  & .step.active,
  & .step:hover,
  & .step:focus {
    opacity: 1;
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
    padding: .5rem;
    margin 1rem 0;
    color: rgba(255,255,255,.65);
  }

  & .fake-context {
    padding: 0 .5rem;
    margin-bottom: 1rem;
    color: rgba(0,0,0,.85);
    max-height: 100%;
    overflow: auto;
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

function queueAttackRelease(shift, i) {
  const { root } = $.learn()
  const note = root + shift

  attackRelease(note, () => {
    $.teach(note, (state, payload) => {
      return {
        ...state,
        activeNotes: [...state.activeNotes.filter(x => x !== payload)]
      }
    })
  }, getNoteDuration())

  $.teach(note, (state, payload) => {
    return {
      ...state,
      activeNotes: [...state.activeNotes, payload]
    }
  })
}

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
    toggleSpam('type-up', params.value, () => {
      const key = strings.slice(0,5).join('')
      const character = characterMapping[key][1]
      if(character) {
        type(character)
      }
    })
    toggleSpam('strum-up', params.value, () => {
      const key = strings.slice(0,4).join('')
      if(strings[4] === 1) {
        if(minorScales[key]) {
          [...minorScales[key]].map(x => x + 12).reverse().map(queueAttackRelease)
        }
      } else {
        if(majorScales[key]) {
          [...majorScales[key]].map(x => x + 12).reverse().map(queueAttackRelease)
        }
      }
    })
  },
  'down': (params) => {
    toggleSpam('type-down', params.value, () => {
      const key = strings.slice(0,5).join('')
      const character = characterMapping[key][0]
      if(character) {
        type(character)
      }
    })
    toggleSpam('strum-down', params.value, () => {
      const key = strings.slice(0,4).join('')
      if(strings[4] === 1) {
        if(minorScales[key]) {
          minorScales[key].map(queueAttackRelease);
        }
      } else {
        if(majorScales[key]) {
          majorScales[key].map(queueAttackRelease);
        }
      }
    })
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

  const nextRoot = root - 1

  if(nextRoot < 24) return
  $.teach({ root: nextRoot })
}

function slideRight() {
  const { root } = $.learn()
  const nextRoot = root + 1
  if(nextRoot>96) return
  $.teach({ root: nextRoot })
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

const forceCache = {}

// essentially make sure the button was released to ensure the screen
function forceAcknowledge(code, value, callback) {
  if(value === 0 && !forceCache[code]) {
    forceCache[code] = 0
    return
  }
  if((forceCache[code] === 0 && value === 1)) {
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
}

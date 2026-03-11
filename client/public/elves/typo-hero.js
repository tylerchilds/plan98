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
  '10110': [',', "'"],

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

const scale = {
  '00000': [0],
  '10101': [0],
  '11101': [0],
  '10111': [0],
  '11111': [0],
  '10110': [0],

  '10000': [7],
  '01000': [2],
  '00100': [9],
  '00010': [4],
  '00001': [11],

  '11000': [-7],
  '01100': [-2],
  '00110': [-9],
  '00011': [-4],
  '10010': [-11],
  '01010': [-6],
  '00101': [6],
  '10100': [13],
  '01001': [-13],
  '11100': [8],
  '01110': [-8],
  '00111': [15],
  '10011': [-15],
  '11010': [10],
  '01101': [-10],

  '01011': [17],
  '11001': [-17],
  '11110': [12],
  '01111': [-12],
  '10001': [19],
  '11011': [-19]
}

const modes = {
  loading: 'loading',
  game: 'game',
  consent: 'consent',
  summary: 'summary',
  ready: 'ready',
  menu: 'menu'
}


const $ = elf('typo-hero', {
  streak: 0,
  maxStreak: 0,
  duration: 60,
  summaryCount: 0,
  readyCount: 0,
  timeLeft: 0,
  pressedKeys: [0,0,0,0,0,0],
  activeNotes: [],
  colors: [],
  root: 60,
  start: 0,
  length: 360,
  reverse: false,
  mode: modes.consent,
  message: '',
  menuKey: 'favorites',
  menuIndex: 0,
  correct: 0,
  attempts: 0,
  currentLine: "",
  track: 'Untitled',
  menu: {
    favorites: {
      label: "Favorites",
      list: [
        {
          label: 'Vowels',
          url: '/public/cdn/sillyz.computer/lyrics/vowels.txt'
        },
        {
          label: 'Punctuation',
          url: '/public/cdn/sillyz.computer/lyrics/punctuation.txt'
        },
        {
          label: 'Rad Calm',
          url: '/public/cdn/sillyz.computer/lyrics/rad-calm.txt'
        },
        {
          label: 'Wolf Guy Pub',
          url: '/public/cdn/sillyz.computer/lyrics/wolf-guy-pub.txt'
        },
        {
          label: 'Wonderwall',
          url: '/public/cdn/sillyz.computer/lyrics/wonderwall.txt'
        },
      ]
    },
    lessons: {
      label: "Lessons",
      list: [
        {
          label: 'Vowels',
          url: '/public/cdn/sillyz.computer/lyrics/vowels.txt'
        },
        {
          label: 'Punctuation',
          url: '/public/cdn/sillyz.computer/lyrics/punctuation.txt'
        },
        {
          label: 'Teenage Shred',
          url: '/public/cdn/sillyz.computer/lyrics/teenage-shred.txt'
        },
        {
          label: 'Rad Calm',
          url: '/public/cdn/sillyz.computer/lyrics/rad-calm.txt'
        },
        {
          label: 'Wolf Guy Pub',
          url: '/public/cdn/sillyz.computer/lyrics/wolf-guy-pub.txt'
        },
        {
          label: 'Viktor Jax Quartz',
          url: '/public/cdn/sillyz.computer/lyrics/viktor-jax-quartz.txt'
        },
      ]
    },

    memes: {
      label: "Memes",
      list: [
        {
          label: 'Wonderwall',
          url: '/public/cdn/sillyz.computer/lyrics/wonderwall.txt'
        },
        {
          label: 'Freebird',
          url: '/public/cdn/sillyz.computer/lyrics/freebird.txt'
        },
        {
          label: 'Never Gonna Give You Up',
          url: '/public/cdn/sillyz.computer/lyrics/never-gonna-give-you-up.txt'
        },
        {
          label: 'Eye of the Tiger',
          url: '/public/cdn/sillyz.computer/lyrics/eye-of-the-tiger.txt'
        },

      ]
    },

    sagas: {
      label: "Sagas",
      list: [
        {
          label: 'Plan4',
          url: '/public/sagas/sillyz.computer/plan4.saga'
        },
        {
          label: 'Rejected Juggler Script',
          url: '/public/sagas/2024-02-24-time.saga'
        },
        {
          label: 'Hello Wally',
          url: '/public/sagas/sillyz.computer/en-us/index.saga'
        },
        {
          label: 'Handy Dandy',
          url: '/public/sagas/sillyz.computer/en-us/start.saga'
        },
        {
          label: 'Ethnography',
          url: '/public/sagas/sillyz.computer/ethnography.saga'
        },
        {
          label: 'Saga Crawler',
          url: '/public/cdn/sillyz.computer/en-us/saga-crawler.saga'
        },
        {
          label: 'Pitch Deck',
          url: '/public/sagas/sillyz.computer/en-us/pitch-deck.saga'
        },
        {
          label: 'tychi',
          url: '/public/sagas/sillyz.computer/en-us/1998.social/tychi.saga'
        }
      ]
    },
  },
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

function score(character, successCallback=()=>null, errorCallback=()=>null) {
  const {
    currentLine,
    correct,
    attempts,
    lines,
    line,
    streak,
    maxStreak
  } = $.learn()

  if(currentLine[0] === character) {
    const newStreak = streak + 1
    $.teach({
      streak: newStreak,
      maxStreak: newStreak > maxStreak ? newStreak : maxStreak,
      correct: correct + 1,
      attempts: attempts + 1
    })
    successCallback()
  } else {
    $.teach({
      streak: 0,
      attempts: attempts + 1
    })
    errorCallback()
  }

  // if line is empty, find next line
  if(currentLine.length - 1 === 0) {
    // we're out of characters for the current line
    let nextLine = line + 1;

    while(nextLine < lines.length) {
      if(lines[nextLine]) {
        break;
      } else {
        nextLine++
      }
    }

    if(nextLine < lines.length) {
      // we found the next line
      $.teach({
        line: nextLine,
        currentLine: lines[nextLine]
      })
    } else {
      // we ran out of lines
      endRound()
    }
  } else {
    // the remaining line has more characters
    $.teach(null, (state) => {
      return {
        ...state,
        currentLine: state.currentLine.slice(1)
      }
    })
  }
}


$.when('input', 'textarea', (event) => {
  const { value } = event.target
  $.teach({ message: value })
})

$.draw((target) => {
  const {
    root,
    message,
    colorVariables,
    mode,
    track,
    maxStreak,
    correct,
    attempts,
    currentLine,
    readyCount,
    summaryCount,
    timeLeft
  } = $.learn()


  if(mode === modes.loading) {
    return `
      <womp>
        <flying-disk></flying-disk>
      </womp>
    `
  }

  if(mode === modes.consent) {
    return `
      <div class="fake-overlay">
        <div class="fake-modal">
          <div class="fake-title">
            Typo Sim
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

  if(mode === modes.menu) {
    const linedPaper = getLinedPaper(target)

    const { menu, menuIndex, menuKey } = $.learn()

    const { list, label } = menu[menuKey]

    const items = list.map((item, i) => {
      const { label, mode, url } = item
      return `
        <button ${url? `data-href="${url}"`:''} ${mode ? `data-mode="${mode}"`:''} data-index="${i}" class="menu-link ${menuIndex === i ? 'active':''}">
          ${label}
        </button>
      `
    }).join('')

    return `
      <div class="menu-container" style="${colorVariables}">
        <div class="hero-bar">
          <div class="app-title">Typo Sim</div>
          <div class="root-note">${root}</div>
        </div>
        <div class="track-menu">
          <div class="track-label">${label}</div>
          <div class="track-list" style="background-image: ${linedPaper}">
            ${items}
          </div>
        </div>
      </div>
    `
  }

  if(mode === modes.summary) {
    const linedPaper = getLinedPaper(target)

    return `
      <div class="menu-container" style="${colorVariables}">
        <div class="hero-bar">
          <div class="app-title">Results</div>
          <div class="score">${correct} | ${(correct / attempts * 100 || 100).toFixed(1)}%</div>
        </div>
        <div class="summary">
          <div class="summary-title">Score</div>
          <div class="summary-notes" style="background-image: ${linedPaper}">
            <span class="summary-label">Track:</span> <span class="summary-value">${track}</span><br/>
            <span class="summary-label">Correct:</span> <span class="summary-value">${correct}</span><br/>
            <span class="summary-label">Keystrokes:</span> <span class="summary-value">${attempts}</span><br/>
            <span class="summary-label">Longest Streak:</span> <span class="summary-value">${maxStreak}</span><br/>
            <span class="summary-label">WPM: <span class="summary-value">${(correct / 5).toFixed()}</span><br/>
            <br/>
            ${message}
            <div class="timer-overlay">
              ${summaryCount > 0 ? summaryCount : ''}
            </div>
          </div>
        </div>
      </div>
    `
  }


  return `
    <div class="typing-container" style="${colorVariables}">
      <div class="hero-bar">
        <div class="app-title">${track}</div>
        <div class="score">${correct} | ${(correct / attempts * 100 || 100).toFixed(1)}%</div>
      </div>
      <div class="typing-region">
        <textarea value="${escapeHyperText(message)}"></textarea>
        <div class="timer-overlay">
          ${mode === modes.ready ? readyCount : timeLeft}
        </div>
      </div>
      <div class="typing-bar">
        <div class="active-phrase">
          ${escapeHyperText(currentLine)}
        </div>
        <div class="character-chord">
          ${drawChord(currentLine[0])}
        </div>
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    {
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'flying-disk')
    }

    {
      const { message } = $.learn()

      const text = target.querySelector('textarea')
      if(text && target.message !== message) {
        target.message = message
        text.scrollTop = text.scrollHeight
      }
    }

    {
      const active = target.querySelector('.menu-link.active')
      if(active) {
        active.scrollIntoView()
      }
    }


  }
})

function drawChord(character) {
  const chord = Object.keys(characterMapping).find(key => {
    return characterMapping[key].includes(character)
  })

  if(chord) {
    const direction = characterMapping[chord][0] === character ? 'down' : 'up'
    const { pressedKeys } = $.learn()

    const buttons = chord.split('').map((x, index) => {
      const value = parseInt(x)

      return `
        <div class="chord-key ${value ? 'on':'off'} ${pressedKeys[index] ? 'pressed':''}"></div>
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
  $.teach({ mode: modes.menu });
  clearAcknowledge('consent-a')
}

function decline() {
  console.error('I cannot let you do that Dave.')
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

  & .score {
    color: white;
    font-size: 1.5rem;
    padding: 0 .5rem;
  }
  & .root-note {
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
    padding: 0 .5rem;
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

  & .menu-container {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .summary-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--root-theme, lightgray);
    padding: .5rem;
  }

  & .summary {
    height: 100%;
    background: white;
  }
  
  & .summary-notes {
    padding: 0 .5rem 3px;
    word-break: break-all;
  }

  & .summary-label {
    color: rgba(0,0,0,.65);
  }

  & .summary-value {
    color: rgba(0,0,0,.85);
    font-weight: bold;
  }


  & .typing-container {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  & .typing-region {
    height: 100%;
    position: relative;
  }

  & .timer-overlay {
    position: absolute;
    bottom: .5rem;
    right: .5rem;
    pointer-events: none;
    mix-blend-mode: multiply;
    color: rgba(0,0,0,.65);
    font-weight: bold;
    font-size: 5rem;
    text-align: center;
    overflow: hidden;
    line-height: 1;
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
    gap: 1rem;
  }

  & .typing-bar {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: .5rem;
    gap: 1rem;
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
    justify-content: end;
  }

  & .strum-key,
  & .chord-key {
    height: 1.5rem;
    width: 1.5rem;
    border: 2px solid;
    background: transparent;
    border-radius: 100%;
  }

  & .chord-key {
    opacity: .65;
  }

  & .chord-key.pressed {
    opacity: 1;
    transform: scale(1.1);
    filter: blur(2px) contrast(2) brightness(2);
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

  & .track-menu {
    background: white;
    height: 100%;
    overflow: auto;
  }

  & .track-label {
    font-size: 2rem;
    font-weight: bold;
    color: var(--root-theme, lightgray);
    padding: .5rem;
  }

  & .track-list {
    padding-bottom: 3px;
  }

  & .menu-link {
    color: black;
  }

  & .menu-link.active {
    color: black;
    opacity: 1;
  }

`)

$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { mode, summaryCount, root } = $.learn()

  if(mode === modes.game) {
    const more = { root }

    if(musicRPC[method]) {
      musicRPC[method]({...params, ...more})
    }
  }

  if(mode === modes.menu) {
    if(menuRPC[method]) {
      menuRPC[method](params)
    }
  }


  if(mode === modes.consent) {
    if(consentRPC[method]) {
      consentRPC[method](params)
    }
  }

  if(mode === modes.summary && summaryCount === 0) {
    if(summaryRPC[method]) {
      summaryRPC[method](params)
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
    $.teach({ index, value }, pressedReducer)
  } else {
    if(strings[index] === 0) return
    strings[index] = value
    $.teach({ index, value }, pressedReducer)
  }
}

function pressedReducer(state, payload) {
  return {
    ...state,
    pressedKeys: [...state.pressedKeys.map((x, i) => {
      if(payload.index === i) {
        return payload.value
      } else {
        return x
      }
    })]
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
        score(character, () => {
          if(scale[key]) {
            [...scale[key]].map(x => x + 12).reverse().map(queueAttackRelease)
          }
        })
      }
    })
  },
  'down': (params) => {
    toggleSpam('type-down', params.value, () => {
      const key = strings.slice(0,5).join('')
      const character = characterMapping[key][0]
      if(character) {
        type(character)
        score(character, () => {
          if(scale[key]) {
            scale[key].map(queueAttackRelease);
          }
        })
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

function clearAcknowledge(code) {
  delete forceCache[code]
}

function select(event) {
  clearAcknowledge('menu-select')
  const { menuKey, menu, menuIndex } = $.learn()
  const { list } = menu[menuKey]
  const song = list[menuIndex]

  $.teach({ mode: modes.loading, track: song.label })

  fetch(song.url)
    .then((res) => res.text())
    .then(lyrics => {
      const lines = lyrics.split('\n')
      $.teach({
        streak: 0,
        maxStreak: 0,
        message: '',
        mode: modes.ready,
        lines,
        readyCount: 3,
        currentLine: lines[0],
        correct: 0,
        attempts: 0,
        line: 0
      })

      readyCountdown()
    }).catch(e => {
      console.error(e)
      $.teach({ modes: modes.menu })
    })
}

function readyCountdown() {
  const { readyCount } = $.learn()

  const nextCount = readyCount - 1

  if(nextCount < 0) {
    startRound()
    return
  }

  setTimeout(() => {
    $.teach({ readyCount: nextCount })
    readyCountdown()
  }, 1000)
}

function startRound() {
  $.teach({ timeLeft: 60, mode: modes.game })
  tickDown()
}

function endRound() {
  $.teach({
    mode: modes.summary,
    summaryCount: 4
  })
  summaryCountdown()
}

function summaryCountdown() {
  const { summaryCount } = $.learn()

  const nextCount = summaryCount - 1

  if(nextCount < 0) {
    return
  }

  setTimeout(() => {
    $.teach({ summaryCount: nextCount })
    summaryCountdown()
  }, 1000)
}

function tickDown() {
  const { timeLeft } = $.learn()

  const nextTime = timeLeft - 1
  if(nextTime < 0) {
    endRound()
    return
  }

  setTimeout(() => {
    $.teach({ timeLeft: nextTime })
    tickDown()
  }, 1000)
}

const menuRPC = {
  'a': (params) => {
    forceAcknowledge('menu-select', params.value, select)
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
      $.teach({ mode: modes.consent })
    })
  },
  'up': (params) => {
    toggleSpam('up', params.value, () => {
      document.activeElement.blur()
      const { menuKey, menu, menuIndex } = $.learn()
      const { list } = menu[menuKey]
      const index = mod((menuIndex - 1), list.length)
      $.teach({
        menuIndex: index,
      })
    })
  },
  'down': (params) => {
    toggleSpam('down', params.value, () => {
      document.activeElement.blur()
      const { menuKey, menu, menuIndex } = $.learn()
      const { list } = menu[menuKey]
      const index = mod((menuIndex + 1), list.length)
      $.teach({
        menuIndex: index,
      })
    })
  },
  'left': (params) => {
    toggleSpam('left', params.value, () => {
      document.activeElement.blur()
      const { menuKey, menu } = $.learn()
      const keys = Object.keys(menu)
      const index = mod((keys.indexOf(menuKey) - 1), keys.length)
      $.teach({
        menuIndex: 0,
        menuKey: keys[index]
      })
    })
  },
  'right': (params) => {
    toggleSpam('right', params.value, () => {
      document.activeElement.blur()
      const { menuKey, menu } = $.learn()
      const keys = Object.keys(menu)
      const index = mod((keys.indexOf(menuKey) + 1), keys.length)
      $.teach({
        menuIndex: 0,
        menuKey: keys[index]
      })
    })
  },
}

const consentRPC = {
  'a': (params) => {
    forceAcknowledge('consent-a', params.value, accept)
  },
  'b': (params) => {
    if(params.value === 1) {
      decline()
    }
  },
}

const summaryRPC = {
  'a': (params) => {
    forceAcknowledge('summary-confirm', params.value, acknowledgeSummary)
  },
}

function acknowledgeSummary() {
  clearAcknowledge('summary-confirm')
  $.teach({ mode: modes.menu })
}

function getLinedPaper(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}



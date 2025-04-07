import elf from '@silly/elf'
import { render } from '@sillonious/saga'
import diffHTML from 'diffhtml'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { overrideButton, checkButton, checkAxis } from './debug-gamepads.js'

const modes = {
  game: 'game',
  app: 'app',
  settings: 'settings',
  pause: 'pause',
  tutorial: 'tutorial',
}

export const systemMenu = {
  favorites: {
    label: "Favorites",
    list: [
      /*
      {
        label: 'Tutorial',
        mode: modes.tutorial
      },
      */
      {
        label: 'Cool Chat',
        url: '/app/cool-chat'
      },
      {
        label: 'Song Wave',
        url: '/app/couch-coop?rom=song-wave'
      },
      {
        label: 'Typo Hero',
        url: '/app/paper-pocket?rom=typo-hero'
      },
      {
        label: 'Jam Band',
        url: '/app/couch-coop?rom=jam-band&variation=pro'
      },
      {
        label: 'Rookie Mistakes',
        url: '/app/couch-coop?rom=jam-band&variation=elegant'
      },
      {
        label: 'Paper Nautiloids',
        url: '/app/paper-pocket?rom=paper-nautiloids'
      },
      {
        label: 'Final Boss',
        url: '/app/paper-pocket?rom=final-boss'
      },
      {
        label: 'Jam Session',
        url: '/app/paper-pocket?rom=jam-session'
      },
      {
        label: 'Silly Script',
        url: '/app/paper-pocket?rom=silly-script'
      },
      {
        label: 'Sonic &amp; Knuckles',
        url: '/app/sonic-knuckles'
      },
    ]
  },
  apps: {
    label: "Apps",
    list: [
      {
        label: 'Map',
        url: '/app/middle-earth'
      },
      {
        label: 'Secure Mail',
        url: '/app/secure-mail'
      },
      {
        label: 'Secure Messenger',
        url: '/app/secure-messenger'
      },
      {
        label: 'Bulletin Board',
        url: `/app/bulletin-board?src=/private/boards/${self.crypto.randomUUID()}.json&group=${self.crypto.randomUUID()}`
      },
      {
        label: 'Public TV',
        url: '/app/public-broadcast'
      },
      {
        label: 'Draw Term 98',
        url: '/app/draw-term'
      },
    ]
  },
  art: {
    label: "Art",
    list: [
      {
        label: 'Chalk Board',
        url: '/app/chalk-board'
      },
      {
        label: 'Paint',
        url: '/app/paint-app'
      },
    ]
  },
  music: {
    label: "Music",
    list: [
      {
        label: 'Final Boss',
        url: '/app/final-boss'
      },
      {
        label: 'Dial Tone',
        url: '/app/dial-tone'
      },
      {
        label: 'Sillyz Ocarina',
        url: '/app/sillyz-ocarina'
      },
      {
        label: 'Music Walk',
        url: '/app/music-walk'
      },
    ]

  },
  code: {
    label: "Coding",
    list: [
      {
        label: 'Camera Desktop',
        url: '/app/camera-desktop'
      },
      {
        label: 'Irix Launcher',
        url: '/app/irix-launcher'
      },
      {
        label: 'Code Module',
        url: '/app/code-module?src=/public/elves/code-module.js'
      },
      {
        label: 'Hyper Script',
        url: '/app/hyper-script'
      },
      {
        label: 'Generic Park',
        url: '/app/generic-park'
      },
      {
        label: 'Collaborative Text',
        url: `/app/simpleton-client?src=/private/text/${new Date().toISOString()}/${self.crypto.randomUUID()}.saga`
      },
      {
        label: 'File System',
        url: '/app/file-system'
      },
    ]
  },
  templates: {
    label: "Templates",
    list: [
      {
        label: 'Swipe Swipe',
        url: '/app/swipe-swipe'
      },
    ]
  }
}

Tone.Transport.start();

let current
// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

const themes = ['lightgray', 'firebrick','darkorange','gold','mediumseagreen','dodgerblue','mediumpurple']
const bpmOptions = ['20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220', '240', '280', '300', '320', '340', '360']
const noteDurationOptions = ['4m', '2m', '1m', '1n', '2n', '4n', '8n', '16n', '32n', '64n']

const fontSizes = ['tiny', 'small', 'regular', 'large', 'huge']
const fontSizeMap = {
  tiny: '10px',
  small: '13px',
  regular: '16px',
  large: '18px',
  huge: '21px',
}

const fontFamilies = ['recursive', 'arial', 'verdana', 'helvetica', 'tahoma', 'times new roman', 'georgia', 'garamond', 'palatino']
const fontFamilyMap = {
  recursive: "'Recursive', 'Avenir', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', 'Verdana', sans-serif",
  arial: "'Arial', sans-serif",
  verdana: "'Verdana', sans-serif",
  helvetica: "'Helvetica', sans-serif",
  'times new roman': "'Times New Roman', serif",
  georgia: "'Georgia', serif",
  garamond: "'Garamond', serif",
  palatino: "'Palatino', serif",
}

const tutorialModes = {
  welcome: 'welcome',
  about: 'about',
  system: 'system',
  options: 'options',
  pause: 'pause',
  ready: 'ready',
}

const tutorialRenderers = {
  [tutorialModes.welcome]: () => {
    return `
# Welcome

Arrow keys (wasd) will move you around. Press right or button A to "Affirm" and continue.

Press X to "eXperience" with the tutorial video.
    `
  },
  [tutorialModes.about]: () => {
    return `
# About
The Paper Pocket is a living prototype video game console system, portable electrical outlet, computer, music player, VCR, video player, video editor, roommate, camera, alarm clock, toaster, flashlight, strobe light, skateboarder, soccer player, tape player, chef, detective and friend who is owned by YOU!

<div
style: max-width: 6in; margin: auto;
html: <a href="https://adventuretime.fandom.com/wiki/BMO" target="_blank">BMO Wiki</a>

@ Finn
> Hey. That's plagiarism.
    `
  },
  [tutorialModes.system]: () => {
    return `
# Console
Press 'PaperPocket' or your "OS" key to toggle the in-screen controls.
    `
  },
  [tutorialModes.options]: () => {
    return `
# Settings
Press 'Options' or control on a keyboard or the select/options button on your gamepad to configure the system.

To configure the Paper Pocket with more granularity, the code is below.

<code-module
src: /public/elves/paper-pocket.js
key: code-1
    `
  },
  [tutorialModes.pause]: () => {
    return `
# Applications
Press 'Start' or alt/options on a keyboard or the start/pause button on your gamepad to switch applications'

Write your own applications using the SDK provided below.

<code-module
src: /public/elf.js
key: code-2
    `
  },
  [tutorialModes.ready]: () => {
    return `
# Ready
Your personal computing device is configured. Reactivate the tutorial from the State menu at any time.

<div
style: max-width: 6in; margin: auto;
html: If you think this entire thing is ridiculous. Try and <button data-escape="">ESC</button>ape.

Move right or "A"ffirm to continue.
    `
  },
}

const $ = elf('paper-pocket', {
  fullScreen: getScreenPreference(),
  theme: getTheme(),
  instrument: getInstrument(),
  fontSize: getFontSize(),
  fontFamily: getFontFamily(),
  bpm: getBpm(),
  noteDuration: getNoteDuration(),
  rom: 'final-boss',
  mode: startMode(),
  backMode: startMode(),
  settingsKey: 'instrument',
  pauseKey: 'favorites',
  pauseIndex: 0,
  tutorialIndex: 0,
  tutorial: Object.keys(tutorialModes),
  settings: {
    instrument: {
      label: 'Instrument',
      description: 'The sound of the console',
      options: getInstruments(),
      value: getInstrument()
    },
    theme: {
      label: 'Theme',
      description: 'The color of the console',
      options: getThemes(),
      value: getTheme()
    },
    fontSize: {
      label: 'Font Size',
      description: 'The size of words and numbers.',
      options: getFontSizeOptions(),
      value: getFontSize(),
    },
    fontFamily: {
      label: 'Font Family',
      description: 'The shapes of the letters.',
      options: getFontFamilyOptions(),
      value: getFontFamily(),
    },
    bpm: {
      label: 'Beats per minute',
      description: 'The aural speed of the console.',
      options: getBpmOptions(),
      value: getBpm()
    },
    noteDuration: {
      label: 'Note Duration',
      description: 'The length of the played notes.',
      options: getNoteDurationOptions(),
      value: getNoteDuration()
    },
    invertY: {
      label: 'Invert Y-Axis',
      description: 'Up is down, down is up.',
      options: ['normal','inverted'],
      value: 'inverted',
    },
    debug: {
      label: 'Debugger',
      description: 'Toggle the debugger',
      options: ['hide', 'show'],
      value: 'hide'
    },
  },
  pause: systemMenu
})

function startMode() {
  return localStorage.getItem('paper-pocket/tutorialComplete') === "true"
    ? modes.game
    : modes.tutorial
}

export function getFontSizeOptions() {
  return fontSizes
}

export function setFontSize(fontSize) {
  localStorage.setItem('paper-pocket/fontSize', fontSize)
  $.teach({ fontSize })
}

export function getFontSize() {
  return localStorage.getItem('paper-pocket/fontSize') || 'regular'
}

export function getFontFamilyOptions() {
  return fontFamilies
}

export function setFontFamily(fontFamily) {
  localStorage.setItem('paper-pocket/fontFamily', fontFamily)
  $.teach({ fontFamily })
}

export function getFontFamily() {
  return localStorage.getItem('paper-pocket/fontFamily') || 'recursive'
}

export function getInstruments() {
  return instruments
}

export function setInstrument(instrument) {
  loadInstrument(instrument)
  localStorage.setItem('paper-pocket/instrument', instrument)
  $.teach({ instrument })
}

export function getInstrument() {
  return localStorage.getItem('paper-pocket/instrument') || 'violin'
}

let ready

function loadInstrument(instrument) {
  ready = false
  current = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/"
  })

  Tone.loaded().then(function() {
    ready = true
    Tone.Transport.bpm.value = parseInt(getBpm())
    current.release = .5;
    current.toDestination();
  })

}

loadInstrument(getInstrument())

export function getScreenPreference() {
  return localStorage.getItem('paper-pocket/screenPreference') || false
}

export function setScreenPreference(preference) {
  localStorage.setItem('paper-pocket/screenPreference', preference)
  $.teach({ fullScreen: preference })
}



export function getThemes() {
  return themes
}

export function setTheme(theme) {
  localStorage.setItem('paper-pocket/theme', theme)
  $.teach({ theme })
}

export function getTheme() {
  return localStorage.getItem('paper-pocket/theme') || 'lightgray'
}

export function getBpmOptions() {
  return bpmOptions
}

export function setNoteDuration(duration) {
  localStorage.setItem('paper-pocket/note-duration', duration)
  $.teach({ noteDuration: duration })
}

export function getNoteDuration() {
  return localStorage.getItem('paper-pocket/note-duration') || '4n'
}

export function getNoteDurationOptions() {
  return noteDurationOptions
}

export function setBpm(bpm) {
  Tone.Transport.bpm.value = parseInt(bpm)
  localStorage.setItem('paper-pocket/bpm', bpm)
  $.teach({ bpm })
}

export function getBpm() {
  return localStorage.getItem('paper-pocket/bpm') || '80'
}



const attacking = {}

export function attack(note) {
  if(!ready || attacking[note]) return
  current.triggerAttack(Tone.Frequency(note, "midi").toNote());
  attacking[note] = true
}

export function attackRelease(note, callback=()=>null, time=getNoteDuration()) {
  if(ready) {
    current.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), time);
    attacking[note] = true
  }

  setTimeout(callback, Tone.Time(time).toMilliseconds())
}

export function release(note) {
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!ready) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
}

const quantizeInterval = "4n"; // Adjust as needed

let latestCallback = null; // Store the most recent callback
let isScheduled = false; // Prevent duplicate scheduling

// Schedule a repeating event that fires on every 16th note
Tone.Transport.scheduleRepeat((time) => {
  if (latestCallback) {
    latestCallback(time); // Execute the most recent user input
    latestCallback = null; // Reset after execution
    isScheduled = false; // Allow new inputs
  }
}, quantizeInterval);

export function quantize(callback) {
  if (!isScheduled) {
    latestCallback = callback; // Store latest callback
    isScheduled = true; // Prevent multiple triggers per 16n
  }
};

$.draw((target) => {
  if(target.innerHTML) return
  const { rom, mode, fullScreen, theme } = $.learn()
  return `
    <div class="chrome" style="--theme: ${theme}" data-full="${fullScreen}">
      <div class="widget-frame">
        <div class="viewport">
          <div class="super-items">
            <button key="os" class="clear" data-press="os">
              PaperPocket
            </button>
          </div>
          <div class="system"></div>
          <div class="game">
            <${rom}></${rom}>
          </div>
          <div class="menu-items">
            <button key="options" class="clear select" data-press="select">
              Settings
            </button>
            <button key="start" class="clear start" data-press="start">
              Start
            </button>
          </div>
        </div>
      </div>

      <div class="controller">
        <fieldset class="gamepad-grid" tab-index="1">
          <button key="a" class="green" data-press="a">A</button>
          <button key="b" class="red" data-press="b">B</button>
          <button key="x" class="blue" data-press="x">X</button>
          <button key="y" class="yellow" data-press="y">Y</button>
          <button key="up" class="gray" data-press="up">
            <sl-icon name="caret-up-fill"></sl-icon>
          </button>
          <button key="down" class="gray" data-press="down">
            <sl-icon name="caret-down-fill"></sl-icon>
          </button>
          <button key="left" class="gray" data-press="left">
            <sl-icon name="caret-left-fill"></sl-icon>
          </button>
          <button key="right" class="gray" data-press="right">
            <sl-icon name="caret-right-fill"></sl-icon>
          </button>
        </fieldset>
      </div>
    </div>
  `
}, {
  beforeUpdate: (target) => {
    {
      if(!target.mounted) {
        target.mounted = true
        const rom = target.getAttribute('rom')
        if(rom) $.teach({ rom })
      }
    }
  },
  afterUpdate: (target) => {
    {
      const chrome = target.querySelector('.chrome')
      chrome.dataset.full = $.learn().fullScreen
    }

    {
      const { mode } = $.learn()

      const menuNode = target.querySelector('.system')
      if(mode !== 'game' && menuNode) {
        diffHTML.innerHTML(menuNode, renderMode())
      }
    }

    {
      const { mode } = $.learn()
      if(target.dataset.mode !== mode) {
        target.dataset.mode = mode
      }
    }

    {
      const { settingsKey } = $.learn()

      if(target.settingsKey !== settingsKey) {
        target.settingsKey = settingsKey
        const active = target.querySelector('.setting.focused')

        if(active) {
          active.scrollIntoView()
        }
      }
    }

    {
      const active = target.querySelector('.setting.focused .option.selected')
      if(active) {
        active.scrollIntoView({
          block: "nearest",  // Keeps the vertical position as close as possible
          inline: "center"    // Scrolls only in the inline direction
        });
      }
    }

    {
      const active = target.querySelector('.menu-link.active')
      if(active) {
        active.scrollIntoView()
      }
    }


    {
      const { theme } = $.learn()
      if(target.theme !== theme) {
        target.theme = theme
        document.body.style.setProperty('--root-theme', theme)
      }
    }

    {
      const { fontSize } = $.learn()
      if(target.fontSize !== fontSize) {
        target.fontSize = fontSize
        document.documentElement.style.setProperty('--font-size-root', fontSizeMap[fontSize])
      }
    }

    {
      const { fontFamily } = $.learn()
      if(target.fontFamily !== fontFamily) {
        target.fontSize = fontFamily
        document.documentElement.style.setProperty('--font-family', fontFamilyMap[fontFamily])
      }
    }

    {
      const { mode, tutorialIndex } = $.learn()
      if(mode === modes.tutorial && target.lastTutorial !== tutorialIndex) {
        target.lastTutorial = tutorialIndex
        target.querySelector('.tutorial-window').scrollTo({ top: 0 });
      }
    }

    {
      recoverElves(target, 'code-module')
    }
  },
})

function renderMode() {
  const { mode, tutorialIndex } = $.learn()

  if(mode === modes.settings) {
    const { settings, settingsKey } = $.learn()

    const list = Object.keys(settings).map((key, i) => {
      const setting = settings[key]
      return `
        <div aria-role="button" class="setting ${settingsKey === key ? 'focused':''}" data-key="${key}">
          <div class="setting-label">
            ${setting.label}
          </div>
          <div class="setting-description">
            ${setting.description}
          </div>
          <div class="options-list">
            <div class="setting-options">
              ${setting.options.map((x) => {
                return `
                  <button data-setting="${key}" data-value="${x}" class="option ${setting.value === x?'selected':''}">
                    ${x}
                  </button>
                `
              }).join('')}
            </div>
          </div>
        </div>
      `
    }).join('')

    return `
      <div class="menu-list">
        ${list}
      </div>
    `
  }

  if(mode === modes.pause) {
    const { pause, pauseIndex, pauseKey } = $.learn()

    return renderPauseMenu(pause, pauseIndex, pauseKey)
  }

  if(mode === modes.app) {
    const { app } = $.learn()

    return `
      <iframe src="${app}" title="app"></iframe>
    `
  }

  if(mode === modes.tutorial) {
    return `
      <div class="tutorial-window">
        <tutorial${tutorialIndex}>
          ${renderTutorial()}
        </tutorial${tutorialIndex}>
      </div>
    `
  }
}

export function renderPauseMenu(menu, pauseIndex, pauseKey) {
  const { list, label } = menu[pauseKey]

  const items = list.map((item, i) => {
    const { label, mode, url } = item
    return `
      <button ${url? `data-href="${url}"`:''} ${mode ? `data-mode="${mode}"`:''} data-index="${i}" class="menu-link ${pauseIndex === i ? 'active':''}">
        ${label}
      </button>
    `
  }).join('')

  return `
    <div class="pause-menu">
      <div class="pause-label">${label}</div>
      <div class="pause-list">
        ${items}
      </div>
    </div>
  `
}

function renderTutorial() {
  const { tutorial, tutorialIndex } = $.learn()

  const renderer = tutorialRenderers[tutorial[tutorialIndex]]
  return render(renderer())
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

const appRPC = {
  'a': (params) => {
  },
  'b': (params) => {
  },
  'x': (params) => {
  },
  'y': (params) => {
  },
  'lb': (params) => {
  },
  'rb': (params) => {
  },
  'lt': (params) => {
  },
  'rt': (params) => {
  },
  'up': (params) => {
  },
  'down': (params) => {
  },
  'left': (params) => {
  },
  'right': (params) => {
  },
}


const settingsRPC = {
  'a': (params) => {
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
      toggleSettings()
    })
  },
  'x': (params) => {
  },
  'y': (params) => {
  },
  'lb': (params) => {
  },
  'rb': (params) => {
  },
  'lt': (params) => {
  },
  'rt': (params) => {
  },
  'up': (params) => {
    toggleSpam('up', params.value, () => {
      document.activeElement.blur()
      const { settingsKey, settings } = $.learn()
      const keys = Object.keys(settings)
      const index = mod((keys.indexOf(settingsKey) - 1), keys.length)
      $.teach({
        settingsKey: keys[index]
      })
    })
  },
  'down': (params) => {
    toggleSpam('down', params.value, () => {
      document.activeElement.blur()
      const { settingsKey, settings } = $.learn()
      const keys = Object.keys(settings)
      const index = mod((keys.indexOf(settingsKey) + 1), keys.length)
      $.teach({
        settingsKey: keys[index]
      })
    })
  },
  'left': (params) => {
    toggleSpam('left', params.value, () => {
      document.activeElement.blur()
      const { settingsKey, settings } = $.learn()
      const { options, value } = settings[settingsKey]

      const index = options.indexOf(value)

      const nextIndex = mod(index - 1, options.length)
      const nextValue = options[nextIndex]
      settingsChange(settingsKey, nextValue)

      $.teach({
        value: nextValue
      }, selectedSettingsReducer)
    })
  },
  'right': (params) => {
    toggleSpam('right', params.value, () => {
      document.activeElement.blur()
      const { settingsKey, settings } = $.learn()
      const { options, value } = settings[settingsKey]

      const index = options.indexOf(value)

      const nextIndex = mod(index + 1, options.length)
      const nextValue = options[nextIndex]
      settingsChange(settingsKey, nextValue)

      $.teach({
        value: options[nextIndex]
      }, selectedSettingsReducer)
    })
  },
}

const sideEffects = {
  theme: (value) => {
    setTheme(value)
  },
  bpm: (value) => {
    setBpm(value)
  },
  noteDuration: (value) => {
    setNoteDuration(value)
  },
  instrument: (value) => {
    setInstrument(value)
  },
  fontSize: (value) => {
    setFontSize(value)
  },
  fontFamily: (value) => {
    setFontFamily(value)
  },
  debug: (value) => {
    setDebugger(value)
  }
}

function settingsChange(settingsKey, nextValue) {
  if(sideEffects[settingsKey]) {
    sideEffects[settingsKey](nextValue)
  }
}

function selectedSettingsReducer(state, payload) {
  const { settingsKey } = state
  return {
    ...state,
    settings: {
      ...state.settings,
      [settingsKey]: {
        ...state.settings[settingsKey],
        value: payload.value
      }
    }
  }
}

const pauseRPC = {
  'a': (params) => {
    if(params.value === 1) {
      launchItem()
    }
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
      toggleSettings()
    })
  },
  'x': (params) => {
  },
  'y': (params) => {
  },
  'lb': (params) => {
  },
  'rb': (params) => {
  },
  'lt': (params) => {
  },
  'rt': (params) => {
  },
  'up': (params) => {
    toggleSpam('up', params.value, () => {
      document.activeElement.blur()
      const { pauseKey, pause, pauseIndex } = $.learn()
      const { list } = pause[pauseKey]
      const index = mod((pauseIndex - 1), list.length)
      $.teach({
        pauseIndex: index,
      })
    })
  },
  'down': (params) => {
    toggleSpam('down', params.value, () => {
      document.activeElement.blur()
      const { pauseKey, pause, pauseIndex } = $.learn()
      const { list } = pause[pauseKey]
      const index = mod((pauseIndex + 1), list.length)
      $.teach({
        pauseIndex: index,
      })
    })
  },
  'left': (params) => {
    toggleSpam('left', params.value, () => {
      document.activeElement.blur()
      const { pauseKey, pause } = $.learn()
      const keys = Object.keys(pause)
      const index = mod((keys.indexOf(pauseKey) - 1), keys.length)
      $.teach({
        pauseIndex: 0,
        pauseKey: keys[index]
      })
    })
  },
  'right': (params) => {
    toggleSpam('right', params.value, () => {
      document.activeElement.blur()
      const { pauseKey, pause } = $.learn()
      const keys = Object.keys(pause)
      const index = mod((keys.indexOf(pauseKey) + 1), keys.length)
      $.teach({
        pauseIndex: 0,
        pauseKey: keys[index]
      })
    })
  },
}

function tutorialBack() {
  const { tutorialIndex } = $.learn()
  const index = tutorialIndex - 1

  if(index < 0) return

  $.teach({ tutorialIndex: index })
}

function tutorialNext() {
  const { tutorial, tutorialIndex } = $.learn()

  const index = tutorialIndex + 1
  if(index >= tutorial.length) {
    localStorage.setItem('paper-pocket/tutorialComplete', true)
    $.teach({ mode: modes.game })
  } else {
    $.teach({ tutorialIndex: index })
  }
}

const tutorialRPC = {
  'a': (params) => {
    forceAcknowledge('tutorial-start', params.value, () => {
      toggleSpam('a', params.value, () => {
        tutorialNext()
      })
    })
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
      tutorialBack()
    })
  },
  'x': (params) => {
  },
  'y': (params) => {
  },
  'lb': (params) => {
    toggleSpam('lb', params.value, () => {
      tutorialBack()
    })
  },
  'rb': (params) => {
    toggleSpam('rb', params.value, () => {
      tutorialNext()
    })
  },
  'lt': (params) => {
    toggleSpam('lt', params.value, () => {
      tutorialBack()
    })
  },
  'rt': (params) => {
    toggleSpam('rt', params.value, () => {
      tutorialNext()
    })
  },
  'up': (params, node) => {
    if(params.value === 1) {
      const container = node.querySelector('.tutorial-window')
      if(container) {
        fakeScrollUp(container, 40)
      }
    }
  },
  'down': (params, node) => {
    if(params.value === 1) {
      const container = node.querySelector('.tutorial-window')
      if(container) {
        fakeScrollDown(container, 40)
      }
    }
  },

  'left': (params) => {
    toggleSpam('left', params.value, () => {
      tutorialBack()
    })
  },
  'right': (params) => {
    toggleSpam('right', params.value, () => {
      tutorialNext()
    })
  },
}



$.when('json-rpc', '.system', (event) => {
  const { method, params } = event.detail
  const { mode } = $.learn()

  const node = event.target.closest($.link)

  if(mode === modes.app) {
    if(appRPC[method]) {
      appRPC[method](params)
    }
  }


  if(mode === modes.settings) {
    if(settingsRPC[method]) {
      settingsRPC[method](params)
    }
  }

  if(mode === modes.pause) {
    if(pauseRPC[method]) {
      pauseRPC[method](params)
    }
  }

  if(mode === modes.tutorial) {
    if(tutorialRPC[method]) {
      tutorialRPC[method](params, node)
    }
  }
})

function standardAction(code) {
  return (target, params) => {
    const { rom, mode } = $.learn()

    const node = mode === modes.game
      ? target.querySelector(rom)
      : target.querySelector('.system')
    notification(node, code, params)
  }
}

const buttons = {
  a: 0,
  b: 1,
  x: 3,
  y: 2,
  lb: 4,
  rb: 5,
  lt: 6,
  rt: 7,
  select: 8,
  start: 9,
  ls: 10,
  rs: 11,
  up: 12,
  down: 13,
  left: 14,
  right: 15,
  os: 16
}

const actions = {
  a: standardAction('a'),
  b: standardAction('b'),
  x: standardAction('x'),
  y: standardAction('y'),
  lb: standardAction('lb'),
  rb: standardAction('rb'),
  lt: standardAction('lt'),
  rt: standardAction('rt'),
  ls: standardAction('ls'),
  rs: standardAction('rs'),
  select: standardAction('select'),
  start: standardAction('start'),
  up: standardAction('up'),
  down: standardAction('down'),
  left: standardAction('left'),
  right: standardAction('right'),
}

function notification(node, method, params) {
  if(node) {
    node.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: method,
        params
      }
    }))
  }
}

const modeEffects = {
  [modes.tutorial]: () => {
    clearAcknowledge('tutorial-start')
    localStorage.setItem('paper-pocket/tutorialComplete', false)
    $.teach({ tutorialIndex: 0, mode: modes.tutorial })
  }
}

function triggerModeEffects(mode) {
  if(modeEffects[mode]) {
    modeEffects[mode]()
  }
}

function launchItem(event) {
  const { pauseKey, pause, pauseIndex } = $.learn()
  const { list } = pause[pauseKey]
  const { url, mode } = list[pauseIndex]

  if(url) {
    window.location.href = url
    return
  }

  if(mode) {
    triggerModeEffects(mode)
    $.teach({ mode, app: null })
  }
}

$.when('click', '.menu-link', (event) => {
  const { href, mode, index } = event.target.dataset

  const pauseIndex = parseInt(index)

  if(mode) {
    triggerModeEffects(mode)
    $.teach({ mode, app: null, pauseIndex })
    return
  }

  if(href) {
    window.location.href = href
    $.teach({ pauseIndex })
    return
  }
})


function toggleSettings () {
  const { mode, backMode } = $.learn()

  if(mode !== modes.settings) {
    $.teach({
      mode: modes.settings
    })
  } else {
    $.teach({ mode: backMode })
  }
}

function togglePause (event) {
  const { mode, backMode } = $.learn()

  if(mode !== modes.pause) {
    $.teach({
      mode: modes.pause
    })
  } else {
    $.teach({ mode: backMode })
  }

}


$.when('click', '.setting', (event) => {
  const { key } = event.target.dataset
  $.teach({ settingsKey: key })
})

$.when('click', '.setting.focused .option', () => {
  const { value } = event.target.dataset

  const { settingsKey } = $.learn()

  settingsChange(settingsKey, value)

  $.teach({
    value
  }, selectedSettingsReducer)
})


$.when('contextmenu', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('dblclick', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('touchcancel', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('touchend', '[data-press]', (event) => {
  event.preventDefault()
  return false
})

$.when('pointerdown', '[data-press]', (event) => {
  const { press } = event.target.dataset
  overrideButton(0, buttons[press], 1)
})

$.when('pointerup', '[data-press]', (event) => {
  const { press } = event.target.dataset
  overrideButton(0, buttons[press], 0)
})

const keyFlips = {
  Meta: keyFlipper(0, buttons.os),
  Alt: keyFlipper(0, buttons.start),
  Control: keyFlipper(0, buttons.select),
  ArrowUp: keyFlipper(0, buttons.up),
  w: keyFlipper(0, buttons.up),
  W: keyFlipper(0, buttons.up),
  ArrowDown: keyFlipper(0, buttons.down),
  S: keyFlipper(0, buttons.down),
  s: keyFlipper(0, buttons.down),
  ArrowRight: keyFlipper(0, buttons.right),
  d: keyFlipper(0, buttons.right),
  D: keyFlipper(0, buttons.right),
  ArrowLeft: keyFlipper(0, buttons.left),
  a: keyFlipper(0, buttons.left),
  A: keyFlipper(0, buttons.left),
  j: keyFlipper(0, buttons.a),
  J: keyFlipper(0, buttons.a),
  k: keyFlipper(0, buttons.b),
  K: keyFlipper(0, buttons.b),
  l: keyFlipper(0, buttons.x),
  L: keyFlipper(0, buttons.x),
  h: keyFlipper(0, buttons.y),
  H: keyFlipper(0, buttons.y),
  u: keyFlipper(0, buttons.lb),
  U: keyFlipper(0, buttons.lb),
  i: keyFlipper(0, buttons.rb),
  I: keyFlipper(0, buttons.rb),
  y: keyFlipper(0, buttons.lt),
  Y: keyFlipper(0, buttons.lt),
  o: keyFlipper(0, buttons.rt),
  O: keyFlipper(0, buttons.rt),
  q: keyFlipper(0, buttons.ls),
  Q: keyFlipper(0, buttons.ls),
  e: keyFlipper(0, buttons.rs),
  E: keyFlipper(0, buttons.rs),
}

function keyFlipper(slot, button) {
  return (value) => {
    overrideButton(slot, button, value)
  }
}


document.addEventListener('keydown', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](1)
  }
})

document.addEventListener('keyup', (event) => {
  if(keyFlips[event.key]) {
    keyFlips[event.key](0)
  }
})

function standardFire(player, node, code) {
  if(player[code]) {
    actions[code](node, {
      type: 'click',
      value: 1
    })
  } else {
    actions[code](node, {
      type: 'click',
      value: 0
    })
  }
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

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

const forceCache = {}

// essentially make sure the button was released to ensure the screen
function forceAcknowledge(code, value, callback) {
  if(value === 0 && !forceCache[code]) {
    forceCache[code] = 0
    return
  }
  if(forceCache[code] === 1 || (forceCache[code] === 0 && value === 1)) {
    forceCache[code] = 1
    callback()
  }
}

function clearAcknowledge(code) {
  delete forceCache[code]
}


function player1(code) {
  return checkButton(0, buttons[code])
}

function gameLoop(time) {
  const { paused } = $.learn()

  if(!paused) {
    const node = document.querySelector($.link)

    if(node) {
      const player = {
        a: player1('a'),
        b: player1('b'),
        x: player1('x'),
        y: player1('y'),
        lb: player1('lb'),
        rb: player1('rb'),
        lt: player1('lt'),
        rt: player1('rt'),
        select: player1('select'),
        start: player1('start'),
        ls: player1('ls'),
        rs: player1('rs'),
        up: player1('up'),
        down: player1('down'),
        left: player1('left'),
        right: player1('right'),
        os: player1('os'),
      }

      standardFire(player, node, 'a')
      standardFire(player, node, 'b')
      standardFire(player, node, 'x')
      standardFire(player, node, 'y')
      standardFire(player, node, 'lb')
      standardFire(player, node, 'rb')
      standardFire(player, node, 'lt')
      standardFire(player, node, 'rt')
      standardFire(player, node, 'ls')
      standardFire(player, node, 'rs')
      standardFire(player, node, 'up')
      standardFire(player, node, 'down')
      standardFire(player, node, 'left')
      standardFire(player, node, 'right')

      selectFire(player.select)

      startFire(player.start)

      toggleSpam('os', player.os, () => {
        toggleFullscreen()
      })
    }
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()

export function pause() {
  $.teach({ paused: true })
}

export function resume() {
  $.teach({ paused: false })
}

function selectFire(value) {
  const { mode } = $.learn()

  if(mode === modes.game) {
    toggleSpam('select', value, () => {
      $.teach({ backMode: modes.game })
      toggleSettings()
    })
    return
  }

  if(mode === modes.app) {
    toggleSpam('select', value, () => {
      $.teach({ backMode: modes.app })
      toggleSettings()
    })
    return
  }

  toggleSpam('select', value, () => {
    toggleSettings()
  })
}

function startFire(value) {
  const { mode } = $.learn()

  if(mode === modes.game) {
    toggleSpam('start', value, () => {
      $.teach({ backMode: modes.game })
      togglePause()
    })
    return
  }

  if(mode === modes.app) {
    toggleSpam('start', value, () => {
      $.teach({ backMode: modes.app })
      togglePause()
    })
    return
  }

  toggleSpam('start', value, () => {
    togglePause()
  })
}


function toggleFullscreen (event) {
  const { fullScreen } = $.learn()
  setScreenPreference(!fullScreen)
}

$.style(`
  & {
    display: block;
    height: 100%;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  & .chrome {
    background: var(--root-theme, lightgray);
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
    position: relative;
  }

  & .chrome::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  & .widget-frame {
    pointer-events: all;
    overflow: hidden;
  }

  & .game {
    display: none;
    overflow: auto;
    grid-area: main;
  }

  & .system {
    overflow: auto;
    grid-area: main;
    padding: 0 8px;
  }

  & .viewport {
    background: black;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: "header" "main" "footer";
    max-height: 100%;
    height: 100%;
  }

  & .yellow {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--yellow);
    color: rgba(255,255,255,.85);
  }

  & .yellow:hover,
  & .yellow:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--yellow);
    color: rgba(255,255,255,1);
  }

  & .blue {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--blue);
    color: rgba(255,255,255,.85);
  }

  & .blue:hover,
  & .blue:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--blue);
    color: rgba(255,255,255,1);
  }

  & .red {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--red);
    color: rgba(255,255,255,.85);
  }

  & .red:hover,
  & .red:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--red);
    color: rgba(255,255,255,1);
  }

  & .green {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--green);
    color: rgba(255,255,255,.85);
  }

  & .green:hover,
  & .green:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--green);
    color: rgba(255,255,255,1);
  }

  & .orange {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--orange);
    color: rgba(0,0,0,.85);
  }

  & .orange:hover,
  & .orange:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--orange);
    color: rgba(0,0,0,1);
  }

  & .purple {
    background: linear-gradient(rgba(255,255,255,.25), rgba(255,255,255,.5)), var(--purple);
    color: rgba(0,0,0,.85);
  }

  & .purple:hover,
  & .purple:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--purple);
    color: rgba(0,0,0,1);
  }

  & .clear {
    background: linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.65)), var(--root-theme, lightgray);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    border-radius: none;
    border-radius: 0;
    border: none;
    padding: .5rem;
    opacity: 1;
  }

  & .clear:hover,
  & .clear:focus {
    filter: brightness(3);
  }

  & .select {
    place-self: start;
  }

  & .start {
    place-self: end;
  }

  & .gray {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--gray);
    color: rgba(255,255,255,.85);
  }

  & .gray:hover,
  & .gray:focus {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.3)), var(--gray);
    color: rgba(255,255,255,1);
  }

  & .pastel {
    background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.75)), var(--gray);
    color: rgba(0,0,0,.5);
  }

  & .pastel:hover,
  & .pastel:focus {
    background: linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.3)), var(--gray);
    color: rgba(0,0,0,1);
  }


  & .chrome[data-full="true"] .widget-frame {
    padding: 0;
  }

  & .chrome[data-full="true"] .controller {
    display: none;
  }

  & .controller {
    pointer-events: none;
    padding-top: 1rem;
    text-align: center;
  }

  & .gamepad-grid {
    display: inline-grid;
    grid-template-columns: 45px 45px 45px 45px 45px;
    grid-template-rows: 45px 45px;
    grid-template-areas:
      "lb y up x rb"
      "b left down right a";
    border: none;
    padding: 16px;
    gap: 8px;
  }

  & .gamepad-grid:focus {
    background: white;
  }

  & .gamepad-grid button {
    pointer-events: all;
    width: 45px;
    height: 45px;
    display: grid;
    place-content: center;
    font-size: 24px;
    border: none;
    border-radius: 0;
    font-weight: bold;
    border-radius: 100%;
  }

  & [data-press="a"] {
    grid-area: a;
  }

  & [data-press="b"] {
    grid-area: b;
  }

  & [data-press="x"] {
    grid-area: x;
    transform: translateX(50%);
  }

  & [data-press="y"] {
    grid-area: y;
    transform: translateX(-50%);
  }

  & [data-press="up"] {
    grid-area: up;
    transform: translateY(5px);
  }

  & [data-press="left"] {
    grid-area: left;
    transform: translateX(5px);
  }

  & [data-press="down"] {
    grid-area: down;
  }

  & [data-press="right"] {
    grid-area: right;
    transform: translateX(-5px);
  }

  & .gamepad-grid button[data-press="lb"] {
    grid-area: lb;
    transform: translate(-20px, -10px);
    height: 35px;
    width: 35px;
  }

  & .gamepad-grid button[data-press="rb"] {
    grid-area: rb;
    transform: translate(30px, -10px);
    height: 35px;
    width: 35px;
  }

  & .super-items {
    display: grid;
    place-items: start;
  }

  & .super-items button {
    font-weight: bold;
    font-style: italic;
  }

  & .menu-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
  }

  & .tutorial-window {
    height: 100%;
    overflow: auto;
    background: white;
    padding: 8px;
  }

  & .pause-menu {
    height: 100%;
    overflow: auto;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .pause-label {
    color: rgba(255,255,255,1);
    background: linear-gradient(335deg, rgba(0,0,0,.25), rgba(0,0,0,.65)), var(--root-theme);
    padding: 4px 8px;
    margin-bottom: 8px;
    font-weight: light;
    font-size: 2rem;
  }

  & .menu-list {
    height: 100%;
    overflow: auto;
    background:
      linear-gradient(335deg, var(--root-theme, lightgray), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, lightgray);
  }

  & .options-list {
    overflow-x: auto;
    max-width: 100%;
  }

  & .setting {
    display: block;
    padding: 4px 8px;
    border: none;
    background: rgba(0,0,0,.15);
    color: white;
    display: inline-block;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
    margin-bottom: 4px;
  }

  & .setting:not(.focused) > * {
    pointer-events: none;
  }

  & .setting.focused .message-body {
    font-weight: bold;
  }

  & .setting-label {
    color: rgba(255,255,255,.85);
    font-weight: bold;
  }

  & .setting-description {
    color: rgba(255,255,255,.65);
  }

  & .setting.focused .setting-label {
    color: rgba(0,0,0,.85);
    font-weight: bold;
  }

  & .setting.focused .setting-description {
    color: rgba(0,0,0,.65);
  }

  & .setting-options {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }

  & .setting-options .option:not(.selected) {
    display: none;
  }

  & .setting.focused {
    color: black;
    background: white;
  }

  & .setting.focused .option {
    display: block;
  }

  & .option.selected {
    display: block;
  }

  & .option {
    border: none;
    border-radius: 2px;
    white-space: nowrap;
    padding: 4px 8px;
  }

  & .option.selected {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, black);
    color: white;
  }

  & .pause-list {
    overflow-y: visible;
  }

  & .menu-link {
    color: white;
    display: block;
    text-decoration: none;
    padding: 4px 8px;
    line-height: 1;
    text-align: left;
    background: transparent;
    border: none;
    font-weight: 600;
    opacity: .65;
  }

  & .menu-link.active {
    color: white;
    transform: scale(1.2);
    transform-origin: left center;
    font-weight: bold;
    opacity: 1;
    border-left: 2px solid var(--root-theme);
  }

  &[data-mode="game"] .game {
    display: block;
  }

  &[data-mode="game"] .system {
    display: none;
  }

  & .tutorial-window hypertext-address {
    text-transform: none;
    font-weight: bold;
    font-size: 2rem;
  }
`)

function fakeScrollUp(container, scrollStep=10) {
  container.scrollBy({ top: -scrollStep, behavior: 'smooth' });
}

function fakeScrollDown(container, scrollStep=10) {
  container.scrollBy({ top: scrollStep, behavior: 'smooth' });
}

$.when('click', '[data-escape]', () => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
})

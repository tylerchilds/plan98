import elf from '@silly/elf'
import Color from "colorjs.io"
import { consoleShow, consoleHide } from './plan98-console.js'
import {
  getInstruments,
  getInstrument,
  setInstrument,
  getThemes,
  setTheme,
  getTheme,
  attack,
  release,
  attackRelease
} from './paper-pocket.js'
import 'aframe'

const gridUnit = 16
const spatialOffset = 3

const orientation = {
	x: '0', y: '0', z: '0', yaw: '0', pitch: '0', roll: '0'
}

const camera = {
	x: '0', y: gridUnit, z: 8*gridUnit, yaw: '0', pitch: '0', roll: '0'
}

const lightnessStops = [
  [95, 120],
  [80, 105],
  [65, 90],
  [50, 75],
  [35, 60],
  [20, 45],
  [5, 30],
]

const start = 0;
const length = 360;
const reverse = false;
const colors = [...Array(13)].map((_, hueIndex) => {
  const hueFifths = mod(hueIndex * 7, 13)
  const step = ((length / 13) * hueFifths)
  const hue = reverse
    ? start - step
    : start + step

  return lightnessStops.map(([l, c], i) => {
    const name = `--wheel-${hueFifths}-${i}`
    const value = new Color('lch', [l, c, hue])
      .to('srgb')
      .toString({ format: 'hex' })

    return {
      name,
      value,
      block: hueFifths,
      inline: i
    }
  })
})

const colorVariables = colors.flatMap(x => x).map(({ name, value }) => `
  ${name}: ${value};
`).join('')


const modes = {
  game: 'game',
  settings: 'settings',
  pause: 'pause',
}

const center = 60

const $ = elf('paper-nautiloids', {
  samples: {},
  rows: 7,
  columns: 13,
  ratio: .1,
  tick: 0,
  room: '0001',
  instances: {},
  mode: modes.game,
  settingsKey: 'instrument',
  pauseKey: 'favorites',
  pauseIndex: 0,
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
    debug: {
      label: 'Debugger',
      description: 'Toggle the debugger',
      options: ['hide', 'show'],
      value: 'hide'
    },
  },
  pause: {
    favorites: {
      label: "Favorites",
      list: [
        {
          label: 'Irix Launcher',
          url: '/app/irix-launcher'
        },
        {
          label: 'Map',
          url: '/app/middle-earth'
        },
        {
          label: 'Draw Term 98',
          url: '/app/draw-term'
        },
        {
          label: 'File System',
          url: '/app/file-system'
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
        }
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
        }
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
})

function maybe(id, value, note) {
  if(value === 1) {
    yes(id, note)
  } else {
    no(id, note)
  }
}

function yes(id, note) {
  attack(note)
  mark(id, note)
}

function no(id, note) {
  release(note)
  unmark(id, note)
}

function mark(id, note) {
  updateNote({ id, note }, true)
}

function unmark(id, note) {
  const { instances } = $.learn()
  const { activeNotes } = instances[id]
  if(activeNotes[note]) {
    updateNote({ id, note }, false)
  }
}

function noteFromGrid(column, row) {
  const { columns } = $.learn()

  const base = center + 30;

  const evenColumn = column % 2 === 0

  const aboveMedian = column > parseInt(columns / 2)
  const octave = row * -12
  const interval = (parseInt(column / 2) * 2)

  return evenColumn
    ? base + octave + interval
    : base - 5 + octave + interval + (aboveMedian?12:0)
}

function colorFromGrid(column, row) {
  return colors[column][row]
}

function draw3d(data) {
	const {
		avatar,
		x, y, z,
		yaw, pitch, roll,
		args
	} = data
	return `
		<${avatar}
			id="${name}"
			position="${x} ${y} ${z}"
			rotation="${yaw} ${pitch} ${roll}"
			${args}
		></${avatar}>
	`
}

function position(priority) {
	return Object.keys(orientation).reduce((clean, key) => {
		if(priority[key]) {
			clean[key] = priority[key]
		}
		return clean
	}, {})
}

function reduceConflicts(conflicts) {
	return Object.keys(conflicts)
		.reduce((str, key) => {
			return `${str} ${key}="${conflicts[key]}"`
		}, '')
}

function aBox(priority, conflicts) {
	return {
		avatar: 'a-box',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}

function aText(priority, conflicts) {
	return {
		avatar: 'a-text',
		...orientation,
		...position(priority),
		args: reduceConflicts(conflicts)
	}
}


$.draw((target) => {
  const { mode, tick, instrument, instances, debuggerVisible, tileDistance } = $.learn()
  seed(target)
  if(!instances[target.id]) return

  if(mode === modes.settings) {
    return renderSettings()
  }

  if(mode === modes.pause) {
    return renderPause()
  }

  if(target.querySelector('.scene')) return

  return `
    <div class="game" style="${colorVariables}">
      <div class="scene">
        <a-scene device-orientation-permission-ui="enabled: false">
          <a-light type="ambient" color="white"></a-light>
          <a-light type="directional" intensity="0.3"></a-light>
          <a-entity
            cursor="rayOrigin: mouse"
            raycaster="near: 0.1; far: 100; objects: .note;"
          ></a-entity>
          <a-camera
            wasd-controls="enabled: false"
            look-controls="enabled: false"
            position="${camera.x} ${camera.y} ${camera.z}"
            rotation="${camera.yaw} ${camera.pitch} ${camera.roll}"
          ></a-camera>
          <a-entity class="grid"></a-entity>
        </a-scene>

      </div>
      <!--
      <div class="information"></div>
      -->
    </div>
  `
}, {
  afterUpdate: (target) => {
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
      const grid = target.querySelector('.grid')
      if(grid) {
        const { instances } = $.learn()

        const instance = instances[target.id]
        const { y, activeNotes } = instance

        const nodes = [y-3,y-2,y-1,y,y+1,y+2,y+3].map(createRow(instance)).join('')
        console.log({ activeNotes })

        requestAnimationFrame(() => {
          grid.innerHTML = nodes
        })
      }
    }

    {
      const info = target.querySelector('.information')
      if(info) {
        const { instances } = $.learn()
        const instance = instances[target.id]
        info.innerHTML = content(instance)
      }
    }
  }
})

function createRow(instance) {
  const { x, columns, rows, boxes, activeNotes } = instance
  return function row(row, yIndex) {
    if(!boxes) return ''

    return [x-3,x-2,x-1,x,x+1,x+2,x+3].map((column, xIndex) => {
      if(column<0||column>=columns||row<0||row>=rows) {
        return draw3d(
          aBox({
            x: gridUnit * (xIndex - 3),
            z: gridUnit * (yIndex) - 1,
            y: gridUnit/2,
            pitch: 0
          }, {
            wireframe: true,
            color: 'firebrick',
            width: gridUnit,
            depth: gridUnit,
            height: gridUnit,
          })
        )
      }
      const note = noteFromGrid(column, row)
      const box = boxes[`${row}-${column}`] || {}
      const color = colorFromGrid(mod(column, columns), mod(row, rows))
      const cube = draw3d(
        aBox({
          x: gridUnit *(xIndex - 3),
          z: gridUnit * (yIndex) - 1,
          y: activeNotes[note] ? - 2 : 0,
          pitch: 0
        }, {
          wireframe: box.revealed,
          color: color.value,
          height: gridUnit/4,
          material: activeNotes[note]?'emissive:#111; metalness:0.5':'',
          width: gridUnit,
          depth: gridUnit,
          'data-x': column,
          'data-y': row,
          class: 'note'
        })
      )

      const text = draw3d(
        aText({
          x: gridUnit *(xIndex - 3) - 2,
          z: gridUnit * (yIndex) - 1 + gridUnit/2,
          y: gridUnit/4+1,
        }, {
          value: note,
          width: gridUnit*4,
          height: gridUnit*4,
          opacity: .5,
          color: 'white',
        })
      )

      return `${cube}${text}`

    }).join('')
  }
}

function renderPause() {
  const { pause, pauseIndex, pauseKey } = $.learn()

  const { list, label } = pause[pauseKey]

  const items = list.map((item, i) => {
    const { label, url } = item
    return `
      <a href="${url}" class="menu-link ${pauseIndex === i ? 'active':''}">
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

function renderSettings() {
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




function content(instance) {
  const { finished, boxes, won, x, y, maxFlags, totalFlags } = instance
  if(finished) {
    return (won?`
      <div class="mini-overlay">
        <div class="game-dialog">
          You win! Play again?
        </div>
        <div class="game-actions">
          <button data-restart>New Game</button>
        </div>
      </div>
    `:`
      <div class="mini-overlay">
        <div class="game-dialog">
          Game over... Try again?
        </div>
        <div class="game-actions">
          <button data-restart>New Game</button>
        </div>
      </div>
    `)
  }
  const box = boxes[`${y}-${x}`] || {}

  const maxxedOut = maxFlags === totalFlags

  const note = noteFromGrid(x, y)
  return `
    <div class="mini-overlay" key="0011">
      <div class="game-dialog">
        ${box.revealed ? `There are ${box.count} rocks  nearby...` : (
          box.flagged
            ? `There is belief of elves in the rocks here.`
            : maxxedOut ? 'If every rock is an elf dwelling, no rocks are elf dwellings.' : 'Do you know of any elves here?'
        )}
      </div>
      <div class="game-actions" key="0010">
        <button data-note="${note}">
          Play: ${note}
        </button>
        ${box.revealed ?'':`
          ${box.flagged ? `
            <button data-flag data-row="${y}" data-column="${x}">
              False elf suspicion
            </button>
          `: `
            <button data-clear data-row="${y}" data-column="${x}">
              No Elves
            </button>
            ${maxxedOut ? ``: `
              <button data-flag data-row="${y}" data-column="${x}">
                Elvish Rocks
              </button>
            `}
          `}
        `}
      </div>
    </div>
  `

}

function launchItem(event) {
  const { pauseKey, pause, pauseIndex } = $.learn()
  const { list } = pause[pauseKey]
  const { url } = list[pauseIndex]
  window.location.href = url
}


function toggleSettings (event) {
  const { mode } = $.learn()
  const newMode = mode !== modes.settings ? modes.settings : modes.game
  $.teach({ mode: newMode })
}

function togglePause (event) {
  const { mode } = $.learn()
  const newMode = mode !== modes.pause ? modes.pause : modes.game
  $.teach({ mode: newMode })
}


function slideLeft(id) {
  const { instances } = $.learn()

  if(!instances[id]) return
  const { x } = instances[id]

  if(x<=0) return
  updateInstance({ id }, { x: x - 1 })
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, columns } = instances[id]

  if(x>=columns-1) return
  updateInstance({ id }, { x: x + 1 })
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  if(y<=-spatialOffset) return
  updateInstance({ id }, { y: y - 1 })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y, rows } = instances[id]

  if(y>=rows-1-spatialOffset) return
  updateInstance({ id }, { y: y + 1 })
}

$.style(`
  & {
    background: black;
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .pause-menu {
    height: 100%;
    overflow: auto;
  }

  & .pause-label {
    color: rgba(255,255,255,.5);
    padding: 8px;
    font-weight: bold;
  }


  & .menu-list {
    height: 100%;
    overflow: auto;
  }

  & .options-list {
    overflow-x: auto;
    max-width: 100%;
  }

  & .title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  & .game,
  & .settings {
    display: none;
    height: 100%;
  }

  &[data-mode="settings"] .settings {
    display: block;
    overflow: auto;
  }

  &[data-mode="game"] .game {
    display: block;
  }

  & .settings {
    padding: 2rem 1rem;
  }

  & select {
    background: #54796d;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 0;
    color: rgba(255,255,255,.65);
    padding: .5rem;
  }

  & .won {
    opacity: .85;
    pointer-events: none;
  }

  & .lost {
    opacity: 0;
    pointer-events: none;
  }

  & .information {
    pointer-events: none;
    position: absolute;
    inset: 3px;
    display: grid;
    place-items: end center;
    z-index: 9001;
  }

  & .mini-overlay {
    pointer-events: all;
    background: rgba(0,0,0,.85);
    border: 1px solid rgba(255,255,255,.5);
    color: rgba(255,255,255,.85);
    border-radius: 2px;
    width: 100%;
    max-width: 55ch;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .game-dialog {
    padding: 1rem 1rem 0;
  }

  & .game-actions {
    padding: .5rem 0;
  }
  & .game-actions button {
    border: none;
    border-radius: none;
    background: transparent;
    color: dodgerblue;
    padding: .5rem 1rem;
  }

  & .flagged::before {
    content: '%';
  }

  & .alive::before {
    content: '';
    background: rgba(255,255,255,.15);
    pointer-events: none;
    inset: 0;
    position: absolute;
    mix-blend-mode: soft-light;
  }

  & .setting {
    display: block;
    padding: 1rem;
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.5);
    display: grid;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
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

  & .setting {
    padding: 4px 8px;
    border: none;
    background: rgba(0,0,0,.85);
    color: white;
    display: inline-block;
    margin-bottom: 4px;
  }

  & .option {
    border: none;
    border-radius: 2px;
    white-space: nowrap;
    padding: 4px 8px;
  }

  & .option.selected {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--theme, black);
    color: white;
  }

  & .menu-link {
    color: rgba(255,255,255,.85);
    display: block;
    text-decoration: none;
    padding: 4px 8px;
    line-height: 1;
    font-size: 2rem;
    font-weight: 100;
  }

  & .menu-link.active {
    font-weight: bold;
    color: var(--theme, white);
  }
`)

$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { id } = event.target.closest($.link)
  const { instances, mode } = $.learn()

  if(mode === modes.game) {
    if(instances[id]) {
      const { x, y } = instances[id]
      const root = noteFromGrid(x, y+spatialOffset)

      const more = { root, id }

      if(musicRPC[method]) {
        musicRPC[method]({...params, ...more})
      }
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
})

$.when('click', '.note', (event) => {
  const { x, y } = event.target.dataset
  const note = noteFromGrid(parseInt(x), parseInt(y))
  attackRelease(note)
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

const musicRPC = {
  'a': (params) => {
    const note = params.root
    maybe(params.id, params.value, note)
  },
  'b': (params) => {
    const note = params.root + 7
    maybe(params.id, params.value, note)
  },
  'x': (params) => {
    const note = params.root + 2
    maybe(params.id, params.value, note)
  },
  'y': (params) => {
    const note = params.root + 9
    maybe(params.id, params.value, note)
  },
  'lb': (params) => {
    const note = params.root + 4
    maybe(params.id, params.value, note)
  },
  'rb': (params) => {
    const note = params.root + 11
    maybe(params.id, params.value, note)
  },
  'lt': (params) => {
    const note = params.root + 6
    maybe(params.id, params.value, note)
  },
  'rt': (params) => {
    const note = params.root + 13
    maybe(params.id, params.value, note)
  },
  'up': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('up', 150, () => {
        slideUp(params.id)
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('down', 150, () => {
        slideDown(params.id)
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('left', 150, () => {
        slideLeft(params.id)
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('right', 150, () => {
        slideRight(params.id)
      })
    }
  },
  'select': (params) => {
    toggleSpam('select', params.value, () => {
      toggleSettings()
    })
  },
  'start': (params) => {
    toggleSpam('start', params.value, () => {
      togglePause()
    })
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
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('up', 150, () => {
        const { settingsKey, settings } = $.learn()
        const keys = Object.keys(settings)
        const index = mod((keys.indexOf(settingsKey) - 1), keys.length)
        $.teach({
          settingsKey: keys[index]
        })
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('down', 150, () => {
        const { settingsKey, settings } = $.learn()
        const keys = Object.keys(settings)
        const index = mod((keys.indexOf(settingsKey) + 1), keys.length)
        $.teach({
          settingsKey: keys[index]
        })
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('left', 150, () => {
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
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('right', 150, () => {
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
    }
  },
  'select': (params) => {
    toggleSpam('select', params.value, () => {
      toggleSettings()
    })
  },
  'start': (params) => {
    toggleSpam('start', params.value, () => {
      togglePause()
    })
  },
}

const sideEffects = {
  theme: (value) => {
    setTheme(value)
  },
  instrument: (value) => {
    setInstrument(value)
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
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('up', 150, () => {
        const { pauseKey, pause, pauseIndex } = $.learn()
        const { list } = pause[pauseKey]
        const index = mod((pauseIndex - 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('down', 150, () => {
        const { pauseKey, pause, pauseIndex } = $.learn()
        const { list } = pause[pauseKey]
        const index = mod((pauseIndex + 1), list.length)
        $.teach({
          pauseIndex: index,
        })
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('left', 150, () => {
        const { pauseKey, pause } = $.learn()
        const keys = Object.keys(pause)
        const index = mod((keys.indexOf(pauseKey) - 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('right', 150, () => {
        const { pauseKey, pause } = $.learn()
        const keys = Object.keys(pause)
        const index = mod((keys.indexOf(pauseKey) + 1), keys.length)
        $.teach({
          pauseIndex: 0,
          pauseKey: keys[index]
        })
      })
    }
  },
  'select': (params) => {
    toggleSpam('select', params.value, () => {
      toggleSettings()
    })
  },
  'start': (params) => {
    toggleSpam('start', params.value, () => {
      togglePause()
    })
  },
}


/*
 Gamer Grid
 */
$.when('click', '[data-flag]', (event) => {
  requestIdleCallback(() => {
    const { row, column } = event.target.dataset
    const instance = getInstance(event.target)
    const { boxes, id, totalFlags, maxFlags } = instance

    if(totalFlags === maxFlags) return
    const { flagged } = boxes[`${row}-${column}`]
    const nextFlag = !flagged

    const flagCount = nextFlag ? totalFlags + 1 : totalFlags - 1
    updateBox({ id, x: column, y: row }, { flagged: nextFlag })

    updateInstance({ id }, { totalFlags: flagCount })
    victoryCondition(id)
  })
})

$.when('click', '[data-note]', (event) => {
  const { note } = event.target.dataset
  attackRelease(parseInt(note))
})

$.when('click', '[data-clear]', (event) => {
  requestIdleCallback(() => {
    const { row, column } = event.target.dataset
    const instance = getInstance(event.target)
    const { boxes, id, rows, columns } = instance
    const { flagged, mimed, count } = boxes[`${row}-${column}`]
    if(flagged) return
    infer(rows, columns, parseInt(row), parseInt(column), boxes)

    if(count === 0) {
      pow(id, rows, columns, parseInt(row), parseInt(column), boxes)
    }

    if(mimed) {
      updateBox({ id, x: column, y: row }, { revealed: true })
      updateInstance({ id }, { finished: true, won: false })
    } else {
      updateBox({ id, x: column, y: row }, { revealed: true })
    }

    victoryCondition(id)
  })
})

$.when('click', '[data-restart]', (event) => {
  event.target.closest($.link).seeded = false
  const { id } = getInstance(event.target)
  updateInstance({ id }, { finished: false, won: null })
})

function victoryCondition(id) {
  const { instances } = $.learn()
  const { boxes } = instances[id]
  const allMimes = Object.keys(boxes).filter((key) => boxes[key].mimed)
  const nonMimes = Object.keys(boxes).filter((key) => !boxes[key].mimed)

  const allMimesFlagged = allMimes.every(x => boxes[x].flagged)
  const nonMimesRevealed = nonMimes.every(x => boxes[x].revealed)

  if(allMimesFlagged || nonMimesRevealed) {
    updateInstance({ id }, { finished: true, won: true })
  }
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns, ratio, room } = $.learn() || {}

  const boxes = {}
  const mimes = {}
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      boxes[`${y}-${x}`] = {
        revealed: false,
        mimed: false,
        alive: false,
        count: 0,
        x,
        y
      }
    }
  }

  function ensureRandomMime() {
    const y = Math.floor(Math.random() * rows)
    const x = Math.floor(Math.random() * columns)
    const key = `${y}-${x}`
    if(boxes[key].mimed) {
      ensureRandomMime()
    } else {
      mimes[key] = self.crypto.randomUUID()
      boxes[key].mimed = true
    }
  }

  function countMimeula() {
    // oh no, the voice in this mime's head is "yo queiro taco bell"
     for(let y = 0; y < rows; y++) {
      for(let x = 0; x < columns; x++) {
        const count = infer(rows, columns, y, x, boxes)
        boxes[`${y}-${x}`].count = count
      }
    } 
  }
  const maxFlags = Math.floor(rows * columns * ratio)
  for(let i = 0; i < maxFlags; i++) {
    ensureRandomMime()
  }

  countMimeula()

  const id = target.id
  schedule(() => {
    updateInstance({ id }, {
      root: 60,
      x: Math.floor(columns/2),
      y: Math.floor(rows/2) - spatialOffset,
      id,
      rows,
      columns,
      ratio,
      room,
      boxes,
      activeNotes: {},
      mimes,
      maxFlags,
      totalFlags: 0
    })
  })
}

function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function updateBox({ x, y, id }, payload) {
  $.teach({...payload}, (s, p) => {
    const key = `${y}-${x}`
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          boxes: {
            ...s.instances[id].boxes,
            [key]: {
              ...s.instances[id].boxes[key],
              ...p
            }
          }
        }
      }
    }
  })
}

function updateNote({ id, note }, payload) {
  $.teach(payload, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          activeNotes: {
            ...s.instances[id].activeNotes,
            [note]: p
          }
        }
      }
    }
  })
}


function infer(rows, columns, y, x, boxes) {
  const minX = Math.max(0, x-1);
  const maxX = Math.min(x+1, columns-1);
  const minY = Math.max(0, y-1);
  const maxY = Math.min(y+1, rows-1);

  let count = 0
  for(let a = minX; a <= maxX; a++) {
    for(let b = minY; b <= maxY; b++) {
      count += boxes[`${b}-${a}`].mimed ? 1 : 0
    }
  }

  return count
}

function pow(id, rows, columns, y, x, boxes) {
  const minX = Math.max(0, x-1);
  const maxX = Math.min(x+1, columns-1);
  const minY = Math.max(0, y-1);
  const maxY = Math.min(y+1, rows-1);

  for(let a = minX; a <= maxX; a++) {
    for(let b = minY; b <= maxY; b++) {
      const { flagged, revealed } = boxes[`${b}-${a}`]
      if(!revealed && !flagged) {
        updateBox({ id, x: a, y: b }, { revealed: true })
      }
    }
  }
}

function getInstance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id]
}

function schedule(x, delay=1) { setTimeout(x, delay) }

function mod(x, n) {
  return ((x % n) + n) % n;
}

function setDebugger(visibility) {
  let console = document.body.querySelector('plan98-console')
  if(!console) {
    document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
    console = document.body.querySelector('plan98-console')
  } else {
    console.classList.toggle('hidden')
  }

  if(visibility === 'show') {
    consoleShow()
    $.teach({ debuggerVisible: true })
  } else {
    consoleHide()
    $.teach({ debuggerVisible: false })
  }

  event.target.classList.toggle('enabled')
}


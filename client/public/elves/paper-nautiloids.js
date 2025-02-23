import elf from '@silly/elf'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import Color from "colorjs.io"
import { consoleShow, consoleHide } from './plan98-console.js'
import 'aframe'
import diffHTML from 'diffhtml'

const orientation = {
	x: '0', y: '0', z: '0', roll: '0', pitch: '0', yaw: '0'
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
  instrument: 'violin',
  mode: modes.game
})

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


let current
// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

function load(instrument) {
  current = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/"
  })

  Tone.loaded().then(function() {
    current.release = .5;
    current.toDestination();
  })
}

load($.learn().instrument)

// show error message on loading error //
$.when('change', '.samples', function(event) {
  const { value } = event.target
  load(instruments[value]);
  $.teach({instrument: value })
})

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


$.draw((target) => {
  const { mode, tick, instrument, instances, debuggerVisible, tileDistance } = $.learn()
  seed(target)
  if(!instances[target.id]) return
  
  if(mode === modes.pause) {
    return `
      Pause
    `
  }

  if(mode === modes.settings) {
    const list = Object.keys(instruments).map((item) => {
      return `
        <option value="${item}" ${instrument === instruments[item] ? 'selected="true"':''}>
          ${instruments[item]}
        </option>
      `
    })

    return `
      <div class="settings">
        <div class="title">Settings</div>

        <label class="field">
          <span class="label">Instruments</span>
          <select class="samples">
            ${list}
          </select>
        </label>
        <hr>

        <hr>

        <button class="toolbelt-debugger">
          ${ debuggerVisible ? 'Hide Debugger' : 'Show Debugger' }
        </button>

      </div>
    `
  }

  if(target.querySelector('.scene')) return

  return `
    <div class="game" style="${colorVariables}">
      <div class="scene"></div>
      <div class="information"></div>
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

      const scene = target.querySelector('.scene')
      if(scene) {
        const { instances } = $.learn()

        const instance = instances[target.id]
        const { y } = instance

        const grid = [y-1,y,y+1].map(createRow(instance)).join('')

        requestIdleCallback(() => {
          scene.innerHTML = `
            <a-scene>
              <a-camera wasd-controls="enabled: false"></a-camera>
              ${grid}
            </a-scene>
          `
        })
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
  const { x, columns, rows, boxes } = instance
  return function row(row, yIndex) {
    if(!boxes) return ''

    return [x-1,x,x+1].map((column, xIndex) => {
      if(column<0||column>=columns||row<0||row>=rows) {
        return draw3d(
          aBox({
            x: 2 * (xIndex - 1),
            z: -2 * (yIndex) - 5,
            y: 0,
            pitch: 45
          }, {
            wireframe: true,
            color: 'firebrick',
          })
        )
      }
      const box = boxes[`${row}-${column}`] || {}
      const color = colorFromGrid(mod(column, columns), mod(row, rows))
      return draw3d(
        aBox({
          x: 2 * (xIndex - 1),
          z: -2 * (yIndex) - 5,
          y: 0,
          pitch: 45
        }, {
          wireframe: box.revealed,
          color: color.value,
        })
      )

    }).join('')
  }
}

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

  if(y<=0) return
  updateInstance({ id }, { y: y - 1 })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y, rows } = instances[id]

  if(y>=rows-1) return
  updateInstance({ id }, { y: y + 1 })
}

$.style(`
  & {
    background: lemonchiffon;
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

  & .title {
    font-size: 2rem;
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

`)

const attacking = {}

function attack(note) {
  if(!current || attacking[note]) return
  current.triggerAttack(Tone.Frequency(note, "midi").toNote());
  attacking[note] = true
}

function attackRelease(note) {
  if(!current) return
  current.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), '2n');
  attacking[note] = true
}


function release(note) {
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!current) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
}

$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { id } = event.target.closest($.link)
  const { instances } = $.learn()
  if(instances[id]) {
    const { x, y } = instances[id]
    const root = noteFromGrid(x, y)

    const more = { root, id }

    if(jsonrpc[method]) {
      jsonrpc[method]({...params, ...more})
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

const jsonrpc = {
  'a': (params) => {
    if(params.value === 1) {
      attack(params.root)
    } else {
      release(params.root)
    }
  },
  'b': (params) => {
    if(params.value === 1) {
      attack(params.root + 7)
    } else {
      release(params.root + 7)
    }
  },
  'x': (params) => {
    if(params.value === 1) {
      attack(params.root + 2)
    } else {
      release(params.root + 2)
    }
  },
  'y': (params) => {
    if(params.value === 1) {
      attack(params.root + 9)
    } else {
      release(params.root + 9)
    }
  },
  'lb': (params) => {
    if(params.value === 1) {
      attack(params.root + 4)
    } else {
      release(params.root + 4)
    }
  },
  'rb': (params) => {
    if(params.value === 1) {
      attack(params.root + 11)
    } else {
      release(params.root + 11)
    }
  },
  'lt': (params) => {
    if(params.value === 1) {
      attack(params.root + 6)
    } else {
      release(params.root + 6)
    }
  },
  'rt': (params) => {
    if(params.value === 1) {
      attack(params.root + 13)
    } else {
      release(params.root + 13)
    }
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', 150, () => {
        slideUp(params.id)
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      debounceSpam('down', 150, () => {
        slideDown(params.id)
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      debounceSpam('left', 150, () => {
        slideLeft(params.id)
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
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
      y: Math.floor(rows/2),
      id,
      rows,
      columns,
      ratio,
      room,
      boxes,
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

$.when('click', '.toolbelt-debugger', debugToolbelt)

function debugToolbelt(event) {
  let console = document.body.querySelector('plan98-console')
  if(!console) {
    document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
    console = document.body.querySelector('plan98-console')
  } else {
    console.classList.toggle('hidden')
  }

  if(console.matches('.hidden')) {
    consoleHide()
    $.teach({ debuggerVisible: false })
  } else {
    consoleShow()
    $.teach({ debuggerVisible: true })
  }

  event.target.classList.toggle('enabled')
}


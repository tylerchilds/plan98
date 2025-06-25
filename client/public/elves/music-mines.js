import elf from '@silly/tag'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/public/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'
import { checkButton, checkAxis } from './debug-gamepads.js'

const modes = {
  game: 'game',
  settings: 'settings',
}

const $ = elf('music-mines', {
  root: 60,
  samples: {},
  rows: 7,
  columns: 13,
  ratio: .1,
  tick: 0,
  room: '0001',
  instances: {},
  mode: modes.game
})

function noteFromGrid(column, row) {
  const { root, columns } = $.learn()
  const base = root + 30;

  const evenColumn = column % 2 === 0

  const aboveMedian = column > parseInt(columns / 2)
  const octave = row * -12
  const interval = (parseInt(column / 2) * 2)

  return evenColumn
    ? base + octave + interval
    : base - 5 + octave + interval + (aboveMedian?12:0)
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

load('piano')

// show error message on loading error //
$.when('change', '.samples', function(event) {
  load(instruments[event.target.value]);
})

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

const midiCodes = [...new Array(116)].map((_, i) => i)

$.draw((target) => {
  const { mode, tick, instances } = $.learn()
  seed(target)
  if(!instances[target.id]) return

  if(mode === modes.settings) {
    const list = Object.keys(instruments).map((item) => {
      return `
        <option value="${item}" ${current === instruments[item] ? 'selected="true"':''}>
          ${instruments[item]}
        </option>
      `
    })

    return `
      <button data-options>
        Options
      </button>
      <div class="settings">
        <div class="title">Settings</div>

        <label class="field">
          <span class="label">Instruments</span>
          <select class="samples">
            ${list}
          </select>
        </label>
      </div>
    `
  }

  const { finished, won, boxes, rows, columns } = instances[target.id]

  function createRow(row) {
    if(!boxes) return 'no boxes'
    return [...Array(columns).keys()].map(column => {
      const box = boxes[`${row}-${column}`] || {}
      return `
        <button class="
          cell
          ${ box.revealed ? 'revealed' : '' }
          ${ box.flagged ? 'flagged' : '' }
          ${ box.alive ? 'alive' : '' }
          "
          data-row="${row}"
          data-column="${column}"
          data-note="${noteFromGrid(column, row)}"
        >
          ${box.revealed ? (box.mimed ? 'x' : box.count ? box.count : ''):'' }
        </button>
      `
    }).join('')
  }

  const grid = [...Array(rows).keys()].map(row => createRow(row)).join('')

  return `
    <button data-options>
      Options
    </button>
    <div class="game">
      <div class="grid ${finished ? (won?'won':'lost') : ''}" style="--rows: ${rows}; --columns: ${columns};">
        ${grid}
      </div>
      ${finished ? (won?`
        <div class="mini-overlay">
          You win! Play again?<br>
          <button data-restart>New Game</button>
        </div>
      `:`
        <div class="mini-overlay">
          Game over... Try again?<br>
          <button data-restart>New Game</button>
        </div>
      `) : ''}
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
  }
})

$.when('click', '[data-options]', (event) => {
  const { mode } = $.learn()
  const newMode = mode !== modes.settings ? modes.settings : modes.game
  $.teach({ mode: newMode })
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
  }

  & .title {
    font-size: 2rem;
    font-weight: bold;
  }

  & [data-options] {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.85);
    color: rgba(0,0,0,.65);
    text-shadow: 1px 1px rgba(255,255,255,.65);
    position: absolute;
    top: 0;
    right: 0;
  }

  & [data-options]:hover,
  & [data-options]:focus {
    background: rgba(255,255,255,.25);
    color: rgba(0,0,0,1);
    text-shadow: 1px 1px rgba(255,255,255,1);
  }

  & .game,
  & .settings {
    display: none
  }

  &[data-mode="settings"] .settings {
    display: block;
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

  & .grid {
    display: inline-grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    height: 100%;
    transform-origin: bottom;
  }

  & .won {
    opacity: .85;
    pointer-events: none;
  }

  & .lost {
    opacity: .5;
    pointer-events: none;
  }

  & .cell {
    border: 2px solid rgba(0,0,0,.85);
    border-left-color: rgba(255,255,255,.85);
    border-top-color: rgba(255,255,255,.85);
    background: rgba(128,128,128,.5);
    color: rgba(0,0,0,1);
    border-radius: 0;
    display: grid;
    place-content: center;
    padding: 0;
    min-height: 2rem;
    aspect-ratio: 1;
  }

  & .mini-overlay {
    position: absolute;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.85);
    padding: 1rem;
    border-radius: 1rem;
    margin: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    top: 50%;
  }

  & .revealed {
    background: rgba(128,128,128,.85);
    border: none;
  }

  & .flagged::before {
    content: '%';
  }

  & .alive {
    background: rgba(128,128,128,.65);
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


function pointerup(event) {
  const note = event.target.dataset.note
  release(note)
}

function release(note) {
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!current) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
}

requestAnimationFrame(loop)
const lastFrame = {
  a: false,
  b: false,
  x: false,
  y: false,
  down: false,
  up: false,
  left: false,
  right: false,
}

function loop(time) {
  const { root } = $.learn()
  const player = {
    a: checkButton(0, 0),
    b: checkButton(0, 1),
    x: checkButton(0, 3),
    y: checkButton(0, 2),
    lb: checkButton(0, 4),
    rb: checkButton(0, 5),
    lt: checkButton(0, 6),
    rt: checkButton(0, 7),
    select: checkButton(0, 8),
    start: checkButton(0, 9),
    ls: checkButton(0, 10),
    rs: checkButton(0, 11),
    up: checkButton(0, 12),
    down: checkButton(0, 13),
    left: checkButton(0, 14),
    right: checkButton(0, 15),
    os: checkButton(0, 16),
  }

  if(player.a) {
    attack(root)
  } else {
    release(root)
  }

  if(player.b) {
    attack(root + 7)
  } else {
    release(root + 7)
  }

  if(player.x) {
    attack(root + 2)
  } else {
    release(root + 2)
  }

  if(player.y) {
    attack(root + 9)
  } else {
    release(root + 9)
  }

  if(player.lb) {
    attack(root + 4)
  } else {
    release(root + 4)
  }

  if(player.rb) {
    attack(root + 11)
  } else {
    release(root + 11)
  }

  if(player.lt) {
    attack(root + 6)
  } else {
    release(root + 6)
  }

  if(player.rt) {
    attack(root + 13)
  } else {
    release(root + 13)
  }

  if(player.up) {
    if(!lastFrame.up) {
      lastFrame.up = true
      console.log('up')
      if(root < 85) {
        $.teach({ root: root + 12 })
      } else {
        $.teach({ root: 96 })
      }
    }
  } else {
    lastFrame.up = false
  }

  if(player.down) {
    if(!lastFrame.down) {
      lastFrame.down = true
      console.log('down')
      if(root > 35) {
        $.teach({ root: root - 12 })
      } else {
        $.teach({ root: 24 })
      }
    }
  } else {
    lastFrame.down = false
  }

  if(player.left) {
    if(!lastFrame.left) {
      lastFrame.left = true
      if(root > 24) {
        $.teach({ root: root - 1 })
      }
    }
  } else {
    lastFrame.left = false
  }

  if(player.right) {
    if(!lastFrame.right) {
      lastFrame.right = true

      if(root < 96) {
        $.teach({ root: root + 1 })
      }
    }
  } else {
    lastFrame.right = false
  }

  if(player.os) {
    if(!lastFrame.os) {
      lastFrame.os = true
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
    }
  } else {
    lastFrame.os = false
  }

  requestAnimationFrame(loop)
}

/*
 Gamer Grid
 */
$.when('contextmenu', '.cell', (event) => {
  event.preventDefault()
  const { row, column } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
  const { flagged } = boxes[`${row}-${column}`]
  updateBox({ id, x: column, y: row }, { flagged: !flagged })
  victoryCondition(event.target)
})

$.when('click', '.cell', (event) => {
  const { row, column, note } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
  const { flagged, mimed, count } = boxes[`${row}-${column}`]
  attackRelease(parseInt(note))
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
  victoryCondition(event.target)
})

$.when('click', '[data-restart]', (event) => {
  event.target.closest($.link).seeded = false
  const { id } = instance(event.target)
  updateInstance({ id }, { finished: false, won: null })
})

function victoryCondition(target) {
  const { boxes, id, rows, columns } = instance(target)
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns, ratio, room } = $.learn() || {}

  const boxes = {}
  let mimes = {}
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
  for(let i = 0; i < rows * columns * ratio; i++) {
    ensureRandomMime()
  }

  countMimeula()

  schedule(() => {
    const id = target.id
    updateInstance({ id }, { id, rows, columns, ratio, room, boxes, mimes })
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

function reanimate(id, rows, columns, y, x, boxes) {
  const minX = Math.max(0, x-1);
  const maxX = Math.min(x+1, columns-1);
  const minY = Math.max(0, y-1);
  const maxY = Math.min(y+1, rows-1);

  const soil = []
  for(let a = minX; a <= maxX; a++) {
    for(let b = minY; b <= maxY; b++) {
      const { alive } = boxes[`${b}-${a}`]
      if(!alive) {
        soil.push([b,a])
      }
    }
  }

  if(soil.length === 0) return

  const [b, a] = soil[Math.floor(Math.random() * soil.length)]
  updateBox({ id, x: a, y: b }, { alive: true })
}

function life($, id) {
  const { instances } = $.learn()
  const { boxes, rows, columns } = instances[id]

  const nextGenXboxes = Object.keys(boxes).reduce((all, box) => {
    const { alive } = all[box]
    let [y, x] = box.split('-')
    y = parseInt(y)
    x = parseInt(x)
    const minX = Math.max(0, x-1);
    const maxX = Math.min(x+1, columns-1);
    const minY = Math.max(0, y-1);
    const maxY = Math.min(y+1, rows-1);

    let count = 0
    for(let a = minX; a <= maxX; a++) {
      for(let b = minY; b <= maxY; b++) {
        const { alive } = boxes[`${b}-${a}`]
        if(alive) {
          count += 1
        }
      }
    }

    count = alive ? count : count - 1

    if((count >= 2 && count <= 3)) {
      all[box].alive = true
    } else if(alive) {
      all[box].alive = false
    }

    return all
  }, boxes)

  updateInstance({ id }, { boxes: nextGenXboxes })
}

setInterval(() => {
  const { tick, instances } = $.learn()

  $.teach({ tick: tick+1 })

  Object.keys(instances).map(id => {
    const { mimes, boxes, rows, columns, finished } = instances[id]
    if(finished) return
    Object.keys(mimes).map(box => {
      const [y, x] = box.split('-')
      reanimate(id, rows, columns, y, x, boxes)
    })

    life($, id)
  })

}, 1000)

function instance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id]
}

function schedule(x, delay=1) { setTimeout(x, delay) }



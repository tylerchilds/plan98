import module from '@silly/tag'
import { v4 as uuidv4 } from 'uuid';
import 'gun'

const gun = window.Gun(['https://gun.1998.social/gun']);

const $ = module('mine-sweeper', {
  keys: ['rows', 'columns', 'ratio', 'room'],
  rows: 9,
  columns: 12,
  ratio: .1,
  tick: 0,
  room: '0001',
  instances: {}
})

$.draw((target) => {
  const { tick, instances } = $.learn()
  seed(target)
  if(!instances[target.id]) return
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
        >
          ${box.revealed ? (box.mimed ? 'x' : box.count ? box.count : ''):'' }
        </button>
      `
    }).join('')
  }

  const grid = [...Array(rows).keys()].map(row => createRow(row)).join('')

  return `
    ${tick}
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
  `
})


$.when('contextmenu', '.cell', (event) => {
  event.preventDefault()
  const { row, column } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
  const { flagged } = boxes[`${row}-${column}`]
  updateBox({ id, x: column, y: row }, { flagged: !flagged })
  victoryCondition(event.target)
})

$.when('click', '.cell', (event) => {
  const { row, column } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
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
  target.gun = gun.get(target.id).get(room)
  target.gun.on(media => {
    $.teach({ media })
  })

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
      mimes[key] = uuidv4()
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

  // multiplayer should be kind of like:
  // table: rooms
  // id: tutorial-world
  // when mounting, subscribe gun

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

$.style(`
  & {
    perspective-origin: center;
    perspective: 1000px;
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    display: block;
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

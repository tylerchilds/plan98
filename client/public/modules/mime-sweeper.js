import module from '@sillonious/module'
import { v4 as uuidv4 } from 'uuid';

const $ = module('mime-sweeper', {
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
  `
})

$.when('click', '.cell', (event) => {
  const { row, column } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
  const { mimed, count } = boxes[`${row}-${column}`]
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
})

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
      const { revealed } = boxes[`${b}-${a}`]
      if(!revealed) {
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

    console.log(count)
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
  & .grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    height: 100%;
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
    border: .25rem solid var(--wheel-0-0);
    border-left-color: var(--wheel-0-1);
    border-top-color: var(--wheel-0-1);
    background: var(--wheel-0-2);
    color: var(--wheel-0-6);
    filter: grayscale(1);
  }

  & .revealed {
    border: none;
  }

  & .alive {
    filter: grayscale(0);
  }
`)

import module from '@sillonious/module'

const $ = module('mime-sweeper', {
  keys: ['rows', 'columns', 'ratio', 'room'],
  rows: 10,
  columns: 10,
  ratio: .1,
  tick: 0,
  room: '0001',
  instances: {}
})

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


setInterval(() => {
  const tick = $.learn().tick+1
  $.teach({ tick })
}, 1000)

function instance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id]
}

$.draw((target) => {
  const { tick, instances } = $.learn()
  seed(target)
  if(!instances[target.id]) return
  const { boxes, rows, columns } = instances[target.id]

  function createRow(row) {
    if(!boxes) return 'no boxes'
    return [...Array(columns).keys()].map(column => {
      const box = boxes[`${row}-${column}`] || {}
      return `
        <button class="${ box.entered ? 'cell entered' : 'cell' }" data-row="${row}" data-column="${column}">
          ${box.entered && box.count ? box.count : '' }
        </button>
      `
    }).join('')
  }

  const grid = [...Array(rows).keys()].map(row => createRow(row)).join('')

  return `
    ${tick}
    <div class="grid" style="--rows: ${rows}; --columns: ${columns};">
      ${grid}
    </div>
  `
})

$.when('click', '.cell', (event) => {
  const { row, column } = event.target.dataset
  const { boxes, id, rows, columns } = instance(event.target)
  const { mimed } = boxes[`${row}-${column}`]
  infer(rows, columns, parseInt(row), parseInt(column), boxes)
  if(mimed) {
    alert('game over')
  } else {
    updateBox({ id, x: column, y: row }, { entered: true })
  }
})

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns, ratio, room } = $.learn() || {}

  const boxes = {}
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      boxes[`${y}-${x}`] = {
        entered: false,
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
    if(boxes[`${y}-${x}`].mimed) {
      ensureRandomMime()
    } else {
      boxes[`${y}-${x}`].mimed = true
        //updateBox({ id: target.id, x, y }, { mimed: true })
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
    updateInstance({ id }, { id, rows, columns, ratio, room, boxes })
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

function schedule(x) { setTimeout(x, 1) }

$.style(`
  & .grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    height: 100%;
  }

  & .cell {
    border: .25rem solid var(--wheel-0-0);
    border-left-color: var(--wheel-0-1);
    border-top-color: var(--wheel-0-1);
  }

  & .entered {
    border: none;
  }
`)

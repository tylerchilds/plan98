import { Self } from '@plan98/types'

const nonNull = x => x !== null && x !== undefined && x !== ''

function filledShots(input) {
  return input.filter(nonNull)
}

function firstShot(input) {
  const shots = filledShots(input)
  return shots.length ? shots[0] : null
}

function lastShot(input) {
  const shots = filledShots(input)
  return shots.length ? shots[shots.length - 1] : null
}

const $ = Self('bowling-scores', {
  bowlers: []
})

$.view(() => {
  const { bowlers } = $.model()
  return `
    <nav>
      <button action="new-bowler">
        Add
      </button>
    </nav>
    <main class="bowlers">
      ${
        bowlers
          .map(game)
          .join('')
      }
    </main>
  `
})

function game(bowler, bowlerId) {
  return `
    <div class="game">
      <div class="number">
        ${bowlerId + 1}
      </div>
      <div class="name">
        ${bowler.name}
      </div>
      <div class="scores">
        ${
          bowler.frames.map(frameById(bowlerId)).join('')
        }
      </div>
    </div>
  `
}

function frameById(bowlerId) {
  return function frame(data, frameId) {
    const inputs = frameId === 9 ? `
      <div class="three-cell inputs">
        ${data.input.map(inputBy(bowlerId, frameId)).join('')}
      </div>
    ` : `
      <div class="two-cell inputs">
        ${data.input.map(inputBy(bowlerId, frameId)).join('')}
      </div>
    `

    const last = data.input.at(-1)

    return `
      <div class="frame">
        ${inputs}
        <div class="score">
          ${(last !== null ? data.output : null) || '' }
        </div>
      </div>
    `
  }
}

function inputBy(bowlerId, frameId) {
  return function input(data, shotId) {
    return `
      <input type="text" value="${data || ''}" data-bowler="${bowlerId}" data-frame="${frameId}" data-shot="${shotId}" />
    `
  }
}

$.when('click', '[action="new-bowler"]', (event) => {
  const name = prompt('Bowler name:')

  $.controller({ name }, (state, payload) => {
    return {
      ...state,
      bowlers: [
        ...state.bowlers,
        Bowler(payload.name)
      ]
    }
  })
})

function Bowler(name) {
  return {
    name,
    frames: Frames()
  }
}

function Frames() {
  return [
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null],
      output: null
    },
    {
      input: [null, null, null],
      output: null
    },
  ]
}

const symbolInputs = [
  '-',
  '/',
  'x',
  'X'
]

const validInputs = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ...symbolInputs
]

$.when('input', 'input', (event) => {
  const { bowler, frame, shot } = event.target.dataset
  const value = event.target.value
  const bowlerId = parseInt(bowler, 10)
  const frameId = parseInt(frame, 10)
  const shotId = parseInt(shot, 10)

  if (value === '') {
    $.controller({ bowlerId, frameId, shotId }, (state, payload) => {
      const newBowlers = [...state.bowlers]
      newBowlers[payload.bowlerId].frames[payload.frameId].input[payload.shotId] = null
      return { ...state, bowlers: newBowlers }
    })

    recompute(bowlerId)
    return
  }

  if (validInputs.includes(value)) {
    $.controller({ bowlerId, frameId, shotId, value }, (state, payload) => {
      const newBowlers = [...state.bowlers]
      const x = symbolInputs.includes(value) ? value : parseInt(value)
      newBowlers[payload.bowlerId].frames[payload.frameId].input[payload.shotId] = x
      return { ...state, bowlers: newBowlers }
    })

    recompute(bowlerId)
  } else {
    event.target.value = event.target.value.slice(0, -1)
  }
})

function toPins(shot, prevPins = null) {
  if (shot === 'x' || shot === 'X') return 10
  if (shot === '-') return 0
  if (shot === '/') return 10 - prevPins
  return Number(shot)
}

function recompute(bowlerId) {
  $.controller(null, (state) => {
    const newBowlers = state.bowlers.map((bowler, idx) => {
      if (idx !== bowlerId) return bowler

      let runningTotal = 0
      let blocked = false

      const newFrames = bowler.frames.map((x, fid) => {
        if (blocked) return { ...x, output: null }

        const currentFrameScore = frameScore(x.input)
        const last = lastShot(x.input)

        const scoresFromTheFuture = fid === 9
          ? 0
          : ['x', 'X'].includes(last)
            ? Strike(bowler.frames, fid)
            : last === '/'
              ? Spare(bowler.frames[fid + 1])
              : 0

        if (scoresFromTheFuture === null) {
          blocked = true
          return { ...x, output: null }
        }

        runningTotal += currentFrameScore
        runningTotal += scoresFromTheFuture
        return { ...x, output: runningTotal }
      })

      return { ...bowler, frames: newFrames }
    })

    return { ...state, bowlers: newBowlers }
  })
}

function frameScore(inputs) {
  let total = 0
  let prevPins = null
  for (const shot of filledShots(inputs)) {
    const pins = toPins(shot, prevPins)
    total += pins
    prevPins = pins
  }
  return total
}

function Strike(frames, fid) {
  const next = frames[fid + 1]
  const first = firstShot(next.input)
  if (first === null) return null

  const firstPins = toPins(first)

  let secondShot
  if (first === 'x' || first === 'X') {
    const afterNext = frames[fid + 2]
    if (fid === 8) {
      secondShot = filledShots(next.input)[1] ?? null
    } else {
      secondShot = afterNext ? firstShot(afterNext.input) : null
    }
  } else {
    secondShot = filledShots(next.input)[1] ?? null
  }

  if (secondShot === null) return null

  const secondPins = (first === 'x' || first === 'X')
    ? toPins(secondShot)
    : toPins(secondShot, firstPins)

  return firstPins + secondPins
}

function Spare(frame) {
  const value = firstShot(frame.input)
  if (value === null) return null
  return toPins(value)
}

function Tenth(inputs) {
  const taken = inputs.filter(s => s !== null && s !== undefined && s !== '')

  const pins = taken.map((shot, i) => {
    if (shot === '/') {
      const prev = taken[i - 1]
      if (prev === 'x' || prev === 'X') {
        throw new Error(`Invalid tenth frame: '/' cannot follow a strike at index ${i}`)
      }
      return 10 - toPins(prev)
    }
    return toPins(shot)
  })

  return pins.reduce((sum, p) => sum + p, 0)
}

$.style(`
  & * {
    box-sizing: border-box;
  }
  & {
    display: grid;
    height: 100%;
    grid-template-rows: auto 1fr;
    --border-style: 1px solid rgba(0,0,0,.1)
  }

  & .game {
    display: flex;
  }

  & .frames {
    display: flex;
  }

  & .scores {
    display: flex;
  }

  & .frame {
    border: var(--border-style);
    border-left: none;
    width: 100px;
    height: 100px;
  }

  & .frame:first-child {
    border-left: var(--border-style);
  }

  & .inputs {
    display: flex;
  }

  & .two-cell input {
    width: 49px;
    height: 49px;
  }

  & .three-cell input {
    width: 33px;
    height: 49px;
  }

  & input {
    border-radius: 0;
    border: none;
    display: grid;
    place-content: center;
    text-align: center;
  }

  & .three-cell input:last-child,
  & .two-cell input:last-child {
    border-left: var(--border-style);
    border-bottom: var(--border-style);
  }

  & .three-cell input:first-child {
    border-right: var(--border-style);
  }

  & .three-cell input {
    border-bottom: var(--border-style);
  }

  & .bowlers {
    overflow: auto;
  }

  & .name {
    width: 180px;
  }
`)

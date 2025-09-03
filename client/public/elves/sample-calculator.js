import elf from '@silly/elf'

const $ = elf('sample-calculator', {
  expression: '5*52*50*45'//'2*3+4'
})

$.draw((target) => {
  const { expression, solution } = $.learn()
  return solution ? 'Solution: '+ solution : `
    <button>
      Calculate: ${expression}
    </button>
  `
})

$.when('click', 'button', () => {
  const { expression } = $.learn()

  let solution = 0
  let maybeNumber = ''
  let mode = '*'
  const addQueue = []
  function addToAddQueue(integer) {
    addQueue.push(integer)
  }
  const executionModes = {
    '*': function multiply() {
      if(solution === 0) {
        solution = parseInt(maybeNumber)
      } else {
        solution *= parseInt(maybeNumber)
      }
    },
    '+': function add() {
      addToAddQueue(parseInt(maybeNumber))
    },
  }

  function executeMode(mode) {
    executionModes[mode] ? executionModes[mode]() : null
  }

  const processModes = {
    '*': function multiply() {
      executeMode(mode)
      mode = '*'
      maybeNumber = ''
    },
    '+': function add() {
      executeMode(mode)
      mode = '+'
      maybeNumber = ''
    },
    edge: function number(x) {
      maybeNumber += x
    }
  }

  const glyphs = expression.split('')

  while(glyphs.length > 0) {
    const x = glyphs.shift()
    processModes[x] ? processModes[x]() : processModes.edge(x)
  }

  executeMode(mode)
  addQueue.forEach(x => {
    solution += x
  })

  $.teach({ solution })
})

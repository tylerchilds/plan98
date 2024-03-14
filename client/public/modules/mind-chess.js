import chess from 'chess'
import module from '@sillonious/module'

const $ = module('mind-chess')

$.draw((target) => {
  init(target)
  const { board, notatedMoves, isCheck, isCheckmate } = target.chess.getStatus();
  const { lastMove } = $.learn()
   const turn = notatedMoves[Object.keys(notatedMoves)[0]].src.piece.side.name

  const moves = Object.keys(notatedMoves).map(key => {
    const {src, dest} = notatedMoves[key]
    return `
      <option value="${key}">${key}</option>
    `
  }).join('')


  console.log({ lastMove })

  return `
    <div class="skybox turn-${turn}">
      <div class="board">
        ${board.squares.map(x => `
          <div class="square" data-file="${x.file}" data-rank="${x.rank}">
            ${renderPiece(x.piece)}
          </div>
        `).join('')}
      </div>
      <form class="actions">
        <select name="move">
          <option disabled>Choose a move</option>
          ${moves}
        </select>
        <button data-move type="submit">
          Move
        </button>
        <hr/>
        ${lastMove ? show(lastMove) : ''}
      </form>
    </div>
  `
})

function show({ move, undo }) {
  return `
    ${move.algebraic}
    <button data-undo>
      undo
    </button>
  `
}

$.when('click', '[data-undo]', (event) => {
  const { lastMove } = $.learn()
  $.teach({ lastMove: lastMove.undo() })
})

function renderPiece(piece) {
  if(!piece) return ''
  return `
    <div data-type="${piece.type}" class="${piece.side.name}">
      ${piece.notation || 'P'}
    </div>
  `
}

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { chess } = event.target.closest($.link)
  const { value } = event.target.move
  try {
    const lastMove = chess.move(value)
    $.teach({ lastMove })
    event.target.move.selectedIndex = 0
  } catch(e) {
    console.log('Make a legal move')
  }
})

function init(target) {
  if(target.chess) return
  target.chess = chess.create({PGN: true})
}

$.style(`
  & .skybox {
    display: grid;
    grid-template-columns: 1fr 180px;
  }
  & select {
    padding: 1rem;
    border-radius: 1rem;
    max-width: 100%;
    margin-bottom: 1rem;
  }
  & .board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
  }

  & .square {
    aspect-ratio: 1;
    display: grid;
    place-content: center;
    background-color: goldenrod;
  }

  & .square:nth-child(16n + 2),
  & .square:nth-child(16n + 4),
  & .square:nth-child(16n + 6),
  & .square:nth-child(16n + 8),
  & .square:nth-child(16n + 9),
  & .square:nth-child(16n + 11),
  & .square:nth-child(16n + 13),
  & .square:nth-child(16n + 15) {
    background-color: saddlebrown;
  }

  & .white,
  & .black {
    border-radius: 100%;
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    font-weight: bold;
  }

  & .white {
    background: white;
    color: black;
  }

  & .black {
    background: black;
    color: white;
  }

  & [data-move] {
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    padding: 0;
    width: 100%;
  }

  & .actions {
    padding: .5rem;
  }

  & .turn-white,
  & .turn-white [data-undo],
  & .turn-white [data-move],
  & .turn-white select {
    border: 1px solid black;
    background: white;
    color: black;
  }

  & .turn-black,
  & .turn-black [data-undo],
  & .turn-black [data-move],
  & .turn-black select {
    border: 1px solid white;
    background: black;
    color: white;
  }
`)

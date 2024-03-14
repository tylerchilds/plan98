import chess from 'chess'
import module from '@sillonious/module'

const $ = module('mind-chess')

$.draw((target) => {
  init(target)
  const { board, notatedMoves, isCheck, isCheckmate } = target.chess.getStatus();
  const { lastMove } = $.learn()

  const moves = Object.keys(notatedMoves).map(key => {
    const {src, dest} = notatedMoves[key]
    return `
      <button data-move="${key}">${key}</button>
    `
  }).join('')


  console.log({ lastMove })

  return `
    <div class="board">
      ${board.squares.map(x => `
        <div class="square" data-file="${x.file}" data-rank="${x.rank}">
          ${renderPiece(x.piece)}
        </div>
      `).join('')}
    </div>
    ${moves}
    ${lastMove ? show(lastMove) : ''}
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

$.when('click', '[data-move]', (event) => {
  const { chess } = event.target.closest($.link)
  const { move } = event.target.dataset
  const lastMove = chess.move(move)
  $.teach({ lastMove })
})

function init(target) {
  if(target.chess) return
  target.chess = chess.create({PGN: true})
}

$.style(`
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
`)

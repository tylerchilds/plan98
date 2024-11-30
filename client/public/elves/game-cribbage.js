const tag = 'game-cribbage'

customElements.define(tag, class WebComponent extends HTMLElement { constructor() { super() } });

import("@silly/elf").then((elf) => {
  const game = elf.default(tag, {
    player1score: 0,
    player2score: 0,
    player3score: 0
  })

  game.draw(drawGame)

  game.style(`
    & {
      display: block;
      height: 100%;
      background: black;
      position: relative;
    }

    & .scoring {
      background: white;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
    }
    & button {
      border: none;
      padding: 1rem;
      border-radius: 100%;
      color: white;
      text-shadow: 1px 1px black;
      margin: 1rem;
      aspect-ratio: 1;
    }


    & button:hover,
    & button:focus {
      background: black;
    }

    & .player-1 {
      background: firebrick;
    }

    game-cribbage [class="player-2"] {
      background: dodgerblue;
    }

    & [class="player-3"] {
      background: mediumseagreen;
    }

    & .player-box {
      position: relative;
    }

    & [data-function="add"] {
      position: relative;
      width: 4rem;
      height: 4rem;
    }

    & [data-function="add"] span {
      position: absolute;
      inset: 0;
      margin: auto;
      height: 1rem;
      font-size: 1rem;
      line-height: 1;
    }
    & [data-function="subtract"] {
      position: absolute;
      left: 0;
      top: 0;
      background: white;
      border: 1px black solid;
      padding: 0 .5rem .5rem;
      margin: 0;
    }
  `)

  function drawGame() {
    const {
      player1score,
      player2score,
      player3score
    } = game.learn()

    return `
      <div class="viewing">

      </div>
      <div class="scoring">
        <div class="player-box">
          <button class="player-1" data-function="subtract" data-value="player1score">
            -
          </button>
          <button class="player-1" data-function="add" data-value="player1score">
            <span>${player1score}</span>
          </button>
        </div>
        <div class="player-box">
          <button class="player-2" data-function="subtract" data-value="player2score">
            -
          </button>
          <button class="player-2" data-function="add" data-value="player2score">
            <span>${player2score}</span>
          </button>
        </div>

        <div class="player-box">
          <button class="player-3" data-function="subtract" data-value="player3score">
            -
          </button>
          <button class="player-3" data-function="add" data-value="player3score">
            <span>${player3score}</span>
          </button>
        </div>
      </div>
    `
  }

  game.when('click', '[data-function="add"]', addScore)
  game.when('click', '[data-function="subtract"]', minusScore)

  function addScore(event) {
    const { value } = event.target.dataset

    const score = game.learn()[value]

    game.teach({ [value]: score+1 })
  }

  function minusScore(event) {
    const { value } = event.target.dataset

    const score = game.learn()[value]

    game.teach({ [value]: score-1 })
  }
})


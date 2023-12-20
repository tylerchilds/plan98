import module from '@sillonious/module'

import party, {
  fantasyGamepadEvent
} from '@sillonious/party'

const $ = module('sillonious-joypro', {joypros: []})

$.draw(target => {
  const { joypros } = $.learn()
  if(joypros.length === 0) return

  return joypros.map(({ quantums, quadrants }, playerIndex) => {
    const [play,reset,light,mode,...buttons] = quadrants.map((button) => {
      return `
        <button
          class="nav-item"
          ${button.pushed ? 'data-pushed="true"' : ''}
          data-index="${button.index}"
          data-player="${playerIndex}"
        >
        </button>
      `
    })
    const [upDown,leftRight,...axes] = quantums.map((axis) => {
      return `
        <button
          class="nav-item"
          ${axis.pushed ? 'data-pushed="true"' : ''}
          data-index="${axis.index}"
          data-player="${playerIndex}"
        >
        </button>
        <button
          class="nav-item"
          ${axis.pulled ? 'data-pulled="true"' : ''}
          data-index="${axis.index}"
          data-player="${playerIndex}"
        >
        </button>

      `
    })

    return `
      <div class="the-cardinal">
        ${upDown}
        ${leftRight}
      </div>
      <div class="the-compass">
        ${play}
        ${reset}
        ${light}
        ${mode}
      </div>
      <div class="the-overflow">
        ${buttons.join('')}
        ${axes.join('')}
      </div>
    `
  }).join('')
})

function loop() {
  const players = party()
  if(players.length === 0) return
  const joypros = players.map(({ gamepad, osc } ) => {
    const quadrants = gamepad.buttons
      .sort((a, b) => a.index - b.index)
    const quantums = gamepad.axes
      .sort((a, b) => a.index - b.index)
    return { quadrants, quantums }
  })

  $.teach({ joypros })
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)


$.when('touchstart', '.nav-item', attack)
$.when('touchend', '.nav-item', release)
$.when('mouseup', '.nav-item', release)
$.when('mousedown', '.nav-item', attack)

function attack(event) {
  const { index, player } = event.target.dataset
  const { joypros } = $.learn()
  const { quadrants } = joypros[player]
	const button = quadrants[index]
  fantasyGamepadEvent(player, button.osc, {
		...button,
		value: 1
	})
}

function release(event) {
const { index, player } = event.target.dataset
  const { joypros } = $.learn()
  const { quadrants } = joypros[player]
	const button = quadrants[index]
  fantasyGamepadEvent(player, button.osc, {
		...button,
		value: 0
	})
}

$.style(`
  & {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  & .the-cardinal,
  & .the-compass {
    display: grid;
    grid-template-columns: repeat(4, 20px);
    grid-template-rows: repeat(4, 20px);
  }

  & .the-cardinal {
    place-self: start;
  }
  & .the-compass {
    place-self: end;
  }

  & .the-overflow {
    grid-column: 1 / -1;
  }

  & .nav-item:nth-child(1) {
    grid-row: 3 / 4;
    grid-column: 2 / 4;
  }

  & .nav-item:nth-child(2) {
    grid-row: 2 / 3;
    grid-column: 3 / 5;
  }

  & .nav-item:nth-child(3) {
    grid-row: 2 / 4;
    grid-column: 1 / 3;
  }

  & .nav-item:nth-child(4) {
    grid-row: 1 / 3;
    grid-column: 2 / 4;
  }

  & .the-cardinal {
    filter: grayscale(1);
  }

	& .nav-item {
		background: linear-gradient(var(--nav-background-start) 0%, var(--nav-background-end) 100%);
		background-size: 1px 14.4rem;
		background-repeat: repeat-x;
		font-weight: bold;
		padding: .5rem;
    height: 3rem;
		text-shadow: 0px 2px 0px var(--text-shadow-color);
		transition: all 200ms ease;
		white-space: nowrap;
		border: 2px solid;
    border-radius: 1rem;
	}

  ${[...Array(16)].map((_,i) => `
    & [data-index="${i}"] {
      --nav-link-color: var(--wheel-${i}-6);
      --text-shadow-color: var(--wheel-${i}-1);
      --nav-background-start: var(--wheel-${i}-6);
      --nav-background-end: var(--wheel-${i}-3);
      border: var(--wheel-${i}-2);
    }

    & [data-index="${i}"][data-pushed="true"],
    & [data-index="${i}"]:hover,
    & [data-index="${i}"]:focus {
      --text-shadow-color: var(--wheel-${i}-2);
    }
  `).join('')}

  & .nav-item[data-pushed="true"],
	& .nav-item:hover,
	& .nav-item:focus {
		--nav-link-color: white;
		background-position-y: -7.2rem;
	}
`)

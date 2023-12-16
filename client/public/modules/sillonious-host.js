import module from '@sillonious/module'

import party, {
  fantasyGamepadEvent
} from '@sillonious/party'

const $ = module('sillonious-host')

$.draw(target => {
  const { compass } = $.learn()
  if(!compass) return

  const [startStop,reset,light,mode,...theRest] = compass.map((button) => {
    return `
			<button
				class="nav-item"
				${button.pushed ? 'data-pushed="true"' : ''}
				data-index="${button.index}"
			>
				${button.value}
			</button>`
  })
  return `
    <div class="the-grid">
      ${startStop}
      ${reset}
      ${light}
      ${mode}
    </div>
    <div class="the-row">
      ${theRest.join('')}
    </div>
  `
})

function loop() {
  const player1 = party()[0]
  if(!player1) return
  const { gamepad, osc } = player1
  const compass = gamepad.buttons
    .sort((a, b) => a.index - b.index)

  $.teach({ compass })
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)


$.when('touchstart', '.step', attack)
$.when('touchend', '.step', release)
$.when('mouseup', '.nav-item', release)
$.when('mousedown', '.nav-item', attack)

function attack(event) {
  const { compass } = $.learn()
  const { index } = event.target.dataset
	const button = compass[index]
  fantasyGamepadEvent(0, button.osc, {
		...button,
		value: 1
	})
}

function release(event) {
  const { compass } = $.learn()
  const { index } = event.target.dataset
	const button = compass[index]
  fantasyGamepadEvent(0, button.osc, {
		...button,
		value: 0
	})
}

$.style(`
  & .the-grid {
    display: grid;
    grid-template-areas:
      "play play play"
      "reset light mode";
    grid-template-colums: 1fr 1fr 1fr;
  }

  & .the-grid > :first-child {
    grid-area: play;
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
      --nav-background-start: var(--wheel-${i}-3);
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

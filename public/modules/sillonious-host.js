import module from '@sillonious/module'

import party, {
  fantasyGamepadEvent
} from '@sillonious/party'

const $ = module('sillonious-host')

$.draw(target => {
  const { compass } = $.learn()
  if(!compass) return

  const timeControls = compass.map((button) => {
		console.log({ button })
    return `
			<button
				class="nav-item"
				${button.actuated ? 'data-actuated="true"' : ''}
				data-index="${button.index}"
			>
				${button.value}
			</button>`
  }).join('')
  return `
    ${timeControls}
  `
})

function loop() {
  const player1 = party()[0]
  if(!player1) return
  const { gamepad, osc } = player1
  const compass = gamepad.buttons
    .sort((a, b) => a.index - b.index)
    .slice(0, 4)

  $.teach({ compass })
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

$.when('mousedown', '.nav-item', (event) => {
  const { compass } = $.learn()
  const { index } = event.target.dataset
	const button = compass[index]
  fantasyGamepadEvent(0, button.osc, {
		...button,
		value: 1
	})
})

$.when('mouseup', '.nav-item', (event) => {
  const { compass } = $.learn()
  const { index } = event.target.dataset
	const button = compass[index]
  fantasyGamepadEvent(0, button.osc, {
		...button,
		value: 0
	})
})


$.style(`
  & {
    display: grid;
    grid-template-areas:
      "play play play"
      "reset light mode";
    grid-template-colums: 1fr 1fr 1fr;
  }

  & > :first-child {
    grid-area: play;
  }


	& .nav-item {
		--nav-background-start: var(--blue4);
		--nav-background-end: var(--blue3);
		background: linear-gradient(var(--nav-background-start) 0%, var(--nav-background-end) 100%);
		background-size: 1px 14.4rem;
		background-repeat: repeat-x;
		font-weight: bold;
		padding: 3.6rem 2.4rem 1.2rem;
		text-shadow: 0px 2px 0px var(--text-shadow-color);
		transition: all 200ms ease;
		white-space: nowrap;
		border-bottom: .4rem solid;
	}


	& .nav-item:nth-child(1n) {
		--nav-link-color: var(--orange7);
		--text-shadow-color: var(--orange1);
		--nav-background-start: var(--orange4);
		--nav-background-end: var(--orange3);
		border-bottom-color: var(--orange2);
	}

	& .nav-item:nth-child(1n):hover,
	.nav-item:nth-child(1n):focus {
		--text-shadow-color: var(--orange2);
	}

	& .nav-item:nth-child(2n) {
		--nav-link-color: var(--flame7);
		--text-shadow-color: var(--flame1);
		--nav-background-start: var(--flame4);
		--nav-background-end: var(--flame3);
		border-bottom-color: var(--flame2);
	}

	& .nav-item:nth-child(2n):hover,
	.nav-item:nth-child(2n):focus {
		--text-shadow-color: var(--flame2);
	}

	& .nav-item:nth-child(3n) {
		--nav-link-color: var(--red7);
		--text-shadow-color: var(--red1);
		--nav-background-start: var(--red4);
		--nav-background-end: var(--red3);
		border-bottom-color: var(--red2);
	}

	& .nav-item:nth-child(3n):hover,
	& .nav-item:nth-child(3n):focus {
		--text-shadow-color: var(--red2);
	}

	& .nav-item:hover,
	& .nav-item:focus {
		--nav-link-color: var(--white);
		background-position-y: -7.2rem;
	}
`)

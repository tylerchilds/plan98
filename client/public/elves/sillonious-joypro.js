import module from '@silly/tag'

import party, {
  fantasyGamepadEvent
} from '@sillonious/party'

const synthia = '/public/icons/sprite.svg'

const $ = module('sillonious-joypro', {joypros: []})

$.draw(target => {
  const { joypros } = $.learn()
  if(joypros.length === 0) return
  const seat = target.getAttribute('seat')

  if(seat) {
    return joypros[seat] ? renderJoyPro(joypros[seat], seat) : renderJoyPro(joypros[0], 0)
  }

  return joypros.map((joypro, seat) => renderJoyPro(joypro, seat)).join('')
})

function renderJoyPro(joypro, seat) {
  const { throttles, buttons } = joypro
  const [play,reset,light,mode,...remainingButtons] = buttons.map((button) => {
    return `
      <button
        class="nav-item"
        ${button.pushed ? 'data-pushed="true"' : ''}
        data-index="${button.index}"
        data-seat="${seat}"
      >
        <img src="${button.icon || synthia}" alt="button for osc button.icon"/>
      </button>
    `
  })
  const [upDown,leftRight,...remainingThrottles] = throttles.map((throttle) => {
    return `
      <button
        class="nav-item"
        ${throttle.pushed ? 'data-pushed="true"' : ''}
        data-index="${throttle.index}"
        data-seat="${seat}"
      >
        <img src="${throttle.iconAbove || synthia}" alt="button for osc button.icon"/>
      </button>
      <button
        class="nav-item"
        ${throttle.pulled ? 'data-pulled="true"' : ''}
        data-index="${throttle.index}"
        data-seat="${seat}"
      >
        <img src="${throttle.iconBelow || synthia}" alt="button for osc button.icon"/>
      </button>

    `
  })

  return `
    <div class="the-overflow">
      <div class="reality-reality">
        ${remainingThrottles.join('')}
      </div>
      <div class="animated-reality">
        ${remainingButtons.join('')}
      </div>
    </div>
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
  `
}

function loop() {
  const players = party()
  if(players.length === 0) return
  const joypros = players.map(({ gamepad, osc } ) => {
    const buttons = gamepad.buttons
      .sort((a, b) => a.index - b.index)
    const throttles = gamepad.axes
      .sort((a, b) => a.index - b.index)
    return { buttons, throttles }
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
  const { index, seat } = event.target.dataset
  const { joypros } = $.learn()
  const { buttons } = joypros[seat]
	const button = buttons[index]
  fantasyGamepadEvent(seat, button.osc, {
		...button,
		value: 1
	})
}

function release(event) {
const { index, seat } = event.target.dataset
  const { joypros } = $.learn()
  const { buttons } = joypros[seat]
	const button = buttons[index]
  fantasyGamepadEvent(seat, button.osc, {
		...button,
		value: 0
	})
}

$.style(`
  @media screen {
    & {
      display: grid;
      grid-template-columns: 1fr 1fr;
      touch-action: manipulation;
    }
    & .the-cardinal,
    & .the-compass {
      display: grid;
      grid-template-columns: repeat(4, 10px);
      grid-template-rows: repeat(4, 10px);
      gap: 20px;
    }

    & .the-cardinal {
      place-self: start;
    }
    & .the-compass {
      place-self: end;
    }

    & .the-overflow {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    & button {
      pointer-events: all;
      opacity: .25;
    }

    & button:hover,
    & button:focus {
      opacity: .75;
    }

    & .the-overflow button {
      width: 2rem;
      height: 1rem;
    }

    & .animated-reality {
      place-self: end;
    }

    & .reality-reality {
      place-self: start;
    }

    & .the-compass .nav-item:nth-child(1) {
      grid-row: 3 / 5;
      grid-column: 2 / 4;
    }

    & .the-compass .nav-item:nth-child(2) {
      grid-row: 2 / 4;
      grid-column: 3 / 5;
    }

    & .the-compass .nav-item:nth-child(3) {
      grid-row: 2 / 4;
      grid-column: 1 / 3;
    }

    & .the-compass .nav-item:nth-child(4) {
      grid-row: 1 / 3;
      grid-column: 2 / 4;
    }

    & .the-cardinal .nav-item:nth-child(1) {
      grid-row: 1 / 3;
      grid-column: 2 / 4;
    }

    & .the-cardinal .nav-item:nth-child(2) {
      grid-row: 3 / 5;
      grid-column: 2 / 4;
    }

    & .the-cardinal .nav-item:nth-child(3) {
      grid-row: 2 / 4;
      grid-column: 3 / 5;
    }

    & .the-cardinal .nav-item:nth-child(4) {
      grid-row: 2 / 4;
      grid-column: 1 / 3;
    }

    & .the-cardinal .the-cardinal {
      filter: grayscale(1);
    }

    & .nav-item {
      background: linear-gradient(var(--nav-background-start) 0%, var(--nav-background-end) 100%);
      background-size: 1px 14.4rem;
      background-repeat: repeat-x;
      font-weight: bold;
      padding: 0;
      height: 100%;
      width: 100%;
      text-shadow: 0px 2px 0px var(--text-shadow-color);
      transition: all 200ms ease;
      white-space: nowrap;
      border: 2px solid;
      border-radius: 100%;
    }

    ${[...Array(16)].map((_,i) => `
      & [data-index="${i}"] {
        --nav-link-color: var(--wheel-${i}-6);
        --text-shadow-color: var(--wheel-${i}-1);
        --nav-background-start: var(--wheel-${i}-0);
        --nav-background-end: var(--wheel-${i}-2);
        border: var(--wheel-${i}-2);
      }

      & [data-index="${i}"][data-pushed="true"],
      & [data-index="${i}"][data-pulled="true"],
      & [data-index="${i}"]:hover,
      & [data-index="${i}"]:focus {
        --text-shadow-color: var(--wheel-${i}-2);
      }
    `).join('')}

    & .nav-item[data-pushed="true"],
    & .nav-item[data-pulled="true"],
    & .nav-item:hover,
    & .nav-item:focus {
      --nav-link-color: white;
      background-position-y: -7.2rem;
    }
  }

  @media print {
    & {
      display: none;
    }
  }
`)

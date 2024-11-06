import module from '@silly/tag'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'
import { showModal } from './plan98-modal.js'

import party, {
  hostPressesStartStop,
  hostPressesReset,
  hostPressesLight,
  hostPressesMode,
  anybodyPressesStartStop,
  anybodyPressesReset,
  anybodyPressesLight,
  anybodyPressesMode,
} from '@sillonious/party'

const protocol = 'https://'
const locale = 'en_US'

const $ = module('hyper-browser', {
  diskette: 6,
  suggestions: [],
  joypros: [],
  player: doingBusinessAs
})

function drawCompass(buttons) {
  const names = ["in", "next", "back", "out"]

  const [down,right,left,up,...remainingButtons] = buttons.map((button, index) => {
    return `
      <button
        name="${names[index]}"
        class="nav-item"
        ${button.pushed ? 'data-pushed="true"' : ''}
        data-index="${button.index}"
      >
        <img src="${button.icon || synthia}" alt="button for osc button.icon"/>
      </button>
    `
  })

  return `
    ${down}
    ${right}
    ${left}
    ${up}
  `
}

function drawCardinal(buttons) {
  const names = ["jump", "duck", "use", "switch"]

  const [down,right,left,up,...remainingButtons] = buttons.map((button, index) => {
    return `
      <button
        name="${names[index]}"
        class="nav-item"
        ${button.pushed ? 'data-pushed="true"' : ''}
        data-index="${button.index}"
      >
        <img src="${button.icon || synthia}" alt="button for osc button.icon"/>
      </button>
    `
  })

  return `
    ${down}
    ${right}
    ${left}
    ${up}
  `
}


$.draw((target) => {
  const { suggestions, suggestable, joypros } = $.learn()
  if(joypros.length === 0) return
  const { art, diskette } = state['ls/sillonious-memex'] || { art: 'sillyz.computer' }

  const compass = drawCompass(joypros[0].buttons)
  const cardinal = drawCardinal(joypros[0].buttons)

  const deck = findDeck(art, diskette)
  const { saga } = doingBusinessAs[art]
  const film = saga.split('/public')[1]
  const frame = film ? `<iframe src="${film}?world=${plan98.parameters.get('world')}"></iframe>` : ''

  const content = `
    <div class="the-map">
      <div class="suggestions ${suggestable ? 'suggestable' : ''}">
        <div class="suggestion-box">
          ${suggestions.map((x, i) => {
            return `
              <button data-suggestion="${x}">
                ${x}
              </button>
            `
          }).join('')}
        </div>
      </div>

      <input value="${art}">
    </div>

    <div name="transport">
      <div name="actions">
        <div>
          <div class="the-compass">
            ${compass}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="the-cardinal">
            ${cardinal}
          </div>
        </div>
      </div>
    </div>
    <div name="carousel" style="background-color: ${doingBusinessAs[art].color}">
      <div name="screen">
        <button data-open>
          ${frame}
        </button>
        ${deck}
      </div>
    </div>
  `

  return `
    <div name="the-time-machine">
      ${content}
    </div>
  `
})

function findDeck(art, diskette) {
  const { player } = $.learn()
  const cards = Object.keys(player).map((world) => {
    const { mascot, color, image, imageDescription } = doingBusinessAs[world]
    const code = `${window.location.origin}?world=${world}`
    return `
      <div class="sleeve">
        <button class="card ${art === world ? 'active': ''}" data-code="${code}" style="--color: ${color}; --image: url('${image}')">
          <div class="backside">
            <qr-code data-fg="saddlebrown" style="max-height: 120px; margin: auto;" text="${code}"></qr-code>
          </div>
          <div class="frontside">
            <div class="title-bar">
              ${mascot}
            </div>
          </div>
        </button>
      </div>
    `
  }).join('')

  return `
    <div class="deck" style="--hand-offset: ${diskette * -.5}in">
      ${cards}
    </div>
  `
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.when('click', 'iframe', () => {
  alert('wtf')
})

$.when('focus', 'input', event => {
  $.teach({ suggestable: true })
})

$.when('change', 'input', event => {
  event.target.value
})

$.when('blur', 'input', event => {
  setTimeout(() => {
    $.teach({ suggestable: false })
  }, 200)
})

$.when('click', '.card', event => {
  event.stopPropagation()
  const { code } = event.target.dataset
  window.location.href = code
})

$.when('click', '[data-open]', event => {
  const { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes(event.target)
  const art = bin[diskette]
  window.location.href = `${window.location.origin}?world=${art}`
})

$.when('keyup', 'input', event => {
  const { value } = event.target;
  $.teach({ address: value })

  const suggestions = diskettes().filter(x => {
    return x.includes(value)
  })

  $.teach({ suggestions })
})

$.when('click', '[data-suggestion]', event => {
  const { suggestion } = event.target.dataset
  const bin = diskettes()
  const diskette = bin.indexOf(suggestion)
  const art = bin[diskette]
  console.log(diskette)
  state['ls/sillonious-memex'] = { art, diskette }

})

$.when('click', '[name="back"]', () => {
  let { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes()
  const count = bin.length
  diskette = mod(((diskette || 0) - 1), count)
  const art = bin[diskette]
  console.log(diskette)
  state['ls/sillonious-memex'] = { art, diskette }
})

$.when('click', '[name="out"]', () => {
  const hand = Object.keys(doingBusinessAs).filter(coinToss).reduce((business, key) => {
    business[key] = doingBusinessAs[key]
    return business
  }, {})
  $.teach({ player: hand })
  const bin = diskettes()
  const diskette = bin.length - 1
  const art = bin[diskette]
  state['ls/sillonious-memex'] = { art, diskette }
})

function coinToss() { return Math.random() >= 0.5 }

$.when('click', '[name="next"]', (event) => {
  let { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes()
  const count = bin.length
  diskette = mod(((diskette || 0) + 1), count)
  const art = bin[diskette]
  state['ls/sillonious-memex'] = { art, diskette }
})

$.when('click', '[name="in"]', () => {
  const hand = Object.keys(doingBusinessAs).filter(coinToss).reduce((business, key) => {
    business[key] = doingBusinessAs[key]
    return business
  }, {})
  $.teach({ player: hand })
  const bin = diskettes()
  const diskette = 0
  const art = bin[diskette]
  state['ls/sillonious-memex'] = { art, diskette }
})

$.when('click', '[name="jump"]', () => {
  const { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes(event.target)
  const art = bin[diskette]
  window.location.href = `${window.location.origin}?world=${art}`
})

$.when('click', '[name="duck"]', () => {
  const { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes(event.target)
  const art = bin[diskette]

  showModal(`<wizard-journey host="${art}">
    <sillonious-brand host="${art}"></sillonious-brand>
  </wizard-journey>`)
})

$.when('click', '[name="use"]', () => {
})

$.when('click', '[name="switch"]', () => {
})

$.style(`
  & {
    display: block;
		position: relative;
    height: 100%;
    max-height: 100%;
    width: 100%;
    pointer-events: none;
  }

  & .the-map {
    display: grid;
    height: 100%;
    align-content: end;
    width: 100%;
  }
  & .the-compass,
  & .the-cardinal {
    display: inline-grid;
    grid-template-columns: repeat(4, 10px);
    grid-template-rows: repeat(4, 10px);
    gap: 30px;
    background: rgba(0,0,0,.85);
    border-radius: 0 100% 0 0;
    pointer-events: all;
  }


  & .the-cardinal {
    place-content: end;
    border-radius: 100% 0 0 0;
  }

  & .the-compass button,
  & .the-cardinal button{
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
  }
  & .the-compass button::before,
  & .the-cardinal button::before{
    content: '';
    background: radial-gradient(rgba(0,0,0,.85), rgba(0,0,0,.25));
    width: 100%;
    height: 100%;
    display: block;
    z-index: 1;
    position: absolute;
    inset: 0;
    transition: background 100ms ease-out;
  }
  & .the-compass button:hover::before,
  & .the-cardinal button:hover::before {
    background: radial-gradient(rgba(255,255,255,.35), rgba(0,0,0,.15));
  }


  & .the-compass img,
  & .the-cardinal img{
    position: relative;
    z-index: 2;
		width: 100%;
		height: 100%;
  }
  & .the-compass button{
    padding: 0;
  }

  & .the-compass button:nth-child(1) {
    grid-row: 3 / 5;
    grid-column: 2 / 4;
  }

  & .the-compass button:nth-child(2) {
    grid-row: 2 / 4;
    grid-column: 3 / 5;
  }

  & .the-compass button:nth-child(3) {
    grid-row: 2 / 4;
    grid-column: 1 / 3;
  }

  & .the-compass button:nth-child(4) {
    grid-row: 1 / 3;
    grid-column: 2 / 4;
  }

  & .the-cardinal button{
    padding: 0;
  }

  & .the-cardinal button:nth-child(1) {
    grid-row: 3 / 5;
    grid-column: 2 / 4;
    background: green;
  }

  & .the-cardinal button:nth-child(2) {
    grid-row: 2 / 4;
    grid-column: 3 / 5;
    background: orange;
  }

  & .the-cardinal button:nth-child(3) {
    grid-row: 2 / 4;
    grid-column: 1 / 3;
    background: rebeccapurple;
  }

  & .the-cardinal button:nth-child(4) {
    grid-row: 1 / 3;
    grid-column: 2 / 4;
    background: dodgerblue;
  }

  & input {
    border: none;
    background: rgba(0,0,0,.85);
    padding: .5rem 1rem;
    color: white;
    width: 100%;
  }
  & [name="desktop"] {
    background: rgba(0,0,0,.85);
    position: fixed;
    inset: 0;
    overflow: auto;
    padding: 0;
    display: grid;
    grid-template-columns: 3.25in 3.25in 3.25in;
    gap: 1rem;
    padding: 2rem;
  }

  & [name="transport"] {
    overflow-x: auto;
    position: absolute;
    display: grid;
    left: 0;
    right: 0;
    bottom: 2rem;
    z-index: 1100;
    overflow: visible;
  }

  & button,
  & iframe,
  & input{
    pointer-events: all;
  }

  & .suggestions {
    display: none;
    position: relative;
  }

  & .suggestions.suggestable {
    display: block;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 200px;
    max-height: 80vh;
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    transform: translateY(-100%);
    padding: 0 .5rem;
    z-index: 1200;
  }

  & [data-suggestion] {
    display: block;
    text-align: left;
    background: rgba(0,0,0,.65);
    color: rgba(255,255,255,.85);
    border: 0;
    padding: .5rem .5rem;

    border-top: 1px solid rgba(255,255,255,.15);
    border-bottom: 1px solid rgba(0,0,0,.15);
  }


  & [data-suggestion]:hover,
  & [data-suggestion]:focus {
    background: dodgerblue;
    color: rgba(255,255,255,1);
  }

  & [name="actions"] {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: end;
    margin: 0;
    gap: .25rem;
    border-radius: 1.5rem;
    padding: 0;
  }

	& .nav-item {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    border-radius: 100%;
    transition: color 100ms;
    padding: .25rem 1rem;
    z-index: 1;
	}

  & [name="the-time-machine"] {
    position: relative;
    z-index: 1001;
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    height: 100%;
    overflow: hidden;
    grid-template-areas: 'carousel';
  }

  & [name="carousel"] {
    display: none;
    place-self: center;
    overflow: hidden;
    position: relative;
    grid-area: carousel;
    background-size: cover;
  }

  & [name="carousel"] {
    display: grid;
    z-index: 1001;
    width: 100%;
    height: 100%;
    padding: 1rem;
    overflow: hidden;
  }

  & [name="screen"] {
    display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
    place-content: center;
    place-self: start;
    height: calc(100% - 3in);
    width: 100%;
    border-radius: 1rem;
  }


  & [name="screen"] iframe {
    margin: auto;
    width: 100%;
    height: 100%;
    border: none;
  }

  & [data-open] {
    padding: 0;
    border: 0;
    position: relative;
  }

  & [data-open]::before {
    content: '';
    z-index: 2;
    position: absolute;
    inset: 0;
  }

  & .title-bar {
    display: grid;
    text-align: left;
    padding: .05in 0;
    font-size: 12pt;
  }
`)

function diskettes() {
  const { player } = $.learn()
  return Object.keys(player)
}

function t(key) {
  return $.learn()[key]
}

let activeSynths = []
const noop = () => null
const fretMap = [0, 1, 3, 2, 4]

const registers = {
  "x   ": () => console.log('first'),
  " x  ": () => console.log('second'),
  "  x ": () => console.log('third'),
  "   x": () => console.log('fourth'),
}

function toPattern(_$, buttons) {
  const pressed = value => value === 1 ? "x" : " "
  const frets = buttons.map(pressed).slice(0, 4)
  return fretMap.map(i => frets[i]).join('')
}

function toMotion(_$, axes) {
  const [vertical] = [...axes].splice(-1)
  const [horizontal] = [...axes].splice(-2)

  return {
    up: vertical === -1,
    down: vertical === 1,
    left: horizontal === -1,
    right: horizontal === 1
  }
}


requestAnimationFrame(loop)
function loop(time) {
  const players = party()
  if(players.length === 0) return
  const activity = players.reduce((activity, { osc, gamepad }) => {
    const { button, axis } = Object.keys(osc).reduce((pad, path) => {
      const [_, type, index] = path.split('/')
      pad[type][index] = osc[path].value
      return pad
    }, { button: [], axis: [] })
    const pattern =  toPattern($, button)
    activity.patterns.push(pattern)
    activity.commands.push(registers[pattern])
    activity.motions.push(toMotion($, axis))
    return activity
  }, {
    patterns: [],
    commands: [],
    motions: []
  })

  const joypros = players.map(({ gamepad, osc } ) => {
    const buttons = gamepad.buttons
      .sort((a, b) => a.index - b.index)
    const throttles = gamepad.axes
      .sort((a, b) => a.index - b.index)
    return { buttons, throttles }
  })

  $.teach({ joypros })

  activity.commands.filter(x => x).map((command) => {
    command()
  })

  requestAnimationFrame(loop)
}

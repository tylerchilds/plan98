import module from '@sillonious/module'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'

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
  diskette: 0,
  paused: true,
  online: true
})

$.draw((target) => {
  const { paused, online } = $.learn()
  const { art } = state['ls/sillonious-memex'] || { art: 'sillyz.computer' }

  const screen = doingBusinessAs[art]
    ? `<iframe src="/?world=${art}" title="${art}"></iframe>`
    : `<iframe src="${protocol}${art}" title="${art}"></iframe>`

  const content = online ? `
    <div name="transport">
      <div name="actions">
        <button name="back">
          Left
        </button>
        <button name="out">
          Up
        </button>
        <input value="${art}">
        <button name="in">
          Down
        </button>
        <button name="next">
          Right
        </button>
      </div>
    </div>
    <div name="world">
      <middle-earth></middle-earth>
    </div>
    <hr style="display: none;"/>
    <div name="carousel">
      <div name="screen">
        ${screen}
      </div>
    </div>
  ` : `
    <div name="desktop">
      <sticky-note>
        <sillonious-tutorials></sillonious-tutorials>
      </sticky-note>
    </div>
  `

  target.innerHTML =`
    <div name="the-time-machine" class=${paused ? 'circus-enabled' : '' }>
      ${content}
    </div>
  `
})

function mod(x, n) {
  return ((x % n) + n) % n;
}
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
  const { paused, online } = $.learn()
  if(paused) {
    $.teach({ paused: false })
  } else {
    $.teach({ online: false })
  }
})

$.when('click', '[name="next"]', (event) => {
  let { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes()
  const count = bin.length
  diskette = mod(((diskette || 0) + 1), count)
  const art = bin[diskette]
  console.log(diskette)
  state['ls/sillonious-memex'] = { art, diskette }
})

$.when('click', '[name="in"]', () => {
  const { paused } = $.learn()
  if(paused) {
    const { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
    const bin = diskettes(event.target)
    const art = bin[diskette]

    window.location.href = doingBusinessAs[art]
      ? '?world=' + art
      : `${protocol}${art}`
  } else {
    $.teach({ paused: true })
  }
})

$.style(`
  & {
    display: block;
		position: relative;
    height: 100%;
    max-height: 100%;
  }
  & input {
    border: none;
    background: rgba(0,0,0,.85);
    border-radius: 1rem;
    padding: 0 1rem;
    color: white;
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
    bottom: 0;
    z-index: 1100;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    margin: 0 auto .25rem;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

	& button {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
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

  & [name="world"] {
    grid-area: carousel;
  }

  & [name="world"] > * {
    height: 100%;
  }

  & [name="carousel"] {
    display: none;
    place-self: center;
    overflow: hidden;
    position: relative;
    grid-area: carousel;
  }

  & .circus-enabled hr {
    display: block !important;
    position: absolute;
    inset: 0;
    margin: 0;
    padding: 0;
    border: 0;
    height: 100%;
    z-index: 1000;
    background: rgba(0,0,0,.85);
  }

  & .circus-enabled [name="carousel"] {
    display: grid;
    overflow: auto;
    z-index: 1001;
    width: 100%;
    height: 100%;
  }

  & [name="screen"] {
    display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: 1fr;
    place-content: center;
    place-self: center;
    height: 100%;
    width: 100%;
  }


  & [name="screen"] > * {
    margin: auto;
  }
`)


function diskettes() {
  return Object.keys(doingBusinessAs)
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
  const gamepads = party()

  const activity = gamepads.reduce((activity, { osc, gamepad }) => {
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

  activity.commands.filter(x => x).map((command) => {
    command()
  })

  requestAnimationFrame(loop)
}

import module from '@silly/tag'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'

const protocol = 'https://'
const locale = 'en_US'

const $ = module('sillonious-memex', {
  diskette: 0,
  paused: false,
  online: true
})

const tiles = [
  {
    name: 'enter',
    label: '/sillonious-memex/tiles/enter/label.txt',
    styles: {
      'text-align': 'left'
    }
  },
  {
    name: 'escape',
    label: '/sillonious-memex/tiles/escape/label.txt',
    styles: {
      'text-align': 'left'
    }
  },
  {
    name: 'carousel',
    label: '/sillonious-memex/tiles/carousel/label.txt',
  },
  {
    name: 'shift',
    label: '/sillonious-memex/tiles/shift/label.txt',
    styles: {
      'text-align': 'left'
    }
  },
  {
    name: 'tab',
    label: '/sillonious-memex/tiles/tab/label.txt',
    styles: {
      'text-align': 'left'
    }
  }
]

const tileMap = tiles.reduce((map, tile) => {
  map[tile.name] = tile
  fetch(`/strings/${locale}/${tile.label}`)
    .then(res => res.text())
    .then(label => {
      $.teach({ [tile.label]: label })
    })
  return map
}, {})

$.draw((target) => {
  const { paused, online } = $.learn()
  const { art } = state['ls/sillonious-memex'] || { art: 'sillyz.computer' }

  const screen = doingBusinessAs[art]
    ? `<iframe src="/?world=${art}" title="${art}"></iframe>`
    : `<iframe src="${protocol}${art}" title="${art}"></iframe>`

  const content = online ? `
    <div name="transport">
      <div name="actions">
        <button name="${tileMap.enter.name}">
          ${t(tileMap.enter.label)}
        </button>
        <button name="${tileMap.shift.name}">
          ${t(tileMap.shift.label)}
        </button>
        <button name="${tileMap.tab.name}">
          ${t(tileMap.tab.label)}
        </button>
        <button name="${tileMap.escape.name}">
          ${t(tileMap.escape.label)}
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
      <my-admin></my-admin>
    </div>
  `

  target.innerHTML =`
    <div name="the-time-machine" class=${paused ? 'circus-enabled' : '' }>
      ${content}
    </div>
  `
})

$.when('click', '[name="escape"]', () => {
  const { paused } = $.learn()
  if(paused) {
    window.location.href = window.location.href
  }

  alert('new quest coming soon!')
})

$.when('click', '[name="enter"]', () => {
  const { paused, online } = $.learn()
  if(paused) {
    const { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
    const bin = diskettes(event.target)
    const art = bin[diskette]

    window.location.href = doingBusinessAs[art]
      ? '?world=' + art
      : `${protocol}${art}`
  }

  $.teach({ online: !online })
})

$.when('click', '[name="tab"]', (event) => {
  let { diskette } = state['ls/sillonious-memex'] || { diskette: 0 }
  const bin = diskettes()
  const count = bin.length
  diskette = ((diskette || 0) + 1) % count
  const art = bin[diskette]
  console.log(diskette)
  state['ls/sillonious-memex'] = { art, diskette }
})

$.when('click', '[name="shift"]', () => {
  const { paused } = $.learn()
  $.teach({ paused: !paused })
})

$.style(`
  & {
    display: block;
		position: relative;
    height: 100%;
    max-height: 100%;
  }
  & [name="desktop"] {
    position: fixed;
    inset: 0;
    overflow: auto;
    padding: 0;
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 1100;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
		padding-right: 1rem;
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
    grid-template-areas:
      "${tileMap.carousel.name}"
  }

  & [name="world"] {
    grid-area: ${tileMap.carousel.name};
  }

  & [name="world"] > * {
    height: 100%;
  }

  & [name="carousel"] {
    display: none;
    place-self: center;
    overflow: hidden;
    position: relative;
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
    grid-area: ${tileMap.carousel.name};
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

  ${layout(tiles)}
`)

function layout(tiles) {
  return tiles.map((tile) => `
    & [name="${tile.name}"] {
      grid-area: ${tile.name};
      ${bonusStyles(tile)}
    }
  `).join('')
}

function bonusStyles(tile) {
  return tile.styles
    ? Object.keys(tile.styles).map(key => {
      return `${key}: ${tile.styles[key]};`
    }).join('\n')
    : ''
}

function diskettes() {
  return Object.keys(doingBusinessAs)
}

function t(key) {
  return $.learn()[key]
}

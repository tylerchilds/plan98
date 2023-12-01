// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'

const protocol = 'https://'
const locale = 'en_US'

const $ = module('sillonious-memex', {
  diskette: 0
})

const tiles = [
  {
    name: 'enter',
    label: '/sillonious-memex/tiles/enter/label.txt',
    styles: {
      'grid-area': 'enter',
      'place-self': 'start'
    }
  },
  {
    name: 'escape',
    label: '/sillonious-memex/tiles/escape/label.txt',
    styles: {
      'grid-area': 'escape',
      'place-self': 'end'
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
      'grid-area': 'shift',
      'place-self': 'end'
    }
  },
  {
    name: 'tab',
    label: '/sillonious-memex/tiles/tab/label.txt',
    styles: {
      'grid-area': 'tab',
      'place-self': 'start'
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
  const { diskette, paused } = $.learn()
  const bin = diskettes(target)
  const game = bin[diskette]

  const screen = doingBusinessAs[game]
    ? `<sillonious-brand host="${game}" preview="true"></sillonious-brand>`
    : `<iframe src="${protocol}${game}" title="${game}"></iframe>`

  target.innerHTML =`
    <div name="the-time-machine" class=${paused ? 'circus-enabled' : '' }>
      <button name="${tileMap.shift.name}">
        ${t(tileMap.shift.label)}
      <button name="${tileMap.enter.name}">
        ${t(tileMap.enter.label)}
      </button>
      <middle-earth></middle-earth>
      <hr style="display: none;"/>
      <div name="carousel">
        ${screen}
      </div>
      <button name="${tileMap.tab.name}">
        ${t(tileMap.tab.label)}
      </button>
      <button name="${tileMap.escape.name}">
        ${t(tileMap.escape.label)}
      </button>
      </button>
    </div>
  `
})

$.when('click', '[name="escape"]', () => {
  alert('minimize')
})

$.when('click', '[name="enter"]', () => {
  alert('maximize')
})

$.when('click', '[name="tab"]', (event) => {
  const { paused } = $.learn()
  if(!paused) return
  let { diskette } = $.learn()
  const count = diskettes(event.target).length
  diskette = (diskette + 1) % count
  $.teach({ diskette })
})

$.when('click', '[name="shift"]', () => {
  const { paused } = $.learn()
  $.teach({ paused: !paused })
})

$.style(`
  & [name="the-time-machine"] {
    z-index: 1001;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-rows: 2rem auto 2rem;
    grid-template-columns: 1fr 1fr;
    max-height: 100vh;
    overflow: hidden;
    grid-template-areas:
      "${tileMap.shift.name} ${tileMap.enter.name}"
      "${tileMap.carousel.name} ${tileMap.carousel.name}"
      "${tileMap.tab.name} ${tileMap.escape.name}";
  }

  & middle-earth {
    grid-area: ${tileMap.carousel.name};
    height: 100%;
  }

  & [name="carousel"] {
    display: none;
    place-self: center;
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
    display: block;
    z-index: 1001;
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
  return tiles.styles
    ? Object.keys(tile.styles).map(key => {
      debugger
      return `${key}: ${tile.styles[key]};`
    }).join('\n')
    : ''
}

function diskettes(target) {
  return target.closest($.link).getAttribute('bin').split('+')
}

function t(key) {
  return $.learn()[key]
}

import module from '@sillonious/module'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { doingBusinessAs } from './sillonious-brand.js'

const protocol = 'https://'
const locale = 'en_US'

const drives = [
  `<middle-earth></middle-earth>`,
  `<actionable-quests></actionable-quests>`,
  `<favorite-people></favorite-people>`,
  `<interest-groups></interest-groups>`,
  `<public-domain></public-domain>`,
]

const $ = module('sillonious-memex', {
  diskette: 0,
  drive: 0
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
  const { diskette, drive, paused } = $.learn()
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
      <div name="drive">
        ${drives[drive]}
      </div>
      <hr style="display: none;"/>
      <div name="carousel">
        <div name="screen">
          ${screen}
        </div>
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
  if(!paused) {
    let { drive } = $.learn()
    const count = drives.length
    drive = (drive + 1) % count
    $.teach({ drive })
  } else {
    let { diskette } = $.learn()
    const count = diskettes(event.target).length
    diskette = (diskette + 1) % count
    $.teach({ diskette })
  }
})

$.when('click', '[name="shift"]', () => {
  const { paused } = $.learn()
  $.teach({ paused: !paused })
})

$.style(`
  & {
    display: block;
  }
	& button {
		border-radius: 0;
		border: none;
		background: black;
		color: dodgerblue;
	}
  & [name="the-time-machine"] {
    position: relative;
    z-index: 1001;
    display: grid;
    grid-template-rows: 2rem 1fr 2rem;
    grid-template-columns: 1fr 1fr;
    height: 100%;
    overflow: hidden;
    grid-template-areas:
      "${tileMap.shift.name} ${tileMap.enter.name}"
      "${tileMap.carousel.name} ${tileMap.carousel.name}"
      "${tileMap.tab.name} ${tileMap.escape.name}";
  }

  & [name="drive"] {
    grid-area: ${tileMap.carousel.name};
  }

  & [name="drive"] > * {
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
  return tiles.styles
    ? Object.keys(tile.styles).map(key => {
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

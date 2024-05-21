import module from '@silly/tag'
// i channel my runic knowledge to commune with the ancestors and establish contact with the animals
import { showModal } from './plan98-modal.js'

const $ = module('owncast-surfer', {
  channel: 0,
  section: 0,
  sections: [[]],
})

$.draw((target) => {
  const { channel, section, sections } = $.learn()
  const deck = surf(target, 'https://directory.owncast.online/api/home')
  const list = sections[section]

  if(!list.instances) return 'Loading...?'

  const film = list.instances[channel]
  const frame = film ? `<iframe src="${film.url}"></iframe>` : ''

  return `
    <div name="transport">
      <div class="actions" style="transform: rotate(45deg);">
        <button data-action="up"></button>
        <button data-action="right"></button>
        <button data-action="left"></button>
        <button data-action="down"></button>
      </div>
    </div>

    <div name="carousel">
      <div name="screen">
        ${frame}
        ${deck}
      </div>
    </div>

  `
})

function surf(target, channelGuide) {
  if(!target.queried) {
    target.queried = true
    fetch(channelGuide).then((res) => res.json()).then(interdimensionalCable)
  }

  const { sections, section, channel } = $.learn()
  const list = sections[section]
  if(!list.instances) return

  const cards = list.instances.map((station, index) => {
    return `
      <div class="sleeve">
        <button class="card ${channel === index ? 'active': ''}" data-code="${station.url}">
          <div class="backside">
            <qr-code data-fg="saddlebrown" style="max-height: 120px; margin: auto;" text="${station.url}"></qr-code>
          </div>
          <div class="frontside">
            <div class="title-bar">
              ${station.name}
            </div>
            <img src="${station.url + station.logo}" alt="${station.description}" />
            <p>
              ${station.streamTitle}
            </p>
            <p>
              ${station.viewerCount}
            </p>
          </div>
        </button>
      </div>
    `
  }).join('')

  return `
    <div class="name">
      ${list.name}
    </div>
    <div class="deck" style="--hand-offset: ${channel * -.5}in">
      ${cards}
    </div>
  `
}

function interdimensionalCable({ sections }) {
  $.teach({ sections })
}

$.when('click', '.card', event => {
  event.stopPropagation()
  const { code } = event.target.dataset
  window.location.href = code
})

$.when('click', '[data-action]', event => {
  const { action } = event.target.dataset
  dispatch(action)
})


const actions = {
  up: () => {
    const { section, sections } = $.learn()
    
    $.teach({
      section: mod(section - 1, sections.length),
      channel: 0
    })
  },
  left: () => {
    const { section, sections, channel } = $.learn()
    const list = sections[section]
    if(!list.instances) return
    $.teach({
      channel: mod(channel - 1, list.instances.length)
    })
  },
  right: () => {
    const { section, sections, channel } = $.learn()
    const list = sections[section]
    if(!list.instances) return
    $.teach({
      channel: mod(channel + 1, list.instances.length)
    })
  },
  down: () => {
    const { section, sections } = $.learn()
    $.teach({
      section: mod(section + 1, sections.length),
      channel: 0
    })

  }
}

const noop = () => null
function dispatch(action) {
  (actions[action] || noop)()
}



$.style(`
  & {
    display: block;
    height: 100%;
    position: relative;
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
    z-index: 2;
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

  & .card {
    padding: 0;
    pointer-events: all;
    aspect-ratio: 1;
    transform-style: preserve-3d;
    display: block;
    width: 2.5in;
    height: 3.5in;
    line-height: 1;
    border: none;
    background: transparent;
  }

  & .frontside,
  & .backside {
    height: 100%;
    width: 100%;
    box-shadow: 0 0 4px 1px rgba(0,0,0,.85);
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    border-radius: .25in;
    box-sizing: border-box;
    backface-visibility: hidden;
    opacity: .9999;
    transition: transform 200ms ease-in-out, opacity 200ms ease-in-out;
    overflow: hidden;
  }

  & .frontside {
    background: linear-gradient(165deg, black 70%, dodgerblue);
    color: rgba(255,255,255,.85);
    border: .05in solid var(--color);
    padding: .05in;
    transform: rotateY(180deg);
    background-blend-mode: multiply;
    opacity: 0;
  }

  & .backside {
    display: grid;
    place-items: center;
    position: absolute;
    inset: 0;
    background: lemonchiffon;
    z-index: 1;
    transform: rotateY(0deg);
  }

  & .card.active > .frontside {
    pointer-events: none;
    transform: rotateY(0deg);
    opacity: 1;
  }

  & .card.active > .backside {
    transform: rotateY(180deg);
  }

  & .deck {
    white-space: nowrap;
    transform: translateX(var(--hand-offset));
    transition: transform 100ms ease-in-out;
    position: absolute;
    left: calc(50% - 1.25in);
    bottom: 0;
    z-index: 3;
  }

  & .deck .sleeve {
    display: inline-block;
    width: .5in;
  }
  & .deck .card {
    transform: translateY(6rem);
    transition: transfokm 250ms ease-in-out;
  }

  & .deck .card.active {
    transform: translateY(0);
    z-index: 2;
    position: relative;
  }


	& .actions {
		display: grid;
		grid-area: slot;
		grid-template-columns: 1fr 1fr;
		width: 250px;
		height: 250px;
		clip-path: circle(50%);
		place-self: end center;
    bottom: 0;
    left: 0;
    z-index: 4;
    position: absolute;
	}

	& .actions button {
		width: 100%;
		height: 100%;
    border: none;
    background: linear-gradient(-225deg, rgba(200, 200, 200, 1), rgba(128,128,128,1))
	}
`)

function mod(x, n) {
  return ((x % n) + n) % n;
}

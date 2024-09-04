import module from '@silly/tag'

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
      <div class="actions" style="transform: rotate(45deg) translate(-20%, -20%);">
        <button data-action="up"><span>^</span></button>
        <button data-action="right"><span>&gt;</span></button>
        <button data-action="left"><span>&lt;</span></button>
        <button data-action="down"><span>v</span></button>
      </div>
    </div>


    <div name="carousel">
      <div name="screen">
        ${frame}
        ${deck}
      </div>
    </div>
  `
}, {
  afterUpdate: ensureActiveIsCentered
})

function ensureActiveIsCentered(target) {
  const activeItem = target.querySelector('.deck .item.active')
  if(activeItem) {
    activeItem.scrollIntoView()
  }
}

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
        <button class="item ${channel === index ? 'active': ''}" data-code="${station.url}" data-index="${index}">
          <div class="marquee">
            <img src="${station.url + station.logo}" alt="${station.description}" />
            <span class="title-bar">
              ${station.name}
            </span>
            <qr-code data-fg="saddlebrown" style="max-height: 120px; margin: auto;" text="${station.url}"></qr-code>
            <span>
              ${station.streamTitle}
            </span>
            <span>
              ${station.viewerCount}
            </span>
          </div>
        </button>
      </div>
    `
  }).join('')

  return `
    <div class="deck" style="--hand-offset: ${channel * -.5}in">
      ${cards}
    </div>
  `
}

function interdimensionalCable({ sections }) {
  $.teach({ sections })
}

$.when('click', '.item', event => {
  event.stopPropagation()
  const { code, index } = event.target.dataset
  $.teach({ channel: parseInt(index) })
})

$.when('click', '[data-action]', event => {
  const { action } = event.target.dataset
  dispatch(action)
})


const actions = {
  left: () => {
    const { section, sections } = $.learn()
    
    $.teach({
      section: mod(section - 1, sections.length),
      channel: 0
    })
  },
  up: () => {
    const { section, sections, channel } = $.learn()
    const list = sections[section]
    if(!list.instances) return
    $.teach({
      channel: mod(channel - 1, list.instances.length)
    })
  },
  down: () => {
    const { section, sections, channel } = $.learn()
    const list = sections[section]
    if(!list.instances) return
    $.teach({
      channel: mod(channel + 1, list.instances.length)
    })
  },
  right: () => {
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
    overflow: hidden;
  }

  & [name="screen"] {
    display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 200px;
    place-content: center;
    place-self: start;
    height: 100%;
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

  & .item.active {
    background-color: dodgerblue;
  }

  & .card.active > .backside {
    transform: rotateY(180deg);
  }

  & .deck {
    white-space: nowrap;
    transition: transform 100ms ease-in-out;
    height: 100%;
    width: 100%;
    z-index: 3;
    overflow-x: hidden;
  }

  & .deck .sleeve {
    height: 2rem;
  }

  & .sleeve img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    aspect-ratio: 1;
    display: inline-block;
  }
  & .sleeve qr-code {
    height: 100%;
    display: inline-block;
    margin: 0;
  }

  & .sleeve button {
    width: 100%;
    display: block;
    height: 100%;
    text-align: left;
    border: none;
    border-radius: none;
    background: rgba(0,0,0,.65);
    background-image: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    color: white;
  }

  & .sleeve button:hover,
  & .sleeve button:focus {
    background-color: dodgerblue;
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
		width: 125px;
		height: 125px;
		clip-path: circle(50%);
		place-self: end center;
    bottom: 0;
    right: 2rem;
    z-index: 4;
    position: absolute;
	}

  & .actions [data-action] span {
    transform: rotate(-45deg);
    display: block;
  }

	& .actions button {
		width: 100%;
		height: 100%;
    border: none;
    background: linear-gradient(-225deg, rgba(200, 200, 200, 1), rgba(128,128,128,1))
	}

  & .marquee {
    animation: &-marquee 10000ms linear infinite;
    white-space: nowrap;
    height: 100%;
    display: inline-flex;
    overflow: hidden;
  }

 @keyframes &-marquee {
   0% {
     transform: translateX(50%);
     opacity: 0;
   }

   5% {
    opacity: 1;
   }

   95% {
    opacity: 1;
   }
   100% {
     transform: translateX(-50%);
     opacity: 0;
   }
 }


`)

function mod(x, n) {
  return ((x % n) + n) % n;
}

import tag from '@silly/tag'
import $intro from './plan98-intro.js'
import $zune from './plan9-zune.js'
import { actionScript } from './action-script.js'

$zune.teach({ menu: false })

const $ = tag('sillyz-computer')

export const lookup = {
  '004': {
    title: "Charmander's",
    subtitle: "Ember",
    tag: 'sillyz-ocarina',
    latitude: '37.769100',
    longitude: '-122.454583',
  },
  '007': {
    title: "Squirtle's",
    subtitle: "Bubble",
    tag: 'sillyz-ocarina',
    latitude: '37.771336',
    longitude: '-122.460065',
  },
  '035': {
    title: "Clefairy's",
    subtitle: "Metronome",
    tag: 'sillyz-ocarina',
    latitude: '37.772006',
    longitude: '-122.462220',
  },
  '097': {
    title: "Hypno's",
    subtitle: "Future Sight",
    tag: 'sillyz-ocarina',
    latitude: '37.772322',
    longitude:  '-122.465443',
  },
  '134': {
    title: "Vaporeon's",
    subtitle: "Aurora Beam",
    tag: 'sillyz-ocarina',
    latitude: '37.772366',
    longitude: '-122.467315',
  },
  '147': {
    title: "Dratini's",
    subtitle: "Dragon Dance",
    tag: 'sillyz-ocarina',
    latitude: '37.771326',
    longitude: '-122.470304',
  },
}

$.draw(target => {
  const src = target.getAttribute('src') || '/404'
  const { resourceLevel, resourceActions } = $.learn()

  if(!resourceLevel) {
    return `
      <div class="resource">
        ${ resourceActions ? resourceMenu(resourceActions) : `<button data-create="${src}" aria-label="create"></button>` }
      </div>
    `
  }

  if(lookup[target.id]) {
    return `<middle-earth id="${target.id}"></middle-earth>`
  }

  return `
    <div class="bottom">
      <plan98-intro src="${src}"></plan98-intro>
    </div>
    <div class="top">
      <plan9-zune></plan9-zune>
    </div>
  `
})

function resourceMenu(actions) {
  const list = actions.map((data) => {
    const attributes = Object.keys(data).map(key => {
      return `data-${key}="${data[key]}"`
    }).join(' ')
    return `
      <div>
        <button class="action-script" ${attributes}>
          ${data.text}
        </button>
      </div>
    `
  }).join('')

  return `
    <div class="synthia">
      <div>
        <button data-no-actions> 
          back
        </button>
      </div>
      ${list}
    </div>
  `
}

$.when('click', '[data-no-actions]', (event) => {
  $.teach({ resourceActions: null })
})
$.when('click', '[data-create]', (event) => {
  $.teach({
    resourceActions: [
      {
        text: 'low',
        action: 'low',
        script: import.meta.url,
        src: event.target.dataset.create
      },
      {
        text: 'medium',
        action: 'medium',
        script: import.meta.url,
        src: event.target.dataset.create
      },
      {
        text: 'ultra',
        action: 'ultra',
        script: import.meta.url,
        src: event.target.dataset.create
      },
    ]
  })
})

$.when('click', '.action-script', actionScript)
export function low(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = src
}

export function medium(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = '/9' + src
}

export function ultra(event) {
  if(event.type === 'popstate') {
    $.teach({ resourceLevel: null, resourceActions: null })
  } else {
    const to = 'ultra'
    self.history.pushState({ type: 'resourceLevel', from: null, to }, "");
    $.teach({ resourceLevel: to })
  }
}

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    background: #54796d;
  }

  & .top {
    position: absolute;
    inset: 0 0 3rem 0;
    grid-area: midship;
    z-index: 2;
    pointer-events: none;
  }

  & .bottom {
    position: absolute;
    inset: 2rem 0 0 0;
    grid-area: midship;
  }

  & [data-create] {
    background: lemonchiffon;
    border: none;
    border-radius: none;
    box-shadow: var(--shadow);
    padding: 2rem;
    max-width: 10rem;
    aspect-ratio: 1;
    width: 100%;
  }

  & [data-create]::before{
    content: '';
    display: block;
    width: 100%;
    aspect-ratio: 1;
    background-color: #E83FB8;
    border-radius: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }

  & .resource {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  & .synthia button {
    font-weight: 100;
    color: rgba(0,0,0,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .synthia button:hover,
  & .synthia button:focus {
    color: rgba(0,0,0,1);
  }
}
  & .synthia {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .synthia:not(:empty) {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
    width: 100%;
    height: 100%;
    background: white;
  }
`)


function handleEvent (event) {
  if (event.metaKey) {
    handleSuperKey(event)
  }
}
self.addEventListener('keydown', handleEvent);

self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'metaKey') {
    handleSuperKey()
  } else { console.log(event) }
});

function handleSuperKey(event) {
  const { menu } = $zune.learn()
  $zune.teach({ menu: !menu })

  const { broken } = $intro.learn()
  $intro.teach({ broken: !broken })

  if(document.querySelector('plan9-zune')) return

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    const node = document.body.querySelector('sillonious-brand') || document.body
    node.insertAdjacentHTML("beforeend", '<sillyz-computer></sillyz-computer>')
  }
}



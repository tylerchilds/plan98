import tag from '@silly/tag'
import $intro from './plan98-intro.js'
import $zune from './plan9-zune.js'

$intro.teach({ broken: true })

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
  const { resources, resourceActions } = $.learn()

  if(!resources) {
    return `
      <div class="resource">
        ${ resourceActions ? '' : '<button data-create aria-label="create"></button>' }
      </div>
    `
  }

  const src = target.getAttribute('src') || '/app/startup-wizard'
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

$.when('click', '[data-create]', (event) => {
  $.teach({ resources: 'medium' })
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
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
  }

  & [data-create]::before{
    content: '';
    display: block;
    width: 6rem;
    height: 6rem;
    background-color: #E83FB8;
    border-radius: 100%;
  }

  & .resource {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
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



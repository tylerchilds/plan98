import elf from '@plan98/elf'
import natsort from 'natsort'
const sorter = natsort();

const REMOTE = 'REMOTE'
const PLAYER = 'PLAYER'

const media = {
  '123': {
    title: 'the tale of cyr otr',
    artist: 'sillyz.computer',
    description: 'the cyber otter pranks the multiverse',
    keyart: '/public/cdn/boxart.svg',
  },
  '456': {
    title: 'wally joins the circus',
    artist: 'sillyz.computer',
    description: 'the dragon quits hoarding gold',
    keyart: '/public/cdn/boxart.svg',
  },
  '789': {
    title: 'quantum elves',
    artist: 'sillyz.computer',
    description: 'the elves create an accidental stasis oasis',
    keyart: '/public/cdn/boxart.svg',
  },
}

const baddata = {
  title: 'Untitled',
  artist: 'Unknown',
  description: '---',
  keyart: '/public/cdn/boxart.svg',
}

const library = Object.keys(media)

const views = {
  [REMOTE]: (target) => {
    return `
      <div class="library">
        ${alphabeticallySort(library, 'title')}
      </div>
    `
  },
  [PLAYER]: (target) => {
    const { contentId } = $.learn()
    const content = media[contentId] || baddata
    return `
      <div>
        <qr-code src="${window.location.origin}/app/media-mirror?view=${REMOTE}"></qr-code>
        ${content.title}
        ${content.artist}
      </div>
    `
  }
}

const $ = elf('media-mirror', {
  view: 'PLAYER',
  media: '123',
  playerCount: 0
})

function increment() {
  $.teach({ playerCount: $.learn().playerCount + 1 })
}

function decrement() {
  $.teach({ playerCount: $.learn().playerCount - 1 })
}

$.when('click', '[data-play]', (event) => {
  const { play } = event.target.dataset
  $.teach({ contentId: play })
})

$.draw((target) => {
  const view = target.getAttribute('view')
  return (views[view] || views[PLAYER])(target)
}, {
  beforeUpdate(target) {
    if(target.mounted) return
    target.mounted = true
  },
  afterUpdate(target) {

  }
})

function alphabeticallySort(library, attribute) {
  const usedLetters = {}

  const tiles = library.sort(function(a, b) {
    const x = media[a][attribute]
    const y = media[b][attribute]
    return sorter(x.toLowerCase(), y.toLowerCase());
  }).map((key) => {
    const content = media[key]
    const lowerFirst = content[attribute][0].toLowerCase()
    let prefix
    if(!usedLetters[lowerFirst]) {
      usedLetters[lowerFirst] = true
      prefix = `<a class="category" href="#back-to-top">${lowerFirst}</a><a name="${$.link}-${lowerFirst}" class=""></a>`
    }

    return `
      <div class="tile">
        ${prefix}
        <div>
          <button data-play="${key}">
            ${content[attribute]}
          </button>
        </div>
      </div>
    `
  }).join('');

  return `
    <div class="categories">
      ${
        Object
          .keys(usedLetters)
          .sort(natsort())
          .map(x => `<a href="#${$.link}-${x}" class="category">${x}</a>`)
          .join('')
      }
    </div>
    <a name="back-to-top"></a>
    ${tiles}
  `
}

$.style(`
  & {
    background: black;
    color: rgba(255,255,255,.85);
    display: grid;
    height: 100%;
  }

  & .library {
    font-weight: 100;
    font-size: 2rem;
    line-height: 1;
    background: black;
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.95)), linear-gradient(var(--color), var(--accent-color-0));
    color: rgba(255,255,255,.65);
    height: 100%;
    overflow-y: auto;
    display: block;
    padding: 2rem 0 3rem;
    gap: 2rem;
  }

  & .library .tile {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  & .categories {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  }

  & .category {
    margin: 1rem 0 0;
    display: inline-block;
    padding: 0;
    border: 1px solid rgba(255,255,255,.65);
    line-height: 1;
    aspect-ratio: 1;
    opacity: .65;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: end end;
  }

  & .category:hover,
  & .category:focus {
    opacity: 1;
  }

  & .library a:link,
  & .library a:visited {
    color: rgba(255,255,255,.65);
  }

  & .library a:hover,
  & .library a:focus {
    color: rgba(255,255,255,1);
  }
`)

import elf from '@silly/elf'

export const products = {
  jokebook: {
    title: 'Joke Book',
    artist: 'Tyler Childs',
    description: 'A personal journal for the any type of different joke.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="jokebook"></box-art>',
    url: '/app/joke-book'
  },
  memex: {
    title: 'Plan98:Memex',
    artist: 'Tyler Childs',
    description: 'Forget forgetting. Agency over memory. Your brains.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="memex"></box-art>',
    url: '/app/time-machine'
  },
  songwave: {
    title: 'Song Wave',
    artist: 'Tyler Childs',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="songwave"></box-art>',
    url: '/app/couch-coop?rom=song-wave'
  },
  finalboss: {
    title: 'Final Boss',
    artist: 'Tyler Childs',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="finalboss"></box-art>',
    url: '/app/paper-pocket?rom=final-boss'
  },
  securemail: {
    title: 'Secure Mail',
    artist: 'Tyler Childs',
    description: 'Email is the preferred communication for busy people.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="securemail"></box-art>',
    url: '/app/secure-mail'
  },
  coolchat: {
    title: 'Cool Chat',
    artist: 'Tyler Childs',
    description: 'Nobody likes downloading or using chat apps, say hi and bye',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="coolchat"></box-art>',
    url: '/app/cool-chat'
  },
  drawterm: {
    title: 'Draw Term',
    artist: 'Tyler Childs',
    description: 'Swipe a windows',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="drawterm"></box-art>',
    url: '/app/draw-term'
  },
  typohero: {
    title: 'Typo Hero',
    artist: 'Tyler Childs',
    description: 'Learn to type on a five chorder with a strummer input',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="typohero"></box-art>',
    url: '/app/typo-hero'
  },
  filesystem: {
    title: 'File System',
    artist: 'Tyler Childs',
    description: 'View all your files',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="filesystem"></box-art>',
    url: '/app/file-system'
  },
  sonicknuckles: {
    title: 'Sonic &amp; Knuckles',
    artist: 'Sonic 3 A.I.R.',
    description: 'Retro Future Childhood Nostalgia',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="sonicknuckles"></box-art>',
    url: '/app/sonic-knuckles'
  },

}

const $ = elf('box-art')

$.draw((target) => {
  const product = products[target.getAttribute('product')]

  if(!product) {
    return `
      404
    `
  }

  return `
    <div>
      <span class="product-title">
        ${product.title}
      </span>
      <span class="product-artist">
        ${product.artist}
      </span>
    </div>
    <div class="product-description">
      ${product.description}
    </div>
    <div class="product-keyart">
      <img src="${product.keyart}" />
    </div>
    <button class="standard-button product-button" data-url="${product.url}">
      Launch
    </button>
  `
})

$.when('click', '.product-button', (event) => {
  const { url } = event.target.dataset
  window.location.href = url
})

$.style(`
  & {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    background: black;
  }

  & .product-title {
    color: rgba(255,255,255, .95);
    font-size: 1.2rem;
    position: relative;
    font-weight: bold;
    z-index: 3;
    background: black;
    padding: 1rem;
  }

  & .product-keyart {
    position: absolute;
    inset: 0;
    object-fit: contain;
    display: grid;
  }

  & .product-keyart img {
    margin: auto;
  }

  & .product-artist {
    color: rgba(255,255,255, .85);
    background: black;
    position: relative;
    font-size: .9rem;
    padding: 4px;
    z-index: 3;
  }

  & .product-description {
    color: rgba(255,255,255, .85);
    background: black;
    position: relative;
    z-index: 3;
    margin-bottom: 1rem;
    padding: .5rem;
  }

  & .product-button {
    max-width: 100%;
    width: 240px;
    position: relative;
    z-index: 3;
  }
`)

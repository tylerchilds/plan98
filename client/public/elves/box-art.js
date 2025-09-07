import elf from '@silly/elf'

export const products = {
  jokebook: {
    title: 'Joke Book',
    artist: 'Sillyz.Computer',
    description: 'A personal journal for the any type of different joke.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="jokebook"></box-art>',
    url: '/app/joke-book'
  },
  memex: {
    title: 'Plan98:Memex',
    artist: 'Sillyz.Computer',
    description: 'Forget forgetting. Agency over memory. Your brains.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="memex"></box-art>',
    url: '/app/time-machine'
  },
  tuner: {
    title: 'Music Tuner',
    artist: 'Bloop.Monster',
    description: 'A string tuner for guitar and uke, then more...',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="tuner"></box-art>',
    url: '/app/music-tuner'
  },
  songwave: {
    title: 'Song Wave',
    artist: 'Sillyz.Computer',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="songwave"></box-art>',
    url: '/app/couch-coop?rom=song-wave'
  },
  finalboss: {
    title: 'Final Boss',
    artist: 'Sillyz.Computer',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="finalboss"></box-art>',
    url: '/app/paper-pocket?rom=final-boss'
  },
  securemail: {
    title: 'Secure Mail',
    artist: 'Sillyz.Computer',
    description: 'Email is the preferred communication for busy people.',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="securemail"></box-art>',
    url: '/app/e-mail'
  },
  coolchat: {
    title: 'Cool Chat',
    artist: 'Sillyz.Computer',
    description: 'Nobody likes downloading or using chat apps, say hi and bye',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="coolchat"></box-art>',
    url: '/app/cool-chat'
  },
  drawterm: {
    title: 'Draw Term',
    artist: 'Sillyz.Computer',
    description: 'Swipe a windows',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="drawterm"></box-art>',
    url: '/app/draw-term'
  },
  typohero: {
    title: 'Typo Hero',
    artist: 'Sillyz.Computer',
    description: 'Learn to type on a five chorder with a strummer input',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="typohero"></box-art>',
    url: '/app/typo-hero'
  },
  filesystem: {
    title: 'File System',
    artist: 'Sillyz.Computer',
    description: 'View all your files',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="filesystem"></box-art>',
    url: '/app/file-system'
  },
  stardew: {
    title: 'Stardew Valley',
    artist: 'StardewValley.Net',
    description: 'A slice of life simulator on your slice of life simulator',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="stardew"></box-art>',
    url: 'steam://rungameid/413150'
  },
  sonicknuckles: {
    title: 'Sonic &amp; Knuckles',
    artist: 'Sonic 3 A.I.R.',
    description: 'Retro Future Childhood Nostalgia',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="sonicknuckles"></box-art>',
    url: '/app/sonic-knuckles'
  },
  tamashika: {
    title: 'Tamashika',
    artist: 'QuickTequila.Com',
    description: 'ATTENTION IS ALL YOU NEED',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="tamashika"></box-art>',
    url: 'steam://rungameid/3788220'
  },
  netflix: {
    title: 'Netflix',
    artist: 'Netflix.Com',
    description: 'Movies',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="netflix"></box-art>',
    url: 'https://netflix.com'
  },
  google: {
    title: 'Google',
    artist: 'Google.Com',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="google"></box-art>',
    url: 'https://google.com'
  },
  archive: {
    title: 'Archive',
    artist: 'Archive.Org',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="archive"></box-art>',
    url: 'https://archive.org'
  },
  bluesky: {
    title: 'Bluesky',
    artist: 'Bsky.App',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="bluesky"></box-art>',
    url: 'https://bsky.app/'
  },
  blue98: {
    title: 'Blue98',
    artist: 'Sillyz.Computer',
    description: 'A social media network inside a social media network',
    keyart: '/public/cdn/boxart.svg',
    boxart: '<box-art product="blue98"></box-art>',
    url: '/app/blue-sky'
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
    <div class="product-actions">
      <button class="standard-button product-button" data-launch="${product.url}">
        Launch
      </button>
      <button class="standard-button" data-browse>
        Swap
      </button>
    </div>
  `
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
    padding: .5rem;
  }
  & .product-keyart {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
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

  & .product-actions button {
    position: relative;
    z-index: 3;
  }
`)

import elf from '@silly/elf'

export const products = {
  jokebook: {
    title: 'Joke Book',
    artist: 'Sillyz.Computer',
    description: 'A personal journal for the any type of different joke.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="jokebook"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/joke-book'
  },
  memex: {
    title: 'Plan98:Memex',
    artist: 'Sillyz.Computer',
    description: 'Forget forgetting. Agency over memory. Your brains.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="memex"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/time-machine'
  },
  desktop: {
    title: 'Door Man',
    artist: 'Sillyz.Computer',
    description: 'A multi tasker that can summon answers to inqueries from thin air.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="desktop"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/door-man'
  },
  mobile: {
    title: 'Mobile Device',
    artist: 'Sillyz.Computer',
    description: 'A mobile device in your mobile device for directions inside.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="mobile"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Mobile/manifest.m3u8',
    url: '/app/mobile-device'
  },
  coop: {
    title: 'Couch Cooperative',
    artist: 'Sillyz.Computer',
    description: 'A couch cooperative multiplayer experience',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="coop"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Gaming/manifest.m3u8',
    url: '/app/couch-coop'
  },
  shell: {
    title: 'yo(UR SH)ell',
    artist: 'Sillyz.Computer',
    description: 'Your universal resource shell for securely dialing code',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="shell"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Shell/manifest.m3u8',
    url: '/app/ur-shell'
  },
  tuner: {
    title: 'Music Tuner',
    artist: 'Bloop.Monster',
    description: 'A string tuner for guitar and uke, then more...',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="tuner"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/music-tuner'
  },
  songwave: {
    title: 'Song Wave',
    artist: 'Sillyz.Computer',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="songwave"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/couch-coop?rom=song-wave'
  },
  finalboss: {
    title: 'Final Boss',
    artist: 'Sillyz.Computer',
    description: 'A multiplayer game to face and save the music.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="finalboss"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/paper-pocket?rom=final-boss'
  },
  securemail: {
    title: 'Secure Mail',
    artist: 'Sillyz.Computer',
    description: 'Email is the preferred communication for busy people.',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="securemail"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/e-mail'
  },
  coolchat: {
    title: 'Cool Chat',
    artist: 'Sillyz.Computer',
    description: 'Nobody likes downloading or using chat apps, say hi and bye',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="coolchat"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/cool-chat'
  },
  drawterm: {
    title: 'Draw Term',
    artist: 'Sillyz.Computer',
    description: 'Swipe a windows',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="drawterm"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/draw-term'
  },
  typohero: {
    title: 'Typo Hero',
    artist: 'Sillyz.Computer',
    description: 'Learn to type on a five chorder with a strummer input',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="typohero"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/typo-hero'
  },
  filesystem: {
    title: 'File System',
    artist: 'Sillyz.Computer',
    description: 'View all your files',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="filesystem"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/file-system'
  },
  stardew: {
    title: 'Stardew Valley',
    artist: 'StardewValley.Net',
    description: 'A slice of life simulator on your slice of life simulator',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="stardew"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'steam://rungameid/413150'
  },
  sonicknuckles: {
    title: 'Sonic &amp; Knuckles',
    artist: 'Sonic 3 A.I.R.',
    description: 'Retro Future Childhood Nostalgia',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="sonicknuckles"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: '/app/sonic-knuckles'
  },
  tamashika: {
    title: 'Tamashika',
    artist: 'QuickTequila.Com',
    description: 'ATTENTION IS ALL YOU NEED',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="tamashika"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'steam://rungameid/3788220'
  },
  netflix: {
    title: 'Netflix',
    artist: 'Netflix.Com',
    description: 'Movies',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="netflix"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'https://netflix.com'
  },
  google: {
    title: 'Google',
    artist: 'Google.Com',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="google"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'https://google.com'
  },
  archive: {
    title: 'Archive',
    artist: 'Archive.Org',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="archive"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'https://archive.org'
  },
  bluesky: {
    title: 'Bluesky',
    artist: 'Bsky.App',
    description: 'Inventory',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="bluesky"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
    url: 'https://bsky.app/'
  },
  blue98: {
    title: 'Blue98',
    artist: 'Sillyz.Computer',
    description: 'A social media network inside a social media network',
    keyart: '/public/cdn/boxart.svg',
    launcher: '<box-art product="blue98"></box-art>',
    trailer: '/public/cdn/sillyz.computer/six-modalities/Desktop/manifest.m3u8',
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
    <div>
      <span class="product-description">
        ${product.description}
      </span>
    </div>
    <div class="product-actions">
      <button class="gaming-button -a" data-launch="${product.url}">
        Launch
      </button>
      <button class="gaming-button -b" data-browse>
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
    line-height: 1.75;
  }

  & .product-actions {
    text-align: right;
  }
  & .product-actions button {
    position: relative;
    z-index: 3;
  }
`)

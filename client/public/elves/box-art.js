import elf from '@silly/elf'

export const products = {
  jokebook: {
    title: 'Joke Book',
    artist: 'Tyler Childs',
    description: 'A personal journal for the any type of different joke.',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="jokebook"></box-art>',
    url: '/app/joke-book'
  },
  memex: {
    title: 'Plan98:Memex',
    artist: 'Tyler Childs',
    description: 'Forget forgetting. Agency over memory. Your brains.',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="memex"></box-art>',
    url: '/app/time-machine'
  },
  songwave: {
    title: 'Song Wave',
    artist: 'Tyler Childs',
    description: 'A multiplayer game to face and save the music.',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="songwave"></box-art>',
    url: '/app/couch-coop?rom=song-wave'
  },
  finalboss: {
    title: 'Final Boss',
    artist: 'Tyler Childs',
    description: 'A multiplayer game to face and save the music.',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="finalboss"></box-art>',
    url: '/app/paper-pocket?rom=final-boss'
  },
  securemail: {
    title: 'Secure Mail',
    artist: 'Tyler Childs',
    description: 'Email is the preferred communication for busy people.',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="securemail"></box-art>',
    url: '/app/secure-mail'
  },
  coolchat: {
    title: 'Cool Chat',
    artist: 'Tyler Childs',
    description: 'Nobody likes downloading or using chat apps, say hi and bye',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="coolchat"></box-art>',
    url: '/app/cool-chat'
  },
  drawterm: {
    title: 'Draw Term',
    artist: 'Tyler Childs',
    description: 'Swipe a windows',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="drawterm"></box-art>',
    url: '/app/draw-term'
  },
  typohero: {
    title: 'Typo Hero',
    artist: 'Tyler Childs',
    description: 'Learn to type on a five chorder with a strummer input',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="typohero"></box-art>',
    url: '/app/typo-hero'
  },
  filesystem: {
    title: 'File System',
    artist: 'Tyler Childs',
    description: 'View all your files',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
    boxart: '<box-art product="filesystem"></box-art>',
    url: '/app/file-system'
  },
  sonicknuckles: {
    title: 'Sonic &amp; Knuckles',
    artist: 'Sonic 3 A.I.R.',
    description: 'Retro Future Childhood Nostalgia',
    keyart: '<img class="boxart" src="/cdn/boxart.svg" alt="keyart" />',
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
    ${product.title}
    ${product.artist}
    ${product.description}
  `
})


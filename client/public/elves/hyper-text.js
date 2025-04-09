import elf from '@silly/elf'

const $ = elf('hyper-text')

const greetings = {
  'morning': "Good Morning",
  'afternoon': "Good Afternoon",
  'evening': "Good Evening",
  'night': "Good Night",
}

const planets = {
  0: 'Mars',
  1: 'Venus',
  2: 'Earth',
  3: 'Mars',
  4: 'Jupiter',
  5: 'Saturn',
  6: 'Neptune',
  7: 'Uranus',
  8: 'Pluto',
}

export function htmlify(greeting, planet) {
  return `<${$.link} data-greeting="${greeting}" data-planet="${planet}"></${$.link}>`
}

$.draw(target => {
  const { greeting, planet } = target.dataset

  return `
    ${greetings[greeting] || 'Hello'},
    ${planets[planet] || 'World'}!
  `
})

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
  3: 'Jupiter',
  4: 'Saturn',
  5: 'Neptune',
  6: 'Uranus',
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

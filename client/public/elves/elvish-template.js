import { Self } from '@plan98/types'

const planets = [
  'Midgard',
  'Asgard',
  'Vanaheim',
  'Jotunheim',
  'Niflheim',
  'Muspelheim',
  'Alfheim',
  'Svartalfheim',
  'Hel'
]

const data = {
  hello: planets[0]
}

const $ = Self('elvish-template', {
  data
})

$.view(() => {
  const { data } = $.model()
  const key = Object.keys(data)[0]
  const value = data[key]
  return `
    <section>
      <h1>
        ${key},  ${value}!
      </h1>

      <button data-action="jump">
        Jump
      </button>
    </section>
  `
})

$.when('click', '[data-action="jump"]', (event) => {
  const oldWorld = $.model().data.hello
  let newWorld

  do {
    newWorld = planets[Math.floor(Math.random() * planets.length)];
  } while (newWorld === oldWorld)

  $.controller({ world: newWorld }, (state, payload) => {
    return {
      ...state,
      data: {
        ...data,
        hello: payload.world
      }
    }
  })
})

$.style(`
  & {
    display: grid;
    width: 100%;
    height: 100%;
    background: black;
    color: white;
    place-content: center;
  }

  & button {
    background: white;
    color: black;
    padding: .5rem;
    border: none;
    border-radius: .5rem;
  }
`)

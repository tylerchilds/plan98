import module from '@silly/tag'

const $ = module('hello-universe', {
  // set an initial array of planets
  'planets': [
    {
      'id': 'mercury',
      'name': 'Mercury',
      'background': 'sienna'
    },
    {
      'id': 'venus',
      'name': 'Venus',
      'background': 'darkgoldenrod'
    },
    {
      'id': 'Earth',
      'name': 'Earth',
      'background': 'deepskyblue'
    },
    {
      'id': 'mars',
      'name': 'Mars',
      'background': 'orangered'
    },
    {
      'id': 'jupiter',
      'name': 'Jupiter',
      'background': 'lightsalmon'
    },
    {
      'id': 'saturn',
      'name': 'Saturn',
      'background': 'bisque'
    },
    {
      'id': 'neptune',
      'name': 'Neptune',
      'background': 'dodgerblue'
    },
    {
      'id': 'uranus',
      'name': 'Uranus',
      'background': 'darkturquoise'
    }
  ],
  // an incrementable integer for looping through planets
  'tick': 0,
  // a boolean value to control visibility of the admin view
  'showAdmin': false
})

// increase our tick twice a second (once every 500 milliseconds)
setInterval(function tick() {
  const { tick } = $.learn()
  $.teach({ tick: tick + 1 })
}, 500)

$.draw(() => {
  // pluck our current values from our current state
  const { planets, tick, showAdmin } = $.learn()

  if(!planets) return
  // get the current planet by modulo of current tick by # of planets
  const current = planets[tick % planets.length]

  // save html for displaying the current planet
  const view = `
    <button class="admin-toggle">
      Manage Planets
    </button>
    <planet style="--planet-background: ${current.background}">
      <greeting>Hello ${current.name}</greeting>
    </planet>
  `

  // save html for displaying the admin view
  const admin = `
    <button class="admin-toggle">
      View Planets
    </button>
    <admin>
      ${renderAdministrationTable(planets)}
      <button class="add-planet">Add Planet</button>
    </admin>
  `

  // determine which html is visible
  return showAdmin ? admin : view
})

// toggle the showAdmin variable on button click
$.when('click', 'button.admin-toggle', () => {
  const showAdmin = ! $.learn().showAdmin
  $.teach({ showAdmin })
})

// create a random planet with the current tick as a seed
$.when('click', 'button.add-planet', () => {
  const { tick } = $.learn()
  $.teach({
    id: `planet-${tick}`,
    name: `Planet ${tick}`,
    background: 'cornsilk'
  }, addPlanet)
})

// surgically add a new planet to our tag's state
function addPlanet(state, payload) {
  return {
    ...state,
    planets: [
      ...state.planets,
      payload
    ]
  }
}

// update planet information when input values have been changed
$.when('keyup', 'admin input', (event) => {
  const { value, dataset } = event.target
  const { id, attribute } = dataset

  $.teach({
    id,
    attribute,
    value
  }, updatePlanet)
})

// return the index of the planet with a given id
function getPlanetIndexById(id) {
  const index = $.learn().planets
    .findIndex(x => x.id === id)

  return index
}

// surgically update planet information in our tag's state
function updatePlanet(state, payload){
  const { id, attribute, value } = payload

  const index = getPlanetIndexById(id)
  const planet = state.planets[index]

  return {
    ...state,
    planets: [
      ...state.planets.slice(0, index),
      { ...planet, [attribute]: value },
      ...state.planets.slice(index + 1)
    ]
  }
}

// loop over the planets array to create a complex form to manage values
function renderAdministrationTable(planets) {
  const rows = planets.map(x => `
    <input type="text" data-id="${x.id}"
      value="${x.id}" data-attribute="id" />
    <input type="text" data-id="${x.id}"
      value="${x.name}" data-attribute="name" />
    <input type="text" data-id="${x.id}"
      value="${x.background}" data-attribute="background" />
  `).join('')

  return `
    <admin-table>
      <cell-head>ID</cell-head>
      <cell-head>Name</cell-head>
      <cell-head>Background</cell-head>
    </admin-table>
    <admin-table>
      ${rows}
    </admin-table>
  `
}

// create scoped rulesets for all of our content
$.style(`
  & {
    display: block;
    margin: 0 auto;
    background: black;
  }

  & button {
    background: rgba(255, 255, 255, .75);
    border: 1px solid;
    border-color:
      rgba(255, 255, 255, .5)
      rgba(0, 0, 0, .75)
      rgba(0, 0, 0, .75)
      rgba(0, 0, 0, .75);
    border-radius: 2px;
    font-size: 1rem;
    font-weight: bold;
    padding: .5rem;
  }

  & button:hover {
    background: rgba(255, 255, 255, .5);
    border-color:
      rgba(0, 0, 0, .75)
      rgba(255, 255, 255, .5)
      rgba(255, 255, 255, .5)
      rgba(255, 255, 255, .5);
    cursor: pointer;
  }

  & planet {
    background: var(--planet-background, cornsilk);
    border-radius: 100%;
    display: grid;
    grid-template-areas: 'greeting';
    height: 75vmin;
    margin: 0 auto;
    mix-blend-mode: lighten;
    position: relative;
    width: 75vmin;
  }

  & planet greeting {
    background: cornsilk;
    border-radius: 100%;
    color: darkslategray;
    grid-area: greeting;
    place-self: center;
    font-size: 5vmin;
    padding: 3rem;
  }

  & admin {
    background: rgba(0, 0, 0, .85);
    border-radius: 1rem;
    display: block;
    margin: 0 auto;
    max-width: 500px;
    padding: 2rem 1rem;
  }

  & admin-table {
    display: grid;
    grid-template-columns: repeat(3, minmax(80px, 1fr));
    gap: 10px;
    max-height: 40vh;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  & cell-head {
    font-weight: bold;
  }

  & input {
    background: rgba(33, 33, 33, .85);
    border: 1px solid rgba(255, 255, 255, .2);
    border-radius: 2px;
    color: cornsilk;
    height: 1.5rem;
  }

  & .admin-toggle {
    margin: 1rem;
  }

  & .add-planet {
    grid-column: 1 / -1;
  }
`)

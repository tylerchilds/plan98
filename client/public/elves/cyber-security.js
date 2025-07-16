import elf from '@plan98/elf'

const TYPES = {
  SOFTWARE: 'SOFTWARE',
  HARDWARE: 'HARDWARE',
  EVENT: 'EVENT'
}

const EVENTS = [
  {
    label: 'Spawn',
    actions: 'Play HARDWARE of COST or less from HAND to PRODUCTION',
    flavor: 'A secret plot revealed from a hidden agenda.'
  },
  {
    label: 'Destry',
    actions: 'Destroy TARGET hardware of COST or less',
    flavor: "They're gonna need a bigger boat. Wait. They need a boat, period."
  },
  {
    label: 'Cancel',
    actions: 'Nullify EVENT of COST or less',
    flavor: 'A double agent tips the scales in favor of "Not Today!"'
  },
  {
    label: 'Hot Swap',
    actions: 'Equip to TARGET HARDWARE. Target is now LEVEL level COST cost.',
    flavor: ''
  },
]

const GENERIC_HARDWARE_ACTIONS = `In STAGING, may be activated to provide COST to POOL
In PRODUCTION, may be activated to ATTACK
In DEFENSE, may be activated to DEFEND`

const HARDWARE = [
  {
    label: 'Circuit',
    actions: GENERIC_HARDWARE_ACTIONS,
    flavor: 'A simple logic gate. 2b and or xor is the question.',
  }
]

const GENERIC_SOFTWARE_ACTIONS = `In STAGING, may be activated to add COST to POOL`

const SOFTWARE = [
  {
    label: 'Firebrick',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: 'A lovely shade of red.',
  },
  {
    label: 'Darkorange',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: 'An orange that has been burnt to autumn delight',
  },
  {
    label: 'Gold',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: "Diamonds are a girl's best friend and dogs are man's best friend, but this gold ain't fool's gold.",
  },
  {
    label: 'Mediumseagreen',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: "Mediumseagreeen",
  },
  {
    label: 'Dodgerblue',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: "A perfectly serene scene. Where the sky meets the ocean and the horizon exists nowhere in between them.",
  },
  {
    label: 'Slateblue',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: "Indigo. Purple. Blue. Neither. Both.",
  },
  {
    label: 'Mediumpurple',
    actions: GENERIC_SOFTWARE_ACTIONS,
    flavor: "If indigo can't even, mediumpurple casts shade to defend the odd ones.",
  },
]



const COSTS = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9
}

const POWERS = {
  LIGHT: 'LIGHT',
  OCEAN: 'OCEAN',
  LAVA: 'LAVA',
  CARBON: 'CARBON',
  OZONE: 'OZONE',
}

const LEVELS = {
  BYTE: 'byte',
  KILO: 'kilo',
  MEGA: 'mega',
  GIGA: 'giga',
  TERA: 'tera',
  PETA: 'peta',
  EXO: 'exo',
  ZETTA: 'zetta',
  YOTTA: 'yotta'
}

const HARDWARE_DECK = []
const SOFTWARE_DECK = []
const EVENT_DECK = [
  newCard({
    level: LEVELS.BYTE,
    cost: COSTS[1],
    powers: POWERS.LIGHT
  })
]

for(const power in POWERS) {
  for(const software of SOFTWARE) {
    SOFTWARE_DECK.push(newCard({
      level: null,
      power,
      cost: COSTS[1],
      type: TYPES.SOFTWARE,
      ...software
    }))
  }

  for(const cost in COSTS) {
    for(const level in LEVELS) {
      for(const event in EVENTS) {
        EVENT_DECK.push(newCard({
          level,
          power,
          cost,
          type: TYPES.EVENT,
          ...event
        }))
      }

      for(const hardware of HARDWARE) {
        HARDWARE_DECK.push(newCard({
          level,
          power,
          cost,
          type: TYPES.HARDWARE,
          ...hardware
        }))
      }
    }
  }
}

function newCard(config) {
  return {
    id: self.crypto.randomUUID(),
    type: 'software',
    cost: 1,
    power: POWERS.LIGHT,
    level: null,
    ...config
  }
}

function newDeck() {
  return shuffle([
    ...pick(20, HARDWARE_DECK),
    ...pick(20, SOFTWARE_DECK),
    ...pick(20, EVENT_DECK),
  ])
}

function pick(count, bag) {
  return [...new Array(count)].map(() => {
    return bag[randomInteger(0, bag.length - 1)]
  })
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(NO_BREAKY) {
  const array = [...NO_BREAKY]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array
}

const player1 = self.crypto.randomUUID()

const players = {
  [player1]: {
    id: player1,
    deck: newDeck(),
    hand: [],
    passive: [],
    active: [],
    ready: [],
    deactivated: [],
    discarded: []
  }
}

const ids = Object.keys(players)
const activePlayerId = ids[randomInteger(0,ids.length-1)]

const $ = elf('cyber-security', {
  players,
  activePlayerId
})

$.draw((target) => {
  const { players, activePlayerId } = $.learn()

  const player = players[activePlayerId]

  const {
    deck,
    hand,
    passive,
    active,
    ready,
    deactivated,
    discarded
  } = player

  const drawCollection = (collection, classification) => {
    return `
      <div class="${classification}">
        ${collection.map(x => {
          return `
            <div class="card">
              ${x.label}
              ${x.actions}
              ${x.flavor}
            </div>
          `
        }).join('')}
      </div>
    `
  }

  return `
    <div>
      Draws left: ${deck.length}
    </div>

    <button data-start>
      start
    </button>

    ${drawCollection(hand, 'hand')}
    ${drawCollection(passive, 'passive')}
    ${drawCollection(active, 'active')}
    ${drawCollection(ready, 'ready')}
    ${drawCollection(deactivated, 'deactivated')}
    ${drawCollection(discarded, 'discarded')}
  `
}, {
  beforeUpdate(target) {
    if(!target.initialized) {
      target.initialized = true
    }
  }
})

$.when('click', '[data-start]', (event) => {
  const { players } = $.learn()
  Object.keys(players).forEach(id => {
    const player = players[id]

    const { deck } = player

    const software = []

    let i = 0
    while(software.length < 5 && deck[i]) {
      if(deck[i].type === TYPES.SOFTWARE) {
        software.push(deck[i])
      }

      i++
    }

    const ids = software.map(x => x.id)

    $.teach({
      ...player,
      deck: deck.filter(x => !ids.includes(x.id)),
      passive: software,
    }, mergePlayer(id))
  })
})

function mergePlayer(id) {
  return (state, payload) => {
    return {
      ...state,
      players: {
        ...state.players,
        [id]: {
          ...state[id],
          ...payload
        }
      }
    }
  }
}

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  }
}




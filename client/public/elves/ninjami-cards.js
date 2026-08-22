/*
 * All Rights Reserved
 *
 * Sillyz.Computer
 *
 * author: imajnin
 *
 **/

import { Self } from "@plan98/types"

function cardify(data) {
  return `
    <button class="card ninjami ${data.type}" data-id="${data.id}">
      <div class="content">
        <div class="ninjami-name">
          ${data.name}
        </div>
        <div class="ninjami-art">
          ${data.art}
        </div>
        <div class="ninjami-strength">
          ${data.strength.map(x => x).join('')}
        </div>
        <div class="ninjami-weakness">
          ${data.weakness.map(x => x).join('')}
        </div>
      </div>
    </button>
  `
}

const Modes = {
  welcome: 'Welcome',
  acquire: 'Acquire',
  map: 'Map',
  level: 'Level',
  party: 'party',
  dev: 'whazzzaaaaaaaaaaah',
}

const Levels = {
  alien: 'alien',
  ninjami: 'ninjami',
  work: 'work',
  playground: 'playground',
  dystopia: 'dystopia',
}

const DangerTypes = {
  red: {
    index: 'red',
    name: 'Red Energy',
    color: 'firebrick',
  },
  orange: {
    index: 'orange',
    name: 'Orange Energy',
    color: 'darkorange',
  },
  yellow: {
    index: 'yellow',
    name: 'Yellow Energy',
    color: 'gold',
  },
  green: {
    index: 'green',
    name: 'Green Energy',
    color: 'mediumseagreen',
  },
  blue: {
    index: 'blue',
    name: 'Blue Energy',
    color: 'dodgerblue',
  },
  violet: {
    index: 'violet',
    name: 'Violet Energy',
    color: 'mediumpurple',
  },
  clown: {
    index: 'clown',
    name: 'Clown Energy',
    color: 'black'
  }
}

const formulas = {
  roll: (sides, type=DangerTypes.clown) => {
    return {
      value: Math.floor(Math.random() * sides),
      type
    }
  },
  exact: () => {
  },
  set: () => {

  },
  streak: () => {

  }
}

const DangerStrength = {
  roll: {
    formula: formulas.roll,
    description: 'Rolls the number of sides'
  }
}

const DangerWeakness = {
  exact: {
    formula: formulas.exact,
    description: 'Must match exactly'
  },
  set: {
    formula: formulas.set,
    description: 'Collections of the same type'
  },
  streak: {
    formula: formulas.streak,
    description: 'Sequential collections of items'
  }
}


function DangerShape(parameters){
  if(typeof parameters !== 'object') {
    return false
  }

  return {
    ...parameters,
    type: DangerTypes[parameters.type]?.index || DangerTypes.clown.index,
  }
}

const memex = []

const KEYS = {
  r6: 'r6',
  o6: 'o6',
  y6: 'y6',
  g6: 'g6',
  b6: 'b6',
  v6: 'v6',
  c6: 'c6',
  exact1: 'exact1',
  set2: 'set2'
}

const STRENGTHS = {
  [KEYS.o6]: DangerStrength.roll.formula.bind(null, 6, DangerTypes.orange),
  [KEYS.c6]: DangerStrength.roll.formula.bind(null, 6, DangerTypes.clown)
}

const WEAKNESSES = {
  [KEYS.exact1]: DangerWeakness.exact.formula.bind(null, 1),
  [KEYS.set2]: DangerWeakness.set.formula.bind(null, 2),
  [KEYS.streak4]: DangerWeakness.streak.formula.bind(null, 4)
}

const Silly = {
  id: 0,
  type: DangerTypes.orange.index,
  name: "Silly",
  art: '',
  description: "Time is a gift of the elves",
  strength: [
    KEYS.o6,
    KEYS.o6,
    KEYS.o6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const Alien = {
  id: 1,
  type: DangerTypes.clown.index,
  name: "Alien",
  art: '',
  description: "Defender of Xanadu",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
    KEYS.set2
  ]
}

const Sally = {
  id: 2,
  type: DangerTypes.blue.index,
  name: "Sally",
  art: '',
  description: "Serious, but not that serious and that's intimidating.",
  strength: [
    KEYS.b6,
    KEYS.b6,
    KEYS.b6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const Ninjami = {
  id: 3,
  type: DangerTypes.clown.index,
  name: "Ninjami",
  art: '',
  description: "imajnin",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}

const Sully = {
  id: 4,
  type: DangerTypes.red.index,
  name: "Sully",
  art: '',
  description: "Before you were Ninjami, I was Ninjami. Highlander? Me.",
  strength: [
    KEYS.r6,
    KEYS.r6,
    KEYS.r6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const Work = {
  id: 5,
  type: DangerTypes.clown.index,
  name: "Work",
  art: '',
  description: "At work, we are family. See you at dinner.",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}


const Shelly = {
  id: 6,
  type: DangerTypes.violet.index,
  name: "Shelly",
  art: '',
  description: "Shenanigans. Shelly, Shenaningans.",
  strength: [
    KEYS.r6,
    KEYS.r6,
    KEYS.r6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const Playground = {
  id: 7,
  type: DangerTypes.clown.index,
  name: "Playground",
  art: '',
  description: "In 1888, a playground was founded by a train baron by ultimatum of the people. Was. Until the train baron went back in time and destroyed it.",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}

const Wally = {
  id: 8,
  type: DangerTypes.green.index,
  name: "Wally",
  art: '',
  description: "A storyteller inspiring a storyteller to tell a story about enabling story tellers to tell stories.",
  strength: [
    KEYS.g6,
    KEYS.g6,
    KEYS.g6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const FunPermit = {
  id: 9,
  type: DangerTypes.clown.index,
  name: "Fun Permit",
  art: '',
  description: "Break in case of emergency, but also all other cases, just in case.",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}

const Dystopia = {
  id: 10,
  type: DangerTypes.clown.index,
  name: "Dystopia",
  art: '',
  description: "",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}

const Sonny = {
  id: 11,
  type: DangerTypes.green.index,
  name: "Wally",
  art: '',
  description: "A storyteller inspiring a storyteller to tell a story about enabling story tellers to tell stories.",
  strength: [
    KEYS.g6,
    KEYS.g6,
    KEYS.g6
  ],
  weakness: [
    KEYS.exact1,
    KEYS.exact1
  ]
}

const Alfheim2 = {
  id: 12,
  type: DangerTypes.clown.index,
  name: "Alfheim 2",
  art: '',
  description: "",
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
  ]
}


memex.push(DangerShape(Silly))
memex.push(DangerShape(Alien))
memex.push(DangerShape(Sally))
memex.push(DangerShape(Ninjami))
memex.push(DangerShape(Sully))
memex.push(DangerShape(Work))
memex.push(DangerShape(Shelly))
memex.push(DangerShape(Playground))
memex.push(DangerShape(Wally))
memex.push(DangerShape(FunPermit))
memex.push(DangerShape(Dystopia))
memex.push(DangerShape(Sonny))
memex.push(DangerShape(Alfheim2))

function strengthCheck(target) {
  return target.strength.map(x => STRENGTHS[x]?.())
}

function weaknessCheck(target, attack) {
  const localAttack = [...attack]
  return target.weakness.filter(x => {
  })
}

console.log(strengthCheck(memex[0]))
console.log(weaknessCheck(memex[0], [1, 2, 3]))

const $ = Self('ninjami-cards', {
  fate: false,
  mode: Modes.welcome,
  party: [],
  inventory: [],
  battlefield: {},
  memex
})

const views = {
  [Modes.welcome]: () => {
    const { fate } = $.model()
    const d = fate?'':'disabled="true"'
    return `
      <section class="wizard">
        <div class="title">Ninjami</div>
        <p style="font-family: 'Courier', monospace; line-height: 2;">
          Once you enter Ninjami,<br>
          You are become Ninjami.
        </p>
        <label class="field">
          <input type="checkbox" action="fate" ${fate?'checked="true"':''}/>
          <span class="label">Accept fate</span>
        </label>
        <div style="text-align: right; margin-bottom: 1rem;">
          <button action="become" class="standard-button bias-positive" ${d}>
            Ninjami
          </button>
        </div>
        <div style="text-align: right;">
          <button action="investigate" class="standard-button bias-negative">
            Roll for perspective
          </button>
        </div>
      </section>
    `
  },
  [Modes.acquire]: () => {
    const { memexId } = $.model()
    const data = memex[memexId]
    return data ? `
      <section class="acquisition">
        <div class="yay-plate">
          ${cardify(data)}
        </div>
        <div>
          <button action="get" data-id="${memexId}" class="standard-button">
            Get
          </button>
        </div>
      </section>
    ` : 'memex underwhelmed by id: ' + memexId
  },
  [Modes.map]: () => {
    console.log($.model())
    return `
      <div class="map">
        <button action="challenge" data-id="alien" class="">
          Alien
        </button>
        <button action="challenge" data-id="ninjami" class="">
          Ninjami
        </button>
        <button action="challenge" data-id="work" class="">
          Work
        </button>
        <button action="challenge" data-id="playground" class="">
          Playground Project
        </button>
        <button action="challenge" data-id="dystopia" class="">
          Dystopian Reality
        </button>
      </div>
    `
  },
  [Modes.level]: (target) => {
    const { levelId } = $.model()

    if(target.levelId !== levelId) {
      target.levelId = levelId
      requestIdleCallback(() => load(levelId))
    } else {
      const { battlefield, party } = $.model()
      const { baddies={} } = battlefield

      return `
        <div class="play-area">
          <div class="baddies">
            ${Object.keys(baddies).map(x => cardify(baddies[x])).join('')}
          </div>
          <div class="goodies">
            ${party.map(x => cardify(memex[x])).join('')}
          </div>
          <div>
            <button action="party">
              Party
            </button>
          </div>
        </div>
      `
    }
  },
  [Modes.party]: () => {
    const { inventory, party } = $.model()

    return `
      <div-party class="pause-area">
        <div class="party">
          ${party.map(id => cardify(memex[id])).join('')}
        </div>
        <div class="inventory">
          ${inventory.map(id => cardify(memex[id])).join('')}
        </div>
        <div>
          <button action="back">
            Back
          </button>
        </div>
      </div-party>
    `
  },
  [Modes.dev]: () => {
    return `
      <was-code src="/public/elves/ninjami-cards.js"></was-code>
    `
  },
}

$.view((target) => {
  const { mode } = $.model()
  return views[mode](target)
})

function load(levelId) {
  const baddies = LevelEnemies[levelId]?.() ?? {}
  $.teach({
    battlefield: {
      baddies
    }
  })
}

const LevelEnemies = {
  [Levels.alien]: () => {
    return {
      'misunderstood-alien': memex[1]
    }
  },
  [Levels.ninjami]: () => {

  },
  [Levels.work]: () => {

  },
  [Levels.playground]: () => {

  },
  [Levels.dystopia]: () => {

  },
}


$.when('click', '[action="become"]', (event) => {
  $.controller({ mode: Modes.acquire, memexId: 0 })
})

$.when('click', '[action="investigate"]', (event) => {
  $.controller({ mode: Modes.dev })
})

$.when('click', '[action="fate"]', (event) => {
  const fate = event.target.checked
  $.controller({ fate })
})

$.when('click', '[action="challenge"]', (event) => {
  const { id } = event.target.dataset
  $.controller({ mode: Modes.level, levelId: Levels[id] })
})

$.when('click', '[action="party"]', (event) => {
  const lastMode = $.model().mode
  $.controller({ mode: Modes.party, lastMode })
})

$.when('click', '[action="back"]', (event) => {
  const { lastMode } = $.model()
  $.controller({ mode: lastMode })
})

$.when('click', '.goodies .ninjami', (event) => {
  const id = parseId(event)
  console.log(strengthCheck(memex[id]))
})

$.when('click', '.baddies .ninjami', (event) => {
  const id = parseId(event)
  console.log(strengthCheck(memex[id]))
})

$.when('click', '.party .ninjami', (event) => {
  const id = parseId(event)

  $.controller({ id }, (state, payload) => {
    return {
      ...state,
      party: state.party.filter(x => x !== payload.id)
    }
  })
})

$.when('click', '.inventory .ninjami', (event) => {
  const id = parseId(event)
  const { party } = $.model()

  if(party.includes(id)) return

  $.controller({ id }, (state, payload) => {
    return {
      ...state,
      party: [...state.party, payload.id ]
    }
  })
})

$.when('click', '[action="get"]', (event) => {
  const { id } = event.target.dataset
  get(id)

  $.controller({ mode: Modes.map })
})

// boring system level things don't worry about it

// like http, but only in this file

function get(id) {
  const item = memex[id]

  if(item) {
    $.controller({ id }, (state, payload) => {
      return {
        ...state,
        inventory: [...state.inventory, payload.id]
      }
    })
  }
}

get(1)
get(2)
get(3)
get(4)
get(5)
get(6)
get(7)
get(8)
get(9)
get(10)
get(11)
get(12)

function parseId(event) {
  const { id } = event.target.dataset
  return parseInt(id)
}

// gross, performant visual math, yuck
$.style(`
  ${Object.keys(DangerTypes).map((type) => {
    return `
      & .${type} {
        background: ${DangerTypes[type].color};
      }
    `
  }).join('')}

  & .title {
    font-weight: 1000;
    font-size: 3rem;
  }

  & .ninjami {
    padding: 6px;
    place-self: center;
    color: saddlebrown;
  }

  & .ninjami .content {
    background: lemonchiffon;
    height: 100%;
    border-radius: .05in;
    padding: 6px;
  }

  & .pause-area,
  & .play-area {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr;
  }

  & .goodies {
    background: linear-gradient(-45deg, rgba(0,0,0,1), mediumseagreen, rgba(255,255,255,1));
  }

  & .baddies {
    background: linear-gradient(-45deg, rgba(0,0,0,1), firebrick, rgba(255,255,255,1));
  }

  & .party {
    background: linear-gradient(-45deg, rgba(0,0,0,1), dodgerblue, rgba(255,255,255,1));
  }

  & .inventory {
    background: linear-gradient(-45deg, rgba(0,0,0,1), mediumpurple, rgba(255,255,255,1));
  }

  & .party,
  & .inventory,
  & .baddies,
  & .goodies {
    display: flex;
    place-content: safe center;
    overflow: auto;
  }

  & .yay-plate {
    height: 100%;
    display: grid;
    place-content: center;
  }

  & .map {
    background: linear-gradient(-45deg, rgba(0,0,0,1), orange, rgba(255,255,255,1));
    height: 100%;
  }

  & .acquisition {
    display: grid;
    background: linear-gradient(-45deg, rgba(0,0,0,1), gold, rgba(255,255,255,1));
    grid-template-rows: 1fr auto;
    height: 100%;
  }

  & .ninjami-name {
    font-weight: 600;
  }

  & .ninjami-art {
    aspect-ratio: 16/9;
    border: 1px solid saddlebrown;
    margin: 4px 0;
  }
`)

/*
 * All Rights Reserved
 *
 * Sillyz.Computer
 *
 **/

import { Self } from "@plan98/types"

function cardify(data) {
  return `
    <div class="card">
      <div class="card-name">
        ${data.name}
      </div>
    </div>
  `
}

const Modes = {
  welcome: 'Welcome',
  acquire: 'Acquire',
  map: 'Map',
  level: 'Level',
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
  red: 'firebrick',
  orange: 'darkorange',
  yellow: 'gold',
  green: 'mediumseagreen',
  blue: 'dodgerblue',
  violet: 'mediumpurple',
  clown: 'clown'
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
    type: DangerTypes[parameters.type] || DangerTypes.clown
  }
}

const memex = []

const KEYS = {
  o6: 'o6',
  exact1: 'exact1'
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
  type: DangerTypes.orange,
  name: "Silly",
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
  type: DangerTypes.clown,
  name: "Alien",
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


memex.push(DangerShape(Silly))
memex.push(DangerShape(Alien))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))
memex.push(DangerShape(Silly))

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
        <h1>Ninjami</h1>
        <p style="font-family: 'Courier', monospace; line-height: 2;">
          Once you enter Ninjami,<br>
          You are become Ninjami.
        </p>
        <label class="field">
          <input type="checkbox" action="fate" ${fate?'checked="true"':''}/>
          <span class="label">I accept my fate</span>
        </label>
        <div style="text-align: right; margin-bottom: 1rem;">
          <button action="become" class="standard-button bias-positive" ${d}>
            Become Ninjami
          </button>
        </div>
        <div style="text-align: right;">
          <button action="investigate" class="standard-button bias-negative">
            Investigate Ninjami
          </button>
        </div>
      </section>
    `
  },
  [Modes.acquire]: () => {
    const { memexId } = $.model()
    const data = memex[memexId]
    return data ? `
      <section class="wizard">
        <h1>${data.name}</h1>
        <p>
          ${data.description}
        </p>

        <button action="get" data-id="${memexId}" class="standard-button">
          Get
        </button>
      </section>
    ` : 'memex underwhelmed by id: ' + memexId
  },
  [Modes.map]: () => {
    console.log($.model())
    return `
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
    `
  },
  [Modes.level]: (target) => {
    const { levelId } = $.model()

    if(target.levelId !== levelId) {
      target.levelId = levelId
      requestIdleCallback(() => load(levelId))
    } else {
      const { battlefield } = $.model()
      const { baddies={}, goodies={} } = battlefield
      
      return `
        <div class="baddies">
          ${Object.keys(baddies).map(x => cardify(baddies[x])).join('')}
        </div>
        <div class="goodies">
          ${Object.keys(goodies).map(x => cardify(goodies[x])).join('')}
        </div>
      `
    }
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
  const goodies = {}
  $.teach({
    battlefield: {
      baddies,
      goodies
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

$.when('click', '[action="get"]', (event) => {
  const { id } = event.target.dataset
  get(id)

  $.controller({ mode: Modes.map })
})

$.style(`
  ${Object.keys(DangerTypes).map((type) => {
    return `
      & .${type} {
        background: ${DangerTypes[type]};
      }
    `
  })}
`)


// boring system level things don't worry about it

// like http, but only in this file

function get(id) {
  const item = memex[id]

  if(item) {
    $.controller({ item }, (state, payload) => {
      return {
        ...state,
        inventory: [...state.inventory, payload.item]
      }
    })
  }
}

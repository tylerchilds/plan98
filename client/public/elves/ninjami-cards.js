/*
 * All Rights Reserved
 *
 * Sillyz.Computer
 *
 * author: imajnin
 *
 **/

import { Self } from "@plan98/types"
import { toast } from "./plan98-toast.js"

function cardify(data) {
  const used = data.exhausted ? 'exhausted' : ''
  return `
    <div class="ninjami-wrap">
      <button class="card ninjami ${data.type} ${used}" data-id="${data.id}">
        <div class="content">
          <div class="ninjami-name">${data.name}</div>
          <div class="ninjami-art">${data.art}</div>
          <div class="ninjami-strength">${data.strength.map(x => x).join('')}</div>
          <div class="ninjami-weakness">${data.weakness.map(x => x).join('')}</div>
        </div>
      </button>
    </div>
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
  roll: (sides, type = DangerTypes.clown) => {
    return {
      value: Math.floor(Math.random() * sides) + 1,
      type
    }
  },
  exact: ({ value }, pool) => {
    const dice = pool.filter(d => d.value === value)
    return { hit: dice.length > 0, values: dice.length ? [value] : [], dice }
  },

  match: ({ value, type }, pool) => {
    const dice = pool.filter(d => d.value === value && d.type === type)
    return { hit: dice.length > 0, values: dice.length ? [value] : [], dice }
  },

  set: ({ size, maxSides = 6 }, pool) => {
    const buckets = Array.from({ length: maxSides + 1 }, () => [])
    for (const d of pool) buckets[d.value].push(d)
    const values = []
    let dice = []
    for (let v = 0; v <= maxSides; v++) {
      if (buckets[v].length >= size) {
        values.push(v)
        dice = dice.concat(buckets[v])
      }
    }
    return { hit: values.length > 0, values, dice }
  },

  streak: ({ size, maxSides = 6 }, pool) => {
    const buckets = Array.from({ length: maxSides + 1 }, () => [])
    for (const d of pool) buckets[d.value].push(d)
    const values = []
    let dice = []
    let run = []
    for (let v = 0; v <= maxSides; v++) {
      if (buckets[v].length > 0) {
        run.push(v)
        if (run.length >= size) {
          for (const rv of run) if (!values.includes(rv)) values.push(rv)
          dice = dice.concat(buckets[v])
        }
      } else {
        run = []
      }
    }
    return { hit: values.length > 0, values, dice }
  },

  any: (_config, pool) => {
    return { hit: true, values: [], dice: pool }
  }
}

const DangerWeakness = {
  exact: {
    formula: formulas.exact,
    description: 'Must match exactly'
  },
  match: {
    formula: formulas.match,
    description: 'Must match exactly'
  },
  set: {
    formula: formulas.set,
    description: 'Collections of the same type'
  },
  streak: {
    formula: formulas.streak,
    description: 'Sequential collections of items'
  },
  any: {
    formula: formulas.any
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
  exact2: 'exact2',
  exact3: 'exact3',
  exact4: 'exact4',
  exact5: 'exact5',
  exact6: 'exact6',
  red1: 'red1',
  red2: 'red2',
  red3: 'red3',
  red4: 'red4',
  red5: 'red5',
  red6: 'red6',
  orange1: 'orange1',
  orange2: 'orange2',
  orange3: 'orange3',
  orange4: 'orange4',
  orange5: 'orange5',
  orange6: 'orange6',
  yellow1: 'yellow1',
  yellow2: 'yellow2',
  yellow3: 'yellow3',
  yellow4: 'yellow4',
  yellow5: 'yellow5',
  yellow6: 'yellow6',
  green1: 'green1',
  green2: 'green2',
  green3: 'green3',
  green4: 'green4',
  green5: 'green5',
  green6: 'green6',
  blue1: 'blue1',
  blue2: 'blue2',
  blue3: 'blue3',
  blue4: 'blue4',
  blue5: 'blue5',
  blue6: 'blue6',
  violet1: 'violet1',
  violet2: 'violet2',
  violet3: 'violet3',
  violet4: 'violet4',
  violet5: 'violet5',
  violet6: 'violet6',
  set2: 'set2',
  set3: 'set3',
  set4: 'set4',
  set5: 'set5',
  streak3: 'streak3',
  streak4: 'streak4',
  streak5: 'streak5',
  any: 'any',
}

const WEAKNESSES = {
  [KEYS.exact1]: DangerWeakness.exact.formula.bind(null, { value: 1 }),
  [KEYS.exact2]: DangerWeakness.exact.formula.bind(null, { value: 2 }),
  [KEYS.exact3]: DangerWeakness.exact.formula.bind(null, { value: 3 }),
  [KEYS.exact4]: DangerWeakness.exact.formula.bind(null, { value: 4 }),
  [KEYS.exact5]: DangerWeakness.exact.formula.bind(null, { value: 5 }),
  [KEYS.exact6]: DangerWeakness.exact.formula.bind(null, { value: 6 }),
  [KEYS.set2]: DangerWeakness.set.formula.bind(null, { size: 2 }),
  [KEYS.set3]: DangerWeakness.set.formula.bind(null, { size: 3 }),
  [KEYS.set4]: DangerWeakness.set.formula.bind(null, { size: 4 }),
  [KEYS.set5]: DangerWeakness.set.formula.bind(null, { size: 5 }),
  [KEYS.streak3]: DangerWeakness.streak.formula.bind(null, { size: 3 }),
  [KEYS.streak4]: DangerWeakness.streak.formula.bind(null, { size: 4 }),
  [KEYS.streak5]: DangerWeakness.streak.formula.bind(null, { size: 5 }),
  [KEYS.any]: DangerWeakness.any.formula.bind(null, {}),
}

// colorKeys look like `${colorName}${value}`, e.g. "orange1" -> orange energy, value 1
const parseColorKey = (key) => {
  const match = key.match(/^([a-z]+)(\d+)$/)
  if (!match) throw new Error(`Unrecognized color weakness key: ${key}`)
  const [, colorName, valueStr] = match
  return { colorName, value: parseInt(valueStr, 10) }
}

const colorKeys = [
  KEYS.red1, KEYS.red2, KEYS.red3, KEYS.red4, KEYS.red5, KEYS.red6,
  KEYS.orange1, KEYS.orange2, KEYS.orange3, KEYS.orange4, KEYS.orange5, KEYS.orange6,
  KEYS.yellow1, KEYS.yellow2, KEYS.yellow3, KEYS.yellow4, KEYS.yellow5, KEYS.yellow6,
  KEYS.green1, KEYS.green2, KEYS.green3, KEYS.green4, KEYS.green5, KEYS.green6,
  KEYS.blue1, KEYS.blue2, KEYS.blue3, KEYS.blue4, KEYS.blue5, KEYS.blue6,
  KEYS.violet1, KEYS.violet2, KEYS.violet3, KEYS.violet4, KEYS.violet5, KEYS.violet6,
]

colorKeys.forEach(key => {
  const { colorName, value } = parseColorKey(key)
  const type = DangerTypes[colorName]
  if (type) {
    WEAKNESSES[key] = DangerWeakness.match.formula.bind(null, { value, type })
  }
})

const Silly = {
  id: 0,
  type: DangerTypes.orange.index,
  name: "Silly",
  art: '',
  description: "Time is a gift of the elves",
  loot: [0],
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
  loot: [1, 2],
  strength: [
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
  loot: [2],
  strength: [
    KEYS.b6,
    KEYS.b6,
    KEYS.b6
  ],
  weakness: [
    KEYS.exact2,
    KEYS.exact2
  ]
}

const Ninjami = {
  id: 3,
  type: DangerTypes.clown.index,
  name: "Ninjami",
  art: '',
  description: "imajnin",
  loot: [3, 4],
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
    KEYS.set2,
    KEYS.set2
  ]
}

const Sully = {
  id: 4,
  type: DangerTypes.red.index,
  name: "Sully",
  art: '',
  description: "Before you were Ninjami, I was Ninjami. Highlander? Me.",
  loot: [4],
  strength: [
    KEYS.r6,
    KEYS.r6,
    KEYS.r6
  ],
  weakness: [
    KEYS.exact3,
    KEYS.exact3
  ]
}

const Work = {
  id: 5,
  type: DangerTypes.clown.index,
  name: "Work",
  art: '',
  description: "At work, we are family. See you at dinner.",
  loot: [5, 6],
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
    KEYS.streak4
  ]
}


const Shelly = {
  id: 6,
  type: DangerTypes.violet.index,
  name: "Shelly",
  art: '',
  description: "Shenanigans. Shelly, Shenaningans.",
  loot: [6],
  strength: [
    KEYS.v6,
    KEYS.v6,
    KEYS.v6
  ],
  weakness: [
    KEYS.exact4,
    KEYS.exact4
  ]
}

const Playground = {
  id: 7,
  type: DangerTypes.clown.index,
  name: "Playground",
  art: '',
  description: "In 1888, a playground was founded by a train baron by ultimatum of the people. Was. Until the train baron went back in time and destroyed it.",
  loot: [7,8,9],
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
    KEYS.orange1,
    KEYS.blue2,
    KEYS.red3,
    KEYS.violet4
  ]
}

const Wally = {
  id: 8,
  type: DangerTypes.green.index,
  name: "Wally",
  art: '',
  description: "A storyteller inspiring a storyteller to tell a story about enabling story tellers to tell stories.",
  loot: [8],
  strength: [
    KEYS.g6,
    KEYS.g6,
    KEYS.g6
  ],
  weakness: [
    KEYS.exact5,
    KEYS.exact5
  ]
}

const FunPermit = {
  id: 9,
  type: DangerTypes.clown.index,
  name: "Fun Permit",
  art: '',
  description: "Break in case of emergency, but also all other cases, just in case.",
  loot: [9],
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
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
  description: "In a world where everyone was afraid of being labeled weird, an unemployed clown became the fall guy for a multi-dimensional conspiracy.",
  loot: [10, 11, 12],
  strength: [
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6,
    KEYS.c6
  ],
  weakness: [
    KEYS.set2,
    KEYS.set2,
    KEYS.set2,
    KEYS.set2,
    KEYS.set2
  ]
}

const Sonny = {
  id: 11,
  type: DangerTypes.yellow.index,
  name: "Sonny",
  art: '',
  description: "The student becomes the teacher when the teacher becomes the student.",
  loot: [11],
  strength: [
    KEYS.y6,
    KEYS.y6,
    KEYS.y6
  ],
  weakness: [
    KEYS.exact6,
    KEYS.exact6
  ]
}

const Alfheim2 = {
  id: 12,
  type: DangerTypes.clown.index,
  name: "Alfheim 2",
  art: '',
  description: "During Ragnarok, Alfeim was the last of the nine worlds to be destroyed. The elves evacuated the realms through the bi-frost into Clown World until Alfheim 2 was stable enough to re-constitute Yggdrasil from memory.",
  loot: [12],
  strength: [
    KEYS.o6,
    KEYS.o6,
    KEYS.b6,
    KEYS.b6,
    KEYS.r6,
    KEYS.r6,
    KEYS.v6,
    KEYS.v6,
    KEYS.g6,
    KEYS.g6,
    KEYS.y6,
    KEYS.y6
  ],
  weakness: [
    KEYS.any
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

// KEYS look like `${typeChar}${sides}`, e.g. "o6" -> orange d6, "c10" -> clown d10
const parseKey = (key) => {
  const match = key.match(/^([a-z])(\d+)$/)
  if (!match) throw new Error(`Unrecognized strength key: ${key}`)

  const [, typeChar, sidesStr] = match
  return { typeChar, sides: parseInt(sidesStr, 10) }
}

// typeChar -> DangerTypes entry, via first-letter match
const typeByChar = Object.values(DangerTypes).reduce((acc, type) => {
  acc[type.name[0].toLowerCase()] = type
  return acc
}, {})

const sidesFor = (key) => parseKey(key).sides
const typeFor = (key) => {
  const { typeChar } = parseKey(key)
  const type = typeByChar[typeChar]
  if (!type) throw new Error(`Unrecognized danger type char: ${typeChar}`)
  return type
}

const strengthCheck = (instance, ownerId) => {
  return instance.strength.map(key => ({
    key,
    ownerId,
    ...formulas.roll(sidesFor(key), typeFor(key))
  }))
}

// consumes pool against a weakness list, returns leftover pool,
// surviving weaknesses, and exactly what was spent this round
const resolveAttack = (pool, weaknesses) => {
  let remainingPool = pool
  const remainingWeakness = []
  const consumed = []

  for (const wKey of weaknesses) {
    if (remainingPool.length === 0) {
      remainingWeakness.push(wKey)
      continue
    }

    const attack = WEAKNESSES[wKey](remainingPool)

    if (attack.hit) {
      const hitEntries = new Set(attack.dice)
      remainingPool = remainingPool.filter(p => !hitEntries.has(p))
      consumed.push(...attack.dice)
    } else {
      remainingWeakness.push(wKey)
    }
  }

  return { pool: remainingPool, weaknesses: remainingWeakness, consumed }
}

const battleCombined = (activatedUnits, targets) => {
  let pool = activatedUnits.flatMap(({ id, unit }) => strengthCheck(unit, id))
  let locksByOwner = {}
  activatedUnits.forEach(({ id, unit }) => {
    locksByOwner[id] = (unit.locks || []).map(l => ({ ...l, entries: [...l.entries] }))
  })

  console.log('[battleCombined] pool', pool.map(p => ({
    key: p.key,
    ownerId: p.ownerId,
    value: p.value,
    type: p.type?.index
  })))

  const next = {}
  const defeated = []

  for (const name of Object.keys(targets)) {
    const target = { ...targets[name] }
    const hadWeakness = target.weakness.length > 0
    const result = resolveAttack(pool, target.weakness)
    pool = result.pool
    target.weakness = result.weaknesses
    const justDied = hadWeakness && target.weakness.length === 0

    if (justDied) {
      defeated.push(name)
      pool = pool.concat(result.consumed)
      Object.keys(locksByOwner).forEach(ownerId => {
        const idx = locksByOwner[ownerId].findIndex(l => l.target === name)
        if (idx > -1) {
          pool = pool.concat(locksByOwner[ownerId][idx].entries)
          locksByOwner[ownerId].splice(idx, 1)
        }
      })
    } else {
      if (result.consumed.length > 0) {
        const byOwner = {}
        result.consumed.forEach(entry => {
          (byOwner[entry.ownerId] = byOwner[entry.ownerId] || []).push(entry)
        })
        Object.keys(byOwner).forEach(ownerId => {
          const locks = locksByOwner[ownerId] || (locksByOwner[ownerId] = [])
          const existing = locks.find(l => l.target === name)
          if (existing) existing.entries = existing.entries.concat(byOwner[ownerId])
          else locks.push({ target: name, entries: byOwner[ownerId] })
        })
      }
      next[name] = target
    }
  }

  const leftoverByOwner = {}
  pool.forEach(entry => {
    (leftoverByOwner[entry.ownerId] = leftoverByOwner[entry.ownerId] || []).push(entry)
  })

  return { next, defeated, locksByOwner, leftoverByOwner }
}

// release locks non-activated units on `roster` hold against defeated names
const releaseLocksOnDefeat = (roster, defeatedNames, skipIds = []) => {
  const next = {}
  for (const name of Object.keys(roster)) {
    if (skipIds.includes(name)) continue
    const unit = roster[name]
    if (!unit.locks || unit.locks.length === 0) continue
    const releasedEntries = []
    const remainingLocks = []
    for (const lock of unit.locks) {
      if (defeatedNames.includes(lock.target)) releasedEntries.push(...lock.entries)
      else remainingLocks.push(lock)
    }
    if (releasedEntries.length > 0) {
      next[name] = { ...unit, strength: [...unit.strength, ...releasedEntries.map(e => e.key)], locks: remainingLocks }
    }
  }
  return next
}

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
      <div class="layout">
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
        <div class="home-row">
          <button action="become" class="home-button">
            Ok
          </button>
        </div>
      </div>
    `
  },
  [Modes.acquire]: () => {
    const { memexId } = $.model()
    const data = memex[memexId]
    return data ? `
      <section class="acquisition">
        <div class="yay-plate card-row">
          ${cardify(data)}
        </div>
        <div class="home-row">
          <button action="get" data-id="${memexId}" class="home-button">
            Ok
          </button>
        </div>
      </section>
    ` : 'memex underwhelmed by id: ' + memexId
  },
  [Modes.map]: () => {
    const { inventory } = $.model()
    const challenge = nextChallenge()

    return `
      <div class="map">
        <div class="yay-plate card-row">
          ${challenge ? cardify(challenge) : `
            ${inventory.map(id => cardify(memex[id])).join('')}
          `}
        </div>
        <div class="home-row">
          ${challenge ? `
            <button action="attack" data-id="${challenge.id}" class="home-button">
              Ok
            </button>
          ` : `
            <button action="accept" class="home-button">
              Ok
            </button>
          `}
        </div>
      </div>
    `
  },
  [Modes.level]: (target) => {
    const { battlefield } = $.model()
    const { baddies={}, goodies={} } = battlefield

    return `
      <div class="play-area">
        <div class="baddies card-row">
          ${Object.keys(baddies).map(x => cardify(baddies[x])).join('')}
        </div>
        <div class="goodies card-row">
          ${Object.keys(goodies).map(x => cardify(goodies[x])).join('')}
        </div>
        <div class="home-row">
          <button action="party" class="home-button">
            Ok
          </button>
        </div>
      </div>
    `
  },
  [Modes.party]: () => {
    const { inventory, party } = $.model()

    return `
      <div-party class="pause-area">
        <div class="party card-row">
          ${party.map(id => cardify(memex[id])).join('')}
        </div>
        <div class="inventory card-row">
          ${inventory.filter(x => !party.includes(x)).map(id => cardify(memex[id])).join('')}
        </div>
        <div class="home-row">
          <button action="ready-party" class="home-button">
            Ok
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

const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach(entry => fitCardsToRow(entry.target))
})

let observedRows = new Set()

function observeCardRows(target) {
  const currentRows = new Set(target.querySelectorAll('.card-row'))

  observedRows.forEach(el => {
    if (!currentRows.has(el)) {
      resizeObserver.unobserve(el)
      observedRows.delete(el)
    }
  })

  currentRows.forEach(el => {
    if (!observedRows.has(el)) {
      resizeObserver.observe(el)
      observedRows.add(el)
    }
  })
}

const INCH_IN_PX = 96 // CSS defines 1in = 96px, fixed regardless of actual screen DPI
const CARD_NATURAL_HEIGHT = 3.5 * INCH_IN_PX // 336px

function fitCardsToRow(container) {
  const wraps = container.querySelectorAll(':scope > .ninjami-wrap')
  if (wraps.length === 0) return

  const containerHeight = container.clientHeight
  const scale = Math.min(1, containerHeight / CARD_NATURAL_HEIGHT)

  wraps.forEach(wrap => {
    const current = wrap.style.getPropertyValue('--card-scale')
    const next = String(scale)
    if (current !== next) {
      wrap.style.setProperty('--card-scale', next)
    }
  })
}

function fitAllCardRows(target) {
  target.querySelectorAll('.card-row').forEach(fitCardsToRow)
}

$.view(
  (target) => {
    const { mode } = $.model()
    return views[mode](target)
  },
  {
    afterUpdate(target) {
      observeCardRows(target)
      fitAllCardRows(target)
    }
  }
)

function load(id) {
  const { party } = $.model()
  const goodies = party.reduce((group, pid) => {
    group[pid] = { ...memex[pid], exhausted: false }
    return group
  }, {})

  const baddies = { [id]: { ...memex[id], exhausted: false } }

  $.controller(
    { goodies, baddies },
    (state, payload) => ({
      ...state,
      battlefield: {
        goodies: payload.goodies,
        baddies: payload.baddies
      }
    })
  )
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
})

$.when('click', '[action="party"]', (event) => {
  const lastMode = $.model().mode
  $.controller({ mode: Modes.party, lastMode })
})

$.when('click', '[action="ready-party"]', (event) => {
  const { party } = $.model()
  const goodies = party.reduce((group,id) => {
    group[id] = memex[id]
    return group
  }, {})
  $.controller({ mode: Modes.level, goodies }, (state, payload) => {
    return {
      ...state,
      mode: payload.mode,
      battlefield: {
        ...state.battlefield,
        goodies: payload.goodies
      }
    }
  })
})

$.when('click', '[action="back"]', (event) => {
  const { lastMode } = $.model()
  $.controller({ mode: lastMode })
})

$.when('click', '.map .ninjami, [action="attack"]', (event) => {
  const id = parseId(event)
  load(id)
  $.controller({ mode: Modes.level, levelId: id })
})

// true if NOTHING the player currently owns (regardless of who's
// actually deployed on the battlefield right now) could ever satisfy
// the target baddies' weaknesses. This is a strategic check against
// the player's full roster, not the current tactical selection.
const isCheckmate = (baddies) => {
  const { party, inventory } = $.model()
  const ownedIds = [...new Set([...party, ...inventory])]

  if (ownedIds.length === 0) return false // no units left to check at all — that's a loss, not checkmate

  const availableTypes = new Set()
  let totalDiceAvailable = 0
  ownedIds.forEach(gid => {
    const entry = memex[gid]
    if (!entry || !entry.strength) return
    entry.strength.forEach(key => {
      availableTypes.add(typeFor(key).index)
      totalDiceAvailable++
    })
  })

  const baddieIds = Object.keys(baddies)
  if (baddieIds.length === 0) return false

  return baddieIds.every(bid => {
    return baddies[bid].weakness.every(wKey => {
      if (wKey === KEYS.any) return false

      if (wKey.startsWith('set') || wKey.startsWith('streak')) {
        const size = parseInt(wKey.replace(/^\D+/, ''), 10)
        return totalDiceAvailable < size
      }

      if (wKey.startsWith('exact')) {
        return false
      }

      const { colorName } = parseColorKey(wKey)
      const type = DangerTypes[colorName]
      return !type || !availableTypes.has(type.index)
    })
  })
}

const BOSS_IDS = [1, 3, 5, 7, 10] // Alien, Ninjami, Work, Playground, Dystopia

const missingLoot = (entry, inventory) => {
  const loot = entry.loot || []
  return loot.some(id => !inventory.includes(id))
}

const nextChallenge = () => {
  const { inventory } = $.model()
  const incomplete = BOSS_IDS.filter(id => missingLoot(memex[id], inventory))
  return incomplete.length > 0 ? memex[incomplete[0]] : null
}

const opposite = (side) => (side === 'goodies' ? 'baddies' : 'goodies')

function activate(side, id) {
  const { battlefield } = $.model()
  const roster = battlefield[side]
  const unit = roster[id]
  if (!unit || unit.exhausted) return // already went this round — cooldown

  const targetSide = opposite(side)
  const targets = battlefield[targetSide]

  // this click's unit, plus any teammate still "in play" from earlier
  // clicks this round (exhausted but not yet answered by the other side)
  const contributorIds = [id, ...Object.keys(roster).filter(uid => uid !== id && roster[uid].exhausted)]
  const activatedUnits = contributorIds.map(uid => ({ id: uid, unit: roster[uid] }))

  const { next, defeated, locksByOwner, leftoverByOwner } = battleCombined(activatedUnits, targets)

  const updatedTargets = { ...targets, ...next }
  defeated.forEach(name => delete updatedTargets[name])

  const releasedFromInactive = releaseLocksOnDefeat(roster, defeated, contributorIds)
  const updatedAttackers = { ...roster, ...releasedFromInactive }
  contributorIds.forEach(uid => {
    updatedAttackers[uid] = {
      ...roster[uid],
      strength: (leftoverByOwner[uid] || []).map(e => e.key),
      locks: locksByOwner[uid] || [],
      exhausted: true // stays grayed until the other side hits back
    }
  })

  const droppedLoot = side === 'goodies'
    ? defeated.flatMap(name => targets[name].loot || [])
    : []

  $.controller(
    { side, targetSide, updatedAttackers, updatedTargets, defeated, droppedLoot },
    (state, payload) => {
      let battlefield = { ...state.battlefield }
      let inventory = state.inventory
      let party = state.party
      let mode = state.mode

      battlefield = { ...battlefield, [payload.side]: payload.updatedAttackers, [payload.targetSide]: payload.updatedTargets }

      // the side that just got hit is now free to respond
      const freshTargets = { ...battlefield[payload.targetSide] }
      Object.keys(freshTargets).forEach(uid => {
        freshTargets[uid] = { ...freshTargets[uid], exhausted: false }
      })
      battlefield = { ...battlefield, [payload.targetSide]: freshTargets }

      if (payload.side === 'goodies') {
        inventory = [...inventory, ...payload.droppedLoot]
      }
      if (payload.side === 'baddies') {
        const defeatedIds = payload.defeated.map(n => parseInt(n, 10))
        party = party.filter(pid => !defeatedIds.includes(pid))
        inventory = inventory.filter(iid => !defeatedIds.includes(iid))
      }

      const isWin = targetSide === 'baddies' && Object.keys(updatedTargets).length === 0
      const isLoss = targetSide === 'goodies' && defeated.length > 0 && Object.keys(updatedTargets).length === 0 && inventory.length === 0
      const sillyDefeated = targetSide === 'goodies' && defeated.includes(String(Silly.id))
      const partyWiped = targetSide === 'goodies' && defeated.length > 0 && Object.keys(updatedTargets).length === 0 && inventory.length > 0

      const checkmate = !isWin && !isLoss && !sillyDefeated && isCheckmate(
        targetSide === 'baddies' ? updatedTargets : battlefield.baddies
      )

      if (isWin) mode = Modes.map
      if (isLoss || sillyDefeated) {
        mode = Modes.welcome
        party = []
        inventory = []
        battlefield = {}
      } else if (partyWiped || checkmate) {
        mode = Modes.map
        toast(partyWiped ? 'Your party was defeated — pick a new one.' : 'No winning moves left — regroup and try again.', {type: 'success' })
      }

      return { ...state, battlefield, inventory, party, mode }
    }
  )

  if (side === 'goodies') {
    droppedLoot.forEach(lootId => {
      toast(`Found ${memex[lootId].name}!`, { type: 'success' })
    })
  }
}

$.when('click', '.goodies .ninjami', (event) => activate('goodies', parseId(event)))
$.when('click', '.baddies .ninjami', (event) => activate('baddies', parseId(event)))

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

$.when('click', '.acquisition .ninjami', (event) => {
  const id = parseId(event)
  get(id)

  $.controller({ mode: Modes.map })
})

$.when('click', '[action="get"]', (event) => {
  const id = parseId(event)
  get(id)

  $.controller({ mode: Modes.map })
})

$.when('click', '[action="accept"]', (event) => {
  const id = parseId(event)
  get(id)

  $.controller({ mode: Modes.welcome })
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

  & .ninjami-wrap {
    width: calc(2.5in * var(--card-scale, 1));
    height: calc(3.5in * var(--card-scale, 1));
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    place-self: center;
  }

  & .ninjami {
    width: 2.5in;
    height: 3.5in;
    transform: scale(var(--card-scale, 1));
    transform-origin: center center;
    padding: 6px;
    place-self: center;
    color: saddlebrown;
  }

  & .ninjami.exhausted {
    opacity: .5;
    filter: grayscale(1);
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
    background: linear-gradient(-45deg, rgba(0,0,0,1), mediumseagreen, rgba(255,255,255,1));
  }

  & .inventory {
    background: linear-gradient(-45deg, rgba(0,0,0,1), dodgerblue, rgba(255,255,255,1));
  }

  & .party,
  & .inventory,
  & .baddies,
  & .yay-plate,
  & .goodies {
    display: flex;
    place-content: safe center;
    overflow: auto;
    gap: 1rem;
    padding: 0 1rem;
  }

  & .map {
    background: linear-gradient(-45deg, rgba(0,0,0,1), orange, rgba(255,255,255,1));
    height: 100%;
  }

  & .layout,
  & .map {
    display: grid;
    grid-template-rows: 1fr auto;
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

  & .home-row {
    background: linear-gradient(-180deg, rgba(255,255,255,.25),rgba(0,0,0,.75)), black;
    display: flex;
    place-content: center;
    padding: 8px;
  }

  & .home-button {
    border: none;
    padding: 0;
    border-radius: 100%;
    color: white;
    font-weight: 1000;
    width: 44px;
    height: 44px;
    display: grid;
    place-content: center;
    background: linear-gradient(rgba(0,0,0,.75),rgba(255,255,255,.25)), black;
  }

  & .party,
  & .inventory,
  & .baddies,
  & .goodies,
  & .yay-plate {
    container-name: card-row;
  }
`)

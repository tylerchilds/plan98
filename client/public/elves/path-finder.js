import elf from '@silly/elf'

import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const attributes = {
  'STR': 'Strength',
  'DEX': 'Dexterity',
  'CON': 'Constitution',
  'INT': 'Intelligence',
  'WIS': 'Wisdom',
  'CHA': 'Charisma',
}

const ancestries = [
  'Dwarf',
  'Elf',
  'Gnome',
  'Halfling',
  'Human',
  'Leshy',
  'Orc',
]

const classes = [
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Ranger',
  'Rogue',
  'Witch',
  'Wizard',
]

const skills = [
  'Acrobatics',
  'Arcana',
  'Athletics',
  'Crafting',
  'Deception',
  'Diplomacy',
  'Intimidation',
  'Lore',
  'Medicine',
  'Nature',
  'Occultism',
  'Performance',
  'Religion',
  'Society',
  'Stealth',
  'Survival',
  'Thievery',
]
const stock = {
  character: '',
  classification: '',
  ancestry: ''
}

function read($) {
  const path = window.location.pathname + window.location.search
  return $.learn()[path] || stock
}

function write($, data, merge = (node, data, key) => {
  node.get(key).put(data[key])
}) {
  const path = window.location.pathname + window.location.search
  Object
    .keys(data)
    .forEach(key => {
      const entry = gun.get($.link).get(path)
      merge(entry, data, key)
    })
}

const origin = elf('path-finder')

function subscribe(target) {
  target.subscribed = true
  const path = window.location.pathname + window.location.search
  const entry = gun.get(origin.link).get(path)
  entry.open((data) => {
    origin.teach({[path]: data})
  });
}

origin.draw(target => {
  if(!target.subscribed) subscribe(target)
  const { character, ancestry, classification } = read(origin)
  console.log(character, ancestry, classification)
  const ancestryOptions = ancestries.map((x) => {
    return `
      <option value="${x}" ${x === ancestry ? 'selected="true"':''}>
        ${x}
      </option>
    `
  }).join('')
  const classOptions = classes.map((y) => {
    return `
      <option value="${y}" ${y === classification ? 'selected="true"':''}>
        ${y}
      </option>
    `
  }).join('')

  const stats = Object.keys(attributes).map(x => {
    return `
      <label class="field">
        <span class="label" data-tooltip="${attributes[x]}">${x}</span>
        <input data-bind name="${x}" value="${read(origin)[x] || ''}">
      </label>
    `
  }).join('')


  return `
    <h1>
      ${character || '??????'}
    </h1>
    <h2>
      ${ancestry || '????'} / ${classification || '?????'}
    </h2>
    <div class="navigation">
      <a href="${self.location.href}">
        Permalink
      </a>
      <a href="/app/my-journal">
        Journal
      </a>
      <a href="/app/bulletin-board?src=${target.getAttribute('src') || ''}">
        Launch
      </a>
    </div>
    <div class="character">
      <label class="field" style="grid-area: name;">
        <span class="label">Character</span>
        <input data-bind name="character" value="${character || ''}">
      </label>
      <label class="field">
        <span class="label">Ancestry</span>
        <select data-bind name="ancestry">
          <option disabled>--select--</option>
          ${ancestryOptions}
        </select>
      </label>
      <label class="field">
        <span class="label">Class</span>
        <select data-bind name="classification">
          <option disabled>--select--</option>
          ${classOptions}
        </select>
      </label>
    </div>

    <h2>Stats</h2>
    <div class="stats">
      ${stats}
    </div>

    <h3>Skills</h3>
    <div class="skills">
      ${
        skills.map(skill => {
          return `
            <span class="label">${skill}</span>
            <div class="skill">
              <div class="skill-value">
                <input data-bind name="${skill}" value="${read(origin)[skill] || ''}">
              </div>
              <div class="skill-math">
              </div>
              <div class="skill-notes">
                <textarea data-bind name="${skill}-note">${read(origin)[`${skill}-note`] || ''}</textarea>
              </div>
            </div>
          `
        }).join('')
      }
    </div>
  `
})

origin.when('input', '[data-bind]', (event) => {
  write(origin, {[event.target.name]: event.target.value })
})

origin.when('change', '[data-bind]', (event) => {
  write(origin, {[event.target.name]: event.target.value })
})

origin.style(`
  & {
    display: block;
    height: 100%;
    padding: 1rem;
  }
  & .character {
    display: grid;
    grid-template-areas: "name name" "ancestry classification";
    grid-template-columns: 1fr 1fr;
  }

  & .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4ch, 1fr));
  }

  & .skill {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  }

  & .skill-value input {
    max-width: 100%;
  }

  & .skill .field {
    margin-bottom: 0;
  }

  & .skill-notes textarea {
    height: 100%;
    border-radius: 0;
    resize: none;
    max-width: 100%;
    border: 1px solid rgba(0,0,0,.1);
  }

  & .navigation {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
  }
`)

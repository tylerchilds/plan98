import elf from '@plan98/elf'

const attributes = {
  'STR': 'Strength',
  'DEX': 'Dexterity',
  'CON': 'Constitution',
  'INT': 'Intelligence',
  'WIS': 'Wisdom',
  'CHA': 'Charisma',
}

const ancestriesList = [
  'Dwarf',
  'Elf',
  'Gnome',
  'Halfling',
  'Human',
  'Leshy',
  'Orc',
]

const classesList = [
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Ranger',
  'Rogue',
  'Witch',
  'Wizard',
]

const skillsList = [
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

const ethicsList = ["Lawful", "Neutral", "Chaotic"]
const modalsList = ["Good", "Neutral", "Evil"]

const stock = {
  character: '',
  classification: '',
  ancestry: ''
}

const origin = elf('path-finder')

function getState(target) {
  return origin.learn()[target.id] || stock
}

origin.draw(target => {
  const { character, ancestry, classification, ethics, morals } = getState(target)
  console.log(character, ancestry, classification, ethics, morals)
  const ancestryOptions = ancestriesList.map((x) => {
    return `
      <option value="${x}" ${x === ancestry ? 'selected="true"':''}>
        ${x}
      </option>
    `
  }).join('')
  const classOptions = classesList.map((y) => {
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
        <input data-bind name="${x}" value="${getState(target)[x] || ''}">
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
    ${classification === 'Bard' ? `<music-walk></music-walk>` : ''}
    <div class="navigation">
      <a href="${self.location.href}" target="_top">
        Permalink
      </a>
      <a href="/app/bulletin-board?src=${target.getAttribute('src') || ''}">
        Campaign Board
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
    <div style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        Ethics
        ${ethicsList.map(value => {
          return `
            <label class="field">
              <input data-bind type="radio" name="ethics" value="${value}" data-option="${value}" ${ethics === value ? 'checked="true"':''} />
              <span class="label">${value}</span>
            </label>
          `
        }).join('')}
      </div>
      <div>
        Morals
        ${modalsList.map(value => {
          return `
            <label class="field">
              <input data-bind type="radio" name="morals" value="${value}" data-option="${value}" ${morals === value ? 'checked="true"':''} />
              <span class="label">${value}</span>
            </label>
          `
        }).join('')}
      </div>
    </div>


    <h2>Stats</h2>
    <div class="stats">
      ${stats}
    </div>

    <h3>Skills</h3>
    <div class="skills">
      ${
        skillsList.map(skill => {
          return `
            <span class="label">${skill}</span>
            <div class="skill">
              <div class="skill-value">
                <input data-bind name="${skill}" value="${getState(target)[skill] || ''}">
              </div>
              <div class="skill-math">
              </div>
              <div class="skill-notes">
                <textarea data-bind name="${skill}-note">${getState(target)[`${skill}-note`] || ''}</textarea>
              </div>
            </div>
          `
        }).join('')
      }
    </div>
  `
})

function setState(id, payload) {
  origin.teach(payload, {
    mergeHandler: mergeBy,
    parameters: [id]
  })
}

function mergeBy(id) {
  return (state, payload) => {
    return {
      ...state,
      [id]: {
        ...state[id],
        ...payload
      }
    }
  }
}


origin.when('input', '[data-bind]', (event) => {
  const { id } = event.target.closest(origin.link)
  setState(id, { [event.target.name]: event.target.value  })
})

origin.when('change', '[data-bind]', (event) => {
  const { id } = event.target.closest(origin.link)
  setState(id, { [event.target.name]: event.target.value  })
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

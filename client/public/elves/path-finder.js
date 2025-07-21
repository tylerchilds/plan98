import elf from '@plan98/elf'

const STR = 'STR'
const DEX = 'DEX'
const CON = 'CON'
const INT = 'INT'
const WIS = 'WIS'
const CHA = 'CHA'

const attributes = {
  [STR]: 'Strength',
  [DEX]: 'Dexterity',
  [CON]: 'Constitution',
  [INT]: 'Intelligence',
  [WIS]: 'Wisdom',
  [CHA]: 'Charisma',
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
  {
    label: 'Acrobatics',
    name: 'acrobatics',
    modifier: DEX,
  },
  {
    label: 'Arcana',
    name: 'arcana',
    modifier: INT,
  },
  {
    label: 'Athletics',
    name: 'athletics',
    modifier: STR,
  },
  {
    label: 'Crafting',
    name: 'crafting',
    modifier: INT,
  },
  {
    label: 'Deception',
    name: 'deception',
    modifier: CHA,
  },
  {
    label: 'Diplomacy',
    name: 'diplomacy',
    modifier: CHA,
  },
  {
    label: 'Intimidation',
    name: 'intimidation',
    modifier: CHA,
  },
  {
    label: 'Lore',
    name: 'lore',
    modifier: INT,
  },
  {
    label: 'Medicine',
    name: 'medicine',
    modifier: WIS,
  },
  {
    label: 'Nature',
    name: 'nature',
    modifier: WIS,
  },
  {
    label: 'Occultism',
    name: 'occultism',
    modifier: INT,
  },
  {
    label: 'Performance',
    name: 'performance',
    modifier: CHA,
  },
  {
    label: 'Religion',
    name: 'religion',
    modifier: WIS,
  },
  {
    label: 'Society',
    name: 'society',
    modifier: INT,
  },
  {
    label: 'Stealth',
    name: 'stealth',
    modifier: DEX,
  },
  {
    label: 'Survival',
    name: 'survival',
    modifier: WIS,
  },
  {
    label: 'Thievery',
    name: 'thievery',
    modifier: DEX,
  },
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
    <div class="page">
      <label class="field">
        <span class="label">Background</span>
        <textarea class="standard-input" data-bind name="background">${getState(target).background || ''}</textarea>
      </label>

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
          Ethics<br>
          ${ethicsList.map(value => {
            return `
              <label class="field -inline">
                <input data-bind type="radio" name="ethics" value="${value}" data-option="${value}" ${ethics === value ? 'checked="true"':''} />
                <span class="label">${value}</span>
              </label>
            `
          }).join('')}
        </div>
        <div>
          Morals<br>
          ${modalsList.map(value => {
            return `
              <label class="field -inline">
                <input data-bind type="radio" name="morals" value="${value}" data-option="${value}" ${morals === value ? 'checked="true"':''} />
                <span class="label">${value}</span>
              </label>
            `
          }).join('')}
        </div>
      </div>

      <div class="stats">
        ${stats}
      </div>

      <div class="skills">
        ${
          skillsList.map(skill => {
            const { label, name, modifier } = skill
            const value = parseInt(getState(target)[name] || 0)
            const mod = parseInt(getState(target)[modifier] || 0)
            return `
              <div class="skill">
                <div class="skill-value">
                  <label class="field">
                    <span class="label">${label}</span>
                    <input data-bind name="${name}" value="${value}">
                  </label>
                </div>
                <div class="skill-math">
                  ${value + mod}
                </div>
                <div class="skill-notes">
                  <textarea class="standard-input" data-bind name="${name}-note">${getState(target)[`${name}-note`] || ''}</textarea>
                </div>
              </div>
            `
          }).join('')
        }
      </div>

      <label class="field">
        <span class="label">Inventory</span>
        <textarea class="standard-input" data-bind name="inventory">${getState(target).inventory || ''}</textarea>
      </label>

      ${classification === 'Bard' ? `<paper-pocket></paper-pocket>` : ''}
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
    overflow: auto;
  }

  & .page {
    padding: 1in 1rem;
    max-width: 7.5in;
    margin: auto;
    display: grid;
    gap: 1rem;
  }
  & .character {
    display: grid;
    grid-template-areas: "name name" "ancestry classification";
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
  }

  & .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4ch, 1fr));
    gap: .5rem;
  }

  & .skills {
    display: grid;
    gap: 1rem;
  }

  & .skill {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: .5rem;
  }

  & .skill-math {
    display: grid;
    place-content: end;
    font-size: 2rem;
    color: rgba(0,0,0,.5);
  }

  & .skill-value input {
    max-width: 100%;
  }

  & .skill .field {
    margin-bottom: 0;
  }

  & .skill-notes textarea {
    height: 100%;
    resize: none;
    max-width: 100%;
  }

  & .navigation {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
  }
`)

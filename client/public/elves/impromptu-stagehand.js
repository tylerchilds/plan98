// elf files are the kernel that convert machine code to keyboard
import elf from '@silly/elf'

// link is a variable that bridges human computer interaction
const link = elf('impromptu-stagehand', {
  schedule: {},
  sessions: [],
  form: {},
  types: ['geography', 'entertainment', 'history', 'art/literature', 'science/nature', 'sports/leisure'],
  accordions: {
    propose: false,
    session: true,
    grid: false,
  }
})

// hours are how many times are available
const hours = ['fast', 'pre-breakfast', 'breakfast', 'brunch', 'lunch', 'tea', 'a kind thank you to our sponsors', 'dinner', 'dessert', 'show', 'song', 'dance', 'pizza']

// circles are how many spaces are available
const circles = ['Winchester Mystery House', 'Mountain View', 'Palo Alto', 'Redwood City', 'San Mateo', 'San Bruno', '4th & King', 'Embarcadero', 'Pierre 35', 'Pier 39']

link.draw((target) => {
  const {
    types,
    proposing,
    schedule,
    sessions,
    form,
    focused,
    accordions
  } = link.learn()

  let grid = '<table>'
  grid += '<thead>'
  grid += '<tr>'

  // (0,0) cell
  grid += `<th></th>`
  for(const when of hours) {
    grid += `<th>${when}</th>`
  }

  grid += '</tr>'
  grid += '</thead>'
  grid += '<tbody>'

  for(const where of circles) {
    grid += '<tr>'
    grid += `<td>${where}</td>`
    for(const when of hours) {
      const id = `${when}-${where}`
      const session = sessions[schedule[id]]

      let button
      if(focused === id) {
        button = `<select class="active cell" id="${id}" data-when="${when}" data-where="${where}">`
        button += `<option disabled>-</option>`
        button += sessions
          .filter(session => {
            return session.when === when && session.where === where
          })
          .map(({ what }, index) => {
            return `
              <option value="${index}">${what}</option>
            `
          }).join('')
        button += '</select>'
      } else {
        button = session ? `
          <button data-update class="idea" data-type="${session.type}" data-tooltip="${tooltip(schedule[id])}" data-where="${where}" data-when="${when}">
            ${session.what}
          </button>
        ` : `
          <button data-insert data-where="${where}" data-when="${when}">
            +
          </button>
        `
      }
      grid += `<td>${button}</td>`
    }

    grid += '</tr>'
  }

  grid += '</tbody>'
  grid += '</table>'

  const allSessions = sessions.map(({ uuid, type, who, when, what, where, why }, id) => {
    return `
      <tr>
        <td>
          <button data-launch class="idea" data-uuid="${uuid}" data-type="${type}" data-tooltip="${tooltip(id)}">
            ${what}
          </button>
        </td>
        <td>
          ${when}
        </td>
        <td>
          ${where}
        </td>
        <td>
          ${why}
        </td>
        <td>
          ${who.split(',').map(x => `<span>${x}</span>`).join(', ')}
        </td>
      </tr>
    `
  }).join('')

  return `
    <div style="text-align: center;">
      <a href="/app/clown-jukebox" class="nonce" data-tooltip="home" aria-label="home"></a>
    </div>
    <div class="item">
      <button class="head" data-accordion="propose">
        <a href="" class="nonce"></a>
        Volunteer Idea
      </button>
      <div class="body">
        <form>
          <label class="field">
            <span class="label">Guiness Book of World Records Category</span>
            <select name="type">
              <option>uncategorized</option>
              ${types.map((type) => {
                return `
                  <option value="${type}">${type}</option>
                `
              })}
            </select>
          </label>

          <label class="field">
            <span class="label">Who</span>
            <input name="who" value="${form.who || ''}" placeholder="tychi,clown">
          </label>

          <label class="field">
            <span class="label">What</span>
            <input name="what" value="${form.what || ''}" placeholder="un-gamifying un-conferences">
          </label>

          <label class="field">
            <span class="label">When</span>
            <select name="when">
              <option disabled>When</option>
              ${hours.map((hour) => {
                return `
                  <option value="${hour}">${hour}</option>
                `
              })}
            </select>
          </label>

          <label class="field">
            <span class="label">Where</span>
            <select name="where">
              <option disabled>Where</option>
              ${circles.map((circle) => {
                return `
                  <option value="${circle}">${circle}</option>
                `
              })}
            </select>
          </label>

          <label class="field">
            <span class="label">Why</span>
            <input name="why" value="${form.why || ''}" placeholder="to streamline co creative processes">
          </label>
          <div class="button-row">
            <button type="submit">
              <div class="nonce"></div>
              Submit
            </button>
            <button type="reset">clear</button>
          </div>
        </form>
      </div>
    </div>
    <div class="item">
      <button class="head" data-accordion="session">
        <div class="nonce"></div>
        All Ideas
      </button>
      <div class="body">
        <div class="horizon-scroll">
          <table>
            <tr>
              <th>What</th>
              <th>When</th>
              <th>Where</th>
              <th>Why</th>
              <th>Who</th>
            </tr>
            ${allSessions}
          </table>
        </div>
      </div>
    </div>
    <div class="item">
      <button class="head" data-accordion="grid">
        <a href="" class="nonce"></a>
        Conference Grid
      </button>
      <div class="body">
        <div class="horizon-scroll">
          ${grid}
        </div>
      </div>
    </div>
  `
}, {
  afterUpdate: function(target) {
    {
      const { focused } = link.learn()
      if(focused) {
        const active = target.querySelector(`[id="${focused}"]`)
        active.focus()
      }
    }

    {
      const { accordions } = link.learn()
      Object
        .keys(accordions)
        .map(accordion => {
          target.querySelector(`[data-accordion="${accordion}"]`).dataset.open = accordions[accordion]
        })
    }
  }
})


link.when('click', '[data-launch]', (event) => {
  const { uuid } = event.target.dataset
  window.location.href = `/app/bulletin-board?src=${`/private/${link.link}/${uuid}`}.saga&uuid=${uuid}`
})

link.when('click', '.head', (event) => {
  const { accordion } = event.target.dataset
  const { accordions } = link.learn()
  const open = accordions[accordion]

  link.teach({ [accordion]: !open }, (s, p) => {
    return {
      ...s,
      accordions: {
        ...s.accordions,
        ...p
      }
    }
  })
})

function tooltip(id) {
  const {
    sessions,
  } = link.learn()

  const session = sessions[id]
  if(!session) return
  return `
    ${session.type}<br>
    ${session.who}<br>
    ${session.when}<br>
    ${session.what}<br>
    ${session.why}<br>
  `
}

link.when('submit', 'form', (event) => {
  event.preventDefault()
  link.teach({ error: false })

  const { form } = link.learn()
  if(form.who && form.when && form.why && form.what) {
    link.teach({...form, uuid: self.crypto.randomUUID() }, (state, payload) => {
      return {
        ...state,
        sessions: [...state.sessions, payload]
      }
    })
  } else {
    link.teach({ error: 'You missed a spot.' })
  }
})

link.when('reset', 'form', (event) => {
  link.teach({ form: { who: '', what: '', why: '', when: '' }, proposing: false, focused: null })
})

link.when('click', 'button[data-insert]', (event) => {
  const { when, where } = event.target.dataset
  link.teach({ focused: `${when}-${where}` })
})

link.when('click', 'button[data-update]', (event) => {
  const { when, where } = event.target.dataset
  link.teach({ focused: `${when}-${where}` })
})


link.when('click', '[data-unfocus]', () => {
  link.teach({ focused: null, proposing: true })
})

link.when('click', '*:not([data-insert],[data-update],.active)', (event) => {
  const { focused } = link.learn()
  if(focused) {
    link.teach({ focused: null })
  }
})

link.when('input', 'input', (event) => {
  const { name, value } = event.target

  link.teach({
    [name]: value
  }, (state, payload) => {
    return {
      ...state,
      form: {
        ...state.form,
        ...payload
      }
    }
  })
})

link.when('change', 'select.cell', (event) => {
  const { when, where } = event.target.dataset
  const { sessions } = link.learn()

  const sessionIndex = sessions.findIndex((_, index) => `${index}` === event.target.value)
  link.teach({ [`${when}-${where}`]: sessionIndex }, (state, payload) => {
    return {
      ...state,
      schedule: {
        ...state.schedule,
        ...payload
      }
    }
  })
})


function syncInput(key, value) {
  link.teach({
    [key]: value
  }, (state, payload) => {
    return {
      ...state,
      form: {
        ...state.form,
        ...payload
      }
    }
  })

}

link.when('change', 'select', (event) => {
  syncInput(event.target.name, event.target.value)
})

link.style(`
  & {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: auto;
    flex-direction: column;
    gap: 1rem;
    background: #54796d;
    padding: 1rem;
  }

  & .item {
    background: lemonchiffon;
    color: saddlebrown;
    positon: relative;
    bottom: 0;
  }

  & .head {
    background: lemonchiffon;
    color: saddlebrown;
    display: grid;
    width: 100%;
    grid-template-columns: auto 1fr;
    place-items: center start;
    gap: .5rem;
    border: none;
  }

  & .head .nonce {
    height: 2rem;
  }

  & .body {
    display: none;
  }

  & [data-open="true"] + .body {
    display: block;
    padding: 1rem;
  }

  & .horizon-scroll {
    max-width: 100%;
    overflow: auto;
  }

  & table {
    width: 100%;
    table-layout: fixed;
  }

  & table th,
  & table td {
    height: 3rem;
    width: 18ch;
    padding: 8px;
  }

  & table button {
    width: 100%;
    display: block;
    height: 100%;
    border: none;
    border-radius: 0;
    background: linear-gradient(rgba(255,255,255,.65),rgba(255,255,255,.5));
    background-color: lemonchiffon;
    color: rgba(0,0,0,.85);
  }

  & .idea[data-type="entertainment"] {
    background-color: firebrick;
  }

  & .idea[data-type="sports/leisure"] {
    background-color: darkorange;
  }

  & .idea[data-type="history"] {
    background-color: gold;
  }

  & .idea[data-type="science/nature"] {
    background-color: mediumseagreen;
  }

  & .idea[data-type="geography"] {
    background-color: dodgerblue;
  }

  & .idea[data-type="art/literature"] {
    background-color: mediumpurple;
  }

  & table select,
  & .field select {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    border-radius: none;
    display: block;
    width: 100%;
  }

  & form button {
    border-radius: none;
    border: 0;
  }

  & form [type="reset"] {
    background: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: lemonchiffon;
    color: white;
    padding: .5rem;
    float: right;
  }

  & form [type="submit"] {
    background: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: mediumseagreen;
    color: white;
    padding: .5rem;
    display: grid;
    grid-template-columns: 2rem 1fr;
    place-items: center start;
    gap: .5rem;
  }

  & .field input {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    border-radius: 0;
  }


  & .field {
    background: lemonchiffon;
    color: saddlebrown;
  }

  & .idea {
    background: linear-gradient(rgba(255,255,255,.65),rgba(255,255,255,.5));
    background-color: lemonchiffon;
    color: rgba(0,0,0,.85);
    aspect-ratio: 1;
    min-width: 18ch;
    width: 100%;
  }

  & .button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`)

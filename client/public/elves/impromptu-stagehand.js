// elf files are the kernel that convert machine code to keyboard
import elf from '@silly/tag'

// link is a variable that bridges human computer interaction
const link = elf('impromptu-stagehand', {
  schedule: {},
  sessions: [],
  form: {},
  types: ['apple', 'banana', 'coconut', 'dill pickles', 'eggs', 'french toast', 'grapes'],
  accordions: {
    propose: false,
    session: true,
    grid: false,
    more: false
  }
})

// hours are how many times are available
const hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

// circles are how many spaces are available
const circles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

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
    for(const when in hours) {
      const id = `${when}-${where}`
      const session = sessions[schedule[id]]

      let button
      if(focused === id) {
        button = `<select class="active cell" id="${id}" data-when="${when}" data-where="${where}">`
        button += `<option disabled>-</option>`
        button += sessions.map(({ what }, index) => {
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

  const allSessions = sessions.map(({ type, who, what, why }, id) => {
    return `
      <div class="idea" data-type="${type}" data-tooltip="${tooltip(id)}">
        <strong>${what}</strong>
        ${why}

        <hr>
        ${who}
      </div>
    `
  }).join('')

  return `
    <div style="text-align: center;">
      <a href="/app/clown-jukebox" class="nonce" data-tooltip="home" aria-label="home"></a>
    </div>
    <div class="item">
      <button class="head" data-accordion="propose">
        <a href="" class="nonce"></a>
        Propose Session
      </button>
      <div class="body">
        <form>
          <label class="field">
            <span class="label">Type</span>
            <select name="type">
              <option>unconference</option>
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
        All Sessions
      </button>
      <div class="body">
        <div class="irix-launcher">
          ${allSessions}
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
    <div class="item">
      <button class="head" data-accordion="more">
        <a href="" class="nonce"></a>
        Past Appearances
      </button>
      <div class="body">
        <div style="padding: 1rem;">
          Related Videos:
          <ul>
            <li>
              <a target="_blank" href="https://archive.org/details/26-11_15_simplifying_client-side_web_programming.mp4">Simplifying Client-Side Web Programming</a>
            </li>
            <li>
              <a target="_blank" href="https://archive.org/details/amphi_day1_1730_a_taste_of_tomorrow_today">A Taste of Tomorrow Today</a>
            </li>
          </ul>
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
    ${session.what}<br>
    ${session.why}<br>
  `
}

link.when('submit', 'form', (event) => {
  event.preventDefault()
  link.teach({ error: false })

  const { form } = link.learn()

  if(form.who && form.why && form.what) {
    link.teach(form, (state, payload) => {
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
  link.teach({ form: { who: '', whate: '', why: '' }, proposing: false, focused: null })
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


link.when('change', 'select[name="type"]', (event) => {
  link.teach({
    type: event.target.value
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
  }

  & .horizon-scroll {
    max-width: 100%;
    overflow: auto;
  }

  & .irix-launcher {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    padding: 8px;
    gap: 8px;
    justify-items: center;
  }


  & table {
    width: 100%;
    table-layout: fixed;
  }

  & table th,
  & table td {
    height: 3rem;
    width: 18ch;
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

  & .idea[data-type="apple"] {
    background-color: firebrick;
  }

  & .idea[data-type="banana"] {
    background-color: darkorange;
  }

  & .idea[data-type="coconut"] {
    background-color: gold;
  }

  & .idea[data-type="dill pickle"] {
    background-color: mediumseagreen;
  }

  & .idea[data-type="eggs"] {
    background-color: dodgerblue;
  }

  & .idea[data-type="french toast"] {
    background-color: saddlebrown;
  }

  & .idea[data-type="grapes"] {
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

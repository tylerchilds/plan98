// elf files are the kernel that convert machine code to keyboard
import elf from '@silly/elf'

// link is a variable that bridges human computer interaction
const link = elf('impromptu-stagehand', {
  schedule: {},
  sessions: [],
  form: {}
})

// hours are how many times are available
const hours = ['0', '1', '2', '3', '4', '5', '6', '7']

// circles are how many spaces are available
const circles = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

link.draw((target) => {
  const { schedule, sessions, form, focused } = link.learn()

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
      const session = schedule[`${when}-${where}`]

      let button
      if(focused === `${when}-${where}`) {
        button = `<select data-when="${when}" data-where="${where}">`
        button += `<option disabled>-</option>`
        button += sessions.map(({ who, what }) => {
          return `
            <option value="${who}">${what}</option>
          `
        }).join('')
        button += '</select>'
      } else {
        button = session ? `
          <button data-about data-where="${where}" data-when="${when}">
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


  const allSessions = sessions.map(({ who, what, why }) => {
    return `
      <div class="card">
        <div class="card-who">${who}</div>
        <div class="card-what">${what}</div>
        <div class="card-why">${why}</div>
      </div>
    `
  }).join('')

  return `
    Un-Employed Un-Conference <button data-unfocus>Un-Focus</button>
    ${grid}

    <form>
      <fieldset>
        <legend>
          New Session
        </legend>
        <label for="who">Who</label>
        <input name="who" value="${form.who || ''}">
        <br>
        <label for="what">What</label>
        <input name="what" value="${form.what || ''}">
        <br>
        <label for="why">Why</label>
        <input name="why" value="${form.why || ''}">
      </fieldset>

      <button type="submit">Submit</button>
    </form>
    ${allSessions}

    Related Videos:
    <a target="_blank" href="https://archive.org/details/26-11_15_simplifying_client-side_web_programming.mp4">Simplifying Client-Side Web Programming</a>
    <a target="_blank" href="https://archive.org/details/amphi_day1_1730_a_taste_of_tomorrow_today">A Taste of Tomorrow Today</a>
  `
})

link.when('submit', 'form', (event) => {
  event.preventDefault()

  const { form } = link.learn()

  link.teach(form, (state, payload) => {
    return {
      ...state,
      sessions: [...state.sessions, payload]
    }
  })
})

link.when('click', 'button[data-insert]', (event) => {
  const { when, where } = event.target.dataset
  link.teach({ focused: `${when}-${where}` })
})

link.when('click', '[data-unfocus]', () => {
  link.teach({ focused: null })
})

link.when('select', 'blur', () => {
  link.teach({ focused: null })
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

link.when('change', 'select', (event) => {
  const { when, where } = event.target.dataset
  const { sessions } = link.learn()

  const session = sessions.find(({ who }) => who === event.target.value)
  link.teach({ [`${when}-${where}`]: session }, (state, payload) => {
    return {
      ...state,
      schedule: {
        ...state.schedule,
        ...payload
      }
    }
  })
})

link.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
  }

  & table {
    width: 100%;
  }

  & table button {
    width: 100%;
    display: block;
    height: 100%;
  }
`)


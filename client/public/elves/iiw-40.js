import elf from '@silly/elf'

const $ = elf('iiw-40', {
  // schema goes here
  inputText: '',
  listOfReminders: []
})

$.draw(() => {
  const { inputText, listOfReminders } = $.learn()

  const todoList = listOfReminders.filter(x => !x.completed)
  const doneList = listOfReminders.filter(x => x.completed)

  return `
    <form class="input-area">
      <input placeholder="Remind me..." value="${inputText}" name="reminder" />
      <button type="submit">
        Remind
      </button>
    </form>
    <div class="list-area">
      <h2>Todo</h2>
      <div class="list">
        ${
          todoList.map(x => {
            return `
              <div class="reminder -todo">
                <input name="${x.id}" type="checkbox" data-complete="${x.id}">
                <span>
                  ${x.text}
                </span>
              </div>
            `
          }).join('')
        }
      </div>
      <h2>Done</h2>
      <div class="list">
        ${
          doneList.map(x => {
            return `
              <div class="reminder -done">
                <input name="${x.id}" checked="true" type="checkbox" data-complete="${x.id}">
                <span>
                  ${x.text}
                </span>
              </div>
            `
          }).join('')
        }
      </div>
    </div>
  `
}, {
  // reconcile the virtual dom for indexing checkboxes funny
  afterUpdate(target) {
    [...target.querySelectorAll('.reminder.-todo input')].map(x => {
      x.checked = false
    });

    [...target.querySelectorAll('.reminder.-done input')].map(x => {
      x.checked = true
    });
  }
})

$.when('change', '[data-complete]', event => {
  const id = event.target.dataset.complete

  const { checked } = event.target

  if(checked) {
    $.teach(id, completeItem)
  } else {
    $.teach(id, undoCompleteItem)
  }
})

$.when('input', '[name="reminder"]', (event) => {
  const inputText = event.target.value
  $.teach({ inputText })
})

$.when('submit', 'form', (event) => {
  event.preventDefault()

  const { inputText } = $.learn()

  $.teach(inputText, newReminder)

  $.teach({ inputText: '' })
})

function completeItem(state, payload) {
  return {
    ...state,
    listOfReminders: [
      ...state.listOfReminders.map(x => {
        if(payload === x.id) {
          x.completed = true
        }
        return x
      })
    ]
  }
}

function undoCompleteItem(state, payload) {
  return {
    ...state,
    listOfReminders: [
      ...state.listOfReminders.map(x => {
        if(payload === x.id) {
          x.completed = false
        }
        return x
      })
    ]
  }
}

function newReminder(state, payload) {
  return {
    ...state,
    listOfReminders: [
      ...state.listOfReminders,
      {
        text: payload,
        completed: false,
        id: self.crypto.randomUUID()
      }
    ]
  }
}

$.style(`
  & {
    display:grid;
    font-size: 2rem;
    font-weight: bold;
    grid-template-rows: auto 1fr;
    height: 100%;
    oveflow: hidden;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(335deg, dodgerblue, mediumseagreen);
  }

  & .input-area {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
  }

  & .input-area input {
    width: 100%;
    max-width: 100%;
  }

  & .list-area {
    overflow: auto;
    height: 100%;
  }

  & .reminder {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    line-height: 1;
    padding: 1rem;
    background: rgba(255,255,255,.5);
    backdrop-filter: blur(8px);
    border-radius: 1rem;
  }

  & .reminder.-done {
    text-decoration: line-through;
    color: rgba(0,0,0,.45);
  }

  & [type="checkbox"] {
    width: 2rem;
    height: 2rem;
  }

  & .input-area input {
    border: none;
    border-radius: 1rem;
    padding: .5rem 1rem;
    font-size: 1rem;
    line-height: 1;
  }

  & h2 {
    color: rgba(0,0,0,.65);
    mix-blend-mode: multiply;
    margin: 0;
  }

  & [type="submit"] {
    line-height: 1;
    font-size: 1rem;
    padding: .5rem 1rem;
    border: none;
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), mediumseagreen;
    color: white;
    border-radius: 1rem;
  }

  & .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`)

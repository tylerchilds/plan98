import elf from '@silly/elf'

const $ = elf('plan98-toast', { order: [] })

export default $

$.draw((target) => {
  const { order } = $.learn()
  const data = order.map((id) => {
    const { body, type } = $.learn()[id]

    return `
      <button class="toast-message -soft ${type}" key="${id}" data-close="${id}">
        ${body}
      </button>
    `
  }).join('')

  if(data) {
    return data
  } else {
    target.innerHTML = ''
  }
}, {afterUpdate})

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    // scroll to bottom on new
    target.scrollTop = target.scrollHeight;
  }
}

$.when('click', '[data-close]', (event) => {
  const id = event.target.dataset.close
  untoast(id)
})

const toastContainer = document.createElement('plan98-toast')
document.body.appendChild(toastContainer)

export function toast(body, options) {
  const id = self.crypto.randomUUID()
  $.teach({
    id,
    [id]: {
      body,
      ...options
    }
  }, (state, payload) => {
    return {
      ...state,
      order: [...state.order, payload.id],
      [payload.id]: payload[payload.id]
    }
  })
  setTimeout(untoast.bind(null, id), 10000)
  return id
}

export function untoast(id) {
  $.teach(id, (state, payload) => {
    const newState = {...state}
    newState.order = newState.order.filter(x => {
      return x !== id
    })
    delete newState[payload]
    return newState
  })
}

$.style(`
  & {
    position: absolute;
    top: .5rem;
    right: .5rem;
    margin: auto;
    place-content: center;
    z-index: 9000;
    overflow: auto;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .toast-message {
    --toast-color: white;
    position: relative;
    width: 100%;
    border-radius: 0;
    background: lemonchiffon;
    text-align: left;
    border: none;
    color: var(--toast-color);
    border-top: rgba(255,255,255,.1);
    border-bottom: 1px solid var(--toast-color);
    padding: .5rem;
    line-height: 2;
    max-width: 280px;
  }

  & .toast-message::after {
    content: "X";
    padding-left: 1rem;
  }

  & .toast-message.success {
    --toast-color: mediumseagreen;
  }

  & .toast-message.error {
    --toast-color: firebrick;
  }

  & .toast-message.warn {
    --toast-color: gold;
  }

  & .toast-message.info {
    --toast-color: dodgerblue;
  }
`)

import elf from '@silly/elf'

const $ = elf('plan98-toast', { order: [] })

export default $

$.draw((target) => {
  const { order } = $.learn()
  const data = order.map((id) => {
    const { body, type } = $.learn()[id]

    return `
      <div class="toast-message ${type}" key="${id}">
        ${body}
        <button class="toast-close" data-close="${id}">
          <sl-icon name="x-lg"></sl-icon>
        </button>
      </div>
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
    bottom: 0;
    right: 0;
    place-content: center;
    z-index: 9000;
    overflow: auto;
    max-height: 100vh;
  }

  & .toast-message {
    --toast-color: black;
    background: white;
    border: 2px solid var(--toast-color);
    border-radius: 3px;
    padding: 1rem 3rem 1rem 1rem;
    font-size: 1.2rem;
    line-height: 1;
    position: relative;
    display: flex;
    gap: 1rem;
    margin: 1rem;
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

  & .toast-close {
    background: transparent;
    border: none;
    color: var(--toast-color);
    display: grid;
    place-content: center;
    padding: 3px 5px 0;
    opacity: .65;
    transition: opacity 100ms;
    margin-left: .5rem;
    aspect-ratio: 1;
    position: absolute;
    top: .5rem;
    right: .5rem;
  }

  & .toast-close:hover,
  & .toast-close:focus {
    border-color: rgba(0,0,0,1);
    color: rgba(0,0,0,1);
  }
`)

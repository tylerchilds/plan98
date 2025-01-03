import { tag } from "/deps.js"

const $ = tag('ctx-drawer', {
  drawers: {
    left: {
      body: null,
      isOpen: null,
    },
    right: {
      body: null,
      isOpen: null,
    }
  }
})

export default $

$.render(target => {
  const { position } = target.dataset

  const { isOpen, body } = byDrawer(position)

  if(!isOpen) return ' '

  const modalClose = `
    <button class="close" data-position="${position}">
      Close
    </button>
  `

  return `
    <div class="contents">
      ${modalClose}
      ${body}
    </div>
  `
})

const context = `
  <ctx-drawer data-position="left"></ctx-drawer>
  <ctx-drawer data-position="right"></ctx-drawer>
`

document.body.insertAdjacentHTML("beforeend", context)

export function showDrawer({ body, position }) {
  $.write({
    body,
    isOpen: true,
  }, merge(position))
}

export function hideDrawer(position) {
  $.write({
    isOpen: false
  }, merge(position))
}

export function byDrawer(position) {
  const { drawers = {} } = $.read()
  return drawers[position]|| {}
}

function merge(position) {
  return (state, payload) => ({
    ...state,
    drawers: {
      ...state.drawers,
      [position]: {
        ...state.drawers[position],
        ...payload
      }
    }
  })
}

$.on('click', '.close', (event) => {
  const { position } = event.target.dataset
  hideDrawer(position)
})

$.style(`
  @keyframes &-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  &[data-position="left"] .contents {
    left: 0;
  }

  &[data-position="right"] .contents {
    right: 0;
  }

  &[data-position="right"] .close {
    text-align: left;
  }

  &[data-position="left"] .close {
    text-align: right;
  }

  & .contents {
      animation: &-in 250ms ease-in-out forwards;
      padding: 1rem;
      position: fixed;
      top: 0;
      bottom: 0;
      background: var(--wheel-5-6);
      z-index: 900;
      overflow-y: auto;
      max-width: 100%;
      width: 600px;
  }

  & .close {
    background: none;
    border: none;
    color: var(--wheel-5-2);
    padding: none;
    opacity: .8;
    transition: opacity: 200ms;
    display: block;
    width: 100%;
    font-size: 2rem;
    line-height: 3rem;
    font-weight: 800;
    mix-blend-mode: multiply;
  }

  & .close:hover,
  & .close:focus {
    cursor: pointer;
    opacity: 1;
  }

  & .close * {
    pointer-events: none;
  }

`)

import module from '@sillonious/module'

export const types = {
  news: 'news'
}

const configs = {
  [types.news]: {
    color: 'white',
    backgroundColor: 'dodgerblue',
    label: 'plan98-modal.configs.news.label'
  }
}

const strings = {
  'plan98-modal.configs.news.label': 'New Informational'
}

const $ = module('plan98-modal', {
  label: null,
  children: null,
  isOpen: null
})

export default $

$.draw(() => {
  const {
    body,
    isOpen,
    bannerType
  } = $.learn()

  if(!isOpen) return ' '
  const modalHeader = types[bannerType] ? banner() : ''

  return `
    <button data-close>X</button>
    <div class="modal">
      ${modalHeader}
      <div class="body">
        ${body}
      </div>
    </div>
  `
})

function banner() {
  const {
    bannerType
  } = $.learn()

  const { backgroundColor, color, label } = configs[bannerType]

  return `
    <div class="banner" style="background: ${backgroundColor}; color: ${color};">
      ${strings[label]}
    </div>
  `
}

const context = `<div class="overlay"><plan98-modal></plan98-modal></div>`
document.body.insertAdjacentHTML("beforeend", context)

export function showModal(body, options) {
  document.body.classList.add('trap')
  $.teach({
    body,
    isOpen: true,
    ...options
  })
}

window.showModal = showModal

export function hideModal() {
  document.body.classList.remove('trap')
  $.teach({
    isOpen: false
  })
}
window.hideModal = hideModal

$.when('click', '[data-close]', hideModal)

$.style(`
  .trap .overlay:before {
    animation: fadein 250ms ease-in-out forwards;
    content: '';
    background: rgba(0,0,0, .5);
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    backdrop-filter: blur(10px);
    z-index: 900;
  }

  @keyframes fadein {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  & {
    position: fixed;
    display: none;
    place-items: center;
    padding: 1rem;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;
    z-index: 1100;
  }

  body.trap & {
    display: grid;
  }

  & .modal {
    animation: modal-in 250ms ease-in-out forwards;
    background: white;
    box-shadow:
      0 2px 4px rgba(0,0,0,.1),
      0 6px 8px rgba(0,0,0,.04)
    ;
    box-sizing: border-box;
    position: relative;
    min-height: 100px;
    min-width: 12ch;
    max-width: 55ch;
    width: 100%;
    z-index: -1;
    opacity: 0;
    overflow: auto;
    border-radius: 2rem;
  }

  & .banner {
    font-weight: 800;
    padding: .5rem;
    text-align: center;
  }

  @keyframes modal-in {
    0% {
      opacity: 0;
      z-index: -1;
    }

    100% {
      opacity: 1;
      z-index: 1100;
    }
  }

  & [data-close] {
    background: black;
    border: none;
    border-radius: 100%;
    color: white;
    padding: none;
    line-height: 1;
    height: 2rem;
    width: 2rem;
    opacity: .8;
    transition: opacity: 200ms;
    position: absolute;
    top: .5rem;
    right: .5rem;
  }

  & [data-close]:hover,
  & [data-close]:focus {
    cursor: pointer;
    opacity: 1;
  }

  & [data-close] * {
    pointer-events: none;
  }
`)

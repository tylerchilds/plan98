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
    bannerType,
    maximized,
    theme,
    image,
  } = $.learn()

  if(!isOpen) return ' '
  const modalHeader = types[bannerType] ? banner() : ''

  return `
    <div class="shell ${maximized ? 'maximized': ''}" style="--theme: ${theme}; --image: ${image}">
      <button data-close>Close</button>
      <div class="modal">
        <div class="body">
          ${modalHeader}
          ${body}
        </div>
      </div>
    </shell>
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
  & {
    display: none;
  }
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

  & .shell {
    position: fixed;
    background: var(--image), var(--theme, transparent);
    background-blend-mode: multiply;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    place-items: center;
    display: grid;
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

  & .maximized {
    width: 100%;
  }

  & .modal {
    animation: modal-in 250ms ease-in-out forwards;
    margin: auto;
    box-sizing: border-box;
    position: relative;
    min-height: 100px;
    height: 100%;
    min-width: 12ch;
    max-width: 55ch;
    width: 100%;
    z-index: -1;
    opacity: 0;
    overflow: auto;
  }

  & .body {
    height: 100%;
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
    border-radius: 0 0 1rem 0;
    color: white;
    padding: 0 1rem 0 .5rem;
    line-height: 1;
    height: 2rem;
    opacity: .8;
    transition: opacity: 200ms;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1101;
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

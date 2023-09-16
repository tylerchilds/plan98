import module from '../module.js'

const $ = module('plan98-modal', {
  label: null,
  children: null,
  isOpen: null
})

export default $

$.draw(() => {
  const {
    body,
    isOpen
  } = $.learn()

  if(!isOpen) return ' '

  const modalClose = `
    <button class="close">
      Close
    </button>
  `

  return `
    <div class="modal">
      ${modalClose}
      ${body}
    </div>
  `
})

const context = `<div class="overlay"><plan98-modal></plan98-modal></div>`
document.body.insertAdjacentHTML("beforeend", context)

export function showModal(body) {
  document.body.classList.add('trap')
  $.teach({
    body,
    isOpen: true,
  })
}
window.showModal = showModal

export function hideModal() {
  document.body.classList.remove('trap')
  $.teach({
    isOpen: false
  })
}
window.hideModal = showModal

$.when('click', '.close', hideModal)

$.style(`
  body.trap {
    overflow: hidden;
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
    padding: 1rem;
    min-height: 100px;
    max-width: 80ch;
    width: 100%;
    z-index: -1;
    opacity: 0;
    max-height: 80vh;
    overflow: scroll;
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

  & .close {
    background: none;
    border: none;
    padding: none;
    opacity: .8;
    transition: opacity: 200ms;
    position: absolute;
    top: 1rem;
    right: 1rem;
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

import elf from '@silly/elf'

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
  'plan98-modal.configs.news.label': 'Information Station!'
}

const $ = elf('plan98-modal', {
  label: null,
  children: null,
  isOpen: null,
  layer: 0
})

export default $

$.draw((target) => {
  const {
    body,
    isOpen,
    bannerType,
    maximized,
    centered,
    theme,
    image,
  } = $.learn()

  if(!isOpen) return ' '
  const modalHeader = types[bannerType] ? banner() : ''

  return `
    <div
      class=" shell ${maximized ? 'maximized': ''}"
      style="--theme: ${theme}; --image: ${image}">
      <div class="action-wrapper">
        <button data-close><sl-icon name="x-circle"></sl-icon></button>
      </div>
      <div class="modal">
        <div class="body ${centered ? 'centered': ''}">
          ${modalHeader}
          ${body}
        </div>
      </div>
    </shell>
  `
})

$.when('mousemove', '.body', gh057)
function gh057(event){
  const root = event.target.closest($.link)
  const box = root.getBoundingClientRect()
  const [x, y] = [event.clientX, event.clientY]
  const limit = 20;
  const calcX = -(y - box.y - (box.height / 2)) / limit;
  const calcY = (x - box.x - (box.width / 2)) / limit;

  root.style.setProperty('--rotate-x',`${calcX}deg`)
  root.style.setProperty('--rotate-y',`${calcY}deg`)
  root.style.setProperty('--shadow',`
    ${-1 * calcY - 2}px ${1 * calcX - 2}px 4px 4px rgba(0,0,0,.10),
    ${-1 * calcY - 6}px ${1 * calcX - 6}px 12px 12px rgba(0,0,0,.5),
    ${-1 * calcY - 18}px ${1 * calcX - 18}px 36px 36px rgba(0,0,0,.25)
  `)
}



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

const context = `<div class="modal-overlay"><plan98-modal></plan98-modal></div>`
document.body.insertAdjacentHTML("beforeend", context)

let hideListener = (event) => {
  if (event.key === 'Escape') {

  const { isOpen, layer, body } = $.learn()
    hideModal()
  }
}

let onHide
export function showModal(nextBody, options = {}) {
  onHide = options.onHide
  document.body.classList.add('trap-modal')
  self.addEventListener('keydown', hideListener);

  const { isOpen, layer, body } = $.learn()
  const nextLayer = layer + 1

  if(isOpen) {
    options[`layer-${nextLayer}`] = body
  }

  $.teach({
    body: nextBody,
    layer: nextLayer,
    isOpen: true,
    centered: false,
    bannerType: null,
    ...options
  })
}

window.showModal = showModal

export function hideModal() {
  if(onHide) {
    onHide()
    onHide = null
  }
  const { isOpen, layer } = $.learn()

  const nextLayer = layer - 1

  if(nextLayer < 1) {
    document.body.classList.remove('trap-modal')
    self.removeEventListener('keydown', hideListener);
    $.teach({
      isOpen: false,
      layer: 0
    })

    return
  }


  $.teach({
    body: $.learn()[`layer-${layer}`],
    layer: nextLayer
  })
}

window.hideModal = hideModal

$.when('click', '[data-close]', hideModal)

$.style(`
  & {
    display: none;
  }
  & .body {

  }
  .trap-modal .modal-overlay:before {
    animation: fadein 250ms ease-in-out forwards;
    content: '';
    background: black;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    backdrop-filter: blur(10px);
    z-index: 900;
  }

  .modal-overlay {
    z-index: 3;
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

  body.trap-modal & {
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
    width: 100%;
    z-index: 1000;
    opacity: 0;
  }

  & .body {
    height: 100%;
    display: grid;
    place-items: center;
    overflow: auto;
    display: block;
    max-width: 100%;
  }

  & .body.centered {
    place-items: center;
    place-content: initial;
  }

  & .banner {
    font-weight: 800;
    padding: .5rem;
    text-align: center;
    text-shadow: 2px 2px 2px rgba(0,0,0,.85);
    width: 100%;
  }

  @keyframes modal-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  & .action-wrapper {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: right;
    z-index: 1101;
  }
  & [data-close] {
    pointer-events: all;
    background: black;
    border: none;
    color: rgba(255,255,255,.65);
    display: inline-grid;
    place-items: center;
    height: 2rem;
    width: 2rem;
    font-size: 1rem;
    transition: color 200ms;
    border-radius: 100%;
  }

  & [data-close]:hover,
  & [data-close]:focus {
    cursor: pointer;
    color: rgba(255,255,255,1);
  }

  & [data-close] * {
    pointer-events: none;
  }
`)

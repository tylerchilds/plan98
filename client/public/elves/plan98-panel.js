import module from '@silly/tag'

export const types = {
  news: 'news'
}

const configs = {
  [types.news]: {
    color: 'white',
    backgroundColor: 'dodgerblue',
    label: 'plan98-panel.configs.news.label'
  }
}

const strings = {
  'plan98-panel.configs.news.label': 'Information Station!'
}

const $ = module('plan98-panel', {
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
  const panelHeader = types[bannerType] ? banner() : ''

  return `
    <div class="shell ${maximized ? 'maximized': ''}" style="--theme: ${theme}; --image: ${image}">
      <div class="action-wrapper">
        <button data-close><sl-icon name="x-circle"></sl-icon></button>
      </div>
      <div class="panel">
        <div class="body">
          ${panelHeader}
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

const context = `<div class="panel-overlay"><plan98-panel></plan98-panel></div>`
document.body.insertAdjacentHTML("beforeend", context)

let hideListener = (event) => {
  if (event.key === 'Escape') {
    hidePanel()
  }
}

export function showPanel(body, options) {
  document.body.classList.add('trap-panel')
  self.addEventListener('keydown', hideListener);
  $.teach({
    body,
    isOpen: true,
    ...options
  })
}

window.showPanel = showPanel

export function hidePanel() {
  document.body.classList.remove('trap-panel')
  self.removeEventListener('keydown', hideListener);
  $.teach({
    isOpen: false
  })
}
window.hidePanel = hidePanel

$.when('click', '[data-close]', hidePanel)

$.style(`
  & {
    display: none;
    pointer-events: none;
  }

  @keyframes &-fadein {
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

  body.trap-panel & {
    display: grid;
  }

  & .maximized {
    width: 100%;
  }

  & .panel {
    margin: auto;
    box-sizing: border-box;
    position: relative;
    min-height: 100px;
    height: 100%;
    width: 320px;
    max-width: 100%;
    width: 100%;
  }

  & .body {
    height: 100%;
    max-width: 320px;
    background: white;
    padding: 2rem 0 .5rem;
    position: absolute;
    right: 0;
    pointer-events: all;
    width: 100%;
    overflow: auto;
  }
}
  }

  & .banner {
    font-weight: 800;
    padding: .5rem;
    text-align: center;
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
    background: transparent;
    border: none;
    opacity: .65;
    padding: 9px;
    height: 2rem;
    font-size: 1rem;
    transition: color 200ms;
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

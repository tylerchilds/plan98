import module from '@sillonious/module'

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
  'plan98-panel.configs.news.label': 'New Informational'
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
      <button data-close>Close</button>
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

export function showPanel(body, options) {
  document.body.classList.add('trap-panel')
  $.teach({
    body,
    isOpen: true,
    ...options
  })
}

window.showPanel = showPanel

export function hidePanel() {
  document.body.classList.remove('trap-panel')
  $.teach({
    isOpen: false
  })
}
window.hidePanel = hidePanel

$.when('click', '[data-close]', hidePanel)

$.style(`
  & {
    display: none;
  }
  .trap .panel-overlay:before {
    animation: &-fadein 250ms ease-in-out forwards;
    content: '';
    background: linear-gradient(rgba(0,0,0, .5), transparent);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(10px);
    z-index: 900;
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
    animation: &-in 250ms ease-in-out forwards;
    margin: auto;
    box-sizing: border-box;
    position: relative;
    min-height: 100px;
    height: 100%;
    width: 320px;
    max-width: 100%;
    width: 100%;
    z-index: -1;
    opacity: 0;
    overflow: auto;
  }

  & .body {
    height: 100%;
    max-width: 320px;
    background: lemonchiffon;
    padding-top: 2rem;
    box-shadow:
      2px 2px 4px 4px rgba(0,0,0,.10),
      6px 6px 12px 12px rgba(0,0,0,.5),
      18px 18px 36px 36px rgba(0,0,0,.25);
  }
}
  }

  & .banner {
    font-weight: 800;
    padding: .5rem;
    text-align: center;
  }

  @keyframes &-in {
    0% {
      opacity: 0;
      z-index: -1;
      transform: translateX(-1rem);
    }

    100% {
      opacity: 1;
      z-index: 1100;
      transform: translateX(0);
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

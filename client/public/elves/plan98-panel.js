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
    <div class="shell ${maximized ? 'maximized': ''}">
      <div class="panel">
        <div class="body">
          <div class="action-wrapper">
            <button data-close class="standard-button bias-generic -small -round" type="reset">
              <sl-icon name="x-lg"></sl-icon>
            </button>
          </div>
          ${panelHeader}
          ${body}
        </div>
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


$.when('click', '.panel', () => {
  hidePanel()
})

$.when('click', '[data-close]', hidePanel)

$.style(`
  & {
    display: none;
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
    max-width: 100%;
    width: 100%;
    z-index: 900;
  }

  & .panel:before {
    animation: fadein 250ms ease-in-out forwards;
    content: '';
    background: rgba(255,255,255,.5);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    backdrop-filter: blur(10px);
    z-index: 2;
  }



  & .body {
    height: 100%;
    max-width: 320px;
    background: white;
    padding: 4px;
    position: absolute;
    right: 0;
    pointer-events: all;
    width: 100%;
    overflow: auto;
    z-index: 3;
    box-shadow:
      -6px 0 6px 6px rgba(0,0,0,.05),
      -3px 0 3px 3px rgba(0,0,0,.10),
      -1px 0 1px 1px rgba(0,0,0,.15);

  }

  & .banner {
    font-weight: 800;
    padding: .5rem;
    text-align: center;
  }

  & .action-wrapper {
    pointer-events: none;
    text-align: right;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  & [data-close] * {
    pointer-events: none;
  }
`)

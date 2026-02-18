import { Self } from '@plan98/types'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
const $ = Self('og-synthia', { synthia: {} })


$.draw((target) => {
  const { activated, operation } = $.learn()
  target.dataset.activated = activated
  return ai(operation)
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      const operation = target.getAttribute('operation')
      $.teach({ operation })
    }
  },
  afterUpdate(target) {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'plan98-icon')
      recoverElves(target, 'agentic-dash')
    }

    afterUpdateTheme(null, target)
  }
})

$.when('click', 'paper-pocket [data-search]', (event) => {
  const { selectedText, synthia } = $.learn()
  const search = escapeHyperText(synthia.prompt || selectedText || '')
  const config = getSearchEngineConfig()

  if(config.url) {
    window.location.href = config.url + search
  }
})

$.when('click', '.synthia', (event) => {
  $.teach({ activated: !$.learn().activated })
})

$.when('click', '.escape', (event) => {
  $.teach({ activated: false })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
})

$.style(`
  & {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 900000;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & paper-pocket {
    pointer-events: all;
  }

  & .result {
    pointer-events: all;
    position: relative;
    z-index: 900000;
    transform: translateY(100%);
    transition: transform 100ms ease-in-out;
    padding: .5rem .5rem 0;
    overflow: hidden;
  }

  & .result-card {
    box-shadow: var(--shadow);
    background: rgba(255,255,255,1);
    height: 100%;
    border-radius: .5rem .5rem 0 0;
    position: relative;
    overflow: auto;
  }

  & paper-pocket {
    overflow: auto;
    background: rgba(0,0,0,.1);
  }

  &[data-activated="true"] .result {
    transform: translateY(0);
  }

  & .activator-bar {
    position: relative;
    z-index: 900000;
    pointer-events: all;
    padding: 2px;
    justify-content: end;
    display: grid;
    grid-template-columns: auto 1fr auto;
  }

  & .synthia {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 100%;
    overflow: hidden;
    box-shadow: 0 0 10px 0px var(--root-theme);
    animation: &-fade-in 500ms ease-out forwards;
  }

  @keyframes &-fade-in {
    0% {
      transform: scale(0);
      opacity: 0;
      filter: grayScale(1) blur(10px);
    }
    100% {
      transform: scale(1);
      opacity: 1;
      filter: grayScale(0) blur(0);
    }
  }


  & .search-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: .5rem;
    background: rgba(255,255,255,.5);
    gap: .5rem;
    position: sticky;
    top: 0;
    box-shadow: 0 1px 1px 1px rgba(0,0,0,.15);
    z-index: 10;
  }

  & .share-actions {
    display: flex;
    padding: .5rem;
    gap: .5rem;
    flex-wrap: wrap;
    background: rgba(0,0,0,.1);
  }
`)

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.when('json-rpc', 'paper-pocket', (event) => {
  const { method, params } = event.detail
  if(method === 'updated') {
    $.teach({ systemUpdated: new Date().toJSON() })
  }
})

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    name: event.target.name,
    value: event.target.value
  }, (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  })
})

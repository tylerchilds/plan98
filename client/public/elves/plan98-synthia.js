import elf from '@plan98/elf'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
const $ = elf('plan98-synthia', { synthia: {} })

export function launch() {
  $.teach({ visible: true, activated: true })
}

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText || selectedText.length < 2) {
    //$.teach({ selectedText: null })
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  $.teach({ synthia: { prompt: selectedText }, visible: !!selectedText, rect: { ...rect } })
});

document.addEventListener('pointerdown', function(event) {
  const { rect, activated, visible } = $.learn()
  if(!activated && !visible) return
  if (!event.target.closest('plan98-synthia .synthia, plan98-synthia .result')) {
    $.teach({ visible: false, activated: false, synthia: {} })
  }
});

const context = document.createElement('plan98-synthia')
document.body.appendChild(context)

$.draw(() => {
  const { rect, visible, activated, synthia } = $.learn()
  const operation = escapeHyperText(synthia.prompt || '')
  return visible ? `
    <div class="activator-bar">
      <button class="synthia">
        <plan98-icon></plan98-icon>
      </button>
    </div>
    ${activated ? `
      <div class="result activated">
        <div class="result-card">
          ${ai(operation)}
        </div>
      </div>
    ` : `
      <div class="result">
        <div class="result-card">
          ${ai(operation)}
        </div>
      </div>
    `}
  `: '<div></div>'
}, {
  afterUpdate(target) {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'plan98-icon')
    }

    afterUpdateTheme(null, target)
  }
})

$.when('click', 'paper-pocket [data-search]', (event) => {
  const { selectedText, synthia } = $.learn()
  const search = escapeHyperText(synthia.prompt || selectedText || '')
  const config = getSearchEngineConfig()

  if(config.url) {
    self.open(config.url + search, '_blank')
  }
})

$.when('click', '.synthia', (event) => {
  $.teach({ activated: !$.learn().activated })
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

  & .result.activated {
    transform: translateY(0);
  }

  & .activator-bar {
    position: relative;
    z-index: 900000;
    display: flex;
    place-content: center;
    pointer-events: all;
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,0));
  }

  & .synthia {
    border: none;
    padding: 0;
    background: transparent;
  }

  & .search-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: .5rem;
    background: white;
    gap: .5rem;
    position: sticky;
    top: 0;
    box-shadow: 0 1px 1px 1px rgba(0,0,0,.15);
    z-index: 10;
  }

  & .search-input {
    width: 100%;
    padding: .25rem .5rem;
    border-radius: .5rem;
    border: 1px solid rgba(0,0,0,.15);
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


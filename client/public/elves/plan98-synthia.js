import elf from '@plan98/elf'
import { showModal, isVisible, hideModal } from './plan98-modal.js'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
import { Ollama } from 'ollama/browser'
const $ = elf('plan98-synthia', { synthia: {} })

const host = plan98.env.OLLAMA_HOST || 'http://localhost:11434'
export const ollama = new Ollama({
  host,
})

export function getModels() {
  return ollama.list().then(data => {
    const models = {}

    for(const x of data.models) {
      models[x.name] = x.model
    }

    return models
  })
}

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

  try {
    $.teach({ synthia: { prompt: selectedText }, visible: !!selectedText })
  } catch(e) {
    console.warn(e)
  }
});

document.addEventListener('pointerdown', function(event) {
  const { activated, visible } = $.learn()
  if(!activated && !visible) return
  if (!event.target.closest('plan98-synthia .synthia, plan98-synthia .result')) {
    $.teach({ visible: false, activated: false, synthia: {} })
  }
});

document.addEventListener('pointerup', function(event) {
  const { selectedText, activated, visible } = $.learn()
  if(activated && selectedText && selectedText.length > 2) {
    $.teach({ activated: true })
  }
});



const context = document.createElement('plan98-synthia')
document.body.appendChild(context)

$.draw((target) => {
  const { visible, activated, synthia } = $.learn()
  const operation = escapeHyperText(synthia.prompt || '')
  if(!visible) {
    target.innerHTML = null
    return
  }
  target.dataset.activated = activated
  return `
    <div class="activator-bar">
      <button class="synthia">
        <plan98-icon style="height: 35px; width: 35px;"></plan98-icon>
      </button>
    </div>
    <div class="result">
      <div class="result-card">
        ${ai(operation)}
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'plan98-icon')
      recoverElves(target, 'agentic-nonsense')
    }

    afterUpdateTheme(null, target)
  }
})

$.when('click', 'paper-pocket [data-search]', (event) => {
  const { selectedText, synthia } = $.learn()
  const search = escapeHyperText(synthia.prompt || selectedText || '')
  const config = getSearchEngineConfig()

  if(config.url) {
    self.open(config.url + search)
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

  &[data-activated="true"] .result {
    transform: translateY(0);
  }

  & .activator-bar {
    position: relative;
    z-index: 900000;
    display: flex;
    pointer-events: all;
    padding: 2px;
    justify-content: end;
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

let isRoot = false
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    if(isRoot) return

    if(!isVisible()) {
      isRoot = true
      showModal(`
        <div style="width: 100%; height: 100%; overflow: hidden;">
          <source-code></source-code>
        </div>
      `, { centered: true, onHide: normalMode, blockExit: false })
    } else {
      isRoot = false
      hideModal()
    }
  }

  function normalMode() {
    isRoot = false
  }
});

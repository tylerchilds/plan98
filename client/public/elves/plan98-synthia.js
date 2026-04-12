import elf from '@silly/elf'
import { showModal, isVisible, hideModal } from './plan98-modal.js'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
const $ = elf('plan98-synthia', { synthia: {} })
import './og-synthia.js'

export const users = {
  bengo: {
    bios: 'https://plan98.org/app/quick-blog?src=https://www.bengo.is/outbox/'
  },
  tychi: {
    bios: '/app/time-machine'
  }
}

export function launch() {
  $.teach({ visible: true, activated: true })
}

document.addEventListener('pointerup', function(event) {
  // Skip if clicking on the synthia UI itself
  if (event.target.closest('plan98-synthia')) {
    return;
  }

  // Small delay to let selection finalize
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && selectedText.length > 2) {
      $.teach({ synthia: { prompt: selectedText }, visible: true, activated: false })
    } else {
      // Clear when clicking without selecting text
      $.teach({ visible: false, activated: false, synthia: {} })
    }
  }, 10);
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
  if(target.innerHTML) return
  return `
    <div class="activator-bar">
      <button class="standard-button -smol bias-generic -round escape">
        ESC
      </button>
      <div class="tabs" style="pointer-events: none;">
      </div>
      <button class="synthia">
        <plan98-icon style="height: 35px; width: 35px;"></plan98-icon>
      </button>
    </div>
    <div class="result">
      <div class="result-card" class="sandbox">
      </div>
    </div>
  `
}, {
  afterUpdate(target) {
    { // recover icons from the virtual dom
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'plan98-icon')
      recoverElves(target, 'agentic-dash')
    }

    afterUpdateTheme(null, target)

    {
      const { synthia } = $.learn()
      const sandbox = target.querySelector('.sandbox')
      if(sandbox && synthia.prompt !== target.prompt) {
        target.prompt = synthia.prompt
        const operation = escapeHyperText(synthia.prompt || '')
        sandbox.innerHTML = `<iframe src="/app/og-synthia?operation=${operation}"></iframe>`
      }
    }
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
    pointer-events: none;
    z-index: 900000;
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
    pointer-events: all;
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

  & .sandbox {
    height: 100%;
    overflow: hidden;
    border-radius: 1rem 1rem 0 0;
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

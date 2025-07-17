import elf from '@plan98/elf'
import { showModal, isVisible, hideModal } from './plan98-modal.js'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
import { Ollama } from 'ollama/browser'
const $ = elf('plan98-synthia', { synthia: {} })
import { update } from './ur-shell.js'

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

export const agenticFormatPlaceholder = {
  "type": "object",
  "properties": {
    "age": {
      "type": "integer"
    },
    "available": {
      "type": "boolean"
    }
  },
  "required": [
    "age",
    "available"
  ]
}

export const agenticOptionsPlaceholder = {
  "num_keep": 5,
  "seed": 42,
  "num_predict": 100,
  "top_k": 20,
  "top_p": 0.9,
  "min_p": 0.0,
  "typical_p": 0.7,
  "repeat_last_n": 33,
  "temperature": 0.8,
  "repeat_penalty": 1.2,
  "presence_penalty": 1.5,
  "frequency_penalty": 1.0,
  "penalize_newline": true,
  "stop": ["<br>", "user:"],
  "numa": false,
  "num_ctx": 1024,
  "num_batch": 2,
  "num_gpu": 1,
  "main_gpu": 0,
  "use_mmap": true,
  "num_thread": 8
}

export const agenticToolsPlaceholder = [
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform basic mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate (e.g., \"2 + 2\", \"15 * 23\")"
          }
        },
        required: ["expression"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and time",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather information for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state/country"
          }
        },
        required: ["location"]
      }
    }
  }
]

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
  if (!event.target.closest('plan98-synthia .synthia, plan98-synthia .result, plan98-synthia .standard-button')) {
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
      <button class="standard-button -smol bias-generic -round escape">
        ESC
      </button>
      <div class="tabs">
      </div>
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

let isRoot = false

function normalMode() {
  isRoot = false
}


self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'synthia-escape') {
    handleEscapePropagation()
  } else { console.log(event) }
});


window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleEscapePropagation()
  }
});

function handleEscapePropagation() {
  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'synthia-escape' }, "*");
    return
  }

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

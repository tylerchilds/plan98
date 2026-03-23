/*

Private AI

A way to phone home

Using the @silly/elf as MVCES

m -- Model (data)
v -- View (structure)
c -- Controller (reconcilliation)
e -- Event (interactivity)
s -- Skin (presentation)

all human computer interactions can be expressed with these five letters to maintain mental self-soveriegnty amid context collapse in the torment nexus

*/


import { default as MVCES } from '@silly/elf'
import Cache from '@silly/cache'

const elf = 'private-ai'
const cache = Cache(elf)

const { m, v, c, e, s } = MVCES(elf, {
  ready: false,
  draft: '',
  error: '',
  url: '',
  key: '',
  models: []
})

;(function main() {
  cache.get('creds').then(record => {
    if(!record || !record.data) return

    const patchObject = {}

    const { url, key } = record.data

    if(url) {
      patchObject.url = url
    }

    if(key) {
      patchObject.key = key
    }

    c(patchObject)
  })
})()

v(() => {
  const {
    models,
    modelId,
    url,
    key,
    ready,
    error,
    draft
  } = m()

  if(!ready) {
    return `
      <form name="connect" class="wizard">
        ${error && (`<div class="error">${error}</div>`)}
        <div>
          <label class="field">
            <span class="label">url</span>
            <input data-store="creds" name="url" value="${escapeHyperText(url) || ''}" />
          </label>
          <small>The https:// thing for where the actual model lives in the tubes</small>
        </div>
        <div>
          <label class="field">
            <span class="label">key</span>
            <input data-store="creds" name="key" value="${escapeHyperText(key) || ''}" />
          </label>
          <small>Your super secret password that you shouldn't paste here until you compile this app from scratch</small>
        </div>
        <div class="ready-area">
          <button type="submit" class="standard-button">
            Ready
          </button>
        </div>
      </form>
    `
  }

  const list = models.map((model) => {
    return `
      <option value="${model.id}" ${modelId === model.id ? 'selected="true"':''}>
        ${model.name}
      </option>
    `
  })


  return `
    <form name="chat">
      <label class="field model-picker">
        <span class="label">model</span>
        <select class="models">
          ${list}
        </select>
      </label>
      <div class="feed">
        <div class="input">
          <textarea class="standard-input" placeholder="Type something and send it to a digital robot">${escapeHyperText(draft)}</textarea>
        </div>
        <div class="ready-area">
          <button disabledtype="submit" class="standard-button">
            Send
          </button>
        </div>
      </div>
    </form>
  `
}, {
  beforeUpdate(target) {

  },
  afterUpdate(target) {

  }
})

async function load() {
  const { url, key } = m()

  if(!url || !key) {
    console.error('missing key or url', { url, key })
  }

  const response = await fetch(url + '/api/models', {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${key}`,   // Bearer token for authentication
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const models = await response.json();
  c({ models: models.data })
}

e('submit', 'form', event => {
  event.preventDefault()
  const { url, key } = m()

  if(url && key) {
    c({ ready: true })
    load().catch(console.error);
  } else {
    c({ error: 'Configuration misconfigurated. Try again more better.' })
  }
})

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

e('input', '[data-store]', (event) => {
  const { store } = event.target.dataset

  const name = event.target.name
  const value = event.target.value

  c({
    name,
    value
  }, namespace(store))

  cache.put('creds', m().creds)
})

function namespace(namespace) {
  return (state, payload) => {
    return {
      ...state,
      [payload.name]: payload.value,
      [namespace]: {
        ...state[namespace],
        [payload.name]: payload.value
      }
    }
  }
}


s(`
  & {
    display: block;
    height: 100%;
    overflow: auto;
  }

  & .error {
    color: firebrick;
  }

  & .field + small {
    display: block;
    transform: translateY(-1rem);
    padding: 0 1rem;
  }

  & .ready-area {
    text-align: right;
  }

  & .input {
    margin: 1rem 0;
    padding: 0 .5rem;

  }

  & .model-picker {
    max-width: 240px;
  }

  & .feed {
    max-width: 768px;
    margin: 0 auto;
  }
`)

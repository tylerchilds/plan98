import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import { showModal } from './plan98-modal.js'
import elf, { subscribe } from '@silly/elf'

const bios = {
  'bluesky': '/app/blue-sky',
  'desktop': '/app/door-man',
  'mobile': '/app/mobile-device',
  'remote': '/app/remote-control',
  'gaming': '/app/couch-coop',
  'music': '/app/paper-pocket?headless=true',
  'shell': '/app/ur-shell',
  'journal': '/app/time-machine',
  'boxart': '/app/plan98-boxart',
}

const defaultState = {
  keycards: []
}

const link = 'was-wallet'

const initialState = localStorage.getItem(link)
  ? JSON.parse(localStorage.getItem(link))
  : defaultState

const $ = elf(link, initialState)

const methods = {
  importKeycard: 'import-keycard'
}

const methodHandlers = {
  [methods.importKeycard]: (payload) => {
    const { keycard } = payload.params
    if(keycard) {
      $.teach({ id: keycard.id, ...keycard }, insertKeycard)
    }
  }
}

function insertKeycard(state, payload) {
  if(state.keycards.find(x => x.id === payload.id)) {
    return pasteToKeycard(state, payload)
  } else {
    return unshiftKeycard(state, payload)
  }
}

subscribe((link) => {
  if(link === $.link) {
    localStorage.setItem(`${$.link}`, JSON.stringify($.learn()))
  }
})

export async function getSigner() {
  const { keycards } = $.learn()

  if(keycards.length === 0) {
    return null
  }
  return await Ed25519Signer.fromJSON(JSON.stringify(keycards[0].asJSON))
}

async function newKeycard() {
  const id = self.crypto.randomUUID()
  const signer = await Ed25519Signer.generate({ id })
  return {
    id,
    src: '/app/blue-sky',
    name: 'Keycard',
    asJSON: signer.toJSON(),
    at: new Date().toJSON()
  }
}

$.draw((target) => {
  const { editId, keycards } = $.learn()

  const [active, ...row] = keycards
  return editId ? `
     <header style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <button data-cancel>
          Cancel
        </button>
      </div>
      <div style="text-align: right;">
        <button data-save="${editId}">
          Save
        </button>
      </div>
    </header>
    <div class="keycard-form">
      ${editId}
      <label class="field">
        <span class="label">name</span>
        <input data-bind=${editId} name="name" value="${escapeHyperText(active.name) || ''}" />
      </label>
      <label class="field">
        <span class="label">app</span>
        <select data-bind="${editId}" name="src">
          <option disabled>--Select--</option>
          ${Object.keys(bios).map((x) => `
            <option value="${bios[x]}" ${bios[x] === active.src?'selected':''}>
              ${x}
            </button>
          `).join('')}
        </select>
      </label>
    </div>
    <footer style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        Powered by <a href="https://plan98.org">Plan98</a>
      </div>
      <div style="text-align: right;">
        <button data-remix>
          Remix
        </button>
      </div>
    </footer>
  ` : `
    <header style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        Wallet
      </div>
      <div style="text-align: right;">
        <button data-create>
          New Keycard
        </button>
      </div>
    </header>
    <section class="wallet">
      <div class="lightbox">
        ${active?`
          <div class="active-keycard">
            ${render(active)}
            <div class="keycard-actions">
              <button data-launch="${active.id}">
                Launch
              </button>
              <button data-export="${active.id}">
                Export
              </button>
              <button data-edit="${active.id}">
                Edit
              </button>
              <button data-delete="${active.id}">
                Delete
              </button>
            </div>
          </div>
        `:''}
      </div>
      <div class="keyring">
        ${row.map(render).join('')}
      </div>
    </section>
    <footer style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        Powered by <a href="https://plan98.org">Plan98</a>
      </div>
      <div style="text-align: right;">
        <button data-remix>
          Remix
        </button>
      </div>
    </footer>
  `
}, {
  beforeUpdate(target) {
    if(!target.initialized) {
      target.initialized = true
      const data = target.getAttribute('data')
      if(data) {
        const payload = JSON.parse(atob(data))
        jsonRPC(payload)
      }
    }
  }
})

function jsonRPC(payload) {
  const handler = methodHandlers[payload.method]
  if(handler) {
    handler(payload)
  }
}

function render(keycard) {
  const { activeKeycardId } = $.learn()
  return `
    <button data-select="${keycard.id}" class="keycard ${activeKeycardId === keycard.id?'active':''}">
      <span class="keycard-name">
        ${keycard.name}
      </span>
      <span class="keycard-id">${keycard.id.split('-').join('<br>')}</span>
      <span class="keycard-src">
        ${keycard.src}
      </span>
    </button>
  `
}

$.when('click', '[data-create]', async (event) => {
  const keycard = await newKeycard().catch(console.error)
  $.teach(keycard, unshiftKeycard)
  $.teach({ activeKeycardId: keycard.id })
})

function unshiftKeycard(state, payload) {
  return {
    ...state,
    keycards: [payload, ...state.keycards]
  }
}

$.when('click', '[data-select]', (event) => {
  const id = event.target.dataset.select
  $.teach({ activeKeycardId: id })
  $.teach(id, prioritizeKeycardById)
})

function prioritizeKeycardById(state, payload) {
  const keycard = state.keycards.find(x => x.id === payload)
  return {
    ...state,
    keycards: [keycard, ...state.keycards.filter(x => x.id !== payload)]
  }
}


$.when('click', '[data-launch]', (event) => {
  const id = event.target.dataset.launch
  const keycard = $.learn().keycards.find(x => x.id === id)

  if(keycard) {
    self.location.href = keycard.src
  }
})

$.when('click', '[data-export]', (event) => {
  const { keycards } = $.learn()
  const id = event.target.dataset.export
  const keycard = keycards.find(x => x.id === id)
  if(keycard) {
    const encoded = btoa(
      JSON.stringify({
        jsonrpc: "2.0",
        method: methods.importKeycard,
        params: { type: 'keycard', keycard }
      })
    )

    showModal(`
      <div style="background: white; height: 100%; width: 100%; overflow: hidden;">
        <div style="padding: 51px; height: 100%; display: flex;">
          <qr-code src="${window.location.origin}/app/was-wallet?data=${encoded}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
        </div>
      </div>
    `, {
      blockExit: false
    })
  }
})

$.when('click', '[data-remix]', (event) => {
  showModal(`
    <div style="background: white; height: 100%; width: 100%; overflow: hidden;">
      <code-module src="/public/elves/was-wallet.js"></code-module>
    </div>
  `, {
    blockExit: false
  })
})

$.when('click', '[data-edit]', (event) => {
  const id = event.target.dataset.edit
  $.teach({ editId: id })
})

$.when('click', '[data-cancel]', (event) => {
  $.teach({ editId: null })
})

$.when('click', '[data-save]', (event) => {
  const id = event.target.dataset.save
  $.teach({ editId: null })
  const claim = $.learn()[id]
  $.teach({ id, ...claim }, pasteToKeycard)
})

function pasteToKeycard(state, payload) {
  return {
    ...state,
    keycards: state.keycards.map(x => {
      if(x.id !== payload.id) {
        return x
      }

      return {
        ...x,
        ...payload
      }
    })
  }
}

$.when('click', '[data-delete]', (event) => {
  const id = event.target.dataset.delete
  $.teach(id, deleteKeycardById)
})

function deleteKeycardById(state, payload) {
  return {
    ...state,
    keycards: [...state.keycards.filter(x => x.id !== payload)]
  }
}


$.style(`
  & {
    display: grid;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    background: black;
  }

  & header {
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.85);
    padding: .5rem;
  }

  & footer {
    background: rgba(255,255,255,.85);
    padding: .5rem;
  }

  & .active-keycard {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 1rem;
  }

  & .lightbox {
    padding: 3rem;
    display: grid;
    grid-template-rows: 1fr auto;
    background: black;
    place-content: center;
  }

  & .wallet {
    overflow: auto;
  }

  & .keycard-form {
    overflow: auto;
    background: white;
    padding: .5rem;
  }

  & .keyring {
    padding: .5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: .5rem;
    overflow: auto;
    place-items: center;
  }

  & .keycard {
    aspect-ratio: 1.66/1;
    width: 100%;
    max-width: 280px;
    opacity: .65;
    display: grid;
    place-content: end start;
    padding: .5rem;
    text-align: left;
    border: 2px solid rgba(255,255,255,.25);
    background: black;
    color: rgba(255,255,255,.85);
    word-break: break-all;
  }

  & .keycard:hover,
  & .keycard:focus,
  & .keycard.active {
    border: 2px solid rgba(255,255,255,.65);
    opacity: 1;
  }
`)

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

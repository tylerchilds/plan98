import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import elf from '@plan98/elf'

const $ = elf('was-wallet', {
  keys: []
})

async function newKey() {
  const id = self.crypto.randomUUID()
  const signer = await Ed25519Signer.generate({ id })
  return {
    id,
    name: 'Keyname',
    asJSON: signer.toJSON()
  }
}

$.draw((target) => {
  const { keys } = $.learn()
  return `
    <header>
      Wallet

      <button data-create>
        New Key
      </button>
    </header>
    <section class="wallet">
      ${keys.map(render).join('')}
    </section>
    <footer>
      Powered by <a href="https://plan98.org">Plan98</a>
    </footer>
  `
})

function render(key) {
  const { activeKeyId } = $.learn()
  return `
    <button data-select="${key.id}" class="key ${activeKeyId === key.id?'active':''}">
      ${key.name}
      <span class="key-id">${key.id}</span>
    </button>
  `
}

$.when('click', '[data-create]', async (event) => {
  const key = await newKey().catch(console.error)
  $.teach(key, unshiftKey)
  $.teach({ activeKeyId: key.id })
})

function unshiftKey(state, payload) {
  return {
    ...state,
    keys: [payload, ...state.keys]
  }
}

$.when('click', '[data-select]', (event) => {
  const id = event.target.dataset.select
  $.teach({ activeKeyId: id })
  $.teach(id, prioritizeKeyById)
})

function prioritizeKeyById(state, payload) {
  const key = state.keys.find(x => x.id === payload)
  return {
    ...state,
    keys: [key, ...state.keys.filter(x => x.id !== payload)]
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
  }

  & header {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    padding: .5rem;
  }

  & footer {
    background: rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .wallet {
    padding: .5rem;
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
    overflow: auto;
    align-items:flex-start;
    align-content:flex-start;
  }

  & .key {
    aspect-ratio: 1.66/1;
    width: 100%;
    max-width: 280px;
    opacity: .65;
  }

  & .key.active {
    opacity: 1;
  }
`)

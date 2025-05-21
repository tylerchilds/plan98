import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import elf from '@plan98/elf'

const storageId = 'http://localhost:8080'
const storageUrl = new URL(storageId)
const storage = new StorageClient(storageUrl)

// This signer can create cryptographic signatures
const signer = await Ed25519Signer.generate()

// create the space with signer so all requests get signed by it
const space = storage.space({ signer })

async function main() {
  const spaceObject = {
    controller: signer.controller,
  }
  const spaceObjectBlob = new Blob(
    [JSON.stringify(spaceObject)],
    {type:'application/json'},
  )

  // send PUT request to update the space
  const responseToPutSpace = await space.put(spaceObjectBlob)
  console.debug({ responseToPutSpace })

  const responseToGetSpace = await space.get()
  console.debug({ responseToGetSpace })

  const index = space.resource('/hahahla/aalkslj')
  const blobForIndex = new Blob(['<!doctype html><h1>The Index5</h1>'], { type: 'text/html' })
  const responseToPutIndex = await index.put(blobForIndex, { signer })
  const indexUrl = new URL(index.path, storageUrl)
  $.teach({ home: indexUrl.toString() })
}

main()

const $ = elf('my-wallet', { cards: [], home: '' })

$.draw((target) => {
  const { cards, home } = $.learn()
  return cards.length > 0 ? `
    ${cards.map(renderCard).join('')}
    <button data-link>
      Link Card
    </button>
    <iframe src="${home}"></iframe>
  ` : `
    <button data-link>
      Link Card
    </button>
    <iframe src="${home}"></iframe>
  `
})

function renderCard(data) {
  const { did, nick } = data.card
  return `
    <button data-did="${did}">
      ${nick}
    </button>
  `
}

$.when('click', '[data-link]', (event) => {
  const wallet = event.target.closest($.link)
  wallet.dispatchEvent(new CustomEvent('json-rpc', {
    detail: {
      jsonrpc: "2.0",
      method: 'updated',
      params: {
        cards: $.learn().cards
      }
    }
  }))

  $.teach({
    type: 'card',
    card: { did: self.crypto.randomUUID(), nick: 'Card Name' }
  }, linkCard)
})

function linkCard(state, payload) {
  return {
    ...state,
    cards: [...state.cards, payload]
  }
}


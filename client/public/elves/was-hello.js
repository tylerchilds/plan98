import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import elf from '@silly/elf'
import { toast } from './plan98-toast.js'

const credentials = localStorage.getItem('was/signer')

let signer
if(credentials) {
  signer = await Ed25519Signer.fromJSON(credentials)
} else {
  // This signer can create cryptographic signatures
  signer = await Ed25519Signer.generate()
  localStorage.setItem('was/signer', JSON.stringify(signer.toJSON()))
}

async function publish(spaceId) {
  const { host } = $.learn()
  const storageId = host
  const storageUrl = new URL(storageId)
  const storage = new StorageClient(storageUrl)

  // create the space with signer so all requests get signed by it
  const space = storage.space({
    signer,
    id: `urn:uuid:${spaceId}`
  })


  const spaceObject = {
    controller: signer.controller,

  }
  const spaceObjectBlob = new Blob(
    [JSON.stringify(spaceObject)],
    {type:'application/json'},
  )

  // send PUT request to update the space
  const responseToPutSpace = await space.put(spaceObjectBlob)
    .then(res => {
      console.debug({ res })
      toast(JSON.stringify(res), { type: 'success' })
      return res
    })
    .catch(e => {
      console.debug(e)
      toast(e.message, { type: 'error' })
    })

  if(!responseToPutSpace) return

  const responseToGetSpace = await space.get()
    .then(res => {
      console.debug({ res })
      toast(JSON.stringify(res), { type: 'success' })
      return res
    })
    .catch(e => {
      console.debug(e)
      toast(e.message, { type: 'error' })
    })

  if(!responseToGetSpace) return

  const index = space.resource('/hello/world')
  const blobForIndex = new Blob(['<!doctype html><h1>Hello WAS!</h1>'], { type: 'text/html' })
  const responseToPutIndex = await index.put(blobForIndex, { signer })
    .then(res => {
      console.debug({ res })
      toast(JSON.stringify(res), { type: 'success' })
      return res
    })
    .catch(e => {
      console.debug(e)
      toast(e.message, { type: 'error' })
    })

  if(!responseToPutIndex) return

  const indexUrl = new URL(index.path, storageUrl)
  $.teach({ home: indexUrl.toString() })
}


const $ = elf('was-hello', {
  host: plan98.env.PLAN98_WAS_HOST,
  home: ''
})

$.draw((target) => {
  const { host, home } = $.learn()
  return home ? `
    <iframe src="${home}"></iframe>
  ` : `
    <form action="test-publish" method="post">
      <label class="field">
        <span class="label">Host</span>
        <input data-bind name="host" value="${escapeHyperText(host)}"/>
      </label>
      <button class="standard-button" type="submit">
        Publish
      </button>
    </form>
  `
})

$.when('submit', '[action="test-publish"]', async (event) => {
  event.preventDefault()
  publish(event.target.closest($.link).id)
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.style(`
  & {
    display: grid;
    height: 100%;
    width: 100%;
    place-items: center;
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`)

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

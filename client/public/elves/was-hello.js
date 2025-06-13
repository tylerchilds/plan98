import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import elf from '@silly/elf'
import { toast } from './plan98-toast.js'

const $ = elf('was-hello', {
  loading: true,
  host: plan98.env.PLAN98_WAS_HOST,
  home: ''
})

let signer
async function init(target) {
  if(target.initialized) return
  target.initialized = true

  const { host } = $.learn()
  const credentials = localStorage.getItem('was/signer')

  if(credentials) {
    signer = await Ed25519Signer.fromJSON(credentials)
  } else {
    // This signer can create cryptographic signatures
    signer = await Ed25519Signer.generate()
    localStorage.setItem('was/signer', JSON.stringify(signer.toJSON()))
  }
  const storageId = host
  const storageUrl = new URL(storageId)
  const storage = new StorageClient(storageUrl)

  // create the space with signer so all requests get signed by it
  const space = storage.space({
    signer,
    id: `urn:uuid:${target.id}`
  })

  const resource = space.resource(target.getAttribute('src') || '/tmp')
  const response = await resource.get()
    .then(res => {
      if(res.status === 200) {
        const indexUrl = new URL(resource.path, storageUrl)
        $.teach({ home: indexUrl.toString() })
      }
      return res
    })
    .catch(e => {
      console.debug(e)
      toast(e.message, { type: 'error' })
    })

  $.teach({ loading: false })
}

async function publish(spaceId, src) {
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

  const resource = space.resource(src)
  const blobForIndex = new Blob(['<!doctype html><h1>Hello WAS!</h1>'], { type: 'text/html' })
  const responseToPutIndex = await resource.put(blobForIndex, { signer })
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

  const indexUrl = new URL(resource.path, storageUrl)
  $.teach({ home: indexUrl.toString() })
}

$.draw((target) => {
  init(target)
  const { host, home, loading } = $.learn()

  if(loading) {
    return `
      <div style="width: 100%; height: 100%;">
        <flying-disk></flying-disk>
      </div>
    `
  }

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
  const root = event.target.closest($.link)
  event.preventDefault()
  publish(root.id, root.getAttribute('src') || '/tmp')
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

  & flying-disk {
    width: 100%;
    height: 100%;
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

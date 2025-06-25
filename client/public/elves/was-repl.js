import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import elf from '@plan98/elf'

const contentTypes = {
  // Web documents
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  'default': 'application/octet-stream'
};

function getContentType(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return contentTypes[ext] || contentTypes.default;
}

function getContentTypeByPath(filePath) {
  const filename = filePath.split('/').pop() || '';
  return getContentType(filename);
}

const $ = elf('was-repl', {
  host: plan98.env.PLAN98_WAS_HOST,
  path: '',
  home: '',
  input: 'Hello World'
})

function fetchSauce(src) {
  fetch(src).then(res => res.text()).then(file => {
    $.teach({ input: file, path: src, src: null })
  })
}

let signer
async function init(target) {
  if (target.initialized) return
  target.initialized = true

  const src = target.getAttribute('src') || '/server.js'
  fetchSauce(src)

  const { host } = $.learn()
  const credentials = localStorage.getItem('was/signer')

  if (credentials) {
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
      if (res.status === 200) {
        const indexUrl = new URL(resource.path, storageUrl)
        $.teach({ home: indexUrl.toString() })
      }
      return res
    })
    .catch(e => {
      console.debug(e)
    })
}

async function publish(spaceId) {
  const { host, input, path } = $.learn()
  const storageId = host
  const storageUrl = new URL(storageId)
  const storage = new StorageClient(storageUrl)

  // create the space with signer so all requests get signed by it
  const space = storage.space({
    signer,
    id: `urn:uuid:${spaceId}`
  })

  const linkset = space.resource(`linkset`)
  const spaceObject = {
    controller: signer.controller,
    // configure which resource to use as a linkset
    link: linkset.path,
  }
  const spaceObjectBlob = new Blob(
    [JSON.stringify(spaceObject)],
    { type: 'application/json' },
  )

  // send PUT request to update the space
  const responseToPutSpace = await space.put(spaceObjectBlob)
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })

  if (!responseToPutSpace.ok) throw new Error(
    `Failed to put space: ${responseToPutSpace.status} ${responseToPutSpace.statusText}`, {
    cause: {
      responseToPutSpace
    }
  })
  if (!responseToPutSpace) return

  // GET the space to make sure the PUT persisted it
  const responseToGetSpace = await space.get()
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })

  if (!responseToGetSpace.ok) throw new Error(
    `Failed to get space: ${responseToGetSpace.status} ${responseToGetSpace.statusText}`, {
    cause: {
      responseToGetSpace
    }
  })
  if (!responseToGetSpace) return

  const index = space.resource(path)
  const blobForIndex = new Blob([input], { type: getContentTypeByPath(path) })
  const responseToPutIndex = await index.put(blobForIndex, { signer })
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })

  if (!responseToPutIndex.ok) throw new Error(`Failed to put index: ${responseToPutIndex.status} ${responseToPutIndex.statusText}`, {
    cause: {
      responseToPutIndex
    }
  })

  if (!responseToPutIndex) return

  // Add a policy that makes things PublicCanRead
  const aclAllowingPublicReads = space.resource('policy/published')
  {
    const policy = { type: 'PublicCanRead' }
    const policyBlob = new Blob([JSON.stringify(policy)], { type: 'application/json' })
    const responseToPutPolicy = await aclAllowingPublicReads.put(policyBlob, { signer })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to put policy: ${res.status} ${res.statusText}`, { cause: { res } })
        return res
      })
      .catch(e => {
        console.error(e)
      })
  }

  // Update linkset so the index acl is aclAllowingPublicReads
  {
    const linksetObject = {
      "linkset": [
        {
          "anchor": index.path,
          "acl": [
            {
              "href": aclAllowingPublicReads.path,
            }
          ]
        },
        {
          "anchor": space.resource(`tmp`).path,
          "acl": [
            {
              "href": aclAllowingPublicReads.path,
            }
          ]
        }
      ]
    };
    const linksetBlob = new Blob([JSON.stringify(linksetObject)], { type: 'application/linkset+json' })
    const response = await linkset.put(linksetBlob)
    if (!response.ok) throw new Error(`Failed to put linkset: ${response.status} ${response.statusText}`, { cause: { response } });
  }

  const indexUrl = new URL(index.path, storageUrl)
  $.teach({ src: indexUrl.toString() })
}

$.draw((target) => {
  init(target)
  const { host, path, input, src } = $.learn()
  const url = src?src:path

  return `
    <div class="action-bar">
      <div class="title">was98</div>
      <div class="was-form">
        <input data-bind name="host" value="${escapeHyperText(host)}"/>
        <input data-bind name="path" value="${escapeHyperText(path)}"/>
        <button style="float: right;" data-run>Run</button>
      </div>
    </div>
    <div class="input">
      <textarea
        name="input"
        data-bind="input"
        placeholder="Say it, don't spray it."
      >${escapeHyperText(input)}</textarea>
    </div>
    <div class="output">
      <iframe src="${url}"></iframe>
    </div>
    <div class="footer-bar">
      ${url}
    </div>
  `
},{
  beforeUpdate(target) {
    saveCursor(target)
  },
  afterUpdate(target) {
    replaceCursor(target)
  }
})

let sel = []
const tags = ['TEXTAREA', 'INPUT']
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.field = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const field = target.querySelector(`[name="${target.dataset.field}"]`)
  
  if(field) {
    field.focus()

    if(tags.includes(field.tagName)) {
      field.selectionStart = sel[0];
      field.selectionEnd = sel[1];
    }
  }
}



$.when('click', '[data-run]', async (event) => {
  const root = event.target.closest($.link)
  publish(root.id)
})

$.when('input', '[data-bind]', (event) => {
  $.teach({ [event.target.name]: event.target.value })
})

$.when('blur', '[name="path"]', (event) => {
  fetchSauce(event.target.value)
})


$.style(`
  & {
    display: grid;
    grid-template-rows: auto 1fr 1fr auto;
    grid-template-columns: 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .action-bar {
    background: rgba(0,0,0,1);
    padding: .5rem;
    display: flex;
  }

  & .was-form {
    margin-left: auto;
  }

  & .title {
    color: rgba(255,255,255,.85);
    font-weight: bold;
    font-size: 1.5rem;
  }

  & .input textarea {
    border: none;
    height: 100%;
    width: 100%;
    resize: none;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    padding: .5rem;
  }

  & .output {
    height: 100%;
    overflow: auto;
    padding: .5rem;
  }

  @media (min-width: 36rem) {
    & {
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 1fr 1fr;
    }

    & .action-bar,
    & .footer-bar {
      grid-column: -1 / 1;
    }
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

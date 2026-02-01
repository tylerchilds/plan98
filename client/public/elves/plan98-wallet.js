import elf, { subscribe } from '@silly/elf'
import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"
import { showModal } from './plan98-modal.js'
import $paperPocket, { replaceElves, sideEffects, afterUpdateTheme } from './paper-pocket.js'
import CryptoJS from 'crypto-js';

function addToKeychain(data) {
  const passphrase = prompt('enter admin passphrase')
  const decryptedKeycard = CryptoJS.AES.decrypt(data, passphrase).toString(CryptoJS.enc.Utf8);
  const stringifiedKeycard = atob(decryptedKeycard)
  const rootKeycard = JSON.parse(stringifiedKeycard)
  jsonRPC(rootKeycard).then(console.log)
}

const ERROR_P98_PROVISION_FAILED = '001'
const ERROR_P98_BACKUP_FAILED = '002'
const ERROR_P98_KEYCARD_REJECTED = '003'
const ERROR_P98_KEYCARD_TIMEOUT = '004'
const ERROR_P98_BOOTSTRAP_FAILED = '005'

export const walletDefaultHost = plan98.env.PLAN98_WAS_HOST || 'http://localhost:1088'

const Types = {
  File: {
    type: 'File',
  },
  Directory: {
    type: 'Directory',
  },
}

export const bios = {
  'bluesky': '/app/blue-sky',
  'desktop': '/app/door-man',
  'mobile': '/app/mobile-device',
  'remote': '/app/remote-control',
  'gaming': '/app/couch-coop',
  'music': '/app/paper-pocket?headless=true',
  'shell': '/app/ur-shell',
  'sketch': '/app/sketch-pad',
  'script': '/app/hyper-script',
  'journal': '/app/time-machine',
  'boxart': '/app/plan98-boxart',
}

const defaultPath = {}
const settingsMenuTypeSchema = () => Object.keys(sideEffects)
  .filter(key => {
    return $paperPocket.learn().settings[key]
  }).reduce((path, key) => {
    path[key] = {
      ...sideEffects[key]
    }
    path[key] = sideEffects[key]
    return path
  }, defaultPath)

const defaultState = {
  keycards: []
}

const link = 'plan98-wallet'
const existingState = JSON.parse(localStorage.getItem(link))
const initialState = existingState
  ? { ...defaultState, ...existingState }
  : defaultState

const $ = elf(link, initialState)

$.when('click', '[data-approve-keycard]', () => {
  $.teach({ pendingKeycard: { __status: 'APPROVED' } })
})

$.when('click', '[data-reject-keycard]', () => {
  $.teach({ pendingKeycard: { __status: 'REJECTED' } })
})

function userAcceptImportKeycard(request) {
  const { keycard } = request.params
  $.teach({
    pendingKeycard: {
      __status: 'PENDING',
      ...keycard
    }
  })

  return new Promise((resolve, reject) => {

    const timeout = setTimeout(() => reject({
      "jsonrpc": "2.0",
      id: request.id,
      error: {
        code: ERROR_P98_KEYCARD_TIMEOUT,
        message: 'Initialization Failed',
      }
    }), 30 * 1000)

    function loop() {
      const { pendingKeycard } = $.learn()

      const { __status } = pendingKeycard

      if(__status === 'APPROVED') {
        clearTimeout(timeout)
        $.teach({ pendingKeycard: null })
        resolve({
          "jsonrpc": "2.0",
          id: request.id,
          result: { status: 204 }
        })
        return
      }

      if(__status === 'REJECTED') {
        clearTimeout(timeout)
        $.teach({ pendingKeycard: null })
        reject({
          "jsonrpc": "2.0",
          id: request.id,
          error: {
            code: ERROR_P98_KEYCARD_REJECTED,
            message: 'Initialization Failed',
          }
        })
        return
      }

      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

  })
}

const methods = {
  importKeycard: 'import-keycard'
}

const methodHandlers = {
  [methods.importKeycard]: async (request, resolve, reject) => {
    const { keycard } = request.params

    let error

    function errorCheck() {
      if(error) {
        reject({
          "jsonrpc": "2.0",
          id: request.id,
          error: {
            code: '-32601',
            message: 'Initialization Failed',
          }
        })
        return true
      }
      return false
    }

    await userAcceptImportKeycard(request)
      .then(console.log)
      .catch(e => {
        error = true
        reject(ERROR_P98_PROVISION_FAILED)
      })

    if(errorCheck()) return

    if(keycard) {
      $.teach({ id: keycard.id, ...keycard }, insertKeycard)
      $.teach({ activeKeycardId: keycard.id })
    }

    const signer = await getSigner(keycard)
    const storage = await getStorage(keycard)
    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    await provisionPlan98(signer, keycard).catch((e) => {
      error = true
      reject(ERROR_P98_PROVISION_FAILED)
      console.error(e)
    })

    if(errorCheck()) return

    /*
    await backupPlan98({ space, signer, cwd: '/private/tychi.1998.social/SourceCode/tonejs-instruments/samples' }).catch((e) => {
      error = true
      reject(ERROR_P98_BACKUP_FAILED)
      console.error(e)
    })
    */

    $.teach({ uploadQueue: [], uploadCursor: 0 })

    const bootstrapDependencies = [
      '/public/index.html',
      '/public/styles/system.css',
      '/public/vendor/es-module-shims.js',
      '/public/brand.js',
      '/public/elves/sillonious-brand.js',
      '/public/elf.js',
      '/public/module.js',
      '/public/plan98.js',
      '/public/saga.js',
      '/public/elves/data-popover.js',
      '/public/elves/data-tooltip.js',
      '/public/elves/plan98-modal.js',
      '/public/elves/plan98-panel.js',
      '/public/elves/plan98-toast.js',
      '/public/_statebus.js',
      '/public/statebus/statebus.js',
      '/public/statebus/client-library.js',
      '/public/statebus/braidify-client.js',
      '/public/sqlite.js',
      '/public/main.js',
      '/public/elves/plan98-console.js',
      '/public/elves/plan98-synthia.js',
      '/public/elves/plan98-wallet.js',
      '/public/elves/debug-gamepads.js',
      '/public/elves/paper-pocket.js',
      '/public/elves/tiniest-violin.js',
      '/public/elves/time-machine.js',
      '/public/elves/sketch-pad.js',
      '/public/elves/was-code.js',
      '/public/elves/code-module.js',
      '/public/elves/source-code.js',
    ]

    bootstrapDependencies.map(path => {
      queueUpload({ space, signer }, path)
    })

    await systemAwaitUploadQueue().catch(() => {
      error = true
      reject(ERROR_P98_BOOTSTRAP_FAILED)
    })

    /*
    await backupPlan98({ space, signer, cwd: '/public/elves' }).catch((e) => {
      error = true
      reject(ERROR_P98_BACKUP_FAILED)
      console.error(e)
    })
    */


    if(errorCheck()) return

    resolve({
      "jsonrpc": "2.0",
      id: request.id,
      result: { status: 204 }
    })
  }
}

function jsonRPC(request) {
  return new Promise((resolve, reject) => {
    const handler = methodHandlers[request.method]
    if(handler) {
      handler(request, resolve, reject)
    } else {
      reject({
        "jsonrpc": "2.0",
        id: request.id,
        error: {
          code: '-32601',
          message: 'Method not found',
        }
      })
    }
  })
}

export async function requestKeycardInsertion(keycard) {
  if(keycard) {
    const signer = await getSigner(keycard)
    const storage = await getStorage(keycard)
    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    const keycardMetadata = await getPlan98Config({space, signer}).catch(console.error)

    if(keycardMetadata) {
      $.teach({ id: keycardMetadata.id, ...keycard, ...keycardMetadata }, insertKeycard)
    } else {
      $.teach({ id: keycard.id, ...keycard }, insertKeycard)
    }

    $.teach({ activeKeycardId: keycard.id })
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
    persist()
  }
})

function persist() {
  const { keycards } = $.learn()
  localStorage.setItem(`${$.link}`, JSON.stringify({ keycards }))
}

export function getKeycard(id) {
  const { keycards } = $.learn()

  if(id) {
    const primaryKeycard = keycards.find(x => x.id === id)
    return primaryKeycard ? primaryKeycard : null
  }

  if(keycards.length === 0) {
    return null
  }

  return keycards[0]
}

export function setKeycard(id) {
  const { keycards } = $.learn()
  const primaryKeycard = keycards.find(x => x.id === id)
  if(primaryKeycard){
    $.teach(id, prioritizeKeycardById)
  }
}

export function listKeycards() {
  return $.learn().keycards || []
}

export async function getSigner(keycard=getKeycard()) {
  if(!keycard) {
    return null
  }

  return await Ed25519Signer.fromJSON(JSON.stringify(keycard.asJSON))
}

export function getStorage(keycard=getKeycard()) {
  if(!keycard) return null

  return new StorageClient(new URL(keycard.host || walletDefaultHost))
}

export const KEYCARD_TYPES = {
  GENERIC: 'generic',
  MEMEX: 'memex',
  PERSONA: 'persona',
}

export async function newKeycard(overrides={}) {
  const id = self.crypto.randomUUID()
  const signer = await Ed25519Signer.generate()

  const keycard = {
    id,
    type: KEYCARD_TYPES.GENERIC,
    src: '/app/time-machine',
    title: 'Memex',
    host: walletDefaultHost,
    at: new Date().toJSON(),
    ...overrides
  }

  await provisionPlan98(signer, keycard).catch(console.error)

  return {
    ...keycard,
    asJSON: signer.toJSON(),
  }
}

async function provisionPlan98(signer, keycard) {
  const storage = getStorage(keycard)

  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })

  const linkset = space.resource(`linkset`)
  const spaceObject = {
    controller: signer.controller,
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
  
  const responseToPutConfig = await putPlan98Config({space, signer}, keycard).catch(console.error)

  if (!responseToPutConfig.ok) throw new Error(`Failed to put config: ${responseToPutConfig.status} ${responseToPutConfig.statusText}`, {
    cause: {
      responseToPutConfig
    }
  })

  if (!responseToPutConfig) return
  const keycardMetadata = await getPlan98Config({space, signer}).catch(console.error)

  if(keycardMetadata) {
    $.teach({ id: keycardMetadata.id, ...keycardMetadata }, pasteToKeycard)
  }
}

export async function get(src) {
  const keycard = getKeycard()

  if(keycard) {
    const signer = await getSigner()
    const storage = getStorage()

    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    const resource = space.resource(src)

    return await resource.get({ signer })
      .then(async res => {
        if(!res.ok) {
          throw new Error('Not OKAY!')
        }
        return (await res.blob())
      })
  }
}

export async function touch(src, config={ type: 'application/json' }) {
  const keycard = getKeycard()
  if(keycard) {
    const signer = await getSigner()
    const storage = getStorage()

    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    const resource = space.resource(src)

    const typedBlob = new Blob([JSON.stringify({})], config)
    return await resource.put(typedBlob, { signer })
      .then(res => {
        console.debug({ res })
        return res
      })
  }
}

window.touch = touch

export async function put(src, file, config={ type: 'text/plain' }) {
  const keycard = getKeycard()
  if(keycard) {
    const signer = await getSigner()
    const storage = getStorage()

    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    const resource = space.resource(src)

    const typedBlob = new Blob([file], config)
    return await resource.put(typedBlob, { signer })
      .then(res => {
        return res
      })
  }
}



export async function del(src) {
  const keycard = getKeycard()
  if(keycard) {
    const signer = await getSigner()
    const storage = getStorage()

    const space = storage.space({
      signer,
      id: `urn:uuid:${keycard.id}`
    })

    const resource = space.resource(src)

    return await resource.delete()
      .then(res => {
        console.debug({ res })
        return res
      })
  }
}


export async function putPlan98Config({ space, signer }, keycard) {
  const config = space.resource('/.plan98/config.json')
  const blobForConfig = new Blob([JSON.stringify(keycard)], { type: 'application/json' })
  return await config.put(blobForConfig, { signer })
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })
}

export async function getPlan98Config({space, signer}) {
  const config = space.resource('/.plan98/config.json')

  return await config.get({ signer })
    .then(async res => {
      return await res.json()
    })
    .catch(e => {
      console.debug(e)
    })
}

function uploadRecursive(context, { tree = {}, pathParts = [], subtree = {} }) {
  const files = []
  if(subtree.children) {
    subtree.children.map((child, index) => {
      const { name, type, extension } = child
      const currentPathParts = [...pathParts, name]
      const currentPath = currentPathParts.join('/') || '/'

      if(type === Types.File.type) {
        files.push((context.cwd || '') + currentPath)
        queueUpload(context, currentPath)
      }

      if(type === Types.Directory.type) {
        const moreFiles = uploadRecursive(context, { tree, pathParts: currentPathParts, subtree: child })
        files.push(...moreFiles)
      }
    })
  }
  return files
}

let queue = []
let uploading = false
function queueUpload(context, path) {
  queue.push({
    path: (context.cwd || '') + path,
    error: false,
    done: false
  })

  process(context)
}

function process(context) {
  if(uploading) return

  if(queue.length > 0) {
    $.teach([...queue], (state, payload) => {
      return {
        ...state,
        uploadQueue: [...state.uploadQueue, ...payload]
      }
    })
    queue = []
  }

  const { uploadQueue, uploadCursor } = $.learn()

  const item = uploadQueue[uploadCursor]

  if(!item) return
  uploading = true
  fetch(item.path).then(async (response) => {
    const contentType = response.headers.get('content-type');
    const blob = await response.blob();

    const resource = context.space.resource(item.path)
    const typedBlob = new Blob([blob], { type: contentType })
    resource.put(typedBlob, { signer: context.signer })
      .then(res => {
        console.debug({ res })
        return res
      })
      .catch(e => {
        $.teach({ error: true }, updateQueueAt(uploadCursor))
        console.debug(e)
      })
      .finally(() => {
        $.teach({ done: true }, updateQueueAt(uploadCursor))
        $.teach({ uploadCursor: uploadCursor + 1 })
        if(uploadQueue[uploadCursor]) {
          uploading = false
          process(context)
        }
      })
  }).catch((error) => {
    console.error(error)
    $.teach({ error: true, done: true }, updateQueueAt(uploadCursor))
    $.teach({ uploadCursor: uploadCursor + 1 })
    if(uploadQueue[uploadCursor]) {
      uploading = false
      process(context)
    }
  })
}

function updateQueueAt(index) {
  return (state, payload) => {
    return {
      ...state,
      uploadQueue: state.uploadQueue.map((x, i) => {
        if(i === index) {
          return {
            ...x,
            ...payload
          }
        }

        return x
      })
    }
  }
}

function systemAwaitUploadQueue() {
  return new Promise((resolve) => {
    function loop() {
      const { uploadQueue, uploadCursor } = $.learn()
      if(uploadCursor < uploadQueue.length) {
        requestAnimationFrame(loop)
      } else {
        resolve()
      }
    }

    requestAnimationFrame(loop)
  })
}



export async function backupPlan98(context) {
  $.teach({ uploadQueue: [], uploadCursor: 0 })
  uploading = false
  const { plan98 } = await fetch(`/plan98/about?cwd=${context.cwd}`)
    .then(res => res.json())

  const filesOnly = uploadRecursive(context, { tree: plan98, pathParts: [], subtree: plan98 })

  const aclAllowingPublicReads = context.space.resource('policy/published')
  {
    const policy = { type: 'PublicCanRead' }
    const policyBlob = new Blob([JSON.stringify(policy)], { type: 'application/json' })
    const responseToPutPolicy = await aclAllowingPublicReads.put(policyBlob, { signer: context.signer })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to put policy: ${res.status} ${res.statusText}`, { cause: { res } })
        return res
      })
      .catch(e => {
        console.error(e)
        toast(e.message, { type: 'error' })
      })
  }

  const publicPaths = filesOnly.map(path => ({
    "anchor": context.space.resource(path).path,
    "acl": [
      {
        "href": aclAllowingPublicReads.path,
      }
    ]
  }))

  const linkset = context.space.resource(`linkset`)
  {
    const linksetObject = {
      "linkset": publicPaths
    };
    const linksetBlob = new Blob([JSON.stringify(linksetObject)], { type: 'application/linkset+json' })
    const response = await linkset.put(linksetBlob, { signer: context.signer })
    if (!response.ok) throw new Error(`Failed to put linkset: ${response.status} ${response.statusText}`, { cause: { response } });
  }

  return systemAwaitUploadQueue()
}

$.when('click', '[data-backup]', async (event) => {
  const keycard = getKeycard()

  if(keycard) {
    getSigner().then(signer => {
      const storage = getStorage()
      const space = storage.space({
        signer,
        id: `urn:uuid:${keycard.id}`
      })

      backupPlan98({ space, signer, cwd: event.target.dataset.backup || '' })
    })
  }
})

function renderQueue(item) {
  return `
    <div class="file ${item.error?'error':item.done?'done':''}">
      ${item.path}
    </div>
  `
}


$.draw((target) => {
  const { pendingKeycard, editId, keycards, uploadQueue=[], uploadCursor } = $.learn()

  const draft = $.learn()[editId] || {}

  const [active, ...row] = keycards

  function footer() {
    return `
      ${uploadQueue[uploadCursor] ? `
        <div class="loader-bar" style="--progress: calc(${uploadCursor} / ${uploadQueue.length}  * 100%);">
          <span class="loader-status">
            ${renderQueue(uploadQueue[uploadCursor])}
          </span>
        </div>
      `:`
        <footer style="display: grid; grid-template-columns: 1fr auto;">
          <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
            <button class="logo-gradient">
              Plan98
            </button>
          </div>
          <div style="text-align: right;">
            <button class="standard-button bias-generic -small" data-quit>
              Quit
            </button>
          </div>
        </footer>
      `}
    `
  }

  if(pendingKeycard) {
    return `
      ${footer()}
      <section class="serious-business">
        <h1>
          Keycard Import Request
        </h1>

        <div class="button-container">
          <button class="standard-button bias-positive -small" data-approve-keycard>
            Approve
          </button>

          <button class="standard-button bias-negative -small" data-reject-keycard>
            Deny
          </button>
        </div>

        <p>
          A keycard that goes by ${pendingKeycard.title} and is known to be connected to ${pendingKeycard.host} would like to be added to your wallet.
        </p>

        <p>
          <strong>Serial Number: </strong>${pendingKeycard.id}
        </p>
      </section>
      <header style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          System Message
        </div>
        <div style="text-align: right;">
          <button class="standard-button bias-generic -small" data-reject-keycard>
            Ignore
          </button>
        </div>
      </header>
    `
  }

  return editId ? `
    ${footer()}
    <div class="keycard-form">
      ${editId}
      <div class="wizard">
        <label class="field">
          <span class="label">title</span>
          <input data-bind="${editId}" name="title" value="${escapeHyperText(active.title) || ''}" />
        </label>
        <label class="field">
          <span class="label">host</span>
          <input data-bind="${editId}" name="host" value="${escapeHyperText(active.host || walletDefaultHost) || ''}" />
        </label>
        <label class="field">
          <span class="label">launch</span>
          <select data-bind="${editId}" name="src">
            <option disabled>--Select--</option>
            ${Object.keys(bios).map((x) => `
              <option value="${bios[x]}" ${bios[x] === active.src?'selected':''}>
                ${x}
              </button>
            `).join('')}
          </select>
        </label>

        <hr>

        <!--
        <div class="colorpicker" style="clear: both; overflow: hidden; background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0), rgba(0,0,0,.5), rgb(0,0,0,1)), ${draft.theme || active.theme || 'var(--root-theme, mediumseagreen)'}">
          <plan98-palette local="true" name="theme" style="width: 160px; height: 80px; float: right;" data-bind="${editId}"></plan98-palette>
        </div>
        -->
        ${settingsMenu(editId)}

        <hr>

        <button class="standard-button" data-backup="/public">
          Publish: /public
        </button>
        <button class="standard-button" data-backup="/private/home/tychi/Videos/2024-11-08-blox-b-roll/020-cabaret-clown">
          Publish: Video
        </button>
      </div>
    </div>
    <header style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <button class="standard-button bias-negative -small" data-cancel>
          Cancel
        </button>
      </div>
      <div style="text-align: right;">
        <button class="standard-button bias-positive -small" data-save="${editId}">
          Save
        </button>
      </div>
    </header>

  ` : `
    ${footer()}
    <section class="wallet">
      <div class="keyring">
        <div class="keyring-scroller">
          ${row.map(render).join('')}
        </div>
      </div>
      ${active?`
        <div class="lightbox" style="--lightbox-color: ${active.theme || 'var(--root-theme, mediumseagreen)'}">
          <div class="keycard-actions">
            <button class="standard-button -large bias-negative -round" data-delete="${active.id}">
              <sl-icon name="trash3-fill"></sl-icon>
            </button>
            <button class="standard-button -large bias-generic -round"  style="margin-left: auto;" data-export="${active.id}">
              <sl-icon name="qr-code"></sl-icon>
            </button>
            <button class="standard-button -large -brand -round" data-edit="${active.id}">
              <sl-icon name="pencil-fill"></sl-icon>
            </button>
          </div>

          <div class="active-keycard">
            ${render(active)}
          </div>
        </div>
      `:''}
    </section>
    <header style="display: grid; grid-template-columns: 1fr 1fr;">
      <div>
        <button class="standard-button bias-generic -small" data-create>
          New Keycard
        </button>
      </div>
      <div style="text-align: right;">
        <button class="standard-button bias-generic -small" data-remix>
          Remix
        </button>
      </div>
    </header>
  `
}, {
  beforeUpdate(target) {
    if(!target.initialized) {
      target.initialized = true
      const data = target.getAttribute('data')
      if(data) {
        addToKeychain(data)
      }

      const { keycards } = $.learn()
      if(keycards.length === 0) {
        seed()
      }

      const keycard = getKeycard()

      if(keycard) {
        getSigner().then(signer => {
          const storage = getStorage()
          const space = storage.space({
            signer,
            id: `urn:uuid:${keycard.id}`
          })

          getPlan98Config({ space, signer }).then((keycardMetadata) => {
            if(keycardMetadata) {
              $.teach({ id: keycardMetadata.id, ...keycardMetadata }, pasteToKeycard)
            }
          })
        })
      }
    }
  },
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
    }

    {
      replaceElves(target, 'sl-icon')
    }
  }
})


export function settingsMenu(editId) {
  const cardOptions = Object
      .keys(settingsMenuTypeSchema()).map(key => {
    const { label, description, options } = $paperPocket.learn().settings[key]
    const draft = ($.learn()[$.learn()?.editId])
    const value = (draft ? draft[key] : null) || (getKeycard() && getKeycard()[key]) || $paperPocket.learn()[key]
    return `
      <label class="field">
        <span class="label" data-tooltip="${description}">
          ${label}
        </span>
        <select data-bind="${editId}" name="${key}">
          <option disabled>${label}</option>
          ${options.map(option => {
            return `
              <option ${option === value?'selected':''}>${option}</option>
            `
          }).join('')}
        </select>
      </label>

    `
  }).join('')

  return `
    ${cardOptions}
  `
}

async function seed() {
  Promise.all([
    newKeycard({ title: 'silly', src: '/app/sketch-pad' }),
    newKeycard({ title: 'sally', src: '/app/time-machine' }),
    newKeycard({ title: 'sully', src: '/app/couch-coop' }),
    newKeycard({ title: 'shelly', src: '/app/ur-shell' }),
    newKeycard({ title: 'sunny', src: '/app/paper-pocket?headless=true' }),
    newKeycard({ title: 'wally', src: '/app/hyper-script' }),
  ]).then(agents => {
    agents.forEach(keycard => {
      $.teach(keycard, pushKeycard)
    })
  })
}

function render(keycard) {
  const { activeKeycardId } = $.learn()
  const isActive = activeKeycardId === keycard.id
 
  return `
    <button
      ${isActive?`data-launch="${keycard.id}"`:''}
      data-select="${keycard.id}"
      class="standard-button keycard ${isActive?'is-active':''}"
      style="--keycard-theme: ${keycard.theme || 'var(--root-theme, mediumseagreen)'}">
      <span class="keycard-title">
        ${keycard.title}
      </span>
      <span class="keycard-host">
        ${keycard.host}
      </span>
    </button>
  `
}

$.when('click', '[data-create]', async (event) => {
  provisionActiveKeycard()
})

export async function requestKeycardPaste(keycard) {
  if(keycard) {
    await updatePlan98Config(keycard)
    $.teach({ activeKeycardId: keycard.id })
    persist()
  }
}



export async function provisionActiveKeycard(options={}) {
  const keycard = await newKeycard(options).catch(console.error)
  await updatePlan98Config(keycard)
  $.teach(keycard, unshiftKeycard)
  $.teach({ activeKeycardId: keycard.id })
  persist()
}

$.when('click', '[data-quit]', async (event) => {
  window.location.href = '/app/ur-shell'
})

function pushKeycard(state, payload) {
  return {
    ...state,
    keycards: [...state.keycards, payload]
  }
}

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
        params: {
          type: 'keycard',
          keycard: {
            id: keycard.id,
            title: keycard.title,
            src: keycard.src,
            asJSON: keycard.asJSON,
            host: keycard.host,
          }
        }
      })
    )

    showModal(`
      <div style="background: white; height: 100%; width: 100%; overflow: hidden;">
        <div style="padding: 51px; height: 100%; display: flex;">
          <qr-code src="${window.location.origin}/app/plan98-wallet?data=${encoded}" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
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
      <was-code src="/public/elves/plan98-wallet.js"></was-code>
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

$.when('click', '[data-save]', async (event) => {
  const id = event.target.dataset.save
  $.teach({ editId: null })
  const claim = $.learn()[id]
  $.teach({ id, ...claim }, pasteToKeycard)

  const keycard = $.learn().keycards.find(x => x.id === id)

  if(keycard) {
    await updatePlan98Config(keycard)
    await provisionPlan98(signer, keycard).catch(console.error)
  }
})

async function updatePlan98Config(keycard) {
  const signer = await getSigner(keycard)
  const storage = getStorage(keycard)

  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })

  const keycardMetadata = await getPlan98Config({space, signer}).catch(console.error)
  const cleanKeycard = {
    ...keycardMetadata,
    ...keycard
  }

  $.teach(cleanKeycard, pasteToKeycard)

  delete cleanKeycard.asJSON

  return await putPlan98Config({space, signer}, cleanKeycard).catch(console.error)
}


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

export function requestKeycardDeletion(id) {
  if(id) {
    $.teach(id, deleteKeycardById)
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
    align-items: center;
  }

  & footer {
    background: rgba(255,255,255,.85);
    padding: 4px .5rem;
    align-items: center;
  }

  & .active-keycard {
    position: relative;
    text-align: center;
    height: 100%;
    display: grid;
    place-items: center;
  }

  & .keycard-actions {
    position: absolute;
    top: 0;
    z-index: 1;
    margin: 0 auto;
    padding: .5rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: .5rem;
    pointer-events: none;
  }

  & .lightbox {
    padding: 1rem;
    position: relative;
    display: block;
    place-content: center;
    overflow: hidden;
    background: rgba(255,255,255,.85);
  }

  & .standard-button.-brand {
    --root-theme: var(--lightbox-color, mediumseagreen);
    background-repeat: repeat-x;
    display: grid;
    place-content: center;
  }

  & .wallet {
    overflow: auto;
    display: grid;
    grid-template-rows: 7rem 1fr;
    grid-template-columns: auto;
    background: rgba(0,0,0,.5);
    color: rgba(255,255,255,.85);
  }

  & .keyring-scroller {
    max-width: 100%;
    gap: .5rem;
    display: flex;
    overflow-y: hidden;
    overflow-x: auto;
    height: 100%;
    padding: .5rem;
    justify-content: space-around;
  }

  @media (min-width: 768px) {
    & .wallet {
      grid-template-columns: 280px 1fr;
      grid-template-rows: auto;
    }

    & .keyring-scroller {
      overflow-y: auto;
      overflow-x: hidden;
      flex-direction: column;
    }
  }

  & .serious-business {
    padding: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    background: white;
    color: rgba(0,0,0,.85);
    overflow: auto;
  }


  & .keycard-form {
    overflow: auto;
    background: white;
    padding: .5rem;
  }

  & .keyring {
    display: block;
    place-items: center;
    overflow: hidden;
  }

  & .keycard {
    width: 100%;
    max-height: calc(280px / 1.66);
    height: 100%;
    min-height: 6rem;
    max-width: 280px;
    min-width: 220px;
    display: inline-grid;
    place-content: center;
    gap: .5rem;
    padding: .5rem;
    text-align: center;
    word-break: break-all;
  }

  & .keycard:hover,
  & .keycard:focus,
  & .keycard.is-active {
    opacity: 1;
  }

  & .file {

  }

  & .error {
    color: firebrick;
  }

  & .done {
    color: mediumseagreen;
  }

  & .loader-bar {
    position: relative;
    background: var(--keycard-theme, var(--root-theme, mediumseagreen));
    background: linear-gradient(135deg, rgba(0,0,0,.25), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    text-align: right;
    padding: .5rem;
    border-radius: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & .loader-status {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,.85);
    opacity: 0.95;
  }

  & .loader-bar::after {
    content: '';
    width: var(--progress);
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,0,0,.25), rgba(0,0,0,.65)), var(--keycard-theme, var(--root-theme, mediumseagreen));
  }

  & .logo-gradient {
    border: none;
    padding: 0;
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 1000;
    --v-font-slnt: -15;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
  }
`)

$.when('input', 'plan98-palette', (event) => {
  const { bind } = event.target.dataset
  const { color } = event.detail
  $.teach({
    name: event.target.getAttribute('name'),
    value: color
  }, namespace(bind))
})

function namespace(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  }
}

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset

  const name = event.target.name
  const value = event.target.value

  $.teach({
    name,
    value
  }, namespace(bind))
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

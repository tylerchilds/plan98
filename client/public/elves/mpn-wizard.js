/*
 *
 *
 *
 *
 *
 *
 *
 *    Welcome to the Mode Package Nanager!
 *
 *
 *
 *
 *    Usage
 *
 *      mpn install <UR> (where UR is yoUR Universal Resource)
 *
 *
 *    As long as that works it works it works
 *
 *
 *
 *
 *
 *
 *
 */


import Self from '@plan98/elf'
import Cache from '@silly/cache'
import { getKeycard, getSigner, getStorage } from './plan98-wallet.js'

const elf = 'mpn-wizard'

const commands = {
  'ui': function ui(...args) {
    this.loadModule(`<${elf}`)
  },
  'version': () => {
    return '0.0.0'
  },
  'echo': (...args) => {
    return args.join(' ')
  },
  'help': (...args) => {
    return `Mode Package Nanager

help
  display help options

ui
  launch the user interface mode

install
  install modes

uninstall
  uninstall modes

version
  current version number
`
  },
  'install': (...args) => {
    return args.join(' ')
  },
}

export function mpn(message) {
  const [command, ...args] = message.split(' ')
  const program = commands[command] || commands[command.toLowerCase()]
  if(program) {
    try {
      return program.apply(this, args)
    } catch(e) {
      console.error(e)
      return `Whoops! ${e.message}`
    }
  }

  return 'mpn: command not found'
}


const defaultState = {
  attachments: [],
  name: 'Unnamed',
  version: '0.0.0',
  pkg: {
    name: 'Unnamed',
    version: '0.0.0',
  }
}

const $ = Self(elf, defaultState)

$.when('json-rpc', elf, async (event) => {
  if(event.detail.method === 'success') {
  }

  if(event.detail.method === 'error') {
    toast("Error submitting the sell wizard.", { type: 'error' })
  }
})


let STAGED_FILES = {}

function handleFiles(bind, files) {
  STAGED_FILES = {}
  // Convert FileList to Array and add to selectedFiles
  const fileMeta = Array.from(files).map(file => {
    STAGED_FILES[file.name] = file
    return {
      name: file.name,
      url: `/attachments/${self.crypto.randomUUID()}/` + file.name,
      size: file.size,
      type: file.type,
    }
  });

  $.teach({ 
    name: 'attachments',
    value: fileMeta,
  }, namespace(bind))
}

function startProductUpload(target) {
  const database = $.learn()
  const { name, version, attachments, pkg } = database[target.id] || defaultState
  const keycard = getKeycard()

  if(keycard) {
    getSigner().then(async signer => {
      const storage = getStorage()
      const space = storage.space({
        signer,
        id: `urn:uuid:${keycard.id}`
      })

      const context = { signer, space }

      if(attachments) {
        await Promise.all([...attachments].map(queueUpload.bind(context)))
      }

      wizardSuccess(target)
    })
  }
}

export function wizardSuccess(node, params) {
  node.dispatchEvent(new CustomEvent('json-rpc', {
    detail: {
      jsonrpc: "2.0",
      method: 'success',
      params
    }
  }))
}

export function wizardError(node, params) {
  node.dispatchEvent(new CustomEvent('json-rpc', {
    detail: {
      jsonrpc: "2.0",
      method: 'error',
      params
    }
  }))
}

function queueUpload(attachment) {
  const file = STAGED_FILES[attachment.name]

  const resource = this.space.resource(attachment.url)
  const typedBlob = new Blob([file], { type: file.type })
  return resource.put(typedBlob, { signer: this.signer })
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })
    .finally(() => {
      console.log('finally', resource.path)
    })

}

$.draw((target) => {
  const database = $.learn()
  const { name, version, attachments, pkg } = database[target.id] || defaultState
  return `
    <form class="wizard" style="display: flex; flex-direction: column; gap: 1rem;">

      <h1>MPN UI</h1>
      <div style="display: grid; gap: 1rem; grid-template-columns: 1fr auto;">
        Configure your package and assets AND THEN
        <button class="standard-button" type="submit">
          Publish
        </button>
      </div>

      <h2>${name}</h2>
      <label class="field">
        <span class="label">Title</span>

        <input
          data-bind="${target.id}"
          name="name"
          value="${name || ''}"
          class="standard-input"
        />
      </label>
      <label class="field">
        <span class="label">Version</span>
        <input
          data-bind="${target.id}"
          name="version"
          value="${version || ''}"
          class="standard-input"
        />
      </label>

      <label class="field">
        <span class="label">package.json</span>
        <textarea
          data-dom="code-hook"
          disabled
          value="${escapeHyperText(JSON.stringify(pkg,'',2))}"
          style="height: 12rem;"
        ></textarea>
      </label>

      <h3>Assets</h3>
      <div class="file-region">
        <div>
          Drag and Drop
        </div>
        <div class="small-text">
          or
        </div>
        <button class="click-proxy standard-button bias-generic">Browse Files</button>
        <input type="file" name="files" multiple style="display: none;">

        <div class="file-list">
          ${attachments ? attachments.map(x => {
            return `
              <div class="table">
                <div class="table-row">
                  <div class="table-cell">
                    ${x.name}
                  </div>
                  <div class="table-cell">
                    ${formatBytes(x.size)}
                  </div>
                </div>
              </div>
            `
          }).join('') : ''}
        </div>
      </div>
    </form>
  `
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
    }
  },
  afterUpdate(target) {
  }
})


$.when('submit', 'form', (event) => {
  event.preventDefault()
  startProductUpload(event.target.closest($.root))
})



$.style(`
  & {
    display: grid;
    gap: 1rem;
  }

  & .file-region {
    border: 3px dashed rgba(0,0,0,.45);
    padding: 1rem;
    display: grid;
    gap: .5rem;
    text-align: center;
  }

  & .small-text {
    color: rgba(0,0,0,.65);
    font-size: 13px;
  }

  &[data-hovering="true"] .file-region {
    border: 3px dashed rgba(0,0,0,.85);
  }

  & .file-region > * {
    pointer-events: none;
  }

  & .file-region > button {
    pointer-events: all;
  }
`)

$.when('click', '.click-proxy', (event) => {
  event.target.nextElementSibling.click()
})

$.when('dragenter', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = true
})

$.when('dragover', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = true
})

$.when('dragleave', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = false
})

$.when('drop', '.file-region', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const root = event.target.closest($.link)
  root.dataset.hovering = false
  if (event.dataTransfer) {
    console.log('- Files count:', event.dataTransfer.files.length);
    const bind = event.target.closest($.link).id
    handleFiles(bind, event.dataTransfer.files);
  }
})

$.when('change', '[name="files"]', (event) => {
  const bind = event.target.closest($.link).id
  handleFiles(bind, event.target.files);
});

function configurate(state) {
  return {
    name: state.name,
    version: state.version,
  }
}

function namespace(bind) {
  return (state, payload) => {
    const next = {
      ...state,
      [bind]: {
        ...defaultState,
        ...state[bind],
        [payload.name]: payload.value,
      }
    }

    next[bind].pkg = configurate(next[bind])

    return next
  }
}

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset

  const name = event.target.name
  const value = escapeHyperText(event.target.value)

  $.teach({
    name,
    value
  }, namespace(bind))
})


export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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


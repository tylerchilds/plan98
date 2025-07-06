import elf, { subscribe } from '@silly/elf'
import $buySell, { updateDraft, wizardSuccess, wizardError } from './buy-sell.js'
import { getKeycard, getSigner, getStorage } from './plan98-wallet.js'
import { creationForms, eventTypes } from './time-machine.js'

const views = {
  first: 'first',
  second: 'second'
}

const viewRenderers = {
  [views.first]: (state) => {
    return `
      <div class="view-title">
        Sell
      </div>
      <div class="view-description">
        Upload your digital product. It will be stored securely in your wallet using the abcxyz keycard.
      </div>

      <div class="file-region">
        Drag and Drop or
        <button class="click-proxy">Browse Files</button>
        <input type="file" name="files" multiple style="display: none;">
      </div>

      <button data-submit="${views.first}">
        Upload
      </button>
    `
  },
  [views.second]: (state) => {
    return `
      <div class="view-title">
        Sell
      </div>
      <div class="view-description">
        Describe your product and then press "Go to Market" to ship to production.
      </div>

      ${creationForms[eventTypes.product].call(null, state.draft)}

      <button data-submit="${views.second}">
        Go to Market
      </button>
    `

  }
}

const $ = elf('buy-sell-wizard', {
  view: views.first
})

let STAGED_FILES = {}

function handleFiles(files) {
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

  updateDraft({
    attachments: fileMeta
  })
}


function startProductUpload() {
  const { draft } = $.learn()
  const keycard = getKeycard()

  if(draft && keycard) {
    getSigner().then(signer => {
      const storage = getStorage()
      const space = storage.space({
        signer,
        id: `urn:uuid:${keycard.id}`
      })

      const context = { signer, space }

      if(draft.attachments) {
        [...draft.attachments].map(queueUpload.bind(context))
      }
    })
  }
}

function queueUpload(attachment) {
  const file = STAGED_FILES[attachment.name]

  const resource = this.space.resource(attachment.url)
  const typedBlob = new Blob([file], { type: file.type })
  resource.put(typedBlob, { signer: this.signer })
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

const viewValidators = {
  [views.first]: (state, target) => {
    const errors = []
    console.log(state)
    startProductUpload()
    $.teach({ view: views.second })
    return errors.length > 0 ? errors : null
  },
  [views.second]: (state, target) => {
    const errors = []

    if(errors.length === 0) {
      wizardSuccess(target)
    } else {
      wizardError(target)
    }

    return errors.length > 0 ? errors : null
  }
}



$.when('click', '[data-submit]', (event) => {
  const { submit } = event.target.dataset
  if(viewValidators[submit]) {
    const root = event.target.closest($.link)
    viewValidators[submit]($.learn(), root)
  }
})

subscribe((link) => {
  if(link === $buySell.link) {
    const { draft } = $buySell.learn()
    $.teach({ draft })
  }
})

$.draw((target) => {
  const { view } = $.learn()
  const html = viewRenderers[view] ? viewRenderers[view](target) : ''
  return html
})


$.style(`
  & {
    display: block;
  }

  & .file-region {
    border: 3px dashed rgba(0,0,0,.45);
  }

  &[data-hovering="true"] .file-region {
    border: 3px dashed rgba(0,0,0,.85);
  }

  & .file-region > * {
    pointer-events: none;
  }
`)

$.when('click', '.file-region', (event) => {
  event.target.querySelector('input').click()
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
    handleFiles(event.dataTransfer.files);
  }
})

$.when('change', '[name="files"]', (event) => {
  handleFiles(event.target.files);
});

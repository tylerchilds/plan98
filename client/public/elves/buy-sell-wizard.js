import elf, { subscribe } from '@silly/elf'
import $buySell, { formatBytes, updateDraft, wizardSuccess, wizardError } from './buy-sell.js'
import { getKeycard, getSigner, getStorage } from './plan98-wallet.js'
import { creationForms, eventTypes } from './time-machine.js'
import { replaceElves } from './paper-pocket.js'

const views = {
  first: 'first',
  second: 'second'
}
const $ = elf('buy-sell-wizard', {
  view: views.first,
  attachments: []
})

const viewRenderers = {
  [views.first]: (target) => {
    const keycard = getKeycard()
    const { draft } = $.learn()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="view-title">
        Make Money
      </div>
      <div class="view-description">
        Upload your digital product to your store using your ${keycard.name} keycard. Your customers purchase securely and directly from your store.
      </div>

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
          ${draft && draft.attachments ? draft.attachments.map(x => {
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

      <button data-submit="${views.first}" class="standard-button -large bias-positive">
        Continue
      </button>

      <div style="text-align: center">
        <a href="/app/plan98-wallet">
          Wrong Keycard? Go to wallet.
        </a>
      </div>
    `
  },
  [views.second]: (target) => {
    const { draft } = $.learn()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="view-title">
        Make Money
      </div>
      <div class="view-description">
        Describe your product and then press "Go to Market" to ship to production.
      </div>

      <div>
        ${creationForms[eventTypes.product].call(null, draft)}
      </div>

      <button class="standard-button bias-positive -large" data-submit="${views.second}">
        Go to Market
      </button>
    `

  }
}



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

  $.teach({ attachments: fileMeta })
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
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      $.teach({ view: views.first })
    }
  },
  afterUpdate(target) {
    replaceElves(target, 'plan98-icon')
  }
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
    handleFiles(event.dataTransfer.files);
  }
})

$.when('change', '[name="files"]', (event) => {
  handleFiles(event.target.files);
});


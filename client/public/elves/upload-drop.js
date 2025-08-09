import elf, { subscribe } from '@silly/elf'
import $zipFile, { formatBytes, updateDraft, wizardSuccess, wizardError } from './zip-file.js'
import { getKeycard, getSigner, getStorage } from './plan98-wallet.js'

const $ = elf('upload-drop', {
  attachments: []
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

  $.teach({ attachments: fileMeta })

  startProductUpload()
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

      const root = event.target.closest($.link)
      wizardSuccess(root)
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

subscribe((link) => {
  if(link === $zipFile.link) {
    const { draft } = $zipFile.learn()
    $.teach({ draft })
  }
})

$.draw((target) => {
  const { draft } = $.learn()
  return `
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

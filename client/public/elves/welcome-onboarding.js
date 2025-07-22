import elf, { subscribe } from '@silly/elf'
import $buySell, { formatBytes, updateDraft, wizardSuccess, wizardError } from './buy-sell.js'
import { provisionActiveKeycard, getKeycard, getSigner, getStorage } from './plan98-wallet.js'
import { saveKeycard, newDraft, creationForms, eventTypes } from './time-machine.js'
import { replaceElves } from './paper-pocket.js'

const forms = {
  learn: 'learn',
  first: 'first',
  second: 'second',
  create: 'create',
  success: 'success',
  publish: 'publish',
  upload: 'upload',
  complete: 'complete',
  wallet: 'wallet',
  template: 'template'
}
const tag = 'welcome-onboarding'
const $ = elf(tag, {
  form: forms.first,
  attachments: []
})

const formRenderers = {
  [forms.template]: (target) => {
    const keycard = getKeycard()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Title
      </div>
      <div class="form-description">
        Lorem ipsum sit amet dolor.
      </div>

      <label class="field">
        <span class="label">Radio</span>
        <select name="type">
          <option disabled selected>Quantum</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </label>

      <label class="field">
        <span class="label">Field</span>
        <input type="text"/>
      </label>
      <label class="field">
        <span class="label">Area</span>
        <textarea style="height: 16rem;"></textarea>
      </label>

      <button class="standard-button bias-positive -large">
        Large Good
      </button>
      <button class="standard-button bias-generic">
        Generic
      </button>
      <button class="standard-button bias-negative -small">
        Small Bad
      </button>
      <button class="standard-button -smol">
        Smol U
      </button>
      <button class="standard-button -round bias-generic">
        <sl-icon name="x-circle"></sl-icon>
      </button>
    `
  },
  [forms.learn]: (target) => {
    const keycard = getKeycard()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Plan98.org Mission
      </div>
      <div class="form-description">
        There are billions of computing devices globally. Desktops. Laptops. Keyboards. Phones. Watches. Glasses. Rooms.
      </div>
      <div class="form-description">
        Across them are dozens of vendors and their suppliers. The digital landscape is fragmented.
      </div>
      <div class="form-description">
        Have you ever tried to move an Apple to a Google? A Microsoft to an IBM? A Betamax to a VHS?
      </div>
      <div class="form-description">
        You get the idea.
      </div>
      <div class="form-description">
        The Plan98 mission is simple. Bring everything together into one spot.
      </div>
      <div style="margin: 3rem 0;">
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-description">
        A personal computer for computer professionals.
      </div>
      <div class="form-description">
        Plan98 stores your data is where you say to. Your identity is what you declare it. You control your narrative.
      </div>
      <div class="form-description">
        Too good to be true? Press the "ESC" key on your keyboard to check the code.
      </div>
      <div class="form-description">
        No keyboard? No problem. Highlight any text and press the "ESC" button in the top left of your screen.
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.second}">
        Create Keycard
      </button>
      <button class="standard-button bias-generic -large" data-submit="${forms.first}">
        Go Back
      </button>
    `
  },

  [forms.first]: (target) => {
    const keycard = getKeycard()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Getting Started
      </div>
      <div class="form-description">
        ${keycard
          ? 'Welcome back. You can make a new keycard or continue with the one in your pocket.'
          : 'First time? You can create a keycard now or learn more before getting started. '
        }
      </div>

        ${keycard
          ? `
            <button class="standard-button bias-positive -large" data-submit="${forms.second}">
              Create Keycard
            </button>
            <button class="standard-button -large" data-submit="${forms.leave}">
              Continue
            </button>
          `
          : `
            <button class="standard-button bias-positive -large" data-submit="${forms.second}">
              Create Keycard
            </button>
            <button class="standard-button bias-generic -large" data-submit="${forms.learn}">
              Learn More
            </button>
          `
        }
    `
  },
  [forms.second]: (target) => {
    const { draft } = $.learn()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Create Keycard
      </div>
      <div class="form-description">
        A keycard grants access to portals. Portals can be any digital surface. You'll try the time machine soon-- One of the best portals for navigating portals.
      </div>

      <div>
        ${creationForms[eventTypes.keycard].call(null, draft)}
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.create}">
        Create Keycard
      </button>
      <button class="standard-button bias-generic -large" data-submit="${forms.first}">
        Go Back
      </button>
    `
  },
  [forms.success]: (target) => {
    const keycard = getKeycard()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Success!
      </div>
      <div class="form-description">
        Your new keycard has been activated and is ready for use. You may enter the time machine now or publish a website instead.
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.leave}">
        Enter Time Machine
      </button>

      <button class="standard-button -large" data-submit="${forms.publish}">
        Publish Website
      </button>
    `
  },
  [forms.publish]: (target) => {
    const keycard = getKeycard()
    const { draft } = $.learn()
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Optional
      </div>
      <div class="form-description">
        You may publish a website by uploading the corresponding files here.
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

      <button data-submit="${forms.upload}" class="standard-button -large bias-positive">
        Publish
      </button>

      <button class="standard-button bias-generic -large" data-submit="${forms.leave}">
        Skip
      </button>
    `
  },
  [forms.complete]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="form-title">
        Success!
      </div>
      <div class="form-description">
        Your website has been published. Nothing left to do other than jump in. You finished the tutorial. Great work!
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.leave}">
        Enter Time Machine
      </button>
    `
  },
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

const formValidators = {
  [forms.template]: (state, target) => {
    $.teach({ form: forms.template })
  },
  [forms.learn]: (state, target) => {
    $.teach({ form: forms.learn })
  },
  [forms.create]: async (state, target) => {
    const errors = []
    try {
      await provisionActiveKeycard({
        ...state.draft
      })
      await saveKeycard(state.draft).catch(console.error)
    } catch(e) {
      errors.push(e)
    }

    if(errors.length === 0) {
      $.teach({ form: forms.success })
    } else {
      $.teach({ errors })
    }
  },
  [forms.wallet]: (state, target) => {
    $.teach({ form: forms.wallet })
  },
  [forms.publish]: (state, target) => {
    $.teach({ form: forms.publish })
  },
  [forms.upload]: (state, target) => {
    const errors = []
    if(errors.length === 0) {
      $.teach({ form: forms.complete })
    } else {
      $.teach({ errors })
    }
  },
  [forms.first]: (state, target) => {
    $.teach({ form: forms.first })
  },
  [forms.second]: (state, target) => {
    $.teach({ draft: newDraft(eventTypes.keycard), form: forms.second })
  },
  [forms.leave]: (state, target) => {
    window.location.href = '/app/time-machine'
  },
}

$.when('click', '[data-submit]', (event) => {
  const { submit } = event.target.dataset
  if(formValidators[submit]) {
    const root = event.target.closest($.link)
    formValidators[submit]($.learn(), root)
  }
})

subscribe((link) => {
  if(link === $buySell.link) {
    const { draft } = $buySell.learn()
    $.teach({ draft })
  }
})

$.style(`
  & {
    display: grid;
    gap: 1rem;
    animation: &-fade-in 1000ms ease-in-out forwards;
    background: var(--root-theme, mediumseagreen);
    opacity: 0;
    height: 100%;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      background: var(--root-theme, mediumseagreen);
    }
    100% {
      opacity: 1;
      background: white;
    }
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

  & .form-title {
    margin-top: 2rem;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  & .form-description {
    margin-bottom: 1rem;
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

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    [event.target.name]: event.target.value
  }, bound(bind))
})

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        ...payload
      }
    }
  }
}

$.draw((target) => {
  const { form } = $.learn()
  const html = formRenderers[form] ? formRenderers[form](target) : ''

  if(form === target.lastForm) return
  target.lastForm = form
  target.innerHTML = `
    <div class="wizard">
      ${html}
    </div>
  `
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      $.teach({ form: forms.first })
    }
  },
  afterUpdate(target) {
    //replaceElves(target, 'plan98-icon')
  }
})

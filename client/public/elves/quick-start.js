import elf from '@silly/elf'
import {
  getSession,
  clearSession,
} from './bayun-wizard.js'
import {
  getPersona,
  provisionPersonaKeycard,
  handleSessionEnd
} from './secure-persona.js'
import {
  walletDefaultHost
} from './plan98-wallet.js'

const forms = {
  loading: 'loading',
  learn: 'learn',
  first: 'first',
  second: 'second',
  authentication: 'authentication',
  access: 'access',
  success: 'success',
  leave: 'leave',
  template: 'template',
  welcomeBack: 'welcomeBack'
}

const tag = 'quick-start'
const $ = elf(tag, {
  storageHost: walletDefaultHost,
  form: forms.loading,
  loading: false,
  errors: []
})

function renderErrors() {
  const { errors } = $.learn()

  if(errors.length > 0) {
    return `
      <div class="errors-list">
        ${errors.map(error => `
          <div>${error}</div>
        `).join('')}
      </div>
    `
  } else {
    return ''
  }
}

const formRenderers = {
  [forms.loading]: (target) => {
    return `
      <div>
        <flying-disk style="width: 100%;"></flying-disk>
      </div>
    `
  },
  [forms.template]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
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
        <sl-icon name="x-lg"></sl-icon>
      </button>
    `
  },
  [forms.learn]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        About
      </div>
      <div class="form-description">
        There are billions of computing devices globally. Desktops. Laptops. Keyboards. Phones. Watches. Glasses. Rooms.
      </div>
      <div class="form-description">
        Have you ever tried to move data from one provider to another? How'd that go? Was it easy? Was it even possible?
      </div>
      <div class="form-description">
        You get the idea. Sharing data across platforms is difficult, so earth has collectively trusted a handful of super nerds to do this for us, but it turned out to be a bad call.
      </div>
      <div class="form-description">
        We don't need their spyware. You can outsmart them.
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.second}">
        Create Persona
      </button>
      <button class="standard-button bias-generic -large" data-submit="${forms.first}">
        Go Back
      </button>
    `
  },

  [forms.first]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        Your Move
      </div>
      <div class="form-description">
        Are you exhausted as an individual just trying to maintain social cohesion online, but are under constant threat of corporate overreach so someone else can pay their bills using your data? Never again.
      </div>

      <div class="form-description">
        When you're ready to control your own destiny, press "Start", otherwise keep learning the hard way until this feels important to you, personally.
      </div>

      <div class="form-description">
        Gen-Z has coined this paradigm shift as "Pre-De-Platforming".
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.second}">
        Start
      </button>
      <button class="standard-button bias-generic -large" data-submit="${forms.learn}">
        Learn More
      </button>
    `
  },
  [forms.second]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        Persona
      </div>
      <div class="form-description">
        A persona is your primary access key for secure communications across the network.
      </div>

      <div class="form-description">
        The technical pieces are: Authentication and Access. Set a password to authenticate and set an access point for storage.
      </div>

      <div class="form-description">
        When you're ready to create a persona, press "Create Persona" and the interactive creation process will begin.
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.provision}">
        Create Persona
      </button>
      <button class="standard-button bias-generic -large" data-submit="${forms.first}">
        Go Back
      </button>
    `
  },
  [forms.authentication]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <secure-persona></secure-persona>
    `
  },
  [forms.access]: (target) => {
    const { storageHost, loading } = $.learn()
    const { sessionId, companyEmployeeId, companyName } = getSession()

    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        Access
      </div>
      <div>
        You are ${companyEmployeeId}@${companyName} <button class="standard-button -smol" data-logout>Switch</button>
      </div>
      <div class="form-description">
        Configure your storage provider so that you know the full supply chain of your own information.
      </div>
      <label class="field">
        <span class="label">Storage Host</span>
        <input type="text" data-bind name="storageHost" value="${storageHost}" />
      </label>

      ${ loading ? `
          <div3>
            <flying-disk></flying-disk>
          </div3>
        ` : `
          <button class="standard-button bias-positive -large" data-submit="${forms.access}">
            Set Access Point
          </button>
        `
      }
    `
  },
  [forms.success]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        Ready!
      </div>
      <div class="form-description">
        Your Authentication and Access has been fully tailored to your specifications.
      </div>

      <div class="form-description">
        You can continue customizing your preferences or start using your new persona.
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.leave}">
        Continue
      </button>

      <button class="standard-button -large" data-submit="${forms.preferences}">
        Preferences
      </button>
    `
  },
  [forms.welcomeBack]: (target) => {
    const { sessionId, companyEmployeeId, companyName } = getSession()
    return `
      <div>
        <plan98-icon></plan98-icon>
        ${renderErrors()}
      </div>
      <div class="form-title">
        Welcome Back
      </div>
      <div class="form-description">
        You're signed in as <strong>${companyEmployeeId}@${companyName}</strong>
      </div>

      <button class="standard-button bias-positive -large" data-submit="${forms.leave}">
        Continue
      </button>
      <button class="standard-button bias-generic" data-logout>
        Switch Persona
      </button>
    `
  },
}

const formValidators = {
  [forms.template]: (state, target) => {
    $.teach({ form: forms.template, errors: [] })
  },
  [forms.learn]: (state, target) => {
    $.teach({ form: forms.learn, errors: [] })
  },
  [forms.provision]: async (state, target) => {
    const { sessionId, companyEmployeeId, companyName } = getSession()

    if(!sessionId) {
      $.teach({ form: forms.authentication, errors: [] })
    } else {
      $.teach({ form: forms.access, errors: [] })
    }
  },
  [forms.access]: async (state, target) => {
    const errors = []
    const { storageHost } = $.learn()
    try {
      await provisionPersonaKeycard({ host: storageHost })
    } catch(e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      errors.push(errorMessage)
    }

    if(errors.length === 0) {
      $.teach({ form: forms.success, errors: [] })
    } else {
      $.teach({ errors })
    }
  },
  [forms.first]: (state, target) => {
    $.teach({ form: forms.first, errors: [] })
  },
  [forms.second]: (state, target) => {
    $.teach({ form: forms.second, errors: [] })
  },
  [forms.leave]: (state, target) => {
    target.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: 'done',
      }
    }))
  },
}

$.when('activated', 'secure-persona', (event) => {
  $.teach({ form: forms.access })
})

$.when('click', '[data-logout]', (event) => {
  handleSessionEnd()
  $.teach({ form: forms.first })
})


$.when('click', '[data-submit]', async (event) => {
  const root = event.target.closest($.link)
  $.teach({ errors: [], loading: true })

  const { submit } = event.target.dataset
  if(formValidators[submit]) {
    await formValidators[submit]($.learn(), root)
  }

  $.teach({ loading: false })
})

$.style(`
  & {
    display: grid;
    gap: 1rem;
    animation: &-fade-in 1000ms ease-in-out forwards;
    background: var(--root-theme, mediumseagreen);
    opacity: 0;
    height: 100%;
    overflow: auto;
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

  & .advanced-options {
    display: none;
  }

  & .light-font {
    font-weight: 100;
  }
`)

$.when('input', '[data-bind]', function handleBind(event) {
  const { bind } = event.target.dataset
  if(bind) {
    $.teach({
      __bind: bind,
      name: event.target.name,
      value: event.target.value
    }, bindData)
  } else {
    $.teach({ 
      [event.target.name]: event.target.value,
    })
  }
})


function bindData(state, payload) {
  if(!payload.__bind) return state

  return {
    ...state,
    [payload.__bind]: {
      ...state[bind],
      ...payload
    }
  }
}

$.draw((target) => {
  const { form, errors, loading } = $.learn()
  const html = formRenderers[form] ? formRenderers[form](target) : ''

  const cacheKey = `${form}:${loading}:${errors.length}:${errors.join(',')}`
  if(cacheKey === target.lastCacheKey) return
  target.lastCacheKey = cacheKey
  target.innerHTML = `
    <div class="wizard">
      ${html}
    </div>
  `
}, {
  beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true

      getPersona().then((persona) => {
        if(persona) {
          /*
          target.dispatchEvent(new CustomEvent('json-rpc', {
            detail: {
              jsonrpc: "2.0",
              method: 'done',
            }
          }))
          */
          $.teach({ form: forms.welcomeBack })
        } else {
          $.teach({ form: forms.first })
        }
      }).catch(() => {
        $.teach({ form: forms.first })
      })
    }
  },
  afterUpdate(target) {
    //replaceElves(target, 'plan98-icon')
  }
})

import elf from '@silly/elf'
import supabase from '@sillonious/database'

const $ = elf('secure-form')

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    name: event.target.name,
    value: event.target.value
  }, (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        fields: state[bind].fields.map(field => {
          if(field.name === payload.name) {
            field.value = payload.value
          }

          return field
        })
      }
    }
  })
})

const fieldHandlers = {
  text: (scope, field) => {
    return `
      <label class="field">
        <span class="label">${field.label} ${field.required?'*':''}</span>
        <input data-bind=${scope} name="${field.name}" ${field.required?'required':''} value="${escapeHyperText(field.value) || ''}" />
      </label>
    `
  },
  select: (scope, field) => {
    const { options } = field.data
    return `
      <label class="field">
        <span class="label">${field.label} ${field.required?'*':''}</span>
        <select data-bind="${scope}" ${field.required?'required':''} name="${field.name}">
          <option disabled>--Select--</option>
          ${Object.keys(options).map((x) => `
            <option value="${x}" ${x === field.value?'selected':''}>
              ${options[x]}
            </button>
          `).join('')}

        </select>
      </label>
    `
  },
  textarea: (scope, field) => {
    return `
      <label class="field">
        <span class="label">${field.label} ${field.required?'*':''}</span>
        <textarea data-bind=${scope} ${field.required?'required':''} name="${field.name}" value="${escapeHyperText(field.value) || ''}"></textarea>
      </label>
    `
  }
}

function renderField(field) {
  if(fieldHandlers[field.type]) {
    return fieldHandlers[field.type](this, field)
  }

  return ''
}

$.draw((target) => {
  const { title, description, fields, actionLabel } = $.learn()[target.id] || {}

  if(!fields) return 'Error loading form'

  const fieldHTML = fields.map(renderField.bind(target.id)).join('')
  return `
    <form method="post">
      <div class="form-region">
        <div class="form-wrapper">
          <div class="form-title">
            ${title}
          </div>
          <div class="form-description">
            ${description}
          </div>
          <div class="form-disclaimer">
            Fields marked (*) are required
          </div>

          ${fieldHTML}
        </div>
      </div>
      <div class="submit-region">
        <button type="submit">
          ${actionLabel}
        </button>
      </div>
    </form>
  `
}, {
  beforeUpdate: (target) => {
    if(!target.decoded) {
      target.decoded = true

      const encodedData = target.getAttribute('data')
      const rpcID = target.getAttribute('rpcID')
      const data = JSON.parse(atob(encodedData))

      $.teach({ [target.id]: { ...data, rpcID } })
    }
  }
})

$.when('submit', 'form', async event => {
  event.preventDefault()
  const { id } = event.target.closest($.link)
  const { fields, databaseTable, rpcID } = $.learn()[id] || {}

  const values = {}

  fields.map(field => {
    const { value } = event.target[field.name]
    if(value) {
      values[field.name] = value
    }
  })

  try {
    const { error } = await supabase
      .from(databaseTable)
      .insert(values)

    if(error) {
      if(rpcID) {
        self.parent.postMessage({
          type: 'human-rpc',
          response: {
            "jsonrpc": "2.0",
            id: rpcID,
            error: {
              code: '-32000',
              message: error.message,
            }
          }
        }, "*");

      }
    } else {
      if(rpcID) {
        self.parent.postMessage({
          type: 'human-rpc',
          response: {
            "jsonrpc": "2.0",
            id: rpcID,
            result: {}
          }
        }, "*");
      }

    }
    $.teach(response)

  } catch(e) {
    $.teach({ error: true, message: e.message })
    if(rpcID) {
      self.parent.postMessage({
        type: 'human-rpc',
        response: {
          "jsonrpc": "2.0",
          id: rpcID,
          error: {
            code: '-32000',
            message: 'Unable to submit form',
          }
        }
      }, "*");
    }

  }
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


$.style(`
  & {
    display: block;
    height: 100%;
  }

  & .form-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  & .form-description {
    color: rgba(0,0,0,.85);
    margin-bottom: 1rem;
  }

  & .form-disclaimer {
    font-style: italic;
    color: rgba(0,0,0,.65);
    margin-bottom: 1rem;
  }

  & form {
    display: grid;
    grid-template-rows: 1fr auto;
    max-height: 100vh;
    height: 100%;
  }

  & .form-region {
    padding: 1rem;
    overflow: auto;
  }

  & .form-wrapper {
    max-width: 320px;
    margin: 0 auto;
  }
  & .submit-region {
    padding: 1rem;
    background: rgba(0,0,0,.15);
    text-align: center;
  }

  & [type="submit"] {
    background: dodgerblue;
    border: none;
    border-radius;
    font-size: 1rem;
    font-weight: 600;
    padding: 1rem;
    color: white;
    min-width: 240px;
    border-radius: 4px;
  }

  & textarea {
    resize: none;
  }
`)

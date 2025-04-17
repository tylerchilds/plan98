import elf from '@plan98/elf'

const $ = elf('braid-plan98', {
})

function get(id) {
  return $.learn()[id] || {}
}

function set(id, key, value, nuance = {
  mergeHandler: mergeBy,
  parameters: [id]
}) {
  $.teach({ [key]: value }, nuance)
}

function mergeBy(id) {
  return (state, payload) => {

    return {
      ...state,
      [id]: {
        ...state[id],
        ...payload
      }
    }
  }
}

function render(record) {
  const headers = Object.keys(record)
  return `
    <tr>
      ${headers.map((header) => {
        return `
          <td>${record[header]}</td>
        `
      }).join('')}
    </tr>
  `
}

$.draw((target) => {
  const { error } = $.learn()
  const data = get(target.id)

  if(error) return `error`

  if(!data.records) {
    return `
      <button data-create-collection data-id="${target.id}">
        Create Collection
      </button>
    `
  }

  if(data.records.length === 0) {
    return `
      <button data-create-collection data-id="${target.id}">
        Create Record
      </button>
    `
  }

  const headers = Object.keys(data.records[0])
  return `
    <button data-create-collection>
      Create Record
    </button>
    <table>
      <thead>
        <tr>
          ${headers.map((header) => {
            return `
              <th>${header}</th>
            `
          }).join('')}
        </tr>
      </thead>
      ${data.records.map(render).join('')}
    </table>
  `
})

$.when('input', '[data-bind]', (event) => {
  const { key, value } = event.target
  const { id } = event.target.dataset
  set(id, key, value)
})

$.when('click', '[data-create-collection]', (event) => {
  const { id } = event.target.dataset
  set(id, 'records', [])
})

$.when('click', '[data-create-record]', (event) => {
  const { id } = event.target.dataset
  set(id, 'records', [])
})

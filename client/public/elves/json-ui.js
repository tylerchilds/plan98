import elf from '@plan98/elf'

const $ = elf('json-ui', {
  json: {
    string: 'hello world',
    number: 42,
    boolean: true,
    list: [
      1,
      2,
      3
    ],
    map: {
      string: 'wait, waht',
      number: -3.14,
      boolean: false,
      list: [
        { id: self.crypto.randomUUID() },
        { id: self.crypto.randomUUID() },
        { id: self.crypto.randomUUID() },
      ],
      map: {
        string: 'stahp',
        number: 0,
        boolean: null
      }
    }
  }
})

$.draw((target) => {
  const { json } = $.learn()
  console.log(json)
  return render.call('/', json)
})

function render(json) {
  if(typeof json === 'undefined') {
    return renderUndefined.call(this)
  }

  if(typeof json === 'object') {
    if(Array.isArray(json)) {
      return renderArray.call(this, json)
    } else if(json) {
      return renderObject.call(this, json)
    } else {
      return renderNull.call(this)
    }
  }

  if(typeof json === 'boolean') {
    return renderBoolean.call(this, json)
  }

  if(typeof json === 'string') {
    return renderString.call(this, json)
  }

  if(typeof json === 'number') {
    return renderNumber.call(this, json)
  }
}
function renderNull(string) {
  return undefinedBehavior.call(this)
}

function renderUndefined(string) {
  return undefinedBehavior.call(this)
}

function undefinedBehavior() {
  return `
    <button data-path="${this}">
      +
    </button>
  `
}

function renderObject(object) {
  const newKey = object.__key
  return `
    <div class="object">{
      ${Object.keys(object).length > 0 ? Object.keys(object).map((key) => {
        return `
          <input data-bind="${this}" name="${key}" value="${key}">
          ${render(object[key])}
        `
      }).join(''): ''} 
      <input name="__key" value="${newKey}">
      ${undefinedBehavior.call(`${this}/${newKey}`)}
    }</div>
  `
}

function renderArray(array) {
  return `
    <div class="array">[
      ${array.map((key, index) => {
        return `
          ${render(key)}
        `
      }).join('')} 
      ${undefinedBehavior.call(`${this}/${array.length}`)}
    ]</div>
  `
}


function renderBoolean(bool) {
  return `
    <input type="checkbox" data-path="${this}" data-type="boolean" />
  `
}

function renderString(string) {
  return `
    <input type="text" data-path="${this}" data-type="string" value="${string}" />
  `
}

function renderNumber(bool) {
  return `
    <input type="number" data-path="${this}" data-type="number" />
  `
}

$.when('input', '[data-type="string"]', (event) => {
  const { value, dataset } = event.target
  const { path } = dataset
  $.teach({ path, value }, updatePath)
})


$.when('input', '[data-type="number"]', (event) => {
  const { path } = event.target.dataset
  const value = parseFloat(event.target.value)
  $.teach({ path, value }, updatePath)
})


$.when('change', '[data-type="boolean"]', (event) => {
  const { path } = event.target.dataset
  const value = event.target.checked
  $.teach({ path, value }, updatePath)
})

const typeMerger = {
  'object': (state, key, value) => {
      if(!key) {
        return { ...state }
      }
      return {
        ...state,
        [key]: value
      }
  },
  'array': (state, key, value) => {
      const newState = [...state]
      if(!key) {
        return newState
      }

      newState[key] = value
      return newState
  },
  'boolean': (newState, key, value) => {
    return newState
  }
}

function type(value) {
  if(typeof value === 'undefined') {
    return renderUndefined.call(this)
  }

  if(typeof value === 'object') {
    if(Array.isArray(value)) {
      return 'array'
    } else if(value) {
      return 'object'
    } else {
      return 'null'
    }
  }

  if(typeof value === 'boolean') {
    return typeof value
  }

  if(typeof value === 'string') {
    return typeof value
  }

  if(typeof value === 'number') {
    return typeof value
  }
}

function updatePath(state, { path, value }) {
  const newState = { ...state }
  const segments = path.split('/').filter(x => x)
  if(segments.length > 0) {
    newState.json = segments.reduce((json, key, i) => {
      if(i === path.length) {
        json[key] = value
      } else {
        json[key] = typeMerger[type(json)](json, key, value)
      }
      return json
    }, newState.json)

  } else {
    newState.json = value
  }
  return newState
}

$.when('click', '[data-define]', (event) => {
  const { define } = event.target.dataset

  console.log(define)
})

$.style(`
  & {
    display: block;
    height: 100%;
    white-space: preserve;
  }
`)

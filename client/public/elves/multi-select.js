import elf from "@silly/elf"
import { innerHTML } from 'diffhtml'
import lunr from 'lunr'

const $ = elf('multi-select')

const emptySelector = {
  selections: [],
  suggestions: [],
  suggestIndex: null,
}

async function subscribe(target) {
  if(target.subscribed) return
  target.subscribed = true

  try {
    const { options } = await fetch(target.getAttribute('options'))
      .then(res => res.json())
    target.idx = lunr(function () {
      this.ref('option')
      this.field('option')

      target.documents = []
      options.map((option) => {
        this.add({ option })
        target.documents.push({ option })
      })
    })

    setState(target, {
      suggestions: target.idx.search('')
    })
  } catch (e) {
    console.info('subscription failed for ' + target.id)
    console.error(e)
    return
  }
}

function documents(target) {
  return target.closest($.link).documents || []
}

function idx(target) {
  return target.closest($.link).idx || (() => null)
}

$.draw(target => {
  const id = target.id
  subscribe(target)
  const label = target.getAttribute('label')
  const {
    selections,
    query,
    focused
  } = getState(target)

  return `
    <div class="field multiple ${focused ? 'focused': ''}">
      <label class="label" for="field-${target.id}">${label}</label>
      <div class="selections">
        ${selections.map((item) => {
          return `
            <span class="tab">
              ${item.option}
              <button data-remove="${item.option}">
                x
              </button>
            </span>`
        }).join('')}
      </div>
      <input placeholder="query" value="${query || ''}" name="field-${target.id}" autocomplete="off" class="query" data-id="${id}"/>
      <div class="suggestions"></div>
    </div>
  `
}, {
  afterUpdate: (target) => {
    const id = target.id

    {
      const {
        suggestions,
        suggestIndex,
        focused
      } = getState(target)
      const maybies = target.querySelector('.suggestions')
      if(focused && maybies) {
        const start = Math.max(suggestIndex - 5, 0)
        const end = Math.min(suggestIndex + 5, suggestions.length)

        innerHTML(maybies, `
          <div class="suggestion-box">${suggestions.slice(start, end).map((x, i) => {
              const item = documents(target).find(y => {
                return x.ref === y.option
              })

              return `
                <button type="button" class="result ${suggestIndex === i + start ? 'active': ''}" data-id="${id}" data-option="${item.option}" data-index="${i}">
                    ${item.option}
                </button>
              `
            }).join('')}</div>
        `)
      }
    }
  }
})

function defaultMerge(state, payload) {
  console.log('id', payload.id)
  return {
    ...state,
    [payload.id]: {
      ...emptySelector,
      ...state[payload.id],
      ...payload.data
    }
  }
}

function setState(target, data, merge = defaultMerge) {
  const id = target.closest($.link).id
  $.teach({ data, id }, merge)
}

function getState(target) {
  const id = target.closest($.link).id
  return $.learn()[id] || emptySelector
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '.query', event => {
  const { suggestions, suggestIndex } = getState(event.target)
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestions.length) return
    setState(event.target, { suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestions.length - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    setState(event.target, { suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, selections, suggestIndex } = getState(event.target)
    const item = documents(event.target).find(y => {
      return suggestions[suggestIndex].ref === y.option
    })

    if(item) {
      const index = selections.findIndex(({option}) => {
        return option === item.option
      })

      if(index < 0) {
        addItem(event.target, item)
      } else {
        removeItem(event.target, item.option)
      }
      return
    }
  }
})

$.when('click', '[data-remove]', event => {
  event.preventDefault()
  const item = event.target.dataset.remove
  removeItem(event.target, item)
})
$.when('click', '.result', event => {
  event.preventDefault()
  const { suggestions } = getState(event.target)

  const suggestIndex = parseInt(event.target.dataset.index)

  setState(event.target, { suggestIndex })

  const item = documents(event.target).find(y => {
    return suggestions[suggestIndex].ref === y.option
  })

  if(item) {
    $.teach({
      preventBlur: true
    })
    event.target.closest($.link).querySelector('.query').focus()
    addItem(event.target, item)
    return
  }
})

function addItem(target, item) {
  target.closest($.link).dispatchEvent(new Event('change'))
  setState(target, item, (state, payload) => {
    return {
      ...state,
      [payload.id]: {
        ...state[payload.id],
        selections: [...new Set([...state[payload.id].selections, payload.data])]
      }
    }
  })
}

function removeItem(target, item) {
  target.closest($.link).dispatchEvent(new Event('change'))
  setState(target, item, (state, payload) => {
    const index = state[payload.id].selections.findIndex(({option}) => {
      return option === payload.data
    })

    if(index < 0) return

    const selections = [...state[payload.id].selections]
    selections.splice(index, 1)
    return {
      ...state,
      [payload.id]: {
        ...state[payload.id],
        selections
      }
    }
  })
}

$.when('input', '.query', (event) => {
  const { value } = event.target;

  const suggestions = idx(event.target).search(value)

  setState(event.target, { query: value, suggestions, suggestIndex: null })
})

$.when('focus', '.query', event => {
  setState(event.target, { focused: true })
})

$.when('blur', '.query', event => {
  setTimeout(() => {
    const { preventBlur } = $.learn()

    if(preventBlur) {
      $.teach({ preventBlur: false })
      return
    }

    setState(event.target, { focused: false })
  }, 250)
})

$.style(`
  & .field.focused {
    position: relative;
    z-index: 10;
  }

  & .suggestions {
    display: block;
  }

  & .suggestions .result {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .suggestions:not(:empty) {
    display: block;
    position: relative;
    background: var(--green, mediumseagreen);
    text-align: left;
  }

  & .suggestion-box:empty {
    pointer-events: none;
  }
  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    overflow: auto;
    z-index: 100;
    max-height: calc(100vh - 3rem);
    display: flex;
    flex-direction: column;
    display: none;
  }

  & .focused .suggestion-box {
    display: block;
  }

  & .suggestion-box .result {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box .result:focus,
  & .suggestion-box .result:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .result.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }

  & [data-remove] {
    background: black;
    color: white;
    border: none;
    aspect-ratio: 1;
    padding: 2px 8px 8px;
    display: inline-grid;
    place-items: center;
    border-radius: 100%;
    border: none;
  }
`)

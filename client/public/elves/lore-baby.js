import { Self } from '@plan98/types'
import { innerHTML } from 'diffhtml'
import lunr from 'lunr'
import natsort from 'natsort'

export let p98
export const documents = [];
export let idx

const $ = Self('lore-baby', {
  suggestIndex: null,
  suggestions: [],
  src: null,
  suggesttionsLength: 0,
})

function display(target) {
  const irix = target.querySelector('.irix')
  const { src } = $.learn()
  if(!irix) return
  if(!src) return
  if(src === target.src) return
  target.src = src

  innerHTML(irix, `
    <iframe src="/app/saga-repl?src=${src}"></iframe>
  `)
}

fetch('/plan98/about').then(res => res.json()).then((data) => {
  p98 = data.plan98
  const { sagaIndex } = p98
  if(sagaIndex) {
    idx = lunr.Index.load(sagaIndex.index)
    sagaIndex.documents.forEach(x => documents.push(x))
    $.view(view, { beforeUpdate, afterUpdate })
  }
}).catch(() => {
  $.view(() => `Failed to load index...`)
})

function beforeUpdate(target) {
  const { ready } = $.model()
  if(!ready) {
    $.controller({ ready: true })
  }
}

function afterUpdate(target) {

  library(target.querySelector('.library'))

  {
    display(target)
  }

  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

}

function view(target) {
  const { ready } = $.learn()

  if(ready && !target.innerHTML) {
    return `
      <div class="library">
      </div>
      <div class="irix"></div>
    `
  }
}

function library(target) {
  const { src, filter, suggestIndex, suggestions, showSuggestions } = $.learn()

  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)

  const search = `
    <div class="search">
      <input placeholder="Search..." type="text" value="${src || ''}" name="search" autocomplete="off" />
    </div>
    <div class="suggestions">
      ${showSuggestions ? suggestions.slice(start, end).map((x, i) => {
        const item = documents.find(y => {
          return x.ref === y.path
        })

        return `
          <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
            <div class="name">
              ${item.name}
            </div>
          </button>
        `
      }).join('') : ''}
    </div>
  `

  if(target) {
    innerHTML(target, search)
    return
  } else {
    return search
  }
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const target = document.createElement('a')
      target.href = item.path

      $.teach({ src: item.path })
      document.activeElement.blur()
      return
    }
  }

  if(event.keyCode === enter && !suggestIndex) {
    const { value } = event.target

    self.history.pushState({ type: `${$.link}-navigation`, path: value }, "");
    $.teach({ src: value })
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { path } = event.target.dataset

  let { suggestIndex } = $.learn()
  const index = parseInt(event.target.dataset.index)
  const start = Math.max(suggestIndex - 5, 0)
  suggestIndex = start + index
  $.teach({ suggestIndex, src: path })
})

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, musicFilter: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ showSuggestions: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ showSuggestions: false })
    document.activeElement.blur()
  }, 250)
})


import { Self, Saga, Activities } from '@plan98/types'
import { innerHTML } from 'diffhtml'
import lunr from 'lunr'
import natsort from 'natsort'

const saga = {
  input: `<title-page
author: Your Name
title: Telling Your Story

# Ext. Public Space

Some TEXT describing FEATURES in the WILD

@ Character
& excited
> Look at this

! Remove this line later

^ Fade to black

...
`,
  output: null
}

export let p98
export const documents = [];
export let idx

const $ = Self('lore-baby', {
  edit: true,
  url: null,
  suggestIndex: null,
  suggestions: [],
  search: '/public/cdn/sillyz.computer/en-us/elevator-pitch.saga',
  input: saga.input,
  output: saga.output,
  suggestionsLength: 0,
})

const ITEM_HEIGHT = 32
const OVERSCAN = 3

async function print(event) {
  const { input } = $.learn()
  $.teach({ edit: true })
  const html = Saga(input)

  const existing = document.getElementById('__print_dialog__')
  if (existing) existing.remove()

  const dialog = document.createElement('dialog')
  dialog.id = '__print_dialog__'
  dialog.innerHTML = `
    <div class="screenplay">${html}</div>
    <div class="print-banner">
      <button class="standard-button bias-generic" id="__print_cancel__">Cancel</button>
      <button class="standard-button bias-positive" id="__print_go__">Print</button>
    </div>
    <style>
      #__print_dialog__ {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        margin: 0;
        padding: 0;
        border: none;
        overflow-y: auto;
        background: white;
        z-index: 9000;
      }
      #__print_dialog__::backdrop { display: none; }
      .print-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: .75rem 1rem;
        display: flex;
        gap: .5rem;
        justify-content: flex-end;
        z-index: 9001;
      }
      title-page {
        display: block;
        break-after: page;
        page-break-after: always;
        height: 9in;
      }
      @page { size: letter portrait; margin: 1in; }
      @media print {
        .print-banner { display: none; }
      }
    </style>
  `

  document.body.appendChild(dialog)
  dialog.showModal()

  const beforePrint = () => {
    const screenplay = dialog.querySelector('.screenplay')
    Array.from(document.body.children).forEach(el => {
      if (el !== dialog) {
        el.dataset.printHidden = el.style.display
        el.style.display = 'none'
      }
    })
    dialog.style.display = 'none'
    document.body.appendChild(screenplay)
    screenplay.style.cssText = `
      display: block !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      position: static !important;
      clip: auto !important;
      clip-path: none !important;
    `
    document.body.style.cssText = 'margin:0;padding:0;background:white;overflow:visible;height:auto;'
  }

  const afterPrint = () => {
    Array.from(document.body.children).forEach(el => {
      if ('printHidden' in el.dataset) {
        el.style.display = el.dataset.printHidden
        delete el.dataset.printHidden
      }
    })
    const screenplay = document.body.querySelector('.screenplay')
    if (screenplay) dialog.insertAdjacentElement('afterbegin', screenplay)
    dialog.style.display = ''
    document.body.style.cssText = ''
  }

  window.addEventListener('beforeprint', beforePrint)
  window.addEventListener('afterprint', afterPrint)

  document.getElementById('__print_go__').onclick = () => window.print()

  document.getElementById('__print_cancel__').onclick = () => {
    window.removeEventListener('beforeprint', beforePrint)
    window.removeEventListener('afterprint', afterPrint)
    dialog.close()
    dialog.remove()
  }
}

function pitch(event) {
  const { input } = $.learn()
  const url = `/app/saga-pitch?data=${encodeURIComponent(btoa(input))}`
  $.teach({ edit: false, url })
}

function parade(event) {
  const { input } = $.learn()
  const data = encodeURIComponent(btoa(input))
  $.teach({ edit: false, url: null, data })
}

function search(event) {
  $.teach({ search: '' })
  query('')
  const root = event.target.closest($.link)
  root.querySelector('input[name="search"]').focus()
}

$.when('click', '[data-parade]', parade)
$.when('click', '[data-print]', print)
$.when('click', '[data-pitch]', pitch)
$.when('click', '[data-search]', search)

fetch('/plan98/about').then(res => res.json()).then((data) => {
  p98 = data.plan98
  const { sagaIndex } = p98
  if(sagaIndex) {
    idx = lunr.Index.load(sagaIndex.index)
    sagaIndex.documents.forEach(x => documents.push(x))
    $.view(render, { beforeUpdate, afterUpdate })
  }
}).catch(() => {
  $.view(() => `Failed to load index...`)
})

function render(target) {
  const { ready } = $.learn()

  if(ready && !target.innerHTML) {
    return `
      <div class="action-bar">
        <button data-search class="classic-button">
          <sl-icon name="search"></sl-icon>
        </button>
        <div class="library">
        </div>
        <button data-pitch class="classic-button">
          <sl-icon name="projector"></sl-icon>
        </button>
        <button data-print class="classic-button">
          <sl-icon name="printer"></sl-icon>
        </button>
      </div>
      <div class="irix"></div>
    `
  }
}

function beforeUpdate(target) {
  const { ready, search } = $.model()
  if(!ready) {
    $.controller({ ready: true })
  }

  {
    const q = target.getAttribute('q')
    const src = target.getAttribute('src') || search
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        const input = decodeURIComponent(q)
        $.teach({ input })
      }
      if(src) {
        fetch(src).then(async (res) => {
          $.teach({ input: await res.text() })
        })
      }
    }
  }
}

function afterUpdate(target) {
  library(target.querySelector('.library'))
  display(target)
}

function escapeHyperText(text = '') {
  if(!text) return ''
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

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

function display(target) {
  const { edit, url, data, input } = $.learn()
  const irix = target.querySelector('.irix')
  if (!irix) return
  if (!input) return

  if (!edit && url) {
    if (target.lastUrl !== url) {
      target.lastUrl = url
      innerHTML(irix, `<iframe src="${url}" frameborder="0"></iframe>`)
    }
    return
  }

  if (!edit && data) {
    if (target.lastParade !== data) {
      target.lastParade = data
      innerHTML(irix, `<hello-as2 data="${data}"></hello-as2>`)
    }
    return
  }

  target.lastParade = null
  target.lastUrl = null
  innerHTML(irix, `
    <textarea
      name="input"
      data-bind="input"
      placeholder="Say it, don't spray it."
      value="${escapeHyperText(input)}"
    ></textarea>
  `)
}

function getVirtualWindow(scrollTop, containerHeight, totalItems) {
  const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT)
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT)
  const start = Math.max(0, visibleStart - OVERSCAN)
  const end = Math.min(totalItems - 1, visibleEnd + OVERSCAN)
  return { start, end }
}

function renderVirtualList(container, suggestions, suggestIndex) {
  const totalItems = suggestions.length
  const scrollTop = container.scrollTop
  const containerHeight = container.clientHeight || 300

  const { start, end } = getVirtualWindow(scrollTop, containerHeight, totalItems)

  const paddingTop = start * ITEM_HEIGHT
  const paddingBottom = Math.max(0, (totalItems - end - 1) * ITEM_HEIGHT)

  const items = suggestions.slice(start, end + 1).map((x, i) => {
    const globalIndex = start + i
    const item = documents.find(y => y.path === x.ref)
    if (!item) return ''
    return `
      <button
        type="button"
        class="auto-item ${suggestIndex === globalIndex ? 'active' : ''}"
        data-name="${item.name}"
        data-path="${item.path}"
        data-index="${globalIndex}"
        style="height:${ITEM_HEIGHT}px"
      >
        <div class="name">${item.name}</div>
      </button>
    `
  }).join('')

  innerHTML(container, `
    <div class="virtual-spacer-top" style="height:${paddingTop}px"></div>
    ${items}
    <div class="virtual-spacer-bottom" style="height:${paddingBottom}px"></div>
  `)
}

function library(target) {
  if (!target) return
  const { search, suggestions, suggestIndex, showSuggestions } = $.learn()

  if (!target.libraryInitialized) {
    target.libraryInitialized = true
    innerHTML(target, `
      <div class="search">
        <input placeholder="Search..." data-bind type="text" value="${escapeHyperText(search || '')}" name="search" autocomplete="off" />
      </div>
      <div class="suggestions"></div>
    `)

    const suggestionsEl = target.querySelector('.suggestions')

    suggestionsEl.addEventListener('scroll', () => {
      const { suggestions, showSuggestions } = $.learn()
      if (!showSuggestions || !suggestions.length) return

      // Update DOM directly during scroll — bypass state entirely
      renderVirtualList(suggestionsEl, suggestions, null)

      // Only commit suggestIndex to state once scroll settles
      clearTimeout(suggestionsEl._scrollSettle)
      suggestionsEl._scrollSettle = setTimeout(() => {
        const newIndex = Math.round(suggestionsEl.scrollTop / ITEM_HEIGHT)
        const clamped = Math.max(0, Math.min(suggestions.length - 1, newIndex))
        $.teach({ suggestIndex: clamped })
      }, 150)
    }, { passive: true })
  }

  const input = target.querySelector('input[name="search"]')
  if (input && document.activeElement !== input) {
    input.value = search || ''
  }

  const suggestionsEl = target.querySelector('.suggestions')
  if (!suggestionsEl) return

  if (!showSuggestions || suggestions.length === 0) {
    innerHTML(suggestionsEl, '')
    return
  }

  renderVirtualList(suggestionsEl, suggestions, suggestIndex)

  // Sync scroll to suggestIndex when driven by keyboard
  if (suggestIndex !== null) {
    const itemTop = suggestIndex * ITEM_HEIGHT
    const itemBottom = itemTop + ITEM_HEIGHT
    const { scrollTop, clientHeight } = suggestionsEl
    if (itemTop < scrollTop) {
      suggestionsEl.scrollTop = itemTop
    } else if (itemBottom > scrollTop + clientHeight) {
      suggestionsEl.scrollTop = itemBottom - clientHeight
    }
  }
}

const down = 40;
const up = 38;
const enter = 13;

$.when('keydown', 'input[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()

  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength - 1) return
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
    const item = documents.find(y => suggestions[suggestIndex].ref === y.path)

    if(item) {
      fetch(item.path).then(async (res) => {
        $.teach({ input: await res.text() })
      })
      $.teach({ search: item.path, data: null, edit: true })
      document.activeElement.blur()
      return
    }
  }

  if(event.keyCode === enter && !suggestIndex) {
    const { value } = event.target
    self.history.pushState({ type: `${$.link}-navigation`, path: value }, "")
    fetch(value).then(async (res) => {
      $.teach({ input: await res.text() })
    })
    $.teach({ search: value, data: null, edit: true })
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { path } = event.target.dataset
  const index = parseInt(event.target.closest('.auto-item').dataset.index)
  fetch(path).then(async (res) => {
    $.teach({ input: await res.text() })
  })
  $.teach({ showSuggestions: false, suggestIndex: index, data: null, search: path, edit: true })
})

$.when('input', 'input[name="search"]', (event) => {
  const { value } = event.target
  query(value)
})

function query(value) {
  const sort = natsort()
  const suggestions = idx.search(value).sort((a, b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length })
}

$.when('focus', 'input[name="search"]', event => {
  $.teach({ showSuggestions: true })
})

$.when('blur', 'input[name="search"]', event => {
  const next = event.relatedTarget
  if (next && next.closest('.suggestions')) return
  $.teach({ showSuggestions: false })
})

// Desktop wheel — scaled down for deliberate feel, snap handles landing
document.addEventListener('wheel', (event) => {
  const suggestionsEl = event.target.closest('.suggestions')
  if (!suggestionsEl) return
  event.preventDefault()
  suggestionsEl.scrollTop += event.deltaY * 0.3
}, { passive: false })

$.skin(`
  @media print {
    html, body {
      height: 100%;
      padding: 0;
      margin: 0;
    }
    [data-print] {
      display: none;
    }
    #eruda{
      display: none !important;
    }
  }


  @page {
    size: 8.5in 11in;
    margin: 1in 1in 1in 1.5in;
  }

  @page {
    @top-right {
      content: counter(page) '.';
    }
  }

  @page:first {
    @top-right {
      content: '';
    }
  }

  & {
    position: relative;
    width: 100%;
    max-height: 100%;
    display: grid;
    height: 100%;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  & .search {
    pointer-events: all;
    position: relative;
  }

  & .search img {
    display: block;
  }

  & .search input {
    color: #222;
    display: block;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: .9rem;
    padding: 4px;
    margin: 0 auto;
    width: 100%;
    border-radius: 0;
    border: none;
  }

  & .suggestions {
    display: block;
    overflow-y: auto;
    overflow-x: hidden;
    position: absolute;
    left: 0;
    right: 0;
    z-index: 500;
    max-height: 60vh;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
  }

  & .virtual-spacer-top,
  & .virtual-spacer-bottom {
    display: block;
    width: 100%;
  }

  & .suggestions .auto-item {
    color: #999;
    background: #000;
    border: none;
    transition: all 100ms ease-in-out;
    padding: 0 .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    scroll-snap-align: start;
  }

  & .suggestions .auto-item:focus,
  & .suggestions .auto-item:hover {
    color: #fff;
    background: #555;
  }

  & .suggestions .auto-item.active {
    color: dodgerblue;
    background: lemonchiffon;
  }

  & .suggestions .auto-item .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & [data-suggestion] {
    display: block;
  }

  & .action-bar {
    display: grid;
    gap: 2px;
    grid-template-columns: auto 1fr auto auto auto;
    background: #ccc;
    padding: 2px;
  }

  & .action-bar .classic-button {
    aspect-ratio: 1;
  }

  & .title {
    color: rgba(255,255,255,.85);
    font-weight: bold;
    font-size: 1.5rem;
  }

  & .irix {
    height: 100%;
    overflow: hidden;
  }

  & .irix iframe {
    border: none;
    height: 100%;
    width: 100%;
  }

  & .irix textarea {
    border: none;
    height: 100%;
    width: 100%;
    resize: none;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    padding: .5rem;
    border-radius: 0;
  }

  & .output {
    height: 100%;
    overflow: auto;
    padding: .5rem;
  }

  & .output .textarea {
    white-space: preserve;
  }

  & .invisible {
    display: none;
  }

`)

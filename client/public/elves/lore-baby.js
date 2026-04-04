import { Self, Saga, Activities } from '@plan98/types'
import { innerHTML } from 'diffhtml'
import lunr from 'lunr'
import natsort from 'natsort'
import { vim, Vim } from "@replit/codemirror-vim"

import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

import {
  basicSetup
} from "codemirror"

import { sagaSyntaxHighlighter, sagaTheme } from './saga-highlighter.js'

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const srcNode = target.closest('[src]')

    if(srcNode) {
      const src = srcNode.getAttribute('src')
      const file = update.view.state.doc.toString()
      $.controller({ [src]: { file, src }})
    }
	}
}

function sourceFile() {
  const data = $.model()
  return data[data.src] || {}
}

const saga = {
  output: null
}

export let p98
export const documents = [];
export const docMap = new Map();
export let idx

const $ = Self('lore-baby', {
  edit: true,
  url: null,
  suggestIndex: null,
  suggestions: [],
  src: '/public/cdn/sillyz.computer/en-us/elevator-pitch.saga',
  output: saga.output,
  suggestionsLength: 0,
})

const ITEM_HEIGHT = 32
const OVERSCAN = 3

async function print(event) {
  const { file } = sourceFile()
  $.controller({ edit: true })
  const html = Saga(file)

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
  const { edit } = $.model()

  if(!edit) {
    $.controller({ edit: true, url: null, data: null })
  } else {
    const { file } = sourceFile()
    const url = `/app/saga-pitch?data=${encodeURIComponent(btoa(file))}`
    $.controller({ edit: false, url })
  }
}

function parade(event) {
  const { edit } = $.model()

  if(!edit) {
    $.controller({ edit: true, url: null, data: null })
  } else {
    const { file } = sourceFile()
    const data = encodeURIComponent(btoa(file))
    $.controller({ edit: false, url: null, data })
  }
}

function search(event) {
  $.controller({ search: '', suggestions: [], suggestIndex: null, showSuggestions: true })
  const root = event.target.closest($.link)
  root.querySelector('input[name="search"]').focus()
}

$.e('click', '[data-parade]', parade)
$.e('click', '[data-print]', print)
$.e('click', '[data-pitch]', pitch)
$.e('click', '[data-search]', search)

fetch('/plan98/about').then(res => res.json()).then((data) => {
  p98 = data.plan98
  const { sagaIndex } = p98
  if(sagaIndex) {
    idx = lunr.Index.load(sagaIndex.index)
    sagaIndex.documents.forEach(x => {
      documents.push(x)
      docMap.set(x.path, x)
    })
    $.view(render, { beforeUpdate, afterUpdate })
  }
}).catch(() => {
  $.view(() => `Failed to load index...`)
})

function render(target) {
  const { ready } = $.model()
  const { file } = sourceFile()

  if(ready && !target.innerHTML) {
    target.innerHTML = `
      <div class="action-bar">
        <button data-search class="minimal-button">
          <sl-icon name="search"></sl-icon>
        </button>
        <div class="library">
        </div>
        <button data-pitch class="minimal-button">
          <sl-icon name="projector"></sl-icon>
        </button>
        <button data-print class="minimal-button">
          <sl-icon name="printer"></sl-icon>
        </button>
      </div>
      <div class="irix"></div>
      <div class="editor"></div>
    `

    const vimKeymap = vim({
      status: true, // Show Vim status line
      // Configure Vim to prevent scrolling with special handling
      // for arrow keys and space in both modes
      config: {
        insertModeKeys: {
          // Map arrow keys in insert mode to prevent scrolling
          "Up": "goLineUp",
          "Down": "goLineDown",
          "Left": "goCharLeft",
          "Right": "goCharRight" 
        },
        normalModeKeys: {
          // Explicitly map space to do nothing beyond normal Vim behavior
          "Space": " ",
          // Map arrow keys in normal mode
          "Up": "k",
          "Down": "j",
          "Left": "h",
          "Right": "l"
        }
      }
    });

    const preventKeyPropagation = EditorView.domEventHandlers({
      keydown: (event) => {
        event.stopPropagation()
        return false
      }
    })

    const config = {
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        gruvboxDark,
        vimKeymap,
        sagaSyntaxHighlighter,
        sagaTheme,
        EditorView.updateListener.of(
          persist(target, $, {})
        ),
        preventKeyPropagation
      ]
    }

    target.editorState = EditorState.create({
      ...config,
      doc: file
    })

    target.view = new EditorView({
      parent: target.querySelector('.editor'),
      state: target.editorState
    })

    requestIdleCallback(() => {
      target.view.contentDOM.addEventListener("focus", console.log)
    })
  }
}

function beforeUpdate(target) {
  const { ready, src } = $.model()
  if(!ready) {
    $.controller({ ready: true })
  }

  {
    const q = target.getAttribute('q')
    const url = target.getAttribute('src') || src
    if(!target.initialized) {
      target.initialized = true
      if(q) {
        const file = decodeURIComponent(q)
        $.controller({ src: url, [url]: { file, src: url } })
      }
      if(url) {
        fetch(url).then(async blob => {
          const file = await blob.text()
          $.controller({ src: url, [url]: { file, src: url }})
          insert(target, file)
        }).catch(e => {
          fetch(path).then(async blob => {
            const file = await blob.text()
            $.controller({ src: url, [url]: { file, src: url }})
            insert(target, file)
          }).catch(e2 => {
            console.error(e)
            console.error(e2)
          })
        })

      }
    }
  }
}

function insert(target, file) {
  if(target.view) {
    target.view.dispatch({
      changes: { from: 0, to: target.view.state.doc.length, insert: file }
    });
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

$.e('input', '[data-bind]', (event) => {
  $.controller({[event.target.name]: event.target.value })
})

function display(target) {
  const { edit, url, data } = $.model()
  const { file } = sourceFile()
  const irix = target.querySelector('.irix')
  if (!irix) return
  if (!file) return

  if (!edit && url) {
    if (target.lastUrl !== url) {
      target.lastUrl = url
      target.dataset.mode = 'browser'
      innerHTML(irix, `<iframe src="${url}" frameborder="0"></iframe>`)
    }
    return
  }

  if (!edit && data) {
    if (target.lastParade !== data) {
      target.dataset.mode = 'parade'
      target.lastParade = data
      innerHTML(irix, `<hello-as2 data="${data}"></hello-as2>`)
    }
    return
  }

  target.dataset.mode = 'edit'
  target.lastParade = null
  target.lastUrl = null
  innerHTML(irix, '')
}

function getVirtualWindow(scrollTop, containerHeight, totalItems) {
  const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT)
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT)
  const start = Math.max(0, visibleStart - OVERSCAN)
  const end = Math.min(totalItems - 1, visibleEnd + OVERSCAN)
  return { start, end }
}

function initVirtualContainer(container) {
  container.innerHTML = ''
  const top = document.createElement('div')
  const list = document.createElement('div')
  const bottom = document.createElement('div')
  top.className = 'virtual-spacer-top'
  bottom.className = 'virtual-spacer-bottom'
  container.append(top, list, bottom)
  container._vTop = top
  container._vList = list
  container._vBottom = bottom
}

function renderVirtualList(container, suggestions, suggestIndex) {
  if (!container._vList) initVirtualContainer(container)

  const totalItems = suggestions.length
  const scrollTop = container.scrollTop
  const containerHeight = container.clientHeight || 300

  const { start, end } = getVirtualWindow(scrollTop, containerHeight, totalItems)

  container._vTop.style.height = (start * ITEM_HEIGHT) + 'px'
  container._vBottom.style.height = (Math.max(0, totalItems - end - 1) * ITEM_HEIGHT) + 'px'

  const items = suggestions.slice(start, end + 1).map((x, i) => {
    const globalIndex = start + i
    const item = docMap.get(x.ref)
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

  innerHTML(container._vList, items)
}

function library(target) {
  if (!target) return
  const { src, suggestions, suggestIndex, showSuggestions } = $.model()

  if (!target.libraryInitialized) {
    target.libraryInitialized = true
    innerHTML(target, `
      <div class="search">
        <input placeholder="Search..." data-bind type="text" value="${escapeHyperText(src || '')}" name="search" autocomplete="off" />
      </div>
      <div class="suggestions"></div>
    `)

    const suggestionsEl = target.querySelector('.suggestions')

    suggestionsEl.addEventListener('scroll', () => {
      const { suggestions, showSuggestions } = $.model()
      if (!showSuggestions || !suggestions.length) return

      if (suggestionsEl._rafPending) return
      suggestionsEl._rafPending = true

      requestAnimationFrame(() => {
        suggestionsEl._rafPending = false
        renderVirtualList(suggestionsEl, suggestions, null)

        clearTimeout(suggestionsEl._scrollSettle)
        suggestionsEl._scrollSettle = setTimeout(() => {
          const newIndex = Math.round(suggestionsEl.scrollTop / ITEM_HEIGHT)
          const clamped = Math.max(0, Math.min(suggestions.length - 1, newIndex))
          $.controller({ suggestIndex: clamped })
        }, 150)
      })
    }, { passive: true })
  }

  const input = target.querySelector('input[name="search"]')
  if (input && document.activeElement !== input) {
    input.value = src || ''
  }

  const suggestionsEl = target.querySelector('.suggestions')
  if (!suggestionsEl) return

  if (!showSuggestions || suggestions.length === 0) {
    innerHTML(suggestionsEl, '')
    // Re-initialize next open so _vList refs are fresh
    delete suggestionsEl._vTop
    delete suggestionsEl._vList
    delete suggestionsEl._vBottom
    suggestionsEl.scrollTop = 0
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

$.e('keydown', 'input[name="search"]', event => {
  const root = event.target.closest($.link)
  const { suggestionsLength, suggestIndex } = $.model()

  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength) return
    $.controller({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.controller({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.model()
    const item = documents.find(y => suggestions[suggestIndex].ref === y.path)

    if(item) {
      fetch(item.path).then(async (res) => {
        const file = await res.text()
        $.controller({ src: item.path, [item.path]: { file, src: item.path }})
        insert(root, file)
      })
      $.controller({ src: item.path, data: null, edit: true })
      document.activeElement.blur()
      return
    }
  }

  if(event.keyCode === enter && !suggestIndex) {
    const { value } = event.target
    self.history.pushState({ type: `${$.link}-navigation`, path: value }, "")
    fetch(value).then(async (res) => {
      const file = await res.text()
      $.controller({ src: value, [value]: { file, src: value }})
      insert(root, file)
    })
    $.controller({ src: value, data: null, edit: true })
  }
})

$.e('click', '.auto-item', event => {
  event.preventDefault()
  const root = event.target.closest($.link)
  const { path } = event.target.dataset
  const index = parseInt(event.target.closest('.auto-item').dataset.index)
  fetch(path).then(async (res) => {
    const file = await res.text()
    $.controller({ src: path, [path]: { file, src: path }})
    insert(root, file)
  })
  $.controller({ showSuggestions: false, suggestIndex: index, data: null, src: path, edit: true })
})

$.e('input', 'input[name="search"]', (event) => {
  const { value } = event.target
  query(value)
})

function query(value) {
  const sort = natsort()
  const suggestions = idx.search(value).sort((a, b) => sort(a.ref, b.ref))
  $.controller({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length })
}

$.e('focus', 'input[name="search"]', event => {
  $.controller({ showSuggestions: true, suggestIndex: null })
})

$.e('blur', 'input[name="search"]', event => {
  const next = event.relatedTarget
  if (next && next.closest('.suggestions')) return
  $.controller({ showSuggestions: false })
})

// Ramped wheel: slow for precise nudges, fast for big flicks
// sqrt curve: small deltas stay small, large ones accelerate naturally
document.addEventListener('wheel', (event) => {
  const suggestionsEl = event.target.closest('.suggestions')
  if (!suggestionsEl) return
  event.preventDefault()

  const raw = event.deltaY
  const sign = raw < 0 ? -1 : 1
  const abs = Math.abs(raw)

  // Normalize to item units (40px = 1 item), apply sqrt ramp, then scale back.
  // A single trackpad tick (~4px raw) moves ~0.3 items — sub-item precision.
  // A confident flick (~120px raw) moves ~2.6 items — skips a few rows naturally.
  const normalized = abs / ITEM_HEIGHT
  const ramped = sign * Math.sqrt(normalized) * ITEM_HEIGHT

  suggestionsEl.scrollTop += ramped
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
    background: #282828;
    display: grid;
    height: 100%;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & .search {
    pointer-events: all;
    position: relative;
  }

  & .search img {
    display: block;
  }

  & .search input {
    color: #d79921;          /* neutral_yellow, was #ebb22e */
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
  }

  & .virtual-spacer-top,
  & .virtual-spacer-bottom {
    display: block;
    width: 100%;
  }

  & .suggestions .auto-item {
    color: #a89984;          /* light4 */
    background: #3c3836;     /* bg1 */
    border: none;
    transition: all 100ms ease-in-out;
    padding: 0 .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  & .suggestions .auto-item:focus,
  & .suggestions .auto-item:hover {
    color: #ebdbb2;          /* fg */
    background: #504945;     /* bg2 */
  }

  & .suggestions .auto-item.active {
    color: #fbf1c7;          /* fg0 */
    background: #665c54;     /* bg3 */
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
    background: rgba(0,0,0,.5);
    color: #8ec07c;
    padding: 2px;
  }

  & .action-bar .minimal-button {
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

  & .cm-vim-panel input {
    color: white;
  }

  & .editor {
    height: 100%;
    overflow: auto;
    display: none;
  }

  & .cm-editor {
    height: 100%;
  }

  &[data-mode="edit"] .irix {
    display: none;
  }

  &[data-mode="edit"] .editor {
    display: block;
  }
`)

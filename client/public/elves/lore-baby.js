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
  suggestIndex: null,
  suggestions: [],
  search: '/public/cdn/sillyz.computer/en-us/on-software-authorship.saga',
  input: saga.input,
  output: saga.output,
  suggestionsLength: 0,
})


async function print(event) {
  const template = await fetch('/').then(async res => {
    return await res.text()
  })
  const { input } = $.learn()
  const html = Saga(input)
  if(event.target.preview) event.target.preview.close()
  event.target.preview = window.open('', 'PRINT');
  const { preview } = event.target

  const page = new DOMParser().parseFromString(template, "text/html");
  page.body.innerHTML = ''
  page.body.insertAdjacentHTML('beforeend', `
    <div class="screenplay">
      ${html}
    </div>
    <div class="print-banner">
      <button class="standard-button bias-positive" onclick="(()=>{window.print();window.close()})()">Print</button>
      <button class="standard-button bias-generic" onclick="(()=>{window.close()})()">Cancel</button>
    </div>
    <style type="text/css">
      body {overflow: auto; height: auto !important; }
      xml-html {height: 100%; overflow: auto; }
      .print-banner {
        padding: 1rem;
        text-align: right;
        color: white;
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        z-index: 9001;
      }

      @media print {
        .print-banner {
          display: none;
        }
      }
    </style>
  `)

  preview.document.write(`<!DOCTYPE html>${page.documentElement.outerHTML}`)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/
}

function pitch(event) {
  const { input } = $.learn()
  $.teach({ search: `/app/paper-pocket?data=${encodeURIComponent(btoa(input))}&rom=silly-script` })
}

function parade(event) {
  const { input } = $.learn()
  console.log({ activities: Activities(input) })
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
$.when('click', '[data-edit]', () => $.teach({ output: null }))

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
        <button data-parade class="classic-button">
          <sl-icon name="joystick"></sl-icon>
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

  {
    display(target)
  }
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
  const { input } = $.learn()
  const irix = target.querySelector('.irix')
  if(!irix) return
  if(!input) return
  innerHTML(irix, `
    <textarea
      name="input"
      data-bind="input"
      placeholder="Say it, don't spray it."
      value="${escapeHyperText(input)}"
    ></textarea>
  `)
}

function library(target) {
  const { search, suggestions, suggestIndex, showSuggestions } = $.learn()

  const start = Math.max(suggestIndex - 3, 0)
  const end = Math.min(suggestIndex + 4, suggestions.length - 1)

  const html = `
    <div class="search">
      <input placeholder="Search..." data-bind type="text" value="${escapeHyperText(search || '')}" name="search" autocomplete="off" />
    </div>
    <div class="suggestions">
      ${showSuggestions ? suggestions.slice(start, end).map((x, i) => {
        const globalIndex = start + i
        const item = documents.find(y => y.path === x.ref)

        return `
          <button type="button" class="auto-item ${suggestIndex === globalIndex ? 'active' : ''}" data-name="${item.name}" data-path="${item.path}" data-index="${globalIndex}">
            <div class="name">
              ${item.name}
            </div>
          </button>
        `
      }).join('') : ''}
    </div>
  `

  if(target) {
    innerHTML(target, html)
    return
  } else {
    return html
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
      $.teach({ search: item.path })
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
    $.teach({ search: value })
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { path } = event.target.dataset
  const index = parseInt(event.target.closest('.auto-item').dataset.index)
  fetch(path).then(async (res) => {
    $.teach({ input: await res.text() })
  })
  $.teach({ showSuggestions: false, suggestIndex: index, search: path })
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

$.when('mouseenter', '.auto-item', event => {
  const index = parseInt(event.target.closest('.auto-item')?.dataset.index)
  if (isNaN(index)) return
  if (Math.abs(velocity) < 0.5) {
    $.teach({ suggestIndex: index })
  }
})

// --- wheel / momentum scroll ---

let rafId = null
let velocity = 0
let accumulated = 0
const THRESHOLD = 20

document.addEventListener('wheel', (event) => {
  if (!event.target.closest('.suggestions')) return
  event.preventDefault()

  accumulated += event.deltaY
  velocity += event.deltaY * 0.1

  if (rafId) cancelAnimationFrame(rafId)

  function tick() {
    if (Math.abs(velocity) < 0.5) {
      velocity = 0
      accumulated = 0
      return
    }

    const shouldStep = Math.abs(accumulated) >= THRESHOLD

    if (shouldStep) {
      const { suggestionsLength } = $.learn()
      const current = $.learn().suggestIndex ?? 0
      const next = Math.max(0, Math.min(suggestionsLength - 1, current + Math.sign(velocity)))

      $.teach({ suggestIndex: next })

      const active = document.querySelector('.suggestions .auto-item.active')
      if (active) active.scrollIntoView({ block: 'nearest', behavior: 'instant' })

      accumulated -= Math.sign(accumulated) * THRESHOLD
    }

    velocity *= 0.85
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
}, { passive: false })

// --- touch scroll (mobile) ---

let touchStartY = 0
let touchStartIndex = null

$.when('touchstart', '.suggestions', event => {
  touchStartY = event.touches[0].clientY
  touchStartIndex = $.learn().suggestIndex ?? 0
})

$.when('touchmove', '.suggestions', event => {
  event.preventDefault()
  const dy = touchStartY - event.touches[0].clientY
  const { suggestionsLength } = $.learn()

  const delta = Math.round(dy / 48)
  const next = Math.max(0, Math.min(suggestionsLength - 1, (touchStartIndex ?? 0) + delta))

  $.teach({ suggestIndex: next })

  const active = document.querySelector('.suggestions .auto-item.active')
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}, { passive: false })

$.when('touchend', '.suggestions', event => {
  touchStartIndex = $.learn().suggestIndex
})

$.skin(`
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

  & .suggestions .auto-item,
  & .search .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, lemonchiffon);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .search .auto-item:focus,
  & .search .auto-item:hover {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .suggestions {
    display: flex;
    text-align: left;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    z-index: 500;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }

  & .suggestions .auto-item {
    color: #999;
    background: #000;
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
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

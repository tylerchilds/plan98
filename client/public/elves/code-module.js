import module from '@silly/tag'
import { toast } from './plan98-toast.js'
import eruda from 'eruda'
import { vim } from "@replit/codemirror-vim"

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const $ = module('code-module')

// be honest; we want a debugger whenever we code
eruda.init();

function sourceFile(target) {
  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
  const data = $.learn()[src] || {}

  if(target.initialized) return data
  target.initialized = true

  return data.file
    ? data
    : (function initialize() {
      schedule(() => {
        fetch(src).then(res => res.text()).then(file => {
          $.teach({ [src]: { file, src }})
        })
      })
      return data
    })()
}

$.when('click', '.preview', (event) => {
  const src = event.target.closest($.link).getAttribute('src')
  self.open(src, '_blank')
})
$.when('click', '.privatize', (event) => {
  // use this function to encrypt local copies
  // should only be visible when end 2 end encryptable
})
$.when('click', '.publish', (event) => {
  const { file, src } = sourceFile(event.target)

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer no-key"
  }

  $.teach({ thinking: true })

  fetch(src, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      file,
      src
    })
  }).then((response) => response.text()).then((result) => {
    const data = JSON.parse(result)
    toast(data.error ? 'bad' : 'good')
  })
})

$.when('change', 'select', (event) => {
  const { value } = event.target
  const root = event.target.closest($.link)
  root.setAttribute('src', value)
  $.teach({ src: value })
  root.initialized = false
  root.view = null
})



$.draw(target => {
  const { src, activeMenu } = $.learn()
  const { file } = sourceFile(target)
  const stack = target.getAttribute('stack')

  if(file && !target.view) {
    const amp = `
        <div class="menu-item">
          <button data-menu-target="file" class="${activeMenu === 'file'?'active':''}">
            File
          </button>
          <div class="menu-actions" data-menu="file">
            <button class="preview" data-src="${src}">Preview</button>
            <button class="privatize">Privatize</button>
            <button class="publish">Publish</button>
          </div>
        </div>
    `

    target.innerHTML = stack ? `
      <div class="actions">
        ${amp}
        <select class="select menu-item right">
          ${stack.split(',').map((filename) => {
            return `<option value="${filename}" ${filename === src ? 'selected' : ''}>${filename}</option>`
          }).join('')}
        </select>
      </div>
    `: `
      <div class="actions">
        ${amp}
      </div>
    `

    const config = {
      extensions: [
        basicSetup,
        EditorView.updateListener.of(
          persist(target, $, {})
        )
      ]
    }

    target.editorState = EditorState.create({
      ...config,
      doc: file
    })

    target.view = new EditorView({
      parent: target,
      state: target.editorState
    })
  }
})

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const src = target.closest('[src]').getAttribute('src')
		const file = update.view.state.doc.toString()
    $.teach({ [src]: { file, src }})
	}
}


$.style(`
  & {
		display: block;
    overflow: hidden;
    height: 100%;
    max-height: 100%;
    position: relative;
    padding-top: 2rem;
    background: mediumseagreen;
  }

  & select {
    width: 100%;
    max-width: 100%;
    text-overflow: ellipsis;
    background: black;
    color: rgba(255,255,255,.65);
    border: none;
    padding: 0 .5rem;
    height: 2rem;
  }

  & .cm-content {
    background: rgba(255,255,255,.85);
  }

  & .cm-editor {
    height: 100%;
    overflow: auto;
  }

  & .select {
    position: absolute;
    top: 0rem;
    left: 0;
    right: 0;
  }

  & .actions {
    z-index: 10;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding-right: 2rem;
  }

  & .actions button {
    background: black;
    color: rgba(255,255,255,.85);
    border: none;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    height: 2rem;
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    color: #fff;
    background: #54796d;
  }

  & [name="navi"] {
    pointer-events: none;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    margin: auto;
    height: 2rem;
    display: block;
    text-align: center;
    gap: .5rem;
    z-index: 3;
  }

  & .menu-item {
    position: relative;
  }

  & .menu-actions {
    display: none;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    background: #54796d;
  }

  & [data-menu-target].active + .menu-actions {
    display: block;
  }

  & .menu-actions  button {
    width: 100%;
    text-align: left;
  }

  & .menu-item.right {
    margin-left: auto;
  }

  & .cm-editor .cm-gutters {
    background: black;
    color: rgba(255,255,255,.65);
  }

  & .cm-editor .cm-content {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & .cm-editor .cm-activeLine {
    background: mediumseagreen;
    color: white;
  }

  & .cm-editor .cm-activeLineGutter {
    background: mediumseagreen;
  }

  & .cm-editor .cm-cursor {
    border-left-color: white;
  }
`)

$.when('click', '.action-accordion', async (event) => {
  event.target.classList.toggle('active')
})

function schedule(x, delay=1) { setTimeout(x, delay) }

$.when('click', '[data-menu-target]', (event) => {
  const active = event.target.closest($.link).querySelector(`[data-menu-target].active`)
  if(active){
    active.classList.remove('active')
  }

  event.target.classList.add('active')
  event.stopImmediatePropagation()
})

$.when('click', '*', () => {
  $.teach({ activeMenu: null })
  const active = event.target.querySelector(`[data-menu-target].active`)
  if(active){
    active.classList.remove('active')
  }
})


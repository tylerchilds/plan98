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
  const { src } = $.learn()
  const { file } = sourceFile(target)
  const stack = target.getAttribute('stack')

  if(file && !target.view) {
    const amp = `
      <div class="actions">
        <button class="privatize">Privatize</button>
      </div>
      <div name="navi">
        <button class="publish">Publish</button>
      </div>
    `

    target.innerHTML = stack ? `
      <select class="select">
        ${stack.split(',').map((filename) => {
          return `<option value="${filename}" ${filename === src ? 'selected' : ''}>${filename}</option>`
        }).join('')}
      </select>
      ${amp}
    `: `
      ${amp}
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
  }

  & select {
    width: 100%;
    max-width: 100%;
    text-overflow: ellipsis;
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

  & .action-accordion {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 50px;
    height: 50px;
    background: rgba(0,0,0,.65);
    border: 2px solid dodgerblue;
    color: rgba(255,255,255,.85);
    border-radius: 100%;
    opacity: .5;
    transition: all 200ms ease-in-out;
    z-index: 10;
  }
  & .action-accordion:hover {
    background: dodgerblue;
    border: 2px solid rgba(255,255,255,1);
    opacity: 1;
  }
  & .actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    text-align: right;
    z-index: 10;
  }

  & .actions button {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    line-height: 1rem;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: .5rem;
    font-size: 1rem;
    --v-font-mono: 0;
    --v-font-casl: 1;
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    background: saddlebrown;
    color: lemonchiffon;
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

  & [name="navi"] button {
    pointer-events: all;
    background: lemonchiffon;
    color: saddlebrown;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    border: none;
    height: 2rem;
    transition: color 100ms;
    padding: .5rem 1rem;
  font-size: 1rem;
  --v-font-mono: 0;
  --v-font-casl: 1;
  --v-font-wght: 800;
  --v-font-slnt: -15;
  --v-font-crsv: 1;
  font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
  font-family: "Recursive";
  transition: background 200ms ease-in-out;
  }

  & [name="navi"] button:hover,
  & [name="navi"] button:focus {
    background: saddlebrown;
    color: lemonchiffon;
  }


`)

$.when('click', '.action-accordion', async (event) => {
  event.target.classList.toggle('active')
})

function schedule(x, delay=1) { setTimeout(x, delay) }

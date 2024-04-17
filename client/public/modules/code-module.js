import module from '@sillonious/module'
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
  const src = target.closest('[src]').getAttribute('src')
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
    target.innerHTML = stack ? `
      <select class="select">
        ${stack.split(',').map((filename) => {
          return `<option value="${filename}" ${filename === src ? 'selected' : ''}>${filename}</option>`
        })}
      </select>
      <button class="publish">Publish</button>
    `: `
      <button class="publish">Publish</button>
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
    overflow: scroll;
    height: 100%;
    max-height: 100%;
    position: relative;
    padding: 4rem 0 0;
  }

  & select {
    width: 100%;
    max-width: 100%;
    text-overflow: ellipsis;
  }

  & .cm-content {
    background: rgba(255,255,255,.85);
  }

  & .publish {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: color 100ms;
    padding: .25rem 1rem;
    position: absolute;
    top: 0;
    right: 0;
  }

  & .select {
    position: absolute;
    top: 2rem;
    left: 0;
    right: 0;
  }
`)

function schedule(x, delay=1) { setTimeout(x, delay) }

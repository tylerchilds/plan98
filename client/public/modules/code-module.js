import module from '@sillonious/module'

import {
  EditorState,
  EditorView,
  basicSetup
} from "https://esm.sh/@codemirror/basic-setup"

const $ = module('code-module')

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
          $.teach({ [src]: { file }})
        })
      })
      return data
    })()
}

$.when('click', '.publish', (event) => {
  const { file } = sourceFile(event.target)
  alert(file)
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
  const paper = target.getAttribute('paper')

  if(file && !target.view) {
    target.innerHTML = paper ? `
      <select>
        ${paper.split(',').map((filename) => {
          return `<option value="${filename}">${filename}</option>`
        })}
      </select>
    `: `
      <!--
      <button class="publish">Publish</button>
      -->
    `

    const config = {
      extensions: [
        basicSetup,
        EditorView.updateListener.of(
          persist(target, $, {})
        )
      ]
    }

    const editorState = EditorState.create({
      ...config,
      doc: file
    })

    target.view = new EditorView({
      parent: target,
      state: editorState
    })
  }
})

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const src = target.closest('[src]').getAttribute('src')
		const file = update.view.state.doc.toString()
    $.teach({ [src]: { file }})
	}
}


$.style(`
  & {
		display: block;
    overflow: scroll;
    height: 100%;
    max-height: 100%;
  }

  & .cm-content {
    background: rgba(255,255,255,.85);
  }
`)

function schedule(x, delay=1) { setTimeout(x, delay) }

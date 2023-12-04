import module from '../module.js'

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const $ = module('code-module')

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

function sourceFile(target) {
  const src = source(target)
  return state[src]
    ? state[src]
    : (function initialize() {
      fetch(src).then(res => res.text()).then((x) => {
        state[src] = { file: x }
      })
      state[src] = { file: 'loading...' }
      return state[src]
    })()
}

$.when('click', '.publish', (event) => {
  const src = source(event.target)
  const { file } = sourceFile(event.target)
  state[src].file = file
})

$.draw(target => {
  const src = source(target)
  const { file } = sourceFile(target)

  if(!file) {
    return 'loading'
  }

  if(!target.view) {
    target.innerHTML = `
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

    const state = EditorState.create({
      ...config,
      doc: file
    })

    target.view = new EditorView({
      parent: target,
      state
    })
  }
})

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const src = source(target)
		const file = update.view.state.doc.toString()
    state[src].file = file
	}
}

$.style(`
  & {
		display: block;
    max-height: 60vh;
    overflow: scroll;
  }
`)

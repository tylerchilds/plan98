import module from '../module.js'

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const $ = module('code-module')

$.when('click', '.publish', (event) => {
  const link = event.target.closest($.link).getAttribute('src')
  const { file } = $.learn()
  fetch(link, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ file })
  }).then(() => {
    window.location.href = window.location.href
  })
})

$.draw(target => {
  const link = target.getAttribute('src')
  console.log(link)
  const { file } = $.learn()

  if(!file) {
    fetch(link)
      .then(res => res.json())
      .then(({ file }) => $.teach({ file }))
    return
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

function persist(_target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

		const file = update.view.state.doc.toString()
    $.teach({ file })
	}
}

$.flair(`
  & {
		display: block;
    max-height: 60vh;
    overflow: scroll;
  }
`)

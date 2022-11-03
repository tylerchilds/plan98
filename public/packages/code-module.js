import module from '../module.js'

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const $ = module('code-module')

$.render(target => {
  const link = target.getAttribute('src')
  console.log(link)
  const { file } = $.read()

  if(!target.view) {

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
    $.write({ file })
	}
}

$.style(`
  & {
		display: block;
    max-height: 60vh;
    overflow: scroll;
  }
`)

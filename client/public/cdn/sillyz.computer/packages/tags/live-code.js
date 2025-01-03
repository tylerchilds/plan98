import { tag, signal } from "/deps.js"

import {
  EditorState,
  EditorView,
  basicSetup
} from "https://esm.sh/@codemirror/basic-setup"

const $ = tag('live-code')

$.render(target => {
  const link = target.getAttribute('src')
  const data = bus.state[link] || {}

  if(!data.file) return

  if(!target.view) {

    const config = {
      extensions: [
        basicSetup,
        EditorView.updateListener.of(
          persist(target, $, { link })
        )
      ]
    }

    const state = EditorState.create({
      ...config,
      doc: data.file
    })

    target.view = new EditorView({
      parent: target,
      state
    })
  }
})

function persist(target, $, { link }) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const data = bus.state[link] || {}
		const file = update.view.state.doc.toString()
    bus.state[link] = {
      ...data,
      file
    }
	}
}

$.style(`
  & {
		display: block;
    max-height: 60vh;
    overflow: scroll;
  }
`)

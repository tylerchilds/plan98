import elf from '@plan98/elf'
import { get, put } from './plan98-wallet.js'
import { toast } from './plan98-toast.js'
import { vim, Vim } from "@replit/codemirror-vim"
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { consoleShow, consoleHide } from './plan98-console.js'
import { shirtPost } from '@silly/sky'

import {
  basicSetup
} from "codemirror"

const $ = elf('vim-sky')

const cursors = {}

function mount(target) {
  if(target.initialized) return
  target.initialized = true

  const src = target.closest('[src]')?.getAttribute('src') || '/public/cdn/sillyz.computer/en-us/vim-sky/draft.saga'
  get(src).then(async blob => {
    const file = await blob.text()
    $.teach({ src, [src]: { file, src }})
  }).catch(e => {
    fetch(src).then(async blob => {
      const file = await blob.text()
      $.teach({ src, [src]: { file, src }})
    }).catch(e2 => {
      console.error(e)
      console.error(e2)
    })
  })
}

function sourceFile(target) {
  const src = target.closest('[src]')?.getAttribute('src') || '/public/cdn/sillyz.computer/en-us/vim-sky/draft.saga'
  const data = $.learn()[src] || {}
  return data
}

$.when('click', '.preview', (event) => {
  const src = event.target.closest($.link).getAttribute('src')
  self.open(src, '_blank')
})

$.when('click', '.launch', (event) => {
  const { src } = event.target.dataset

  self.top.location.href = src
})



$.when('click', '.debug', (event) => {
  let console = document.body.querySelector('plan98-console')
  if(!console) {
    document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
    console = document.body.querySelector('plan98-console')
  } else {
    console.classList.toggle('hidden')
  }

  consoleShow()

})

Vim.defineEx('write', 'w', function(event) {
  const root = document.querySelector($.link)
  const { file, src } = sourceFile(document.querySelector($.link))
  saveFile(src, file, { root })
});

Vim.defineEx('quit', 'q', function(event) {
  window.location.href = '/app/tiniest-violin'
});

$.when('click', '.publish', (event) => {
  const root = event.target.closest($.link)
  const { file, src } = sourceFile(event.target)
  saveFile(src, file, { root })
})

function saveFile(src, file, { root }) {

  put(src, file).then((res) => {
    if(res.error) {
      toast('Are you even allowed to save, bro?', { type: 'error' })
      root.dispatchEvent(new CustomEvent('save-error', {
        detail: {}
      }))
    } else {
      toast('File saved!', { type: 'success' })
      root.dispatchEvent(new CustomEvent('save-success', {
        detail: {}
      }))
    }
  })

  shirtPost(file).catch(console.error)
}

$.draw(target => {
  mount(target)

  const { file } = sourceFile(target)

  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="editor"></div>
    `
  }

  if(file && !target.view) {
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
        javascript(),
        html(),
        css(),
        vimKeymap,
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
      target.view.contentDOM.addEventListener("focus", deactivate)
    })
  }
}, {
  beforeUpdate: (target) => {
    {
      /*
      const { src } = $.learn()
      if(target.view && src) {
       cursors[src] = target.view.state.selection.main.head
      }
      */
    }
  },
  afterUpdate: (target) => {
    {
      const data = $.learn()
      const instanceSrc = target.closest('[src]')?.getAttribute('src') || '/public/cdn/sillyz.computer/en-us/vim-sky/draft.saga'
      const {file} = data[instanceSrc] || {}
      if(target.view && file && target.lastSrc !== instanceSrc) {
        target.lastSrc = instanceSrc
        target.view.dispatch({
          changes: { from: 0, to: target.view.state.doc.length, insert: file }
        });
      }
    }

    {
      /*
      const { src } = $.learn()
      if(target.view && cursors[src]) {
        target.view.dispatch({
          selection: { anchor: cursors[src] }
        });
      }
      */
    }
  }
})

function persist(target, $, _flags) {
	return (update) => {
    if(update.changes.inserted.length < 0) return

    const srcNode = target.closest('[src]')

    if(srcNode) {
      const src = srcNode.getAttribute('src')
      const file = update.view.state.doc.toString()
      $.teach({ [src]: { file, src }})
    }
	}
}


$.style(`
  & {
		display: block;
    overflow: hidden;
    height: 100%;
    max-height: 100%;
    position: relative;
    max-width: 100%;
    width: 100%;
  }

  & .editor {
    height: 100%;
    overflow: auto;
    font-size: 1rem;
  }

  & .cm-editor {
    height: 100%;
    overflow: auto;
  }

  & .cm-scroller {
    --v-font-wght: 400;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    --v-font-casl: 1;
    --v-font-mono: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
  }

  .cm-vim-panel input {
    color: white;
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

$.when('click', '*', deactivate)

function deactivate(event) {
  $.teach({ activeMenu: null })
  const active = event.target.closest($.link).querySelector('[data-menu-target].active')
  if(active){
    active.classList.remove('active')
  }
}

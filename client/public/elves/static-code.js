import { Self } from '@plan98/types'
import { vim, Vim } from "@replit/codemirror-vim"
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { consoleShow, consoleHide } from './plan98-console.js'

import {
  basicSetup
} from "codemirror"

const $ = Self('static-code')

const cursors = {}

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function mount(target) {
  if(target.initialized) return
  target.initialized = true

  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
  const file = target.innerHTML

  target.innerHTML = `
    <div class="editor"></div>
  `

  $.teach({ src, [src]: { file, src }})
}

function sourceFile(target) {
  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
  const data = $.learn()[src] || {}
  return data
}

$.when('click', '.preview', (event) => {
  const src = event.target.closest($.link).getAttribute('src')
  self.open(src, '_blank')
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

$.draw(target => {
  mount(target)
  const { src, activeMenu } = $.learn()
  const { file } = sourceFile(target)
  const stack = target.getAttribute('stack')

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
        //EditorView.lineWrapping,
        gruvboxDark,
        javascript(),
        html(),
        css(),
        vimKeymap,
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
      const {file} = data[data.src] || {}
      if(target.view && file && target.lastSrc !== data.src) {
        target.lastSrc = data.src
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

$.style(`
  & {
		display: block;
    overflow: hidden;
    height: 100%;
    max-height: 100%;
    position: relative;
    padding-top: 2rem;
    max-width: 100%;
    width: 100%;
  }

  & .layout {
    display: grid;
    grid-template-columns: var(--sidebar-width, 320px) 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .main-column {
    overflow: auto;
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

$.when('pointerdown', '[data-resize-sidebar]', event => {
  document.addEventListener("pointermove", resizeSidebar, false);
  document.addEventListener("pointerup", () => {
    document.removeEventListener("pointermove", resizeSidebar, false);
  }, false);
})

function resizeSidebar(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = event.touches[0].clientX
  } else {
    width = event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}


import module from '@silly/tag'
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

import {
  basicSetup
} from "codemirror"

const $ = module('was-code')

const cursors = {}

function mount(target) {
  if(target.initialized) return
  target.initialized = true

  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
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
  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
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
}

$.draw(target => {
  mount(target)
  const { activeMenu } = $.learn()
  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname

  const { file } = sourceFile(target)
  const stack = target.getAttribute('stack')

  if(!target.innerHTML) {
    const amp = `
      <div class="menu-item">
        <button data-menu-target="file" class="${activeMenu === 'file'?'active':''}">
          File
        </button>
        <div class="menu-actions" data-menu="file">
          <button class="publish">Save</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="view" class="${activeMenu === 'view'?'active':''}">
          View
        </button>
        <div class="menu-actions" data-menu="view">
          <button class="preview" data-src="${src}">Source</button>
          <button class="debug" data-src="${src}">Debugger</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="launch" class="${activeMenu === 'launch'?'active':''}">
          Launch
        </button>
        <div class="menu-actions" data-menu="launch">
          <button class="launch" data-src="/app/ur-shell">Shell</button>
          <button class="launch" data-src="/app/plan98-wallet">Wallet</button>
          <button class="launch" data-src="/app/file-surf">Files</button>
          <button class="launch" data-src="/app/multi-task">Desktop</button>
          <button class="launch" data-src="/app/mobile-device">Mobile</button>
          <button class="launch" data-src="/app/paper-pocket">Handheld</button>
          <button class="launch" data-src="/app/couch-coop">Console</button>
          <button class="launch" data-src="/app/sticky-menu">Paper</button>
        </div>
      </div>

    `

    if(stack) {
      const result = [];
      const tree = {result};

      stack.split(',').forEach(path => {
        path.split('/').reduce((r, name, i, a) => {
          if(!r[name]) {
            r[name] = {result: []};

            const extension = name.split('.')[1]
            r.result.push({name, path, extension, children: r[name].result})
          }

          return r[name];
        }, tree)
      })
      target.innerHTML = `
        <div class="actions">
          ${amp}
        </div>
        <div class="layout">
          <div class="sidebar">
            <div data-resize-sidebar></div>
            <div class="sidebar-inner">
              ${result.map(renderTree).join('')}
            </div>
          </div>
          <div class="main-column">
            <div class="editor"></div>
          </div>
        </div>

      `
    } else {
      target.innerHTML = `
        <div class="actions">
          ${amp}
        </div>
        <div class="editor"></div>
      `
    }
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
      const instanceSrc = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
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

function renderTree(tree) {
  return tree.children.length > 0 ? `
    <plan98-tree data-directory="true" ${!tree.name ? 'data-expanded="true"':''}>
      ${tree.name || ''}/
      ${ tree.children.map(renderTree).join('')}
    </plan98-tree>
  `:`
    <plan98-tree data-path="${tree.path}">
      ${tree.name || '(no name)'}
    </plan98-tree>
  `
}

$.when('click', 'plan98-tree[data-directory="true"]', (event) => {
  event.target.expanded = !event.target.expanded;
})

$.when('click', 'plan98-tree[data-path]', (event) => {
  const { path } = event.target.dataset

  const root = event.target.closest($.link)
  root.setAttribute('src', path)
  root.initialized = false
  $.teach({ src: path })
  sourceFile(root)
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

  & .sidebar {
    max-height: 100%;
    overflow: hidden;
    position: relative;
    padding-right: 10px;
    background: #282828;
    color: #ebdbb2;
  }

  & .sidebar-inner {
    overflow: auto;
    height: 100%;
    padding: 1rem 1rem 1rem 0;
  }

  & [data-resize-sidebar] {
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--sidebar-width, 320px);
    transform: translateX(-10px);
    width: 10px;
    background: #403c31;
    z-index: 10;
    cursor: col-resize;
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

  & .select {
    position: absolute;
    top: 0rem;
    left: 0;
    right: 0;
  }

  & .actions {
    z-index: 10;
    background: #7c6f64;
    border-bottom: 1px solid #403c31;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding-right: 2rem;
  }

  & .actions button {
    background: #7c6f64;
    color: #282828;
    border: none;
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
    color: #ebdbb2;
    background: #403c31;
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


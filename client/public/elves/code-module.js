import module from '@silly/tag'
import { toast } from './plan98-toast.js'
import { vim, Vim } from "@replit/codemirror-vim"
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

import {
  basicSetup
} from "codemirror"

const $ = module('code-module')

const cursors = {}

function mount(target) {
  if(target.initialized) return
  target.innerHTML = ''
  target.initialized = true

  const src = target.closest('[src]')?.getAttribute('src') || '/public' + window.location.pathname
  fetch(src).then(res => res.text()).then(file => {
    $.teach({ src, [src]: { file, src }})
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

Vim.defineEx('write', 'w', function(event) {
  const { file, src } = sourceFile(document.querySelector($.link))
  saveFile(src, file)
});

$.when('click', '.publish', (event) => {
  const { file, src } = sourceFile(event.target)
  saveFile(src, file)
})

function saveFile(src, file) {

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${authorization}`
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
    data.error
      ? toast('Are you even allowed to save, bro?', { type: 'error' })
      : toast('File saved!', { type: 'success' })
  })
}

$.when('change', 'select', (event) => {
  const { value } = event.target
  const root = event.target.closest($.link)
  root.setAttribute('src', value)
  $.teach({ src: value })
  root.initialized = false
  root.view = null
})



$.draw(target => {
  mount(target)
  const { src, activeMenu } = $.learn()
  const { file } = sourceFile(target)
  const stack = target.getAttribute('stack')

  if(file && !target.view) {
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
          <button data-menu-target="file" class="${activeMenu === 'file'?'active':''}">
            View
          </button>
          <div class="menu-actions" data-menu="file">
            <button class="preview" data-src="${src}">Raw</button>
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
              <sl-tree>
                ${result.map(renderTree).join('')}
              </sl-tree>
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

function renderTree(tree) {
  return tree.children.length > 0 ? `
    <sl-tree-item data-directory="true"">
      ${tree.name || '(root)'}
      ${ tree.children.map(renderTree).join('')}
    </sl-tree-item>
  `:`
    <sl-tree-item data-path="${tree.path}">
      ${tree.name || '(root)'}
    </sl-tree-item>
  `
}

$.when('click', 'sl-tree-item[data-directory="true"]', (event) => {
  event.target.expanded = !event.target.expanded;
})

$.when('click', 'sl-tree-item[data-path]', (event) => {
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
    color: black;
    max-width: 100%;
    width: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
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
  }

  & .sidebar {
    max-height: 100%;
    overflow: hidden;
    position: relative;
    padding-right: 10px;
    background: white;
  }

  & .sidebar-inner {
    overflow: auto;
    height: 100%;
    padding: 1rem 1rem 1rem 0;
  }

  & [data-resize-sidebar] {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--sidebar-width, 320px);
    transform: translateX(-10px);
    width: 10px;
    background: rgba(0,0,0,.15);
    z-index: 10;
    cursor: col-resize;
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

  & .actions {
    z-index: 10;
    background: black;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding-right: 2rem;
  }

  & .actions button {
    background: black;
    color: rgba(255,255,255,.85);
    border: none;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
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
    color: #fff;
    background: #54796d;
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
    background: #54796d;
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


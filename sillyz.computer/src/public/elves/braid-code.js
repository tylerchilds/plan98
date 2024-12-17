import module from '@silly/tag'
import { toast } from './plan98-toast.js'
import eruda from 'eruda'
import { vim } from "@replit/codemirror-vim"
import * as braid from 'braid-http'

const myersDiff = document.createElement("script");
myersDiff.src = "https://braid.org/code/myers-diff1.js";
myersDiff.integrity = "";
myersDiff.crossOrigin = "";
document.body.appendChild(myersDiff)

self.braid_fetch = braid.fetch

const simpleton = document.createElement("script");
simpleton.src = "https://unpkg.com/braid-text/simpleton-client.js"
simpleton.integrity = "";
simpleton.crossOrigin = "";
document.body.appendChild(simpleton)

// the file is loaded from disk
// if 404, do the braid thing
// if nothing is ther

import {
  EditorState,
  EditorView,
  basicSetup
} from "@codemirror/basic-setup"

const $ = module('braid-code')

// be honest; we want a debugger whenever we code
eruda.init();

function readyLoop(target) {
  if(!self.simpleton_client) {
    requestAnimationFrame(() => readyLoop(target))
    return
  }
  $.teach({ ready: true })
}


function sourceFile(target) {
  const root = target.closest('[src]')
  const src = root.getAttribute('src')

  if(root.file) return root.file
  target.initialized = true

  return target.file
    ? target.file
    : (function initialize() {
      schedule(() => {
        fetch(plan98.env.BRAID_TEXT_PROXY + src).then(res => res.text()).then(file => {
          target.file = file
          requestAnimationFrame(() => readyLoop(target))
        })
      })
      return target.file
    })()
}

$.when('click', '.action-accordion', async (event) => {
  event.target.classList.toggle('active')
})

$.when('click', '.publish', (event) => {
  const file = sourceFile(event.target)

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
  const { src, ready } = $.learn()
  const file = sourceFile(target)
  const stack = target.getAttribute('stack')
  const amp = `
    <button class="action-accordion">
      &amp;
    </button>
    <div class="actions">
      <button class="publish">Publish</button>
      <button class="Privatize">Privatize</button>
      <button class="Print">Print</button>
    </div>
  `

  if(ready && file && !target.view) {
    target.innerHTML = stack ? `
      <select class="select">
        ${stack.split(',').map((filename) => {
          return `<option value="${filename}" ${filename === src ? 'selected' : ''}>${filename}</option>`
        })}
      </select>
      ${amp}
    `: `
      ${amp}
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
 target.simpleton = simpleton_client(plan98.env.BRAID_TEXT_PROXY + target.getAttribute('src'), {
    apply_remote_update: ({ state, patches }) => {
      if (state !== undefined) target.file = state;
      else apply_patches_and_update_selection(target, patches);
      return target.file;
    },
    generate_local_diff_update: (prev_state) => {
      var patches = diff(prev_state, target.file);
      if (patches.length === 0) return null;
      return { patches, new_state: target.file };
    },
  });

	return (update) => {
    if(update.changes.inserted.length < 0) return

    target.file = update.view.state.doc.toString()
    target.simpleton.changed()
	}
}

function diff(before, after) {
  let diff = diff_main(before, after);
  let patches = [];
  let offset = 0;
  for (let d of diff) {
    let p = null;
    if (d[0] == 1) p = { range: [offset, offset], content: d[1] };
    else if (d[0] == -1) {
      p = { range: [offset, offset + d[1].length], content: "" };
      offset += d[1].length;
    } else offset += d[1].length;
    if (p) {
      p.unit = "text";
      patches.push(p);
    }
  }
  return patches;
}

function apply_patches_and_update_selection(braid_code, patches) {
  let offset = 0;
  for (let p of patches) {
    p.range[0] += offset;
    p.range[1] += offset;
    offset -= p.range[1] - p.range[0];
    offset += p.content.length;
  }

  let original = braid_code.file;
  let sel = [textarea.selectionStart, textarea.selectionEnd];

  for (var p of patches) {
    let range = p.range;

    for (let i = 0; i < sel.length; i++)
      if (sel[i] > range[0])
        if (sel[i] > range[1]) sel[i] -= range[1] - range[0];
        else sel[i] = range[0];

    for (let i = 0; i < sel.length; i++)
      if (sel[i] > range[0]) sel[i] += p.content.length;

    original =
      original.substring(0, range[0]) +
      p.content +
      original.substring(range[1]);
  }

  let transaction = braid_code.view.state.update({
    changes: { from: p.range[0], to: p.range[1], insert: p.content }
  });
  braid_code.view.dispatch(transaction);

  braid_code.file = original;
  // braid_code.view 
  //textarea.selectionStart = sel[0];
  //textarea.selectionEnd = sel[1];
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

  & .action-accordion {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 50px;
    height: 50px;
    background: rgba(0,0,0,.65);
    border: 2px solid dodgerblue;
    color: rgba(255,255,255,.85);
    border-radius: 100%;
    opacity: .5;
    transition: all 200ms ease-in-out;
    z-index: 10;
  }
  & .action-accordion:hover {
    background: dodgerblue;
    border: 2px solid rgba(255,255,255,1);
    opacity: 1;
  }
  & .actions {
    margin: 0 1rem;
    position: absolute;
    top: 4rem;
    right: 0;
    text-align: right;
    z-index: 10;
    display: none;
  }

  & .action-accordion.active + .actions {
    display: block;
  }

  & .actions button {
    background: lemonchiffon;
    color: saddlebrown;
    border: none;
    line-height: 1rem;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: .5rem;
    font-size: 1rem;
    --v-font-mono: 0;
    --v-font-casl: 1;
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    background: saddlebrown;
    color: lemonchiffon;
  }


`)

function schedule(x, delay=1) { setTimeout(x, delay) }

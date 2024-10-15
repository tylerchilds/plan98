import elf from '@silly/tag'
import * as braid from 'braid-http'
import { marked } from 'marked'
import { render } from '@sillonious/saga'

import * as frh from 'frh'

const oplog1 = frh.createOpLog()

// Insert 'h', 'i' from user1.
frh.localInsert(oplog1, 'user1', 0, 'h', 'i')
console.log(frh.checkoutSimpleString(oplog1)) // 'hi'

// Users 1 and 2 concurrently insert A and B at the start of the document
const oplog2 = frh.createOpLog() // In a new document

const v = frh.getLatestVersion(oplog2) // [] in this case.
frh.pushOp(oplog2, ['user1', 0], v, 'ins', 0, 'A')
frh.pushOp(oplog2, ['user2', 0], v, 'ins', 0, 'B')

// Prints 'AB' - since fugue tie breaks by ordering by agent ID.
console.log(frh.checkoutSimpleString(oplog2))

// Now lets simulate the same thing using 2 oplogs.
const oplogA = frh.createOpLog()
frh.localInsert(oplogA, 'user1', 0, 'A')

const oplogB = frh.createOpLog()
frh.localInsert(oplogB, 'user2', 0, 'B')

// The two users sync changes:
frh.mergeOplogInto(oplogA, oplogB)
frh.mergeOplogInto(oplogB, oplogA)

// And now they both see AB.
console.log(frh.checkoutSimpleString(oplogA)) // Also AB.
console.log(frh.checkoutSimpleString(oplogB)) // Also AB.

// Finally lets make a branch and update it.
const branch = frh.createEmptyBranch()
frh.mergeChangesIntoBranch(branch, oplogA)
console.log(branch.snapshot)

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

const mimes = {
  'text/x-saga': render,
  'text/saga': render,
  'text/markdown': marked,
  'text/braid': null // default case, handle in draw
}

const $ = elf('clown-code')

function readyLoop() {
  if(!self.simpleton_client) {
    requestAnimationFrame(readyLoop)
    return
  }
  $.teach({ ready: true })
}

requestAnimationFrame(readyLoop)

$.draw((target) => {
  const { ready } = $.learn()
  const tag = target.getAttribute('tag') || 'textarea'
  const mime = plan98.parameters.get('mime') || target.getAttribute('mime') || 'text/braid'

  if(!ready) {
    return
  }
  if(!target.simpleton) {
    const resource = (target.getAttribute('host') || plan98.env.BRAID_TEXT_PROXY) + (target.getAttribute('path') || location.pathname)
    if(typeof mimes[mime] === 'function') {
      // no mime, just be a clown ok
      target.innerHTML = `
        <div class="client"></div>
        <div class="history">
          <iframe src="/app/chat-lists"></iframe>
        </div>
      `
      target.texty = target.querySelector('.client')

      target.simpleton = simpleton_client(resource, {
        apply_remote_update: ({ state, patches }) => {
          if (state !== undefined) {
            target.texty.dataset.value = state
            target.texty.innerHTML = mimes[mime](state);
          } else {
            apply_mime_on_update(mimes[mime], target, patches);
          }
          return target.texty.dataset.value;
        },
        generate_local_diff_update: (prev_state) => {
          var patches = diff(prev_state, target.texty.innerHTML);
          if (patches.length === 0) return null;
          return { patches, new_state: target.texty.innerHTML };
        },
      });

      // this was a mime, no need to return
      return
    }

    // no mime, just be a clown ok
    target.innerHTML = `
      <${tag} class="client"></${tag}>
      <div class="history">
        <iframe src="/app/chat-lists"></iframe>
      </div>
    `
    target.texty = target.querySelector(tag)

    target.simpleton = simpleton_client(resource, {
      apply_remote_update: ({ state, patches }) => {
        if (state !== undefined) target.texty.value = state;
        else apply_patches_and_update_selection(target.texty, patches);
        return target.texty.value;
      },
      generate_local_diff_update: (prev_state) => {
        var patches = diff(prev_state, target.texty.value);
        if (patches.length === 0) return null;
        return { patches, new_state: target.texty.value };
      },
    });
  }

  return
})

$.when('input', '.client', (event) => {
  const adult = event.target.closest($.link)
  adult.simpleton.changed()
})

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

function apply_patches_and_update_selection(textarea, patches) {
  let offset = 0;
  for (let p of patches) {
    p.range[0] += offset;
    p.range[1] += offset;
    offset -= p.range[1] - p.range[0];
    offset += p.content.length;
  }

  let original = textarea.value;
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

  textarea.value = original;
  textarea.selectionStart = sel[0];
  textarea.selectionEnd = sel[1];
}

function apply_mime_on_update(mime, target, patches) {
  if(patches.length === 0) return
  let offset = 0;
  for (const p of patches) {
    p.range[0] += offset;
    p.range[1] += offset;
    offset -= p.range[1] - p.range[0];
    offset += p.content.length;
  }

  let original = target.texty.dataset.value;

  for (const p of patches) {
    const range = p.range;

    original =
      original.substring(0, range[0]) +
      p.content +
      original.substring(range[1]);
  }

  target.texty.dataset.value = original;
  target.texty.innerHTML = mime(original)
}

$.style(`
  & {
    min-height: 5rem;
    position: relative;
    z-index: 2;
    display: block;
    max-width: 100%;
    overflow: auto;
    height: 100%;
  }

  & {
    display: grid;
    grid-template-columns: 1.618fr 1fr;
  }

  @media (max-width: 480px) {
    & {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }

  & input {
    border: none;
    background: lemonchiffon;
    color: saddlebrown;
  }
  & textarea {
    background: lemonchiffon;
    color: saddlebrown;
    display: block;
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 0rem 1rem;
    line-height: 2rem;
    position: relative;
    z-index: 3;
    background-position-y: -1px;
  }

  &[data-view="insert"] {
    height: 100%;
    display: block;
  }
  &[data-view="insert"] input {
    display: none;
  }
`)


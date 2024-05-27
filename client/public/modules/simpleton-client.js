import tag from '@silly/tag'
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

const $ = tag('simpleton-client')

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
  if(!ready) {
    return
  }
  if(!target.simpleton) {
    target.innerHTML = `
      <textarea style="width: 100%; height: 100%; box-sizing: border-box"></textarea>
    `
    target.texty = target.querySelector('textarea')

    target.simpleton = simpleton_client((target.getAttribute('host')) + location.pathname, {
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
})

$.when('input', 'textarea', (event) => {
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


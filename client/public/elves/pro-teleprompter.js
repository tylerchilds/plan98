import elf from "@silly/elf"
import shelf_merge from "shelf-merge"
import { render } from '@sillonious/saga'

const merge = shelf_merge

let shelf = [{hello: "world"}, [1, {hello: 1}]]

let change = merge(shelf, {more: "data"}) // version info infered

console.log(change)

const $ = elf('pro-teleprompter')

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <simpleton-client src="${target.getAttribute('src')}" data-script="${import.meta.url}" data-action="sync"></simpleton-client>
    <button data-teleprompt class="nonce" aria-label="Teleprompt" data-tooltip="Teleprompt">
    </button>
  `
})

export function sync(target, text) {
  const { src } = target.getAttribute('src') || 'nonce'
  $.teach({ src, text })
}

$.when('click', '[data-teleprompt]', (event) => {
  showModal(`
    <div style="color: white; font-size: 3rem;">
      ${render($.learn().text)}
    </div>
  `)
})

$.style(`
  & [data-teleprompt] {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    width: 3rem;
    height: 3rem;
  }
`)

customElements.define('pro-teleprompter', class WebComponent extends HTMLElement { constructor() { super() } });

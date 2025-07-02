import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const tag = 'was-image'
const $ = elf(tag)

function draw(target) {
  if(target.shadowRoot && target.shadowRoot.innerHTML) return
  target.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      :host img {
        width: 100%;
        height: 100%;
      }
   </style>
   <img />
  `
}

function beforeUpdate(target) {
  if(!target.shadowRoot) {
    target.attachShadow({ mode: 'open' })
  }
}

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true
    const src = target.getAttribute('src')
    if(src) {
      get(src).then(blob => {
        const data = new Blob([blob], { type: blob.type });
        const image = target.shadowRoot.querySelector('img')
        image.src = URL.createObjectURL(data);
      })
    }
  }
}

class SecureImage extends HTMLElement {
  constructor() {
    super();
    // Initialize your component here
    $.draw(draw, { beforeUpdate, afterUpdate })
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }
}

customElements.define(tag, SecureImage);

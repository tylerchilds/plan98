import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const tag = 'was-image'
const $ = elf(tag)

const blobCache = {}

function draw(target) {
  if(target && target.innerHTML) return
  target.innerHTML = `
    <style>
      :host {
        display: grid;
        width: 100%;
        height: 100%;
        place-content: center;
        overflow: hidden;
      }

      :host img {
        max-width: 100%;
        max-height: 100%;
        margin: auto;
        object-fit: cover;
        overflow: hidden;
      }
   </style>
   <img />
  `
}

function beforeUpdate(target) {
}

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true
    const src = target.getAttribute('src')
    if(!src) return

    const image = target.querySelector('img')

    // Cache hit — instant
    if (blobCache[src]) {
      image.src = blobCache[src]
      return
    }

    get(src).then(blob => {
      const data = new Blob([blob], { type: blob.type });
      const url = URL.createObjectURL(data);
      blobCache[src] = url
      image.src = url
    })
  }
}

class SecureImage extends HTMLElement {
  constructor() {
    super();
    // Initialize your component here
    $.draw(draw, { beforeUpdate, afterUpdate })
  }
}

customElements.define(tag, SecureImage);

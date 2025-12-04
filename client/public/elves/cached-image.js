import elf from '@silly/elf'
import Cache from '@silly/cache'

const tag = 'cached-image'
const $ = elf(tag)

function draw(target) {
  if(target.shadowRoot && target.shadowRoot.innerHTML) return
  target.shadowRoot.innerHTML = `
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
  if(!target.shadowRoot) {
    target.attachShadow({ mode: 'open' })
  }
}

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true
    const src = target.getAttribute('src')
    const key = target.getAttribute('key')
    if(src) {
      const cache = Cache(key)
      cache.get(src).then(blob => {
        if(blob) {
          const data = new Blob([blob], { type: blob.type });
          const image = target.shadowRoot.querySelector('img')
          image.src = URL.createObjectURL(data);
        }
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
}

customElements.define(tag, SecureImage);

import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const tag = 'was-video'

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

      :host video {
        width: 100%;
        height: 100%;
      }
     </style>
     <video controls="true"></video>
   `
}

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true
    const src = target.getAttribute('src')
    if(src) {
      get(src).then(blob => {
        const data = new Blob([blob], { type: blob.type });
        const video = target.shadowRoot.querySelector('video')
        video.src = URL.createObjectURL(data);
      })
    }
  }
}

class SecureVideo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' })
    // Initialize your component here
    $.draw(draw, { afterUpdate })
  }

  connectedCallback() {
    const video = this.shadowRoot.querySelector('video')
  }

  disconnectedCallback() {
    const video = this.shadowRoot.querySelector('video')
    if (video.srcObject) {
      video.pause();
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
}

customElements.define(tag, SecureVideo);

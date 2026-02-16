import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const tag = 'was-video'

const $ = elf(tag)

const blobCache = {}

function draw(target) {
  if(target && target.innerHTML) return
  return `
    <video></video>
  `
}

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true

    const video = target.querySelector('video')
    if (!video) return

    // Apply nocontrols attribute
    if (target.hasAttribute('nocontrols')) {
      video.removeAttribute('controls')
    } else {
      video.setAttribute('controls', 'true')
    }

    const src = target.getAttribute('src')
    if(!src) return

    if (blobCache[src]) {
      video.src = blobCache[src]
      return
    }

    get(src).then(blob => {
      const url = URL.createObjectURL(blob);
      blobCache[src] = url
      if (video) video.src = url
    })
  }
}

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    font-size: 0;
    line-height: 0;
  }

  & video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`)

class SecureVideo extends HTMLElement {
  constructor() {
    super();
    $.draw(draw, { afterUpdate })
  }

  connectedCallback() {
    const _video = this.querySelector('video')
  }

  disconnectedCallback() {
    const video = this.querySelector('video')
    if (video && video.srcObject) {
      video.pause();
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
}

customElements.define(tag, SecureVideo);

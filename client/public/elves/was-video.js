import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const tag = 'was-video'

const $ = elf(tag)

function draw(target) {
  if(target.innerHTML) return
  return `
    <video controls="true"></video>
  `
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

function afterUpdate(target) {
  if(!target.initialized) {
    target.initialized = true
    const src = target.getAttribute('src')
    if(src) {
      get(src).then(blob => {
        const video = target.querySelector('video')
        const videoUrl = URL.createObjectURL(blob);
        if(video) {
          video.src = videoUrl;
        }
      })
    }
  }
}

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

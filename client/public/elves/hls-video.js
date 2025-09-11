import elf from '@silly/tag'
import Hls from 'hls.js'

const tag = 'hls-video'
const $ = elf(tag)

$.draw((target) => {
  const autoplay = target.getAttribute('autoplay') || false
  const controls = target.getAttribute('controls') || true
  return `<video playsinline disablepictureinpicture autoplay="${autoplay}" controls="${controls}"></video>`
}, { afterUpdate })

function afterUpdate(target) {
    const hls = new Hls();
    target.hls = hls
    hls.loadSource(target.getAttribute('src'));
    hls.attachMedia(target.querySelector('video'));
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      try {
        clearTimeout(timeoutTimeout)
        video.play();
        $.teach({ retry: 0 })
      } catch (e) {
        $.teach({ status: 'error' })
      }
    });
}

$.style(`
  & {
    display: grid;
    background: black;
    place-content: center;
    height: 100%;
  }

  & video {
    margin: auto;
  }
`)

class HlsVideo extends HTMLElement {
  constructor() { super(); }

  disconnectedCallback() {
    this.querySelector('video').pause();
    this.hls.stopLoad();
    this.hls.destroy();
    this.hls = null
  }
}

customElements.define(tag, HlsVideo);

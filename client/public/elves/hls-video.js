import elf from '@silly/tag'
import Hls from 'hls.js'

const tag = 'hls-video'
const $ = elf(tag)

$.draw((target) => {
  const autoplay = target.getAttribute('autoplay') === "true" || false
  const controls = target.getAttribute('controls') === "true" || false
  const loop = target.getAttribute('loop') === "true" || false
  return `<video playsinline disablepictureinpicture ${loop?`loop`:''} autoplay="${autoplay}" ${controls?`controls="true"`:''}></video>`
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
    display: block;
    background: black;
    height: 100%;
  }

  & video {
    margin: auto;
    width: 100%;
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

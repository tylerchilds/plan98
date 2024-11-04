import elf from '@silly/tag'
import Hls from 'hls.js'

const $ = elf('hls-video')

$.draw(() => `<video controls="true"></video>`, { afterUpdate })

function afterUpdate(target) {
  {
    const hls = new Hls();
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
}

$.style(`
  & {
    display: grid;
    background: black;
    place-content: center;
    height: 100%;
  }
`)

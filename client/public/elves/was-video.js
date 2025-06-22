import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const $ = elf('was-video')

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <video controls="true"></video>
  `
}, {
  afterUpdate(target) {
    {
      if(!target.initialized) {
        target.initialized = true
        const src = target.getAttribute('src')
        if(src) {
          get(src).then(blob => {
            const data = new Blob([blob], { type: 'video/webm' });
            const video = target.querySelector('video')
            video.src = URL.createObjectURL(data);
            target.ready = true
          })
        }
      }
    }
  }
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
  }

  & video {
    width: 100%;
    height: 100%;
  }
`)

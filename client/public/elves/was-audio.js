import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const $ = elf('was-audio')
const blobCache = {}

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <audio controls="true"></audio>
  `
}, {
  afterUpdate(target) {
    if(!target.initialized) {
      target.initialized = true
      const src = target.getAttribute('src')
      if(!src) return

      const audio = target.querySelector('audio')

      if (blobCache[src]) {
        audio.src = blobCache[src]
        target.ready = true
        return
      }

      get(src).then(blob => {
        const data = new Blob([blob], { type: blob.type });
        const url = URL.createObjectURL(data);
        blobCache[src] = url
        audio.src = url
        target.ready = true
      })
    }
  }
})

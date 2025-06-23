import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const $ = elf('was-audio')

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <audio controls="true"></audio>
  `
}, {
  afterUpdate(target) {
    {
      if(!target.initialized) {
        target.initialized = true
        const src = target.getAttribute('src')
        if(src) {
          get(src).then(blob => {
            const data = new Blob([blob], { type: blob.type });
            const audio = target.querySelector('audio')
            audio.src = URL.createObjectURL(data);
            target.ready = true
          })
        }
      }
    }
  }
})

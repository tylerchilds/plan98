import elf from '@silly/elf'
import { get } from './plan98-wallet.js'

const $ = elf('was-image')

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <img />
  `
}, {
  afterUpdate(target) {
    {
      if(!target.initialized) {
        target.initialized = true
        const src = target.getAttribute('src')
        if(src) {
          get(src).then(blob => {
            const url = URL.createObjectURL(new Blob([blob]))
            target.querySelector('img').src = url
          })
        }
      }
    }
  }
})

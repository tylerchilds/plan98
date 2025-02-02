import elf from '@silly/elf'
import { toast } from './plan98-toast.js'

const $ = elf('hello-toast')

const tests = {
  success: 'Good thing happened, yay!',
  info: 'Details on a happening thing',
  warn: 'Be aware of happening thing',
  error: 'Bad thing happened, uh oh!',
}

$.draw(() => {
  return `
    <button data-type="success">Success</button>
    <button data-type="info">Info</button>
    <button data-type="warn">Warning</button>
    <button data-type="error">Error</button>
  `
})

$.when('click', '[data-type]', (event) => {
  toast(event.target.innerText, {
    type: event.target.dataset.type
  })
})

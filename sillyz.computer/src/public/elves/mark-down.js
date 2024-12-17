import elf from '@silly/elf'
import { marked } from 'marked'

const $ = elf('mark-down', { view: '' })

$.draw((target) => {
  const { view } = $.learn()
  if(target.initialized) return view
  target.initialized = true

  const src = target.getAttribute('src')
  if(src) {
    requestIdleCallback(() => {
      let file = ''
      fetch(src).then(async res => {
        if(res.status !== 404) {
          file = await res.text()
        }
      }).catch((error) => {
        file = 'issue'
        console.error(error)
      }).finally(() => {
        $.teach({ view: marked(file) })
      })
    })
  }
})

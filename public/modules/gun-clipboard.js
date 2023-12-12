import module from '@sillonious/module'
import Gun from 'gun'

const gun = Gun(['gun.1998.social']);

const $ = module('gun-clipboard')

$.draw((target) => {
  subscribe(target)
  const { value } = $.learn()
  return `<textarea>${value?value:''}</textarea>`
})

$.when('input', '>textarea', (event) => {
  const { gun } = event.target.closest($.link)
  gun.put(event.target.value)
})

function subscribe(target) {
  if(target.subscribed) return
  target.subscribed = true

  const safeword = target.getAttribute('safeword') || 'paste'
  target.gun = gun.get(target.id).get(safeword)
  target.gun.on(value => $.teach({ value }))
}

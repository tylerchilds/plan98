import module from '@sillonious/module'
import 'gun'

const gun = window.Gun(['https://gun.1998.social/gun']);

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

  target.gun = gun.get($.link).get(window.location.href)
  target.gun.on(value => $.teach({ value }))
}

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 0;
    background: transparent;
  }
`)

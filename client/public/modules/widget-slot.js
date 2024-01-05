import module from '@sillonious/module'

const $ = module('widget-slot')

$.draw(target => {
  const tag = target.getAttribute('tag')
  target.innerHTML = `<${tag}></${tag}>`
})

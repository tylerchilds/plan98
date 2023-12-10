import module from '@sillonious/module'
import * as focusTrap from 'focus-trap'

const $ = module('sillonious-upsell', { visible: true })

$.draw((target) => {
  const { visible } = $.learn()
  if(!visible) {
    if(target.trap) {
      target.trap.deactivate()
      target.trap = null
    }
    return ''
  }
  if(!target.trap) {
    target.trap = focusTrap.createFocusTrap(target, {
      onActivate: onActivate(target),
      onDeactivate: onDeactivate(target),
      clickOutsideDeactivates: true
    });
    schedule(target.trap.activate)
  }

  return `
    <button>one</button>
    <button>two</button>
    <button>three</button>
    <button>four</button>
  `
})

$.style(`
  & {
    display: block;
  }

  &.active {
  }
`)

function onActivate(target){
  return () => {
    target.classList.add('active')
  }
}

function onDeactivate(target) {
  return () => {
    target.classList.remove('active')
  }
}

function schedule(x) { setTimeout(x, 1) }

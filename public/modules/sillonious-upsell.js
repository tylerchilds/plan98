import module from '@sillonious/module'
import gamepads from '@sillonious/gamepads'
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
      onActivate: onActivate($, target),
      onDeactivate: onDeactivate($, target),
      clickOutsideDeactivates: true
    });
    schedule(target.trap.activate)
  }

  return `
    <sillonious-gamepad data-locked="0"></sillonious-gamepad>
    <button>one</button>
    <button>two</button>
    <button>three</button>
    <button>four</button>
  `
})

$.style(`
  & {
    display: block;
    position: absolute;
    z-index: 1;
  }

  &.active {
  }
`)

function onActivate($, target){
  return () => {
    target.classList.add('active')
    $.teach({ trapped: true })
    function loop() {
      let { trapped } = $.learn()
      try {
        if(gamepads()[0].buttons[1] === 1) {
          trapped = false
          target.trap.deactivate()
        }
      } catch(e) {
        console.error('not quite ready for a b button you f feel me?')
      }
      if(trapped) requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
}

function onDeactivate($, target) {
  return () => {
    $.teach({ trapped: false })
    target.classList.remove('active')
  }
}

function schedule(x) { setTimeout(x, 1) }

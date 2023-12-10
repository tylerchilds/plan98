import module from '@sillonious/module'
import players from '@sillonious/players'
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
    schedule(() => {
      target.trap.activate()
    })
  }

  return `
    <sillonious-players></sillonious-players>
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

function trapUntil($, target, terminator) {
  $.teach({ trapped: true })
  function loop(time) {
    let { trapped } = $.learn()
    try {
      if(terminator()) {
        trapped = false
        target.trap.deactivate()
      }
    } catch(reason) {
      const flavor = `the ${time} terminator failed`
      const source = `for ${terminator.toString()}`

      console.error(`${flavor} ${source} because`, reason)
    }
    if(trapped) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

function onActivate($, target){
  return () => {
    target.classList.add('active')
    trapUntil(
      $,
      target,
      () => players().some(p => p['/button/1/pushed'])
    )
  }
}

function onDeactivate($, target) {
  return () => {
    $.teach({ trapped: false })
    target.classList.remove('active')
  }
}

function schedule(x) { setTimeout(x, 1) }

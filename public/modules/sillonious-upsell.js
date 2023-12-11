import module from '@sillonious/module'
import { hyperSanitizer } from './hyper-script.js'

import party, {
  hostPressesStartStop,
  hostPressesReset,
  hostPressesLight,
  hostPressesMode,
  anybodyPressesStartStop,
  anybodyPressesReset,
  anybodyPressesLight,
  anybodyPressesMode,
} from '@sillonious/party'
import * as focusTrap from 'focus-trap'

const $ = module('sillonious-upsell', {
  visible: true,
  activeDialect: '/sagas/pro.thelanding.page/en_US/',
  activeSaga: '000-000.saga',
  cache: {}
})

$.draw((target) => {
  const { visible, activeDialect, activeSaga, cache } = $.learn()

  let content = cache[activeSaga]

  if(!content) {
    fetch(activeDialect + activeSaga)
      .then(x => x.text())
      .then((saga) => {
        $.teach(
          { [activeSaga]: hyperSanitizer(saga) },
          (state, payload) => {
            return {
              ...state,
              cache: {
                ...state.cache,
                ...payload
              }
            }
          }
        )
      })
    content = 'loading...'
  }

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
      onDeactivate: onDeactivate($, target)
    });
    schedule(() => {
      target.trap.activate()
    })
  }

  target.innerHTML = `
    ${content}
  `
})

$.when('click', '', () => {

})

$.style(`
  & {
    display: block;
    position: absolute;
  }

  &.active {
  }
`)

function trapUntil($, target, terminator) {
  $.teach({ trapped: true })
  function loop(time) {
    let { trapped } = $.learn()
    try {
      if(terminator(party)) {
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
    trapUntil($, target, anybodyPressesMode)
  }
}

function onDeactivate($, target) {
  return () => {
    $.teach({ trapped: false })
    target.classList.remove('active')
  }
}

function schedule(x) { setTimeout(x, 1) }

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

const inactiveWorlds = ['fantasysports.social']

const currentWorkingDirectory = '/public/sagas/'
const genesisSaga = '000-000.saga'

const overworld = {
  '/': genesisSaga
}

const $ = module('sillonious-upsell', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
  cache: {}
})

export function setupSaga(nextSaga) {
  const { activeDialect, activeWorld } = $.learn()
  const key = currentWorkingDirectory + activeWorld + activeDialect + nextSaga
  fetch(key)
    .then(async response => {
      if(response.status === 404) {
        return
      }
      const saga = await response.text()
      $.teach(
        { [key]: saga },
        (state, payload) => {
          return {
            ...state,
            key,
            cache: {
              ...state.cache,
              ...payload
            }
          }
        }
      )
    })
    .catch(e => {
      console.error(e)
    })
}

$.draw((target) => {
  const { activeWorld } = $.learn()
  const tutorial = overworld[window.location.pathname]
  if(!tutorial) return
  if(inactiveWorlds.includes(activeWorld)) return
  const { key, cache } = $.learn()

  const content = cache[key]

  if(!content && !target.mounted) {
    target.mounted = true
    setupSaga(tutorial)
  }

  if(!target.trap && target.innerHTML) {
    target.trap = focusTrap.createFocusTrap(target, {
      onActivate: onActivate($, target),
      onDeactivate: onDeactivate($, target),
      clickOutsideDeactivates: true
    });
    schedule(() => {
      target.trap.activate()
    })
    return
  }

  target.innerHTML = hyperSanitizer(content)
})

$.when('click', '', () => {

})

$.style(`
  @media print {
    & { display: none !important; }
  }

  &:not(:empty) {
    display: block;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    margin: auto;
    background: rgba(255,255,255,.85);
    background: lemonchiffon;
    max-height: 100%;
    overflow: auto;
    box-shadow:
      2px 2px 4px 4px rgba(0,0,0,.10),
      6px 6px 12px 12px rgba(0,0,0,.5),
      18px 18px 36px 36px rgba(0,0,0,.25);
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
    //trapUntil($, target, anybodyPressesReset)
  }
}

function onDeactivate($, target) {
  return () => {
    $.teach({ trapped: false })
    target.classList.remove('active')
    target.remove()
  }
}

function schedule(x) { setTimeout(x, 1) }

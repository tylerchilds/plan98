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

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const genesisSaga = '000-000.saga'

const overworld = {
  '/': genesisSaga
}

const $ = module('sillonious-upsell', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
  cache: {}
})

export function setupSaga(nextSaga, target) {
  const root = target.closest($.link)
  const { activeDialect, activeWorld } = $.learn()
  let key = currentWorkingDirectory + activeWorld + activeDialect + nextSaga

  target.dataset.lastHtml = target.innerHTML
  target.innerHTML = `<a href="${key}">Loading...</a>`
  fetch(raw+key)
    .then(async response => {
      if(response.status === 404) {
        target.innerHTML = target.dataset.lastHtml
        return
      }
      if(!root) window.location.href = key
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
      schedule(() => {
        if(!root.trap) {
          root.trap = focusTrap.createFocusTrap(target, {
            onActivate: onActivate($, target),
            onDeactivate: onDeactivate($, target),
            clickOutsideDeactivates: true
          });
        }
        if(root.trap) {
          root.trap.activate()
          root.innerHTML = `
            <data-tooltip>
              ${hyperSanitizer(saga)}
            </data-tooltip>
          `
        }
      })
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
    setupSaga(tutorial, target)
  }
})

$.when('click', '', () => {

})

$.style(`
  @media print {
    & { display: none !important; }
  }

  & xml-html {
    min-height: auto;
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
    max-height: 80%;
    padding: .5rem;
    max-width: 80%;
    overflow: auto;
    opacity: 0;
    box-shadow:
      2px 2px 4px 4px rgba(0,0,0,.10),
      6px 6px 12px 12px rgba(0,0,0,.5),
      18px 18px 36px 36px rgba(0,0,0,.25);
    animation: &-fade-in 1000ms 1000ms forwards;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
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

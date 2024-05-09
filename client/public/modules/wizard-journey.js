import module from '@silly/tag'
import { render } from '@sillonious/saga'

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

const $ = module('wizard-journey', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
  cache: {}
})

export function setupSaga(nextSaga, target) {
  const root = target.closest($.link)
  let { activeDialect, activeWorld } = $.learn()
  activeWorld = root ? root.getAttribute('host') : activeWorld
  const key = currentWorkingDirectory + activeWorld + activeDialect + nextSaga

  target.dataset.lastHtml = target.innerHTML
  target.innerHTML = `<a href="${key}">Loading...</a>`
  fetch(raw+key)
    .then(async response => {
      if(response.status === 404) {
        target.innerHTML = target.dataset.lastHtml
        return
      }
      if(!root) window.location.href = key + window.location.search
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
              <button data-close>Close</button>
              ${render(saga)}
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
  let { activeWorld } = $.learn()
  activeWorld = target.getAttribute('host') || activeWorld
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

$.when('click', '[data-close]', (event) => {
  event.target.closest($.link).trap.deactivate()
})

$.style(`
  @media print {
    & { display: none !important; }
  }

  & xml-html {
    min-height: auto;
    position: absolute;
    max-width: 100%;
    bottom: 0;
  }

  & [data-close] {
    background: rgba(0,0,0,.85);
    color: white;
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 0 1rem 0 .5rem;
    border-radius: 0 0 0 1rem;
    transition: background 100ms ease-in-out;
    line-height: 1;
    height: 2rem;
    z-index: 2;
  }

  & [data-close]:focus,
  & [data-close]:hover {
    background: dodgerblue;
  }


  &:not(:empty) {
    display: block;
    position: absolute;
    inset: 0;
    margin: auto;
    background: rgba(0,0,0,1);
    color: white;
    padding: .5rem;
    overflow: visible;
    opacity: 0;
    box-shadow:
      2px 2px 4px 4px rgba(0,0,0,.10),
      6px 6px 12px 12px rgba(0,0,0,.5),
      18px 18px 36px 36px rgba(0,0,0,.25);
    animation: &-fade-in 1000ms forwards;
    z-index: 9000;
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

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

addEventListener("popstate", (event) => {
  const { lastSaga } = event.state || {}
  if(lastSaga) {
    setupSaga(lastSaga, document.querySelector($.link), {back: true})
  } else {
    document.querySelector($.link).trap.deactivate()
  }
});

export function setupSaga(nextSaga, target, options={}) {
  const root = target.closest($.link) || target.closest('main') || target.closest('body')
  const host = root.getAttribute('host')
  let { activeDialect, activeWorld } = $.learn()
  activeWorld = host ? host : activeWorld
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

      if(!options.back) {
        self.history.pushState({ lastSaga: nextSaga }, "");
      }
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
              <div class="wrapper">
                <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
                ${render(saga)}
              </div>
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

  & .wrapper {
    min-height: auto;
    position: absolute;
    max-width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 1rem auto;
    max-width: 480px;
    max-height: 100%;
    background: rgba(255,255,255,.5);
    color: rgba(0,0,0,.85);
    overflow: auto;
    border-radius: 1rem;
    padding: 1rem;
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
    background: linear-gradient(105deg, rebeccapurple, rgba(200,200,200,.5) 30%), linear-gradient(165deg, rgba(200,200,200,.5) 80%, dodgerblue), white;
    color: white;
    padding: .5rem;
    overflow: visible;
    opacity: 0;
    box-shadow:
      2px 2px 4px 4px rgba(0,0,0,.10),
      6px 6px 12px 12px rgba(0,0,0,.5),
      18px 18px 36px 36px rgba(0,0,0,.25);
    animation: &-fade-in 1000ms forwards;
    z-index: 10000;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
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

import elf from '@silly/elf'
import { render } from '@sillonious/saga'
import * as focusTrap from 'focus-trap'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'

const $ = elf('action-script', {
  activeWorld: plan98.host || 'actuality.network',
  activeDialect: '/en-us/',
})

$.draw(target => {
  if(!target.querySelector('button')) {
    target.dataset.html = target.innerHTML
  }
  return `
    <button>
      ${target.dataset.html}
    </button>
  `
})

export async function actionScript(event) {
  event.stopImmediatePropagation()
  const root = event.target.closest($.link) || event.target.closest('.'+$.link)
  const { action, script, saga } = root.dataset
  root.classList.add('active')
  const otherActions = [...document.querySelectorAll(`${$.link}:not(.active)`)]
  otherActions.map((x) => {
    x.classList.add('inactive')
  })

  if(script) {
        const dispatch = (await import(script))[action]
    if(dispatch) {
      self.history.pushState({ action, script }, "");
      await dispatch(event, root)
    }
  }
  if(saga) {
    paste(saga, event.target, {})
  }

  root.classList.remove('active')
  otherActions.map((x) => {
    x.classList.remove('inactive')
  })
}

$.when('click', 'button', actionScript)

async function paste(nextSaga, target, options={}) {
  // first issue: []
  const root = target.closest('.wizard-journey') || target.closest('wizard-journey') || target.closest('main') || target.closest('body')
  const host = root.getAttribute('host')
  let { activeDialect, activeWorld } = $.learn()
  activeWorld = host ? host : activeWorld
  const key = currentWorkingDirectory + activeWorld + activeDialect + nextSaga

  target.dataset.lastHtml = target.innerHTML
  target.innerHTML = `<a href="${key}">Loading...</a>`
  await fetch(raw+key)
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
            <button data-close>Close</button>
            <div class="wrapper">
              <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
              ${render(saga)}
            </div>
          `
        }
      })
    })
    .catch(e => {
      console.error(e)
    })
}

addEventListener("popstate", async (event) => {
  const { action, script } = event.state || {}
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      await dispatch(event)
    }
  } else {
    location.reload()
  }
});

$.style(`
  & {
    display: block;
    margin: 1rem auto;
    max-width: calc(320px + 2rem);
    padding: 0 1rem;
  }

  &.inactive {
    opacity: .5;
    pointer-events: none;
    text-indent: -200%;
  }

  &.active button {
    pointer-events: none;
    text-indent: -200%;
    overflow: hidden;
  }

  &.active button::before {
    content: '';
    position: absolute;
    inset: 0;
    height: 75%;
    aspect-ratio: 1;
    margin: auto;
    animation: loader 3000ms ease-in-out alternate infinite;
    background: lemonchiffon;
  }

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    width: 100%;
    position: relative;
  }

  & button:focus,
  & button:hover {
    background-color: rebeccapurple;
  }

  &.secondary button {
    background-color: rgba(99,99,99,.65);
  }

  &.secondary button:focus,
  &.secondary button:hover {
    background-color: rgba(99,99,99,.35);
  }

  &.money button {
    background-color: lime;
  }

  &.money button:focus,
  &.money button:hover {
    background-color: rebeccapurple;
  }
`)


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

import module from '@sillonious/module'
import { showModal, types as modalTypes } from './plan98-modal.js'

import { doingBusinessAs } from './sillonious-brand.js'

const $ = module('saga-genesis')

const emeraldOfTime = { saga: '/public/sagas/time.saga' }

let quest = emeraldOfTime.saga

function useMacGuffin(macGuffin) {
  quest = macGuffin
  const {
    previousReality,
    reality
  } = $.learn()

  if(previousReality === macGuffin) {
    return reality
  }

  fetch(macGuffin)
    .then(origin => origin.text())
    .then(async present => {
      const { hyperSanitizer } = await import('./hyper-script.js')
      const supervisedReality = hyperSanitizer(present)
      $.teach({
        previousReality: macGuffin,
        reality: supervisedReality
      })
    })

  return previousReality
}

function getHost(target) {
  return (target.closest('[host]') && target.closest('[host]').getAttribute('host')) || plan98.host
}

$.draw((target) => {
  const host = getHost(target)
  const chaosEmerald = doingBusinessAs[host] || emeraldOfTime
  return useMacGuffin(chaosEmerald.saga)
})

$.style(`
  /* video games are best enjoyed 1:1 in a dark room */
  & {
    display: block;
    background: black;
    color: white;
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    overflow: auto;
  }
`)

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    showModal(`
      <div style="overflow: auto; width: 100%; height: 100%; max-width: 100vw; max-height: 100vh; padding: 4rem .25rem;">
        <code-module src="${quest}"></code-module>
      </div>
    `, { centered: true })
  }
});

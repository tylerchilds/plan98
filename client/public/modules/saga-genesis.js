import module from '@sillonious/module'

import { doingBusinessAs } from './sillonious-brand.js'

const $ = module('saga-genesis')

const emeraldOfTime = { saga: '/public/sagas/time.saga' }

function useMacGuffin(macGuffin) {
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
  return target.closest('[host]').getAttribute('host') || window.location.host
}

$.draw((target) => {
  const host = getHost(target)
  const chaosEmerald = doingBusinessAs[host] || emeraldOfTime
  return useMacGuffin(chaosEmerald.saga)
})

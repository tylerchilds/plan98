// previously on:
// netflixstudios.com
// netflix.com
// identity.com
// liberty.edu
// marketingadvocate.com
// still streaming:
import { doingBusinessAs } from './sillonious-brand.js'
// sillyz.computer

const $ = module('saga-genesis')

const emeraldOfTime = { saga: '/sagas/time.saga' }

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

$.draw((target) => {
  const host = target.getAttribute('host')
  const chaosEmerald = doingBusinessAs[host] || emeraldOfTime
  return useMacGuffin(chaosEmerald.saga)
})

// continue watching:
// 2023-11-15: 6 stones, 6 chaos emeralds, 0 stones, 7 chaos emeralds.

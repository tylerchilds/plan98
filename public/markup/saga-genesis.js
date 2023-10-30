// previously on:
// netflixstudios.com
// netflix.com
// identity.com
// liberty.edu
// marketingadvocate.com
// still streaming:
// sillyz.computer
import { hyperSanitizer } from './hyper-script.js'

const $ = module('saga-genesis')

function useMacGuffin(macGuffin) {
  const { previousReality, reality } = $.learn()

  if(previousReality === macGuffin) {
    return reality
  }

  fetch(macGuffin)
    .then(origin => origin.text())
    .then(present => {
      const supervisedReality = hyperSanitizer(present)
      $.teach({
        previousReality: macGuffin,
        reality: supervisedReality
      })
    })

  return previousReality
}

const emeraldOfTime
  = `/sagas/time.saga`
const emeraldOfSpace
  = `/sagas/space.saga`
const emeraldOfTrust
  = `/sagas/trust.saga`
const emeraldOfTruth
  = `/sagas/truth.saga`
const emeraldOfSelf
  = `/sagas/self.saga`
const emeraldOfSecurity
  = `/sagas/security.saga`
const emeraldOfNow
  = `/sagas/now.saga`

const remoteArchive = {
  'sillyz.computer': emeraldOfTime,
  '1998.social': emeraldOfSpace,
  'yourlovedones.online': emeraldOfTrust,
  'ncity.executiontime.pub': emeraldOfTruth,
  'css.ceo': emeraldOfSelf,
  'y2k38.info': emeraldOfSecurity,
  'thelanding.page': emeraldOfNow,
  //'bustblocker.com': emeraldOfTime
  //'fantasysports.social': emeraldOfTime
  //'tychi.me': emeraldOfTime
  //'executiontime.pub': emeraldOfTime
  //'tylerchilds.com': emeraldOfTime
  //'webdesigninfinity.com': emeraldOfTime
  //'actuality.network': emeraldOfTime
  //'bytesize.dev': emeraldOfTime
  //'bamzap.pw': emeraldOfTime
  //'cutestrap.com': emeraldOfTime
  //'markdownthemes.com': emeraldOfTime
  //'bhs.network': emeraldOfTime
  //'ccsdesperados.com': emeraldOfTime
  //'56k.info': emeraldOfTime
  //'themountainterrace.review': emeraldOfTime
  //'sanmateogov.org': emeraldOfTime
  //'wherespodcast.org': emeraldOfTime
}

$.draw((target) => {
  const host = target.getAttribute('host') || window.location.host
  const chaosEmerald = remoteArchive[host] || emeraldOfTime
  return useMacGuffin(chaosEmerald)
})

// continue watching:
// 2023-11-15: where did the hyper emeralds come from and where did they go?

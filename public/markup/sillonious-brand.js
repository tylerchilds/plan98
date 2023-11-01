const reverseProxyLookup = `
  c/o notorious@sillyz.computer<br/>
  969 G Edgewater Blvd<br/>
  #123<br/>
  Foster City, CA 94404
`

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

export const doingBusinessAs = {
  'sillyz.computer': {
    tagline: 'The Notorious One Will See You Now',
    saga: emeraldOfTime,
    contact: reverseProxyLookup
  },
  '1998.social': {
    tagline: '1998 (ice-cream) social',
    saga: emeraldOfSpace,
    contact: reverseProxyLookup
  },
  'yourlovedones.online': {
    tagline: 'Your Loved Ones are On the Line',
    saga: emeraldOfTrust,
    contact: reverseProxyLookup
  },
  'ncity.executiontime.pub': {
    tagline: 'Pleasures of Night City',
    saga: emeraldOfTruth,
    contact: reverseProxyLookup
  },
  'css.ceo': {
    tagline: 'Custom Handmade Skins, Chainsaw Free',
    saga: emeraldOfSelf,
    contact: reverseProxyLookup
  },
  'y2k38.info': {
    tagline: 'Break the Time Loop',
    saga: emeraldOfSecurity,
    contact: reverseProxyLookup
  },
  'thelanding.page': {
    tagline: 'Computer Scientific Journal',
    saga: emeraldOfNow,
    contact: reverseProxyLookup
  },
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

module('sillonious-brand').draw((target) => {
  const character = target.getAttribute('host')
  const {
    tagline,
    contact
  } = doingBusinessAs[character] || doingBusinessAs['sillyz.computer']

  return `
    ${character}<br/>
    ${contact}<br/>
    ${tagline}<br/>
    <qr-code secret="https://${character}"></qr-code>
  `
})

/*

# November 14th, 2022
@ musings.tychi.me/on-exploring-personas

I have my online only space.
I have my blended online and in person space.
I have my in person space.

I have way too many chat apps and will add another one to the pile shortly.

Also I am my own business for legal protection in America.
I am fighting to have that protection extended globally.

All interactions are funelled through my Limited Liability Corporation for obvious reasons.

The body that wields me is covered under the LLC, you are never interacting with me as a person, just me as a brand.

The real me lives rent free in my head and takes no responsibility for any seriousness that may ensue from how I this meatsack is carried for business purposes.
*/

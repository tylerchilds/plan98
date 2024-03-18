import module from '@sillonious/module'
import { doingBusinessAs } from '@sillonious/brand'

const $ = module('sillonious-about')

function currentBusiness(host = standard) {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const host = target.getAttribute('host')

  const {
    mascot,
    contact,
    tagline,
  } = currentBusiness(host)

  const businesses = Object.keys(doingBusinessAs)
  const realms = businesses.map(host => {
    return `
      <a href="/?world=${host}">
        ${host}
      </a>
    `
  })


  const counselors = businesses.map(host => {
    const {
      mascot,
    } = currentBusiness(host)

    return `
      <a href="/?world=${host}">
        ${mascot}
      </a>
    `
  })

  return `
    <h2>Counselors</h2>
    <div>
      ${counselors}
    </div>
    <h2>Realms</h2>
    <div>
      ${realms}
    </div>
    <hr>
    ${mascot}
    <a href="/?world=${host}">Play</a>
  `
})

$.style(`
  & {
    max-width: 100%;
  }
`)

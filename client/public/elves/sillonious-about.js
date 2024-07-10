import module from '@silly/tag'
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
      <div>
        <a href="/?world=${host}">
          ${host}
        </a>
      </div>
    `
  }).join('')

  return `
    ${mascot}
    <a href="/?world=${host}">Play</a>
    <hr>
    <h2>Realms</h2>
    <div>
      ${realms}
    </div>
  `
})

$.style(`
  & {
    max-width: 100%;
    display: block;
    padding-bottom: 10px;
  }
`)

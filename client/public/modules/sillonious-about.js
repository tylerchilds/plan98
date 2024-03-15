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

  const plans = Object.keys(doingBusinessAs).map(host => {
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
    <h2>Plans</h2>
    <div>
      ${plans}
    </div>
    ${mascot}
    ${contact}
    ${tagline}
    <a href="/?world=${host}">Play</a>
  `
})

$.style(`
  & {
    max-width: 100%;
  }
`)

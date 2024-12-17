import module from '@silly/tag'
import { doingBusinessAs } from './sillonious-brand.js'

const protocol = 'https:'
const endpoint = '/plan98/about'
const $ = module('site-map')

$.draw(() => {
  const sites = Object.keys(doingBusinessAs)
  const tips = sites.map((domain) => {
    const {
      longitude,
      latitude,
      saga,
      color
    } = doingBusinessAs[domain]

    return `
      <details data-tooltip="${latitude},${longitude}" style="background: linear-gradient(45deg, transparent, color)">
        <summary>
          ${domain} (<a href="${saga.split('/public')[1]}">Edit</a>)
        </summary>
        ${renderMemex(domain)}
      </details>
    `
  }).join('');
  return `
    ${tips}
  `
})

function renderMemex(domain) {
  const plan98 = $.learn()[domain]
  if(plan98) {
    return JSON.stringify(plan98)
  } else {
    fetch(window.location.origin + endpoint + '?world=' + domain)
      .then(res => res.json())
      .then(({plan98}) => {
        $.teach({ [domain]: plan98 })
      })
      .catch(e => console.error(e))
    return 'No Data... is this world in the plan98 cinematic universe?'
  }
}

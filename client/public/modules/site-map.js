import module from '@sillonious/module'
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
      <div data-tooltip="${latitude},${longitude}" style="background: linear-gradient(45deg, transparent, color)">
        <a href="${saga}">${domain}</>
        ${renderMemex(domain)}
      </div>
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
    fetch(protocol + '//' + domain + endpoint)
      .then(res => res.json())
      .then(({plan98}) => {
        debugger
        $.teach({ [domain]: plan98 })
      })
      .catch(e => console.error(e))
    return ''
  }
}

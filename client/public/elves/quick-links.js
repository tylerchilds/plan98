import elf from '@silly/elf'
import { doingBusinessAs } from '@sillonious/brand'
import { showModal } from './plan98-modal.js'

const { host } = self.plan98 || { host: window.location.host }

const $ = elf('quick-links')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    links
  } = currentBusiness()

  return links ? links.map(({ href, text }) => {
    return `
      <a href="${href}">
        ${text}
      </a>
    `
  }).join('') : ''
})

$.when('click', '[data-tag]', (event) => {
  const { tag } = event.target.dataset
  showModal(`<${tag}></${tag}>`)
})

$.style(`
  & {
    display: block;
    padding: .5rem;
    text-align: right;
    z-index: 2;
  }

  & a {
    display: inline-block;
    padding: 1rem;
    font-size: 2rem;
    line-height: 1;
  }
`)

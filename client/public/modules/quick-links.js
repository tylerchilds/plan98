import module from '@silly/tag'
import { doingBusinessAs } from '@sillonious/brand'
import { showModal } from './plan98-modal.js'

const { host } = self.plan98 || { host: window.location.host }

const $ = module('quick-links')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    links
  } = currentBusiness()

  return links ? links.map(({ title, tag }) => {
    return `
      <button data-tag="${tag}">
        ${title}
      </button>
    `
  }).join('') : ''
})

$.when('click', '[data-tag]', (event) => {
  const { tag } = event.target.dataset
  showModal(`<${tag}></${tag}>`)
})

$.style(`
  & {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: .5rem;
    text-align: center;
  }

  & button {
    display: inline-block;
    padding: 13px;
    font-size: 1.5rem;
    background: rgba(255,255,255,.5);
    border: none;
    border-radius: 100%;
    text-decoration: none;
    color: dodgerblue;
  }

  & button:hover,
  & button:focus {
    background: rgba(255,255,255,1);
    color: rebeccapurple;
  }
`)

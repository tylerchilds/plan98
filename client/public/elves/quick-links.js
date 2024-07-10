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
    z-index: 2;
    pointer-events: none;
  }

  & button {
    display: inline-block;
    padding: 13px;
    font-size: 1.5rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: goldenrod;
    border: none;
    text-decoration: none;
    color: white;
    pointer-events: all;
    border-radius: 1rem;
  }

  & button:hover,
  & button:focus {
    background-color: darkgoldenrod;
    color: white;
    box-shadow: 0px 0px 8px 8px rgba(0,0,0,.1);
  }
`)

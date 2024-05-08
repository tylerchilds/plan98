import module from '@sillonious/module'
import { doingBusinessAs } from '@sillonious/brand'

const { host } = self.plan98 || { host: window.location.host }

const $ = module('quick-links')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    logo
  } = currentBusiness()

  return `
    <a href="">
      About
    </a>
    <a href="">
      Subscribe
    </a>
    <a href="">
      Purchase
    </a>
  `
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

  & a {
    display: inline-block;
    padding: 13px;
    font-size: 1.5rem;
    background: rgba(255,255,255,.5);
    border-radius: 100%;
    text-decoration: none;
  }

  & a:hover,
  & a:focus {
    background: rgba(255,255,255,1);
  }
`)

import module from '@silly/tag'
import { doingBusinessAs } from '@sillonious/brand'

const { host } = self.plan98 || { host: window.location.host }

const $ = module('mast-head')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    logo
  } = currentBusiness()
  return `
    <img src="${logo}" alt="logo for ${host}" />
  `
})

$.style(`
  & {
    display: block;
    margin: 2rem 0 0;
  }
`)

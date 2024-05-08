import module from '@sillonious/module'
import { doingBusinessAs } from '@sillonious/brand'

const { host } = self.plan98 || { host: window.location.host }

const $ = module('mega-footer')

export function currentBusiness() {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const {
    logo
  } = currentBusiness()
  return `
    footer
  `
})

$.style(`
`)

import { doingBusinessAs } from "@sillonious/brand"

import('randomuuid').catch(console.error)
import('./elves/plan98-console.js').catch(console.error)
import('./elves/plan98-synthia.js').catch(console.error)

self.plan98 ||= { env: {} }

self.requestIdleCallback = self.requestIdleCallback || function (fn) { setTimeout(fn, 1) };

const parameters = new URLSearchParams(window.location.search)
const world = parameters.get('world')
const database = localStorage.getItem("plan98.database") || self.plan98.env.POCKETBASE_URL;

self.plan98 = {
  ...self.plan98,
  parameters,
  database,
  host: world ? world : doingBusinessAs[window.location.host] ? window.location.host : 'sillyz.computer',
}

const style = document.createElement('link')

style.setAttribute('href', `/public/cdn/${window.plan98.host}/default.css`)
style.setAttribute('rel', `stylesheet`)
document.head.appendChild(style)

const newpage = `
  <sillonious-brand host="${plan98.host}"></sillonious-brand>
`

import('@silly/elf').then(x => {
  x.default('#main').draw(target => newpage)
})


export function setDatabase(url) {
  localStorage.setItem("plan98.database", 'https://sillonious.pockethost.io')
}

if(parameters.get('debug') === 'true') {
  document.body.insertAdjacentHTML('beforeend', `
    <plan98-console></plan98-console>
  `)
}

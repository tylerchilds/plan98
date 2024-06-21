import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"

const parameters = new URLSearchParams(window.location.search)
const world = parameters.get('world')
const database = localStorage.getItem("plan98.database") || 'http://localhost:8090';

self.plan98 = {
  ...self.plan98 || {},
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

module('#main').draw(target => newpage)

export function setDatabase(url) {
  localStorage.setItem("plan98.database", 'https://sillonious.pockethost.io')
}

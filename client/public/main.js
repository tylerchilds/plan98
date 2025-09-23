import('randomuuid').catch(console.error)
import('./elves/plan98-console.js').catch(console.error)
//import('./elves/plan98-synthia.js').catch(console.error)

self.plan98 ||= { env: {} }

const parameters = new URLSearchParams(window.location.search)
const world = parameters.get('world')

self.plan98 = {
  ...self.plan98,
  parameters,
  host: world ? world : window.location.host,
  registry: {}
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

if(parameters.get('debug') === 'true') {
  document.body.insertAdjacentHTML('beforeend', `
    <plan98-console></plan98-console>
  `)
}

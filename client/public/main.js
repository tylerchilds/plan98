import module from '@sillonious/module'
import Computer from '@sillonious/computer'

const parameters = new URLSearchParams(window.location.search)
const world = parameters.get('world')
window.plan98 = {
  parameters,
  provider: 'braid.org',
  host: world ? world : window.location.host,
}

const style = document.createElement('style')

style.setAttribute('href', `/public/cdn/${window.plan98.host}/default.css`)
style.setAttribute('rel', `stylesheet`)
document.head.appendChild(style)

module('#main').draw(target => world ? `
  <sillonious-brand host="${plan98.host}">
    <saga-genesis></saga-genesis>
  </sillonious-brand>
`:`
  <sillonious-brand></sillonious-brand>
`)

export default new Computer(window.plan98, { registry: '/public/modules' })

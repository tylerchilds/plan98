import('randomuuid').catch(console.error)
import { showModal, isVisible, hideModal } from './elves/plan98-modal.js'
import './elves/dream-team.js'

self.plan98 ||= { env: {} }

const parameters = new URLSearchParams(window.location.search)
const world = parameters.get('world')

self.plan98 = {
  ...self.plan98,
  parameters,
  host: world ? world : window.location.host.includes('localhost:') ? 'sillyz.computer' : window.location.host,
  registry: {}
}

const style = document.createElement('link')

console.log({ plan98 })

style.setAttribute('href', `/public/cdn/${window.plan98.host}/default.css`)
style.setAttribute('rel', `stylesheet`)

document.head.appendChild(style)

const newpage = `
  <sillonious-brand host="${plan98.host}"></sillonious-brand>
`

import('@plan98/types').then(({ Self }) => {
  Self('#main').draw(target => newpage)
})

if(parameters.get('debug') === 'true') {
  document.body.insertAdjacentHTML('beforeend', `
    <plan98-console></plan98-console>
  `)
}

import('./elves/plan98-icon.js').catch(console.error)
//import('./elves/plan98-synthia.js').catch(console.error)
import('./elves/plan98-console.js').catch(console.error)

let isRoot = false

function normalMode() {
  isRoot = false
}

self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'synthia-escape') {
    handleEscapePropagation()
  } else { console.log(event) }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleEscapePropagation()
  }
});

function handleEscapePropagation() {
  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'synthia-escape' }, "*");
    return
  }

  if(isRoot) return
  if(!isVisible()) {
    isRoot = true
    showModal(`
      <div style="width: 100%; height: 100%; overflow: hidden;">
        <source-code></source-code>
      </div>
    `, { centered: true, onHide: normalMode, blockExit: false })
  } else {
    isRoot = false
    hideModal()
  }
}

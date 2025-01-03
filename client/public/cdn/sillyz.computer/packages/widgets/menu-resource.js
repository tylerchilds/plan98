import { tag } from "/deps.js"

import { showDrawer, hideDrawer, byDrawer } from '/packages/ui/drawer.js'

const $ = tag('menu-resource')

function resourceMenu({ target }) {
  const resource = target.closest($.selector);

  const model = resource.getAttribute('model')
  const view = resource.getAttribute('view')

  const { isOpen } = byDrawer('right')

  isOpen 
    ? hideDrawer('right')
    : showDrawer({ position: 'right', body: `<${view} model="${model}"></${view}>`})
}

$.on('click', 'button', resourceMenu)

$.render(target => {
  return `
    <button class="interface-button tr" data-tooltip="What is this?">
      ?
    </button>
  `
})

import module from '@sillonious/module'
import { setupSaga } from './sillonious-upsell.js'

const $ = module('sillonious-action')

$.draw((target) => {
  const label = target.getAttribute('label')
  const saga = target.getAttribute('saga')
  return `
    <button data-saga="${saga}">
      ${label}
    </button>
  `
})

$.when('click', 'button', (event) => {
  const saga = event.target.dataset.saga
  setupSaga(saga)
})

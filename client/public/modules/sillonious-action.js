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

$.style(`
  & {
    display: block;
    text-align: right;
    margin: 1rem;
  }

  & button {
    background: transparent;
    border: 2px solid dodgerblue;
    color: dodgerblue;
    border-radius: 2rem;
    transition: all 100ms ease-in-out;
    padding: .5rem;
  }

  & button:focus,
  & button:hover {
    background: dodgerblue;
    color: white
  }
`)

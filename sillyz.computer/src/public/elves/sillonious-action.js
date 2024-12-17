import module from '@silly/tag'
import { setupSaga } from './wizard-journey.js'

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
  setupSaga(saga, event.target)
})

$.style(`
  & {
    display: block;
    margin: 1rem;
  }

  & button {
    background: dodgerblue;
    border: none;
    border-radius: 2rem;
    color: white;
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    filter: grayscale(1);
  }

  & button:focus,
  & button:hover {
    background: dodgerblue;
    color: white;
    filter: grayscale(0);
  }
`)

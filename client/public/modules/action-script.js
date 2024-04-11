import module from '@sillonious/module'
import { setupSaga } from './sillonious-upsell.js'

const $ = module('action-script')

$.draw(target => {
  if(!target.querySelector('button')) {
    target.dataset.html = target.innerHTML
  }
  return `
    <button>
      ${target.dataset.html}
    </button>
  `
})

$.when('click', 'button', async (event) => {
  const root = event.target.closest($.link)
  const { action, script, saga } = root.dataset
  const dispatch = (await import(script))[action]
  dispatch(event, root)
  setTimeout(() => {
    setupSaga(saga, event.target)
  }, 100)
})

$.style(`
  & {
    display: block;
    text-align: right;
    margin: 1rem 0;
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

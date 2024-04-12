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
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      await dispatch(event, root)
    }

  }
  if(saga) {
    setupSaga(saga, event.target)
  }
})

$.style(`
  & {
    display: block;
    text-align: right;
    margin: 1rem;
  }

  & button {
    background: rgba(255,255,255,.85);
    border: 2px solid dodgerblue;
    border-radius: 2rem;
    color: dodgerblue;
    transition: all 100ms ease-in-out;
    padding: .5rem;
  }

  & button:focus,
  & button:hover {
    background: dodgerblue;
    color: white;
  }
`)

import module from '@silly/tag'
import { setupSaga } from './wizard-journey.js'

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
    margin: 1rem;
  }

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    width: 100%;
  }

  & button:focus,
  & button:hover {
    background-color: rebeccapurple;
  }

  &.secondary button {
    background-color: rgba(99,99,99,.65);
  }

  &.secondary button:focus,
  &.secondary button:hover {
    background-color: rgba(99,99,99,.35);
  }

  &.money button {
    background-color: lime;
  }

  &.money button:focus,
  &.money button:hover {
    background-color: rebeccapurple;
  }


`)

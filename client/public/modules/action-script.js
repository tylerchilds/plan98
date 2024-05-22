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

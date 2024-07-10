import module from '@silly/tag'
import { connect, getBase, whenLogout } from "./potluck-authentication.js"
import { refresh } from "./potluck-list.js"
import { hideModal } from './plan98-modal.js'

const $ = module('potluck-new')

$.draw(target => {
  const account = state['ls/~']

  const app = account ? `
    <div class="wrapper">
      Create a potluck!
      <form>
        <label class="field">
          <span class="label">Potluck Name</span>
          <input name="potluck" type="text" />
        </label>
        <button type="submit">
          Create
        </button>
      </form>
    </div>
  ` : `
    Not authenticated
  `

  target.innerHTML = `
    <div class="inner">
      ${app}
    </div>
  `
})

$.when('submit', 'form', async function create(event) {
  event.preventDefault()
  const base = getBase(event.target)
  await base.collection('potlucks').create({
    name: event.target.potluck.value,
  });

  refresh(event.target)
  hideModal()
})

$.style(`
  & {
    padding: 1rem;
    background: white;
    border-radius: 1rem;
  }

  & button {
    border: none;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: rgba(255,255,255,.85);
    display: block;
    width: 100%;
    padding: 1rem;
  }


  & button:hover,
  & button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: goldenrod;
  }
`)

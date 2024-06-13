import tag from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'

const $ = tag('poker-face')

$.draw(() => {
  const { companyName, companyEmployeeId } = getSession()

  return `
    <div class="player">
      ${companyEmployeeId}
    </div>
    <div class="console">
      ${companyName}
    </div>
    <button data-disconnect>
      Disconnect
    </button>
  `
})

$.when('click', '[data-disconnect]', async () => {
  clearSession()
})

$.style(`
  & {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    border-radius: 1rem;
  }

  & button {
    background: black;
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: dodgerblue;
    width: 100%;
    text-align: left;
    padding: 1rem;
    transition: all 200ms ease-in-out;
    flex: none;
  }

  & button:hover,
  & button:focus {
    background: dodgerblue;
    color: white;
  }

  & .player {
    padding: 4rem 1rem 1rem;
  }

  & .console {
    text-align: right;
    background: rgba(128,128,128,.5);
    padding: 1rem;
    border-radius: 0 0 1rem 1rem;
  }
`)

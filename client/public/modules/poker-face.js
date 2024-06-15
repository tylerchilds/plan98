import tag from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'

const $ = tag('poker-face')

$.draw(() => {
  const { sessionId, companyName, companyEmployeeId } = getSession()

  return sessionId ? `
    <div class="player">
      ${companyEmployeeId}
    </div>
    <div class="console">
      ${companyName}
    </div>
    <button data-disconnect>
      Disconnect
    </button>
  ` : `
    <form>
      <div class="player">
        <input placeholder="player" name="companyEmployeeId" />
      </div>
      <div class="console">
        <input type="text" placeholder="console" name="companyName" />
      </div>
      <button type="submit">
        Connect
      </button>
    </form>
  `
})


$.when('submit', 'form', async (event) => {
  event.preventDefault()

  const companyEmployeeId = event.target.companyEmployeeId.value
  const companyName = event.target.companyName.value
  debugger
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
    background-image: linear-gradient(rgba(255,255,255,.5), rba(255,255,255,.25));
    background-color: dodgerblue;
    color: white;
    display: block;
    border: 0;
    border-radius: 0 0 1rem 1rem;
    line-height: 1;
    width: 4rem;
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
  }

  & input {
    border: none;
    background: transparent;
    color: rgba(255,255,255,.85);
  }
`)

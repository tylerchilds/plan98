import tag from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'

const $ = tag('poker-face')

$.draw(() => {
  const { sessionId, companyName, companyEmployeeId } = getSession()

  return sessionId ? `
    <div class="console">
      <div class="data">
        ${companyName}
      </div>
    </div>
    <div class="player">
      <div class="data">
        ${companyEmployeeId}
      </div>
    </div>
    <button data-disconnect>
      Disconnect
    </button>
  ` : `
    <form>
      <div class="console">
        <input type="text" placeholder="console" name="companyName" />
      </div>
      <div class="player">
        <input placeholder="player" name="companyEmployeeId" />
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

  showModal(`
    <bayun-login companyEmployeeId="${companyEmployeeId}" companyName="${companyName}">
    </bayun-login>
  `)
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
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
    background-color: lime;
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

  & [data-disconnect] {
    background-color: orange;
  }


  & button:hover,
  & button:focus {
    background-color: rebeccapurple;
    color: white;
  }

  & .player {
  }

  & .console {
    background: rgba(128,128,128,.5);
    padding-top: 3rem;
  }

  & input {
    border: none;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: 1rem;
    max-width: 100%;
  }

  & .data {
    padding: 1rem;
  }
`)

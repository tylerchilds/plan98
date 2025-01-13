import supabase from '@sillonious/database'
import elf, { state } from '@silly/tag'
import { showModal } from '@plan98/modal'
import { disconnect, $ as $login } from './supabase-login.js'


const $ = elf('supabase-logout')

$.draw((target) => {
  const loggedIn = !!state['ls/supabase.auth.token']

  return loggedIn ? `
    <div>
      ${$login.learn().user?.email}
      <button data-logout>
        Disconnect
      </button>
    </div>
  ` : `
    <div>
      <a href="/app/supabase-login">
        Connect
      </a>
    </div>
  `
})

$.when('click', '[data-logout]', async () => {
  $.teach({ message: null })
  disconnect()
})

$.style(`
  & {
    padding: .25rem .5rem;
    display: block;
    margin: auto;
  }

  & button,
  & a {
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 2px;
    float: right;
    border: 1px solid rgba(255,255,255,.65);
    padding: .25rem .5rem;
  }

  & a:hover,
  & a:focus,
  & button:hover,
  & button:focus {
    background: rgba(255,255,255,.25);
  }



  & *:focus {
    border-color: orange;
    outline-color: orange
  }

  & .page {
    height: 100%;
    padding: 0 0 5rem;
  }

  & .label {
    color: rgba(0,0,0,.85);
  }

  & [type="submit"] {
    width: 100%;
    border: none;
    border-radius: none;
    background: navy;
    padding: 1rem;
    color: white;
    opacity: .75;
    transition: opacity 150ms;
  }

  & [type="submit"]:hover,
  & [type="submit"]:focus {
    opacity: 1;
  }

`)

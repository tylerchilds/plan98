import supabase from '@sillonious/database'
import elf, { state } from '@silly/tag'
import { showModal } from '@plan98/modal'
import { disconnect, $ as $login } from './supabase-login.js'


const $ = elf('supabase-logout')

$.draw((target) => {
  const loggedIn = !!state['ls/supabase.auth.token']

  return loggedIn ? `
    ${$login.learn().user.email}
    <button data-logout>
      Disconnect
    </button>
  ` : `
    <a href="/app/supabase-login">
      Connect
    </a>
  `
})

$.when('click', '[data-logout]', async () => {
  $.teach({ message: null })
  disconnect()
})

$.style(`
  & {
    max-width: 320px;
    padding: 1rem;
    display: block;
    margin: auto;
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

import supabase from '@sillonious/database'

import module, { state } from '@silly/tag'
import { showModal } from '@plan98/modal'

const $ = module('supabase-login', {
  email: '',
  password: '',
  message: null,
  connected: true
})

$.draw((target) => {
  const { message, connected, error, email, password } = $.learn()

  if(!connected) {
    return `
      <div name="login">
        <hypertext-variable class="title" monospace="0" casual="1" weight="800" slant="0" cursive="1">
          Authenticate
        </hypertext-variable>
        <div class="error">
          ${message ? message : ''}
        </div>
        <form method="POST" action="loginWithPassword">
          <label class="field">
            <span class="label">Email</span>
            <input data-bind value="${email}" type="text" name="email" required/>
          </label>
          <label class="field">
            <span class="label">Password</span>
            <input data-bind type="password" value="${password}" name="password" required/>
          </label>
          <button type="submit">
            Authenticate
          </button>
        </form>
      </div>
    `
  }

  return `
    <button data-logout>
      Disconnect
    </button>

    <button data-dashboard>
      Go to Dashboard
    </button>
  `
})

$.when('click', '[data-dashboard]', async () => {
  window.location.href = '/app/weild-dealdash'
})

$.when('click', '[data-logout]', async () => {
  disconnect()
})

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

export async function getUser() {
  return await supabase.auth.getUser()
}

export async function disconnect() {
  const { error } = await supabase.auth.signOut()
  if(!error) {
    $.teach({ connected: false })
  }
}

$.when('submit', 'form', (event) => {
  event.preventDefault()
})
$.when('click', '[type="submit"]', async (event) => {
  $.teach({ message: null })
  let connected

  const {
    email,
    password,
  } = $.learn()

  {  // login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if(!error) {
      connected = true
      debugger
      $.teach({ password: '', connected })
    }
  }

  if(connected) return
  $.teach({ message: "Issue with authentication... Retrying..." })

  { // or create
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if(!error) {
      $.teach({
        message: 'Registration Successful. Confirm your email, then authenticate'
      })
      return
    }

    $.teach({ message: "Unable to authenticate at this time, please try agian later." })
  }
})


$.style(`
  & {
    overflow: auto;
    min-height: 480px;
    display: block;
    height: 100%;
    width: 100%;
    line-height: 2rem;
    position: relative;
    padding: 6rem 0;
  }

  & *:focus {
    border-color: orange;
    outline-color: orange
  }

  & .page {
    height: 100%;
    padding: 0 0 5rem;
  }

  & [name="login"] {
    background: lemonchiffon;
    max-width: 320px;
    margin: auto;
    inset: 0;
    padding: 1rem;
    position: absolute;
    aspect-ratio: 1;
    box-shadow:
      0px 0px 4px 4px rgba(0,0,0,.10),
      0px 0px 12px 12px rgba(0,0,0,.05);
  }

  & .label {
    color: saddlebrown;
  }
  & .title {
    margin-bottom: 1rem;
    display: block;
    color: saddlebrown;
  }

  & [type="submit"] {
    width: 100%;
  }
`)

$.when('scroll', 'textarea', function({ target }) {
    const scrollTop = target.scrollTop;
    target.style.backgroundPosition = `0px ${-scrollTop}px`;
});

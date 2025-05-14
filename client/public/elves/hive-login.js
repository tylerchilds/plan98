import supabase from '@sillonious/database'
import elf, { state } from '@silly/tag'
import { showModal } from '@plan98/modal'
import {
  clearSession,
} from './bayun-wizard.js'

export const $ = elf('hive-login', {
  email: '',
  password: '',
  message: '',
  connected: false,
  newAccount: false,
  user: null
})

let connected = false
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    if(!connected) {
      connected = true;
      state['ls/supabase.auth.token'] = JSON.stringify(session)
      $.teach({ user: session.user });
      [...document.querySelectorAll($.link)].map((x) => {
        x.dispatchEvent(new Event('connected'))
      })
    }
  } else {
    if(connected) {
      connected = false;
      state['ls/supabase.auth.token'] = null
      $.teach({ user: null });
      [...document.querySelectorAll($.link)].map((x) => {
        x.dispatchEvent(new Event('disconnected'))
      })
    }
  }
});

const savedSession = state['ls/supabase.auth.token']

if (savedSession) {
  const session = JSON.parse(savedSession);
  await supabase.auth.setSession(session.access_token);
  $.teach({ user: session.user })
}

$.draw((target) => {
  const {
    message,
    user,
    newAccount
  } = $.learn()

  if(!user && newAccount) {
    return `
      <h2>Register</h2>
      <p>
        If you have an account already, please <a href="#" class="account-toggle">Login Here</a>
      </p>
      <div class="account-message">${message ? message : ''}</div>
      <form method="POST" name="register">
        <label class="field">
          <span class="label">Email</span>
          <input type="text" name="email" required/>
        </label>
        <label class="field">
          <span class="label">Password</span>
          <input type="password" name="password" required/>
        </label>
        <button type="submit">
          Register
        </button>
      </form>
    `
  }

  if(!user) {
    return `
      <h2>Login</h2>
      <p>
        If you do not have an account yet, please <a href="#" class="account-toggle">Register Here</a>
      </p>
      <div class="account-message">${message ? message : ''}</div>
      <form method="POST" name="login">
        <label class="field">
          <span class="label">Email</span>
          <input type="text" name="email" required/>
        </label>
        <label class="field">
          <span class="label">Password</span>
          <input type="password" name="password" required/>
        </label>
        <button type="submit">
          Login
        </button>
      </form>
    `
  }

  return `
    <p>
    Connected as: ${user.email}!
    </p>
    <button data-logout>
      Disconnect
    </button>
  `
}, {
  beforeUpdate: (target) => {
  }
})

$.when('click', '.account-toggle', () => {
  $.teach({ newAccount: !$.learn().newAccount })
})

$.when('click', '[data-logout]', async () => {
  $.teach({ message: null })
  disconnect()
})

export async function getUser() {
  return await supabase.auth.getUser()
}

export async function disconnect() {
  state['ls/supabase.auth.token'] = null
  $.teach({ user: null })
  clearSession()
  const { error } = await supabase.auth.signOut()
}

$.when('submit', '[name="login"]', async (event) => {
  event.preventDefault()
  $.teach({ message: null })

  const email = event.target.email.value
  const password = event.target.password.value

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if(!error) {
    const { data: { user } } = await supabase.auth.getUser()
    $.teach({ password: '', user })
    return
  }

  $.teach({
    message: "Invalid email and password combination"
  })
})

$.when('submit', '[name="register"]', async (event) => {
  event.preventDefault()

  $.teach({
    message: null
  })

  const email = event.target.email.value
  const password = event.target.password.value

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if(!error) {
    $.teach({
      newAccount: false,
      message: 'Registration Successful. Confirm your email, then login below!'
    })
    return
  }

  $.teach({
    message: "Unable to register at this time, please try again later."
  })
})



$.style(`
  & {
    max-width: 320px;
    padding: 1rem;
    display: block;
    margin: auto;
  }

  & .account-message {
    background: lemonchiffon;
    padding: .5rem;
  }

  & .account-message:empty {
    display: none;
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
    background: dodgerblue;
    padding: 1rem;
    color: white;
    transition: opacity 150ms;
    border-radius: 4px;
    font-weight: bold;
  }

  & [type="submit"]:hover,
  & [type="submit"]:focus {
  }

`)

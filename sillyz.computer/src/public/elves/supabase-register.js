import supabase from '@sillonious/database'
import module from '@silly/tag'
import { showModal, hideModal } from '@plan98/modal'

const $ = module('supabase-register', {
  email: '',
  password: '',
  message: null,
  connected: false,
  newAccount: true,
  user: null
})

function schedule(x, delay=1) { setTimeout(x, delay) }
function mount(target) {
  if(target.mounted) return
  target.mounted = true
  schedule(() => $.teach({ message: null }))
}


$.draw((target) => {
  mount(target)
  const {
    message,
  } = $.learn()

  return `
    <h2>Register</h2>
    <div class="message">${message ? message : ''}</div>
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
})

$.when('click', '[data-shut]', (event) => {
  hideModal()
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
      message: 'Registration Successful. Confirm your email, then authenticate'
    })
    return
  }

  $.teach({
    message: "Unable to register at this time, please try agian later."
  })
})

$.style(`
  & {
    max-width: 320px;
    padding: 1rem;
    display: block;
  }

  & weild-organizations {
    margin-bottom: 3rem;
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
  }

  & .message:not(:empty) {
    background: lemonchiffon;
    color: rgba(0,0,0,.85);
    padding: .5rem;
    margin-bottom: 1rem;
  }
`)

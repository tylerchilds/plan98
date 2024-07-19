import supabase from '@sillonious/database'
import module from '@silly/tag'
import { showModal } from '@plan98/modal'

const $ = module('supabase-login', {
  email: '',
  password: '',
  message: null,
  connected: false,
  newAccount: true,
  user: null
})


supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  } else {
    localStorage.removeItem('supabase.auth.token');
  }
});

function schedule(x, delay=1) { setTimeout(x, delay) }
async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  schedule(() => $.teach({ message: null }))

  const savedSession = localStorage.getItem('supabase.auth.token');

  if (savedSession) {
    const session = JSON.parse(savedSession);
    await supabase.auth.setSession(session.access_token);
    $.teach({ user: session.user })
  }
}

$.draw((target) => {
  mount(target)
  const {
    message,
    user,
    newAccount
  } = $.learn()

  if(!user) {
    return `
      <h2>Authenticate</h2>
      <div class="message">${message ? message : ''}</div>
      <form method="POST" name="authenticate">
        <label class="field">
          <span class="label">Email</span>
          <input type="text" name="email" required/>
        </label>
        <label class="field">
          <span class="label">Password</span>
          <input type="password" name="password" required/>
        </label>
        <button type="submit">
          Authenticate
        </button>

        <div style="text-align: center">
          <div>
          - or -
          </div>

          <button data-register class="secondary">
            Register
          </button>
        </div>
      </form>
    `
  }

  return `
    <p>
    Connected as: ${user.email}!
    </p>
    <weild-organizations></weild-organizations>
    <button data-logout>
      Disconnect
    </button>
  `
})

$.when('click', '[data-register]', (event) => {
  event.preventDefault()
  showModal(`
    <div style="background: white; padding 1rem;">
      <weild-registration></weild-registration>
    </div>
  `)
})

$.when('click', '[data-logout]', async () => {
  $.teach({ message: null })
  disconnect()
})

export async function getUser() {
  return await supabase.auth.getUser()
}

export async function disconnect() {
  const { error } = await supabase.auth.signOut()
  if(!error) {
    $.teach({ user: null })
    window.location.href = '/'
  }
}

$.when('submit', '[name="authenticate"]', async (event) => {
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
  }

  $.teach({
    message: "Unable to authenticate at this time, please try agian later."
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
`)

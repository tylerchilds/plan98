import supabase from '@sillonious/database'
import module from '@silly/tag'
import { showModal, hideModal } from '@plan98/modal'

const $ = module('plan98-register', {
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
    [...document.querySelectorAll($.link)].map((x) => {
      x.dispatchEvent(new Event('connected'))
    })
  } else {
    localStorage.removeItem('supabase.auth.token');
    [...document.querySelectorAll($.link)].map((x) => {
      x.dispatchEvent(new Event('disconnected'))
    })
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
    user
  } = $.learn()

  if(!user) {
    return `
      <h2>Connect</h2>
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
        <button class="call-to-action" type="submit">
          Connect
        </button>
      </form>
    `
  }

  return `
    <h3>Account</h3>
    <p>
      Connected as: ${user.email}!
    </p>
    <button class="call-to-action" data-next>
      Next
    </button>
    <button class="call-to-action" data-logout>
      Disconnect
    </button>
  `
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
  }
}


$.when('click', '[data-next]', async (event) => {
  const root = event.target.closest($.link)
  const { action, script } = root.dataset
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      self.history.pushState({ action, script }, "");
      await dispatch(event, root)
    }
  }
})



async function autoSignIn(event) {
  const email = event.target.email.value
  const password = event.target.password.value

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if(!error) {
    $.teach({
      message: 'Sign In Successful.'
    })

    const root = event.target.closest($.link)
    const { action, script } = root.dataset
    if(script) {
      const dispatch = (await import(script))[action]
      if(dispatch) {
        self.history.pushState({ action, script }, "");
        await dispatch(event, root)
      }
    }

    return
  }

  $.teach({
    message: "Unable to auto-sign-in at this time, please try agian later."
  })
}

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
      message: 'Registration Successful. Attempting auto-sign-in.'
    })

    autoSignIn(event)
    return
  }

  $.teach({
    message: "Unable to register at this time, please try agian later."
  })

  // try anyways
  autoSignIn(event)
})

$.style(`
  & {
    width: 100%;
    max-width: 320px;
    margin: auto;
    padding: 1rem;
    display: block;
  }

  & .page {
    height: 100%;
    padding: 0 0 5rem;
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

  & h2 {
    margin-top: 0;
  }

`)

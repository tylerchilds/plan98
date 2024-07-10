import module from "@silly/tag"
import PocketBase from "pocketbase"

const bases = {}
const logoutCallbacks = []

export function getBase(target) {
  const { base } = (target.closest('[data-base]') || document.querySelector('[data-base]')).dataset
  return bases[base]
}

export async function connect(target) {
  if(target.dataset.base) return
  const src = target.getAttribute('src') || plan98.database || "http://localhost:8090"
  target.dataset.base = src
  bases[src] = new PocketBase(src)
}

export function whenLogout(callback) {
  logoutCallbacks.push(callback)
}

const $ = module('potluck-authentication')

$.draw((target) => {
  connect(target)
  const { email="", password="" } = $.learn()
  const account = state['ls/~']

  return account ? `
    Logged in as:
    ${account.admin ? account.admin.email : ''}
    ${account.record ? account.record.email : ''}
    (${getBase(target).authStore.model.id})
    <button name="logout">
      Logout
    </button>
  ` : `
    <form>
      <label class="field">
        <span class="label">Player</span>
        <input name="email" type="text" value="${email}"/>
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input name="password" type="password" value="${password}"/>
      </label>
      <button class="button" type="submit">
        Connect
      </button>
    </form>
  `
})


$.when('click', '[name="logout"]', (event) => {
  const base = getBase(event.target)
  base.authStore.clear();
  state['ls/~'] = null
  logoutCallbacks.map(notify => notify())
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const base = getBase(event.target)
  base.authStore.clear();
  const email = event.target.email.value
  const password = event.target.password.value

  try {
    const admin = await authAsAdmin(base, {email, password})
    if(admin) {
      state['ls/~'] = admin
      return
    }
  } catch(e) {
    console.error(e)
  }

  try {
    const record = await authAsUser(base, {email, password})
    if(record) {
      state['ls/~'] = record
      return
    }
  } catch(e) {
    console.error(e)
  }

  // try to create an account and login
  // finally, error out
})

async function authAsAdmin(base, { email,password }) {
  return await base.admins.authWithPassword(email,password);
}

async function authAsUser(base, { email,password }) {
  return await base.collection('users').authWithPassword(email,password);
}

$.style(`
  & {
    display: block;
    margin: auto;
    max-width: 320px;
  }

  & .title {
    font-size: 72px;
    text-align: center;
    color: rgba(255,255,255,1);
    text-shadow:
      0 0px 3px var(--wheel-0-0),
      -2px -2px 3px var(--wheel-0-2),
      2px -2px 3px var(--wheel-0-3),
      4px 4px 5px var(--wheel-0-4),
      -4px 4px 5px var(--wheel-0-5),
      0 9px 15px var(--wheel-0-6);
    animation: &-pulse ease-in-out 2000ms alternate-reverse infinite;
  }

  @keyframes &-pulse {
    0% {
      opacity: .5;
    }

    100% {
      opacity: .85;
    }
  }
  & form {
    display: grid;
  }
`)

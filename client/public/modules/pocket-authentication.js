import module from "@sillonious/module"
import PocketBase from "pocketbase"

const bases = {}
const logoutCallbacks = []

export function getBase(target) {
  const { base } = target.closest('[data-base]').dataset
  return bases[base]
}

export function connect(target) {
  if(target.dataset.base) return
  const src = target.getAttribute('src') || "http://localhost:8090"
  target.dataset.base = src
  bases[src] = new PocketBase(src)
}

export function whenLogout(callback) {
  logoutCallbacks.push(callback)
}

const $ = module('pocket-authentication')

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
    Who are you?
    <form>
      <input name="email" type="text" value="${email}"/>
      <input name="password" type="password" value="${password}" />
      <button type="submit">
        Login
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

import module from "@sillonious/module"
import PocketBase from "pocketbase"

const bases = {}

const $ = module('pocket-authentication')

$.draw((target) => {
  initialize(target)
  const { account, email="", password="" } = $.learn()

  return account ? `
      Logged in as:
      ${account.admin ? account.admin.email : ''}
      ${account.record ? account.record.email : ''}
      (${bases[target.id].authStore.model.id})
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

function initialize(target) {
  if(target.dataset.base) return
  const { id } = target
  target.dataset.base = id
  const src = target.getAttribute('src') || "http://localhost:8090"
  bases[id] = new PocketBase(src)
}

$.when('click', '[name="logout"]', (event) => {
  const pb = bases[event.target.closest($.link).id]
  pb.authStore.clear();
  $.teach({ account: null })
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const pb = bases[event.target.closest($.link).id]
  const email = event.target.email.value
  const password = event.target.password.value

  try {
    const admin = await authAsAdmin(pb, {email, password})
    if(admin) {
      $.teach({ account: admin })
      return
    }
  } catch(e) {
    console.error(e)
  }

  try {
    const record = await authAsUser(pb, {email, password})
    if(record) {
      $.teach({ account: record })
      return
    }
  } catch(e) {
    console.error(e)
  }

  // try to create an account and login
  // finally, error out
})

async function authAsAdmin(pb, { email,password }) {
  return await pb.admins.authWithPassword(email,password);
}

async function authAsUser(pb, { email,password }) {
  return await pb.collection('users').authWithPassword(email,password);
}

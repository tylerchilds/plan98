import module from "@sillonious/module"
import PocketBase from "pocketbase"

const pb = new PocketBase("http://localhost:8090")
const $ = module('pocket-authentication')

$.draw(() => {
  const { account, email="", password="" } = $.learn()

  return account ? `
      Logged in as:
      ${account.admin ? account.admin.email : ''}
      ${account.record ? account.record.email : ''}
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

$.when('click', '[name="logout"]', () => {
  pb.authStore.clear();
  $.teach({ account: null })
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const email = event.target.email.value
  const password = event.target.password.value

  try {
    const admin = await authAsAdmin(email, password)
    if(admin) {
      $.teach({ account: admin })
      return
    }
  } catch(e) {
    console.error(e)
  }

  try {
    const record = await authAsUser(email, password)
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

async function authAsAdmin(email,pass) {
  return await pb.admins.authWithPassword(email,pass);
}

async function authAsUser(email,pass) {
  return await pb.collection('users').authWithPassword(email,pass);
}

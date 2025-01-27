import supabase from '@sillonious/database'
import elf, { state } from '@silly/tag'
import { showModal } from '@plan98/modal'

export const $ = elf('supabase-account', {
  email: '',
  password: '',
  message: '',
  connected: false,
  registration: false,
  user: null,
  profile: {
    nick: '',
    bio: '',
    color: '',
    picture: null,
    banner: null
  },
  upload: {},
  session: { user: {} },
})


supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    $.teach({ session })
  } else {
    $.teach({ session: null })
  }
});


async function query(target) {
  const { session } = $.learn()

  if(target.queried) return

  if(session.user.id) {
    const userId = session.user.id

    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('user_id', userId); 

    if(error) {
      $.teach({ error })
      return
    }

    if(!data[0]) return

    $.teach({ userId, profile: data[0] });
  }
}


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
    profile,
    registration
  } = $.learn()

  if(!user) {
    return registration ? `
      <div class="form">
        <h2>Register</h2>
        <p>
         Returning? <a data-swap href="javascript:;">Authenticate</a>.
        </p>
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
      </div>
    `:`
      <div class="form">
        <h2>Authenticate</h2>
        <p>
          No account? <a data-swap href="javascript:;">Register Now</a>
        </p>
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
        </form>
      </div>
    `
  }

  query(target)

  return `
    <div>
      ${user.email}
    </div>
    <button data-logout>
      Disconnect
    </button>

    <form class="profile" method="POST" action="edit-profile">
        <label class="field">
          <span class="label">Nick</span>
      
          <input type="text" name="nick" value="${escapeHyperText(profile.nick || '')}"/>
        </label>

        <label class="field">
          <span class="label">Bio</span>
          <textarea data-bind name="bio">${escapeHyperText(profile.bio || '')}</textarea>
        </label>
        <label class="field">
          <span class="label">Profile Picture</span>
          <img  src="${profile.picture || '/public/cdn/sillyz.computer/default-picture.png' }" />
          <input type="file" name="picture" accept="image/*">
        </label>
        <label class="field">
          <span class="label">Banner</span>
          <img  src="${profile.banner || '/public/cdn/sillyz.computer/synthia.webp' }" />
          <input type="file" name="banner" accept="image/*">
        </label>

        <label class="field">
          <span class="label">Color</span>
          <div style="width: 64px; height: 64px; margin: auto; background: ${profile.color || 'transparent'}"></div>
          <input name="color" type="color" value="${escapeHyperText(profile.color || '')}"/>
        </label>

        <div class="message">${message ? message : ''}</div>

        <div style="text-align: center">
          <button type="submit">
            Save
          </button>
        </div>
      </form>

  `
}, {
  afterUpdate: (target) => {
    {
      [...target.querySelectorAll('textarea')].map(ta => {
      console.log({ta});
        ta.style.height = ta.scrollHeight + "px"
      })
    }
  }
})

$.when('change', '[type="file"]', onImageSelection)

async function onImageSelection({ target }) {
  const file = target.files && target.files[0];
  if(!file) return

  const { userId } = $.learn()

  if(!userId) return
  const { data, error } = await supabase
  .storage
  .from('same-same')
  .upload(`${userId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false
  })

  const url = `${plan98.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
  $.teach({ [target.name]: url }, mergeProfile)
}

function mergeProfile(state, payload) {
  return {
    ...state,
    profile: {
      ...state.profile,
      ...payload
    },
    upload: {
      ...state.upload,
      ...payload
    }
  }
}

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '[data-swap]', async (event) => {
  event.preventDefault()
  $.teach({ registration: !$.learn().registration })
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
  state['ls/supabase.auth.token'] = null
  if(!error) {
    $.teach({ user: null })
  }
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
      message: 'Registration Successful. Confirm your email, then <a href="/app/supabase-login">authenticate</a>'
    })
    return
  }

  $.teach({
    message: "Unable to register at this time, please try agian later."
  })
})

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

$.when('submit', '[action="edit-profile"]', async event => {
  event.preventDefault()

  $.teach({
    message: null
  })

  const { nick, bio, color } = event.target
  const { picture, banner } = $.learn().upload

  const values = {
    user_id: JSON.parse(state['ls/supabase.auth.token']).user.id,
    nick: nick.value,
    bio: bio.value,
    color: color.value,
  }

  if(picture) {
    values.picture = picture
  }

  if(banner) {
    values.banner = banner
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([values], { onConflict: 'user_id' })
      .select()

    const response = error
      ? { error: true, message: error.message  }
      : { success: true, message: 'Profile updated successfully', profile: data[0] }

    $.teach(response)
  } catch(e) {
    $.teach({ error: e })
  }
})

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}


$.style(`
  & {
    display: block;
  }

  & .field img {
    max-height: 64px;
  }

  & .form {
    max-width: 320px;
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
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.6)), mediumseagreen;
    width: 100%;
    border: none;
    border-radius: 2px;
    padding: 1rem;
    color: white;
    padding: .5rem 1rem;
    transition: opacity 150ms;
  }

  & [type="submit"]:hover,
  & [type="submit"]:focus {
    background: linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.8)), mediumseagreen;
  }

  & textarea {
    resize: none;
  }

`)

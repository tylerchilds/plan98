import module, { state } from '@silly/tag'
import supabase from '@sillonious/database'
import { $ as $login } from './supabase-login.js'
import { showModal } from './plan98-modal.js'

const $ = module('supabase-profile', {
  profile: {
    nick: '',
    bio: '',
    color: '',
    picture: null,
    banner: null
  },
  upload: {}
})

$.draw((target) => {
  mount(target)
  const { error, success, profile, userId, edit } = $.learn()
  const hero = profile.banner || '/cdn/tychi.me/photos/aurora.JPG'

  if(edit) {
    return `
      <div class="hero" style="--background-image: url('${hero}')">
        <div class="banner" data-modal="<img src='${hero}' />"></div>
      </div>
      <div class="hero-row">
        <div class="actions-left">
          <button data-qr="${window.location.origin}/app/${$.link}?data-user=${userId}">
            Share
          </button>
        </div>
        <div class="picture">
          <img  src="${profile.picture || '/cdn/tychi.me/photos/unprofessional-headshot.jpg' }" />
        </div>
        <div class="actions-right">
          <button data-edit>
            Back
          </button>
        </div>
      </div>
      <form class="profile" method="POST" action="edit-profile">
        <div class="nick">
          <input type="text" name="nick" value="${escapeHyperText(profile.nick || '')}"/>
        </div>
        <div class="bio"><textarea name="bio">${escapeHyperText(profile.bio || '')}</textarea></div>

        <div class="input-field">
          Profile Picture<br>
          <input type="file" name="picture" accept="image/*">
        </div>
        <div class="input-field">
          Banner Image<br>
          <input type="file" name="banner" accept="image/*">
        </div>

        <label class="field">
          <span class="label">Color</span>
          <input name="color" value="${escapeHyperText(profile.color || '')}"/>
        </label>

        <div style="text-align: center">
          <button type="submit">
            Save
          </button>
        </div>
      </form>
    ` 
  }

  target.innerHTML = `
    <div class="hero" style="--background-image: url('${hero}')">
      <div class="banner" data-modal="<img src='${hero}' />"></div>
    </div>
    <div class="hero-row">
      <div class="actions-left">
        <button data-qr="${window.location.origin}/app/${$.link}?data-user=${userId}">
          Share
        </button>
      </div>
      <div class="picture">
        <img  src="${profile.picture || '/cdn/tychi.me/photos/unprofessional-headshot.jpg' }" />
      </div>
      <div class="actions-right">
        <button data-edit>
          Edit
        </button>
      </div>
    </div>
    <div class="profile">
      <div class="nick">
        ${escapeHyperText(profile.nick)}
      </div>
      <div class="bio">${escapeHyperText(profile.bio)}</div>
    </div>
    <supabase-updates data-user="${userId}"><supabase-updates>
  `
}, {
  beforeUpdate: (target) => {
    {
      const { profile } = $.learn()
      if(profile.color) {
        target.style = `--profile-color: ${profile.color}`;
      }
    }
  },
  afterUpdate: (target) => {
    {
      [...target.querySelectorAll('textarea')].map(ta => {
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

async function mount(target) {
  if(target.mounted) return
  target.mounted = true

  let userId = target.dataset.user 

  if(!userId) {
    try {
      userId = JSON.parse(state['ls/supabase.auth.token']).user.id
    } catch(_e) {
      //
    }
  }

  if(!userId) return

  $.teach({ userId })
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('user_id', userId); 

  if(error) {
    $.teach({ error })
    return
  }

  if(!data[0]) return

  $.teach({ profile: data[0] })
}

$.style(`
  & {
    display: block;
  }

  & [type="submit"] {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.6)), mediumseagreen;
    border-radius: 2px;
    border: none;
    color: white;
    padding: .5rem 1rem;
    transition: opacity 150ms;
  }

  & [type="submit"]:hover,
  & [type="submit"]:focus {
    background: linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.8)), mediumseagreen;
  }

  & .profile {
  }

  & .profile input[type="text"],
  & .profile textarea {
    border: 0;
    padding: 0;
    width: 100%;
    outline: 1px solid rgba(0,0,0,.25);
    outline-offset: 3px;
  }

  & .profile textarea {
    width: 100%;
    resize: none;
    line-height: 1;
    color: rgba(0,0,0,.65);
  }

  & [action="edit-profile"] {
  }

  & .nick {
    font-size: 2rem;
    padding: .5rem 1rem;
  }

  & .bio {
    padding: .5rem 1rem;
    font-size: 1.5rem;
    color: rgba(0,0,0,.65);
    line-height: 1;
    white-space: pre-wrap;
  }

  & .field {
    padding: .5rem 1rem;
  }

  & .field input {
    background: white;
    border: 1px solid rgba(0,0,0,.25);
  }

  & .input-field {
    padding: .5rem 1rem;
  }

  & [data-qr] {

  }

  & [data-edit] {

  }

  & .hero {
    height: 35vh;
    min-height: 128px;
    border-bottom: 2px solid var(--profile-color, white);
    box-shadow: 0 2px 5px 2px rgba(0,0,0,.25);
  }

  & .picture {
    position: relative;
    top: -64px;
    border-radius: 2px;
    aspect-ratio: 1;
    overflow: hidden;
    margin-bottom: -64px;
    box-shadow: 0 3px 7px 3px rgba(0,0,0,.1);
    transform: scale(1);
    transition: transform 150ms ease-in-out;
  }

  & .picture:hover {
    transform: scale(1.1);
  }

  & .picture img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 2px solid var(--profile-color, white);
  }

  & .hero-row {
    display: grid;
    grid-template-columns: 1fr 128px 1fr;
  }

  & .actions-left {
    padding: .5rem;
  }

  & .actions-right {
    text-align: right;
    padding: .5rem;
  }

  & .hero-row button {
    background: transparent;
    color: rgba(0,0,0,.65);
    border: none;
    border-radius: 0;
    border: 1px solid rgba(0,0,0,.65);
    padding: .25rem .5rem;
    border-radius: 2px;
  }

  & .hero-row button:hover,
  & .hero-row button:focus {
    border: 1px solid rgba(0,0,0,.85);
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.25);
  }

  & .wrapper{
    display: block;
    max-width: 6in;
    padding: 1rem;
    margin: 0 auto;
    color: white;
    background: rgba(0,0,0,.85);
    overflow: hidden;
  }

  & .banner {
    background-image: var(--background-image);
    background-size: cover;
    height: 100%;
  }
`)

$.when('submit', '[action="edit-profile"]', async event => {
  event.preventDefault()

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
      ? { error: error.message }
      : { success: true, edit: false, profile: data[0] }

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

$.when('click', '[data-edit]', (event) => {
  $.teach({ edit: !$.learn().edit })
})

$.when('click', '[data-modal]', (event) => {
  showModal(event.target.dataset.modal)
})

$.when('click', '.picture img', (event) => {
  showModal(event.target.outerHTML)
})
$.when('click', '[data-qr]', (event) => {
  showModal(`
    <div style="background: white; height: 100%; display: grid; place-items: center;">
      <qr-code src="${event.target.dataset.qr}" data-fg="black" data-bg="white" style="width: 240px; height: 240px; max-width: 100%; max-height: 100%;"></qr-code>
    </div>
  `)
})

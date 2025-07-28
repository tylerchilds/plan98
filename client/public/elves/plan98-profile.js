import elf, { state } from '@silly/tag'
import supabase from '@sillonious/database'
import { $ as $login } from './hive-login.js'
import { $ as $persona } from './secure-persona.js'
import { showModal } from './plan98-modal.js'

const zeroState = {
  accountTab: 'updates',
  friendshipStatus: null,
  userId: null,
  profile: {
    nick: '',
    bio: '',
    color: '',
    picture: null,
    banner: null
  },
  upload: {}
}

const $ = elf('plan98-profile', zeroState)

$.when('disconnected', 'hive-login', (event) => {
  $.teach(zeroState)
})


const tabs = {
  updates: {
    label: 'Updates',
    render: () => {
      const { userId } = $.learn()
      return `
        <div>
          <hive-updates data-user="${userId}"><hive-updates>
        </div>
      `
    }
  },
  following:  {
    label: 'Following',
    render: () => {
      return `
        <div>
          <hive-following><hive-following>
        </div>

      `
    }
  },
  followers:  {
    label: 'Followers',
    render: () => {
      return `
        <div>
          <hive-followers><hive-followers>
        </div>
      `
    }
  }

}


$.draw((target) => {
  const { accountTab, profile, userId, edit } = $.learn()
  mount(target)

  if(!userId) {
    target.innerHTML = `<hive-login></hive-login>`
    return
  }

  queryProfileData(target)
  const hero = profile.banner || '/cdn/tychi.me/photos/aurora.JPG'

  const activeId = $login.learn().user?.id

  if(edit) {
    return `
      <div class="hero" style="--background-image: url('${hero}')">
        <div class="banner" />"></div>
      </div>
      <div class="hero-row">
        <div class="actions-left">
          <button data-qr="${window.location.origin}/app/${$.link}?data-user=${userId}">
            Share
          </button>
        </div>
        <div class="picture">
          <img  src="${profile.picture || '/public/cdn/hivelabworks.com/classic-logo.svg' }" />
        </div>
        <div class="actions-right">
          <button data-edit>
            Back
          </button>
        </div>
      </div>
      <form class="profile" method="POST" action="edit-profile">
        <button type="submit">
          Save
        </button>
        <label class="field">
          <span class="label">Nickname</span>
          <input name="nick" value="${escapeHyperText(profile.nick || '')}"/>
        </label>

        <label class="field">
          <span class="label">Biography</span>
          <textarea name="bio">${escapeHyperText(profile.bio || '')}</textarea>
        </label>

        <label class="field">
          <span class="label">Color</span>
          <input name="color" value="${escapeHyperText(profile.color || '')}"/>
        </label>

        <div class="input-field">
          Profile Picture<br>
          <input type="file" name="picture" accept="image/*">
        </div>
        <div class="input-field">
          Banner Image<br>
          <input type="file" name="banner" accept="image/*">
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
        <img  src="${profile.picture || '/public/cdn/hivelabworks.com/classic-logo.svg' }" />
      </div>
      <div class="actions-right">
        ${activeId === userId ? `
          <button data-edit>
            Settings
          </button>
        `:renderFriendshipStatus()}
      </div>
    </div>
    <div class="profile">
      <div class="nick">
        ${escapeHyperText(profile.nick || '')}
      </div>
      <div class="bio">${escapeHyperText(profile.bio || '')}</div>
    </div>

    ${activeId === userId ? `
      <div class="tabs">
        ${Object.keys(tabs).map(key => {
          return `
            <button data-tab="${key}" class="${accountTab === key?'active':''}">
              ${tabs[key].label}
            </button>
          `
        }).join('')}
      </div>
      <div class="tab" key="${accountTab}">
        ${tabs[accountTab].render()}
      </div>
    ` : `
      <div class="tab" key="${accountTab}">
        ${tabs.updates.render()}
      </div>
    `}
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

    {
      recoverElves(target, 'sl-icon')
      recoverElves(target, 'hive-login')
      recoverElves(target, 'secure-persona')
      recoverElves(target, 'action-script')
      recoverElves(target, 'hive-updates')
      recoverElves(target, 'hive-following')
      recoverElves(target, 'hive-followers')
    }
  }
})

function renderFriendshipStatus() {
  const { friendshipStatus } = $.learn()

  if(!friendshipStatus) return ''

  const { userPersona, profilePersona, friendcryption } = friendshipStatus

  const { id: friendcryptionId, approved } = friendcryption || {}

  if(approved) {
    return 'Approved'
  }

  if(friendcryptionId) {
    return 'Requested'
  }

  if(!userPersona) {
    return `
      <button class="profile-action create-persona">
        Persona Required
      </button>
    `
  }

  if(!profilePersona) {
    return 'No Persona'
  }

  return `
    <button class="profile-action request-friendcryption" data-you="${profilePersona.id}" data-me="${userPersona.id}">
      Request
    </button>
  `
}

$.when('click', '.create-persona', async (event) => {
  showModal(`
    <div style="max-width: 55ch; margin: 0 auto; padding: 1rem; background: white;">
      <div style="font-size: 2rem; color: rgba(0,0,0,.65); margin-bottom: 1rem;">Persona Required</div>
      <div style="margin-bottom: 1rem">You must be authenticated with a persona to be able to follow or be followed on the network.</div>
      <secure-persona></secure-persona>
    </div>
  `)
})

$.when('click', '.request-friendcryption', async (event) => {
  const { you, me } = event.target.dataset

  const activeId = $login.learn().user?.id
  const { data, error } = await supabase
    .from('friendcryption')
    .insert({
      target_id: you,
      friend_id: me
    })
    .select()
    .single();

  if(error) {
    console.error(error)
    return
  }

  $.teach(data, (state, payload) => {
    return {
      ...state,
      friendshipStatus: {
        ...(state.friendshipStatus || {}),
        friendcryption: payload
      }
    }
  })
})

async function queryFriendshipStatus(profileId, userId) {
  // 1. Get persona_id for profileId
  const { data: profilePersona, error: profilePersonaError } = await supabase
    .from('persona')
    .select('*')
    .eq('user_id', profileId)
    .maybeSingle();

  if (profilePersonaError) {
    console.error('Error fetching profile persona:', profilePersonaError);
    return { data: null, error: profilePersonaError };
  }

  // 2. Get persona_id for userId
  const { data: userPersona, error: userPersonaError } = await supabase
    .from('persona')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (userPersonaError) {
    console.error('Error fetching user persona:', userPersonaError);
    return { data: null, error: userPersonaError };
  }

  if (!userPersona || !profilePersona) {
    return { data: { userPersona, profilePersona } };
  }

  // 3. Get friendcryption entry
  const { data: friendcryption, error: friendcryptionError } = await supabase
    .from('friendcryption')
    .select('*')
    .eq('target_id', profilePersona.id)
    .eq('friend_id', userPersona.id)
    .maybeSingle();

  if (friendcryptionError) {
    console.error('Error fetching friendcryption entry:', friendcryptionError);
    return { data: null, error: friendcryptionError };
  }

  return { data: { userPersona, profilePersona, friendcryption }, error: null };
}

$.when('click', '[data-tab]', (event) => {
  const accountTab = event.target.dataset.tab
  $.teach({ accountTab })
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

function mount(target) {
  if(target.mounted) return
  target.mounted = true

  let userId = target.dataset.user 

  if(!userId) {
    try {
      userId = $login.learn().user?.id
    } catch(_e) {
      //
    }
  }
  $.teach({ userId })
}

$.when('connected', 'hive-login', () => {
  const userId = $login.learn().user?.id
  $.teach({ userId })
})

async function queryProfileData(target) {
  const { userId } = $.learn()
  if(!userId) return

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

  const activeId = $login.learn().user?.id

  const { data: friendshipStatus, error: friendshipError } = await queryFriendshipStatus(userId, activeId)

  if(friendshipError) {
    console.error(friendshipError)
  } else {
    $.teach({ friendshipStatus })
  }
}

$.style(`
  & {
    display: block;
    position: relative;
  }

  & .profile [type="submit"] {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.6)), mediumseagreen;
    border-radius: 2px;
    border: none;
    color: white;
    padding: .5rem 1rem;
    transition: opacity 150ms;
  }

  & .profile [type="submit"]:hover,
  & .profile [type="submit"]:focus {
    background: linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.8)), mediumseagreen;
  }

  & .profile {
    padding: 1rem;
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
    text-align: center;
  }

  & .bio {
    text-align: center;
    padding: .5rem 1rem;
    font-size: 1.5rem;
    color: rgba(0,0,0,.65);
    line-height: 1;
    white-space: pre-wrap;
  }

  & .field input,
  & .field textarea {
    background: white;
    border: 1px solid rgba(0,0,0,.25);
  }

  & .input-field {
    padding: .5rem 0;
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
    background-position: center;
  }

  & .tabs {
    text-align: center;
    position: relative;
  }

  & .tab {

    padding: 1rem;
  }

  & .tabs button {
    border: 1px solid transparent;
    padding: .5rem;
    color: rgba(0,0,0,.65);
    background-color: rgba(0,0,0,.15)
  }

  & .tabs .active {
    background: white;
    border-color: rgba(0,0,0,.15);
    color: black;
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
    <div style="background: white; width: 100%; height: 100%; display: grid; place-items: center;">
      <qr-code src="${event.target.dataset.qr}" data-fg="black" data-bg="white" style="width: 240px; height: 240px; max-width: 100%; max-height: 100%;"></qr-code>
    </div>
  `)
})

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.replaceWith(newNode)
  })
}

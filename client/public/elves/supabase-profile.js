import module, { state } from '@silly/tag'
import supabase from '@sillonious/database'

const $ = module('supabase-profile', {
  profile: {
    nick: '',
    bio: '',
    picture: null,
    banner: null
  },
  upload: {}
})

$.draw((target) => {
  mount(target)
  const { error, success, profile } = $.learn()
  return `
    <form method="POST">
      <input type="file" name="picture" accept="image/*">
      <img src="${profile.picture || '/cdn/tychi.me/photos/unprofessional-headshot.jpg' }" />
      <input type="file" name="banner" accept="image/*">
      <img src="${profile.banner || '/cdn/tychi.me/photos/aurora.JPG' }" />
      <label class="field">
        <span class="label">Nickname</span>
        <input name="nick" value="${escapeHyperText(profile.nick)}"/>
      </label>
      <label class="field">
        <span class="label">Bio</span>
        <textarea name="bio">${escapeHyperText(profile.bio)}</textarea>
      </label>
      <button type="submit">
        Submit
      </button>
    </form>
  `
})

$.when('change', '[type="file"]', onImageSelection)

async function onImageSelection({ target }) {
  const file = target.files && target.files[0];
  if(!file) return

  const userId = target.closest($.link).dataset.user

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
      target.dataset.user = userId
    } catch(_e) {
      //
    }
  }

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
}


$.style(`
  & {
    display: block;
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
`)

$.when('submit', 'form', async event => {
  event.preventDefault()

  const { nick, bio } = event.target
  const { picture, banner } = $.learn().upload

  const values = {
    user_id: JSON.parse(state['ls/supabase.auth.token']).user.id,
    nick: nick.value,
    bio: bio.value,
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
      .insert(values)

    const response = error
      ? { error: error.message }
      : { success: true }

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



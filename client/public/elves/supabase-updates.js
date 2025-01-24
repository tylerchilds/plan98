import module, { state } from '@silly/tag'
import supabase from '@sillonious/database'

const $ = module('supabase-updates', { updates: [] })

$.draw((target) => {
  mount(target)
  const { updates, saga, error, success } = $.learn()
  console.log({ saga })
  return `
    <form method="POST" action="post-update">
      <textarea data-bind name="saga" value="${escapeHyperText(saga)}" style="height: ${$.learn().statusHeight}" placeholder="What's up?"></textarea>
      <button type="submit">
        Post
      </button>
    </form>

    <div class="updates">
      ${updates.map(render).join('')}
    </div>
  `
}, {
  afterUpdate: (target) => {
    {
      [...target.querySelectorAll('textarea')].map(ta => {
        ta.style.height = ta.scrollHeight + "px"
      })
    }
  }
})



$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

function render(update) {
  return `
    <div class="status-update">
      <div class="status-update-picture">
        <img src=${update.profiles.picture || '/public/cdn/sillyz.computer/default-picture.png'} />
      </div>
      <div>
        <div class="status-update-nickname">
          @${update.profiles.nick}
        </div>
        <div class="status-update-update">
          ${update.saga}
        </div>
      </div>
    </div>
  `
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

  const { data, error } = await supabase
    .from('updates')
    .select(`
      *,
      profiles (*)
    `)
    .eq('user_id', userId); 
  if(error) {
    $.teach({ error })
    return
  }
  
  supabase.channel('feed-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'updates', filter: `user_id=eq.${userId}`  },
    async (payload) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', payload.new.user_id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        return
      }

      const record = {
        ...payload.new,
        profiles: profileData
      }
      $.teach(record, mergeUpdate)

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteUpdate)
      }
    }
  )
  .subscribe()



  $.teach({ updates: data })
}

function mergeUpdate(state, payload) {
  return {
    ...state,
    updates: [
      ...state.updates,
      payload
    ]
  }
}


function deleteUpdate(state, payload) {
  const newState = {
    ...state,
  }

  const index = newState.updates.findIndex(({id}) => {
    return id === payload.id
  })

  newState.updates.splice(index, 1)

  return newState
}



$.style(`
  & {
    display: block;
    max-width: 55ch;
    margin: auto;
  }

  & .updates {
    display: flex;
    flex-direction: column-reverse;
  }

  & .status-update {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    padding: .5rem 1rem;
  }

  & .status-update-nickname {
    color: rgba(0,0,0,.65);
    font-weight: bold;
    font-size: .9rem;
  }
  & .status-update-picture {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
  }

  & .status-update-picture img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 48px;
    height: 48px;
  }

  & [action="post-update"] {
    padding: 1rem;
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

  & textarea {
    width: 100%;
    resize: none;
    margin: .5rem 0;
    min-height: 4rem;
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

$.when('submit', '[action="post-update"]', async event => {
  event.preventDefault()

  const { saga } = event.target

  const values = {
    user_id: JSON.parse(state['ls/supabase.auth.token']).user.id,
    saga: saga.value,
  }

  try {
    const { data, error } = await supabase
      .from('updates')
      .insert(values)

    const response = error
      ? { error: error.message }
      : { success: true, saga: '' }

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

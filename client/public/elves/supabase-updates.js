import module from '@silly/tag'
import supabase from '@sillonious/database'

const $ = module('supabase-updates', { updates: [] })

$.draw((target) => {
  mount(target)
  const { updates, error, success } = $.learn()

  return `
    <form method="POST">
      <textarea name="saga"></textarea>
      <button type="submit">
        Submit
      </button>
    </form>

    ${updates.map(render).join('')}
  `
})

function render(update) {
  return update.saga
}

async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const { data, error } = await supabase
    .from('updates')
    .select()

  if(error) {
    $.teach({ error })
    return
  }
  
  const userId = JSON.parse(state['ls/supabase.auth.token']).user.id
  supabase.channel('feed-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'updates', filter: `user_id=eq.${userId}`  },
    async (payload) => {
      $.teach(payload.new, mergeUpdate)

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
      : { success: true }

    $.teach(response)
  } catch(e) {
    $.teach({ error: e })
  }
})

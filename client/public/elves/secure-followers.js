import elf  from '@plan98/elf'
import { bayunCore } from '@sillonious/vault'
import {
  getSession,
  clearSession,
} from './bayun-wizard.js'
import {
  addFollow,
  blockFollow,
  persona,
  getPersona
} from './secure-persona.js'

const $ = elf('secure-followers', { follower: {moniker: '', organization: 'sillyz.computer' }, followers: [], syncStatus: null })

$.draw((target) => {
  mount(target)

  const { follower, followers, loading } = $.learn()
  if(loading) {
    return `
      <disk>
        <flying-disk></flying-disk>
      </disk>
    `
  }

  const newFollowerForm = `
    <div>
      <div class="relationship-member">
        <label class="field">
          <span class="label">Moniker</span>
          <input data-bind="follower" name="moniker" value="${escapeHyperText(follower.moniker)}"/>
        </label>
        <label class="field">
          <span class="label">Organization</span>
          <input data-bind="follower" name="organization" value="${escapeHyperText(follower.organization)}"/>
        </label>
        <button data-add-follower class="standard-button -round bias-positive">
          <sl-icon name="plus-lg"></sl-icon>
        </button>
      </div>
    </div>
  `

  const approvedFollowers = followers.filter(x => x.approved)

  return approvedFollowers.length > 0 ? `
    <div class="form-subtitle">
      Friends

      <span style="display: inline-grid; place-content: center;">
        <button data-full-sync class="standard-button -small -round bias-generic">
          <sl-icon name="arrow-repeat"></sl-icon>
        </button>
      </span>
    </div>
    ${renderSyncronizer()}
    ${newFollowerForm}
    <div class="relationship-group">
      ${approvedFollowers.map(render).join('')}
    </div>
  ` : `
    <div class="form-subtitle">
      Friends
      <button data-full-sync class="standard-button -small -round -bias-generic">
        <sl-icon name="arrow-repeat"></sl-icon>
      </button>
    </div>
    ${renderSyncronizer()}
    ${newFollowerForm}
  `
}, {
  afterUpdate: (target) => {
    recoverElves(target, 'sl-icon')
    recoverElves(target, 'flying-disk')
  }
})

function renderSyncronizer() {
  const { sessionId } = getSession()
  if(! sessionId) {
    return ''
  }

  const { syncStatus, syncError, addedMembersCount, removedMembersCount } = $.learn()

  return `
    ${syncError ? syncError: ''}
    ${ syncStatus ? `
        <p>
          ${syncStatus}
        </p>
        ${addedMembersCount? `
          <p>
            Added: ${addedMembersCount}
          </p>
        `:''}
        ${removedMembersCount? `
          <p>
            Removed: ${removedMembersCount}
          </p>
        `:''}
      `: `
    `}
  `
}

function render(follower) {
  return `
    <div class="relationship-member">
      <div class="member-handle">
        ${follower.moniker}
      </div>

      <div class="organization-handle">
        ${follower.organization}
      </div>
      <div class="member-actions">
        ${follower.approved ? `
          <button class="standard-button bias-negative -smol -round" data-remove-follower="${follower.moniker}@${follower.organization}">
            <span>
              <sl-icon name="x-lg"></sl-icon>
            </span>
          </button>
        `:`
          <button class="icon-action negative follower-delete" data-friend="${follower.friend_id}">
            <span>
              <sl-icon name="x-lg"></sl-icon>
            </span>
          </button>

          <button class="icon-action positive follower-approve" data-friend="${follower.friend_id}">
            <span>
              <sl-icon name="check-lg"></sl-icon>
            </span>
          </button>
        `}
      </div>
    </div>
  `
}

$.when('click', '.follower-delete', async (event) => {
  const { friend } = event.target.dataset

  const { error } = await supabase
    .from('friendcryption')
    .delete()
    .eq('friend_id', friend);

    if (error) {
      console.error('Error deleting row:', error);
      return
    }

  query()
})

$.when('click', '.follower-kick', async (event) => {
  const { friend } = event.target.dataset

  const { data, error } = await supabase
    .from('friendcryption')
    .update({ approved: false, approval_timestamp: null })
    .eq('friend_id', friend);

  if (error) {
    console.error('Error removing approval:', error);
    return;
  }

  query()

  const { data: personaData, error: personaError } = await supabase
    .from('persona')
    .select('*')
    .eq('id', friend)
    .single();

  if (personaError || !personaData) {
    console.error('Error fetching persona:', personaError);
  } else {
    const { persona } = $.learn()
    if(persona.bayun_group_id) {
      const { sessionId } = getSession()
      bayunCore.removeMemberFromGroup(sessionId, persona.bayun_group_id, personaData.moniker, personaData.organization)
      .then(result => {
        console.log(result)
      }).catch(e => {
        console.error(e)
      })
    }

  }
})

$.when('click', '[data-add-follower]', async (event) => {
  const { moniker, organization } = $.learn().follower
  await addFollow(moniker, organization)
  $.teach({ followers: persona().followers || [] })
})

$.when('click', '[data-remove-follower]', async (event) => {
  const { removeFollower } = event.target.dataset
  const [moniker, organization ] = removeFollower.split('@')
  await blockFollow(moniker, organization)
  $.teach({ followers: persona().followers || [] })
})

async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  $.teach({ loading: true, syncStatus: null })
  query()
}

function query() {
  $.teach({ loading: false, followers: persona().followers || [] })
}

$.when('click', '.unfollow', async (event) => {
  const { target } = event.target.dataset

  const { error } = await supabase
    .from('friendcryption')
    .delete()
    .eq('target_id', target);

    if (error) {
      console.error('Error deleting row:', error);
      return
    }

  query()
})


$.when('click', '[data-full-sync]', async (event) => {
  $.teach({ addedMembersCount: null, removedMembersCount: null, syncStatus: "Fetching followers from database." })
  query()

  syncEncryptionGroupMembers(persona().groupId)
})

async function syncEncryptionGroupMembers(id) {
  const persona = await getPersona()
  if(!persona) return

  $.teach({ syncStatus: "Fetching list from encryption service." })
  const { sessionId } = getSession()
  const { groupMembers } = await bayunCore.getGroupById(sessionId, id)
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });

  const approvedFollowers = persona.followers.filter(x => x.approved)

  const addList = approvedFollowers.filter(follower => {
    return !groupMembers.some(member => {
      return follower.moniker === member.companyEmployeeId && follower.organization === member.companyName
    })

  }).map(x => {
    return {
      companyName: x.organization,
      companyEmployeeId: x.moniker
    }
  })

  const removeList = groupMembers.filter(member => {
    // is the group owner
    if(persona.moniker === member.companyEmployeeId && persona.organization === member.companyName) {
      return false
    }

    return !approvedFollowers.some(follower => {
      return follower.moniker === member.companyEmployeeId && follower.organization === member.companyName
    })
  }).map(x => {
    return {
      companyName: x.companyName,
      companyEmployeeId: x.companyEmployeeId
    }
  })


  if(addList.length > 0) {
    $.teach({ syncStatus: "Adding followers to the encryption service." })
    const addedMembersResponse = await bayunCore.addMembersToGroup(sessionId,id,addList).catch(e => {
      $.teach({ syncStatus: null, syncError: "Error adding members to encryption service" })
    })

    $.teach({ addedMembersCount: addedMembersResponse.addedMembersCount })
  }

  if(removeList.length > 0) {
    $.teach({ syncStatus: "Removing followers to the encryption service." })

    const removedMembersResponse = await bayunCore.removeMembersFromGroup(sessionId,id,removeList).catch(e => {
      $.teach({ syncStatus: null, syncError: "Error removing members from the encryption service" })
    })
    $.teach({ removedMembersCount: removeList.length })
  }

  $.teach({ syncStatus: "Finished syncronizing friendcryption. Everything up to date." })
}

$.style(`
  & {
    display: block;
    max-width: 55ch;
    margin: auto;
    padding: 0 .5rem;
  }

  & .relationship-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: 1rem;
  }

  & .relationship-member {
    display: grid;
    grid-template-columns: 1fr 1fr 2rem;
    border-radius: 4px;
    background: rgba(255,255,255,.15);
    gap: 1rem;
    align-items: center;
  }

  & .member-actions {
    display: flex;
    gap: .5rem;
    place-content: center;
  }
  & .member-handle {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .member-handle,
  & .organization-handle {
    padding: 0 .5rem;
  }

  & .member-picture img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  & .inline-action {
    background: transparent;
    color: rgba(0,0,0,.65);
    border: none;
    border-radius: 0;
    border: 1px solid rgba(0,0,0,.65);
    padding: .25rem .5rem;
    border-radius: 2px;
  }

  & .inline-action:hover,
  & .inline-actions:focus {
    border: 1px solid rgba(0,0,0,.85);
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.25);
  }

  & .icon-action {
    background: transparent;
    color: rgba(0,0,0,.65);
    border: none;
    border-radius: 0;
    border: 1px solid rgba(0,0,0,.65);
    padding: .25rem;
    border-radius: 2px;
    display: grid;
    place-items: center;
  }

  & .icon-action.positive {
    border-color: transparent;
    background: mediumseagreen;
    color: white;
    opacity: .8;
  }

  & .icon-action.positive:hover,
  & .icon-action.positive:focus {
    border-color: transparent;
    background: mediumseagreen;
    color: white;
    opacity: 1;
  }

  & .icon-action.negative {
    border-color: transparent;
    background: firebrick;
    color: white;
    opacity: .8;
  }

  & .icon-action.negative:hover,
  & .icon-action.negative:focus {
    border-color: transparent;
    background: firebrick;
    color: white;
    opacity: 1;
  }

  & .icon-action > span {
    display: grid;
    place-items: center;
  }

  & .icon-action:hover,
  & .icon-actions:focus {
    border: 1px solid rgba(0,0,0,.85);
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.25);
  }

  & .sync-friendcryption {
    background: mediumseagreen;
    text-align: left;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    align-items: center;
    border: none;
    padding: 1rem;
    border-radius: 4px;
    font-weight: bold;
    color: white;
    margin: 1rem auto;
  }

`)

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.replaceWith(newNode)
  })
}

$.when('input', '[data-bind]', handleBind)

const formats = {
  'stringify': (value) => {
    return JSON.stringify(value)
  }
}

function formatify(format, value) {
  if(formats[format]) {
    return formats[format](value)
  }

  return value
}

function handleBind(event) {
  const { bind, format } = event.target.dataset
  if(bind) {
    $.teach({
      name: event.target.name,
      value: formatify(format, event.target.value)
    }, {
      mergeHandler: bound,
      parameters: [bind]
    })
  } else {
    $.teach({ 
      name: event.target.name,
      value: formatify(format, event.target.value)
    })
  }
}

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        [payload.name]: payload.value
      }
    }
  }
}

function escapeHyperText(text = '') {
  if(!text) return ''
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



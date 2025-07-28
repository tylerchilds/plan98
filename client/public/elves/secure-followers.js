import elf, { state }  from '@silly/tag'
import supabase from '@sillonious/database'
import { bayunCore, BayunCore } from '@sillonious/vault'
import { $ as $login } from './hive-login.js'
import {
  getSession,
  clearSession,
} from './bayun-wizard.js'

const $ = elf('secure-followers', { followers: [], syncStatus: null })

$.draw((target) => {
  mount(target)

  const { followers, loading } = $.learn()
  if(loading) {
    return `
      <div>
        <flying-disk></flying-disk>
      </div>
    `
  }

  return followers.length > 0 ? `
    ${renderSyncronizer()}
    <div class="relationship-group">
      ${followers.map(render).join('')}
    </div>
  ` : `
    No one follows you yet... put yourself out there.
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
      To fully syncronize your approved followers with your encryption group, click "Sync Friendcryption"
      <button data-full-sync class="sync-friendcryption">
        <span>
          <sl-icon name="arrow-repeat"></sl-icon>
        </span>
        Sync Friendcryption
      </button>
    `}
    <hr>
  `
}

function render(follower) {
  return `
    <div class="relationship-member">
      <a class="member-picture" href="/app/secure-profile?data-user=${follower.user_id}">
        <img  src="${follower.picture || '/public/cdn/sillyz.computer/default-picture.png' }" />
      </a>
      <div class="member-handle" data-tooltip="${follower.moniker}@${follower.organization}">
        ${follower.nick || follower.moniker}
      </div>
      <div class="member-actions">
        ${follower.approved ? `
          <button class="icon-action negative follower-kick" data-friend="${follower.friend_id}">
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

$.when('click', '.follower-approve', async (event) => {
  const { friend } = event.target.dataset

  const { data, error } = await supabase
    .from('friendcryption')
    .update({ approved: true, approval_timestamp: new Date() })
    .eq('friend_id', friend);

  if (error) {
    console.error('Error approving friendcryption:', error);
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
      bayunCore.addMemberToGroup(sessionId, persona.bayun_group_id, personaData.moniker, personaData.organization)
      .then(result => {
        console.log(result)
      }).catch(e => {
        console.error(e)
      })
    }
  }
})


async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  $.teach({ loading: true, syncStatus: null })
  await query()

  const { persona } = $.learn()

  if(!persona.bayun_group_id && persona.id) {
    const { data, error } = await createFriendGroup(persona.id)

    if(error) {
      console.error(error)
    } else {
      console.log(data)
    }
  }
}

async function query() {
  const userId = $login.learn().user?.id

  const { data: followersData, error: followersError } = await getFollowersWithMutual(userId)

  $.teach({ loading: false })
  if(followersError) {
    console.error(followersError)
  } else {
    $.teach({ followers: followersData })
  }
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



async function getFollowersWithMutual(userId) {
  const { data: personaData, error: personaError } = await supabase
    .from('persona')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (personaError || !personaData) {
    console.error('Error fetching persona:', personaError);
    return { data: null, error: personaError };
  }

  $.teach({ persona: personaData })

  const personaId = personaData.id;

  const { data: followersData, error: followersError } = await supabase.rpc(
    'get_followers_with_mutual',
    { current_persona_id: personaId }
  );

  if (followersError) {
    console.error('Error fetching followers with mutual:', followersError);
    return { data: null, error: followersError };
  }

  return { data: followersData };
}

$.when('click', '[data-full-sync]', async (event) => {
  $.teach({ addedMembersCount: null, removedMembersCount: null, syncStatus: "Fetching followers from database." })
  await query()
  const { persona } = $.learn()

  if(!persona.bayun_group_id) {
    $.teach({ syncStatus: "Creating new group in encryption service." })

    const { data: group, error } = await createFriendGroup(persona.id)

    if(error) {
      $.teach({ syncStatus: error })
    } else {
      syncEncryptionGroupMembers(group.groupId)
    }
  } else {
    syncEncryptionGroupMembers(persona.bayun_group_id)
  }
})

async function createFriendGroup(id) {
  const groupType = BayunCore.GroupType.PRIVATE;
  const { sessionId } = getSession()
  const group = await bayunCore.createGroup(sessionId, `${id}:friends`, groupType)
    .catch(error => {
      console.log(error);
    });

  if(group) {
    const { groupId } = group

    const { error } = await supabase
      .from('persona')
      .update({ bayun_group_id: groupId })  // Set deleted to true instead of deleting
      .match({ id })

    if(!error) {
      return { data: group }
    } else {
      return { error: 'error saving group to database' }
    }
  } else {
    return { error: 'error creating group in encryption service' }
  }
}

async function syncEncryptionGroupMembers(id) {
  $.teach({ syncStatus: "Fetching list from encryption service." })
  const { sessionId } = getSession()
  const { groupMembers } = await bayunCore.getGroupById(sessionId, id)
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });

  const { followers, persona } = $.learn()

  const approvedFollowers = followers.filter(x => x.approved)

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
  }

  & .relationship-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .relationship-member {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    border-radius: 4px;
    background: rgba(255,255,255,.15);
    gap: 1rem;
    align-items: center;
  }

  & .member-actions {
    display: flex;
    gap: .5rem;
  }
  & .member-handle {
    text-overflow: ellipsis;
    overflow: hidden;
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

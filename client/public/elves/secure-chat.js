import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import supabase from '@sillonious/database'
import { render } from '@sillonious/saga'
import { bayunCore } from '@sillonious/vault'
import { getSession, clearSession } from './bayun-wizard.js'

const encryptionPolicy = BayunCore.EncryptionPolicy.GROUP;
const keyGenerationPolicy = BayunCore.KeyGenerationPolicy.ENVELOPE;

/*
   ^
  <@>
  !&{
   #
*/


const $ = module('secure-chat', { jokes: {} })

function getRoom(target) {
  return target.closest($.link).getAttribute('room')
}

export function joinRoom(r) {
  const {
    sessionId,
  } = getSession()

  bayunCore.joinPublicGroup(sessionId, r).catch(error => {
    console.log("Error caught");
    console.log(error);
  });
}

async function connect(target) {
  const {
    sessionId,
  } = getSession()

  if(!sessionId) return

  const room = getRoom(target)
  if(!room || target.subscribedTo === room) return
  target.subscribedTo = room

  $.teach({ jokes: [] })
  
  const { data, error } = await supabase
  .from('chat_history')
  .select(`
    *,
    profiles (*)
  `)
  // Filters
  .eq('room_id', room)
  .range(0, 25)

  data.map(async (row) => {
    const text = await bayunCore.unlockText(sessionId, row.text)
    const unix = await bayunCore.unlockText(sessionId, row.companyEmployeeId)
    const company = await bayunCore.unlockText(sessionId, row.companyName)
    $.teach({
      id: row.id,
      created_at: row.created_at,
      profiles: row.profiles,
      text,
      companyName: company,
      companyEmployeeId: unix
    }, mergeJoke)
  })

  supabase.channel('custom-whatever-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'chat_history' },
    async (payload) => {
      if (
        payload.new.room_id === room
      ) {
        const text = await bayunCore.unlockText(sessionId, payload.new.text)
        const unix = await bayunCore.unlockText(sessionId, payload.new.companyEmployeeId)
        const company = await bayunCore.unlockText(sessionId, payload.new.companyName)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', payload.new.user_id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }


        $.teach({
          id: payload.new.id,
          user_id: payload.new.user_id,
          room_id: payload.new.room_id,
          created_at: payload.new.created_at,
          profiles: profileData,
          text,
          companyName: company,
          companyEmployeeId: unix
        }, mergeJoke)
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteJoke)
      }
    }
  )
  .subscribe()

  $.teach({ groupName: null, groupList: null })
  bayunCore.getGroupById(sessionId, room)
    .then(result => {
      console.log("Response received for getGroupById.");
      console.log(result);
      const groupList = result.groupMembers.reduce((all, one) => {
        if(!all[one.companyName]) {
          all[one.companyName] = {
            members: []
          }
        }
        all[one.companyName].members.push(one.companyEmployeeId)
        return all
      }, {})

      $.teach({
        groupName: result.groupName,
        groupList: groupList
      })
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });

}

function mergeJoke(state, payload) {
  return {
    ...state,
    jokes: {
      ...state.jokes,
      [payload.id]: { 
        text: payload.text,
        room: payload.room,
        created_at: payload.created_at,
        profiles: payload.profiles,
        companyName: payload.companyName,
        companyEmployeeId: payload.companyEmployeeId,
      }
    }
  }
}

function deleteJoke(state, payload) {
  const newState = {
    ...state,
  }

  delete newState.jokes[payload.id]

  return newState
}

$.draw(target => {
  if(target.getAttribute('shell')) return
  const { sessionId, companyEmployeeId, companyName } = getSession()
  connect(target)
  if(!sessionId) return `
    <secure-authentication></secure-authentication>
  `
  const { jokes } = $.learn()

  const { groupList } = $.learn()
  const room = target.getAttribute('room')
  if(!room) {
    return `<sillyz-computer></sillyz-computer>`
  }

  const actions = groupList && groupList[companyName]?.members.includes(companyEmployeeId) ? `
    <button data-info>
      Group Info
    </button>
    ` : `
    <button data-join>
      Join
    </button>
  `

  const view = `
    <div class="actions">
      ${groupList ? actions : ''}
    </div>

    <div class="log">
      <div class="content">
        ${Object.keys(jokes).map((id) => {
          const { created_at, text, profiles, companyEmployeeId: unix, companyName: company } = jokes[id]
          const color = doingBusinessAs[company] ? doingBusinessAs[company].color : 'dodgerblue'
          return `
            <div aria-role="button" class="message ${companyName} ${companyEmployeeId === unix && companyName === company ? 'originator' : ''}" style="--business-color: ${color}" data-id="${id}">
              <div class="meta" data-tooltip="${created_at}">
                <div class="message-picture">
                  <img src=${profiles.picture} />
                </div>
              </div>
              <div class="body">${escapeHyperText(text)}</div>
              <button class="launch" data-id="${id}">
                *
              </button>
            </div>
          `
        }).join('')}
      </div>
    </div>
    <form class="new-message-form" data-command="enter">
      <button class="send" type="submit" data-command="enter">
        <sl-icon name="arrow-up-circle"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message" placeholder="Say something"></textarea>
      </div>
    </form>
  `

  return view
}, { afterUpdate })

function afterUpdate(target) {
  replaceCursor(target)
  saveCursor(target)
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }
}

let sel = []
const tags = ['TEXTAREA', 'INPUT']
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.field = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const field = target.querySelector(`[name="${target.dataset.field}"]`)
  
  if(field) {
    field.focus()

    if(tags.includes(field.tagName)) {
      field.selectionStart = sel[0];
      field.selectionEnd = sel[1];
    }
  }
}

function clearCursor(target) {
  target.dataset.field = null
  sel = []
}

export function social(company, unix) {
  return {
      nickname: `/cache/nickname/${company}/${unix}`,
      tagline: `/cache/tagline/${company}/${unix}`,
      avatar: `/cache/avatars/${company}/${unix}`,
      hero: `/cache/heroes/${company}/${unix}`,
      likes: `/edge/likes/${company}/${unix}`,
      dislikes: `/edge/dislikes/${company}/${unix}`,
      company,
      unix
  }
}

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

$.when('submit', 'form', (event) => {
  event.preventDefault()
  send(event)
})

$.when('click', '.action-accordion', async (event) => {
  event.target.classList.toggle('active')
})

async function send(event) {
  const root = event.target.closest($.link)
  const message = root.querySelector('[name="message"]')
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()
  const room = root.getAttribute('room')
  if(!room) return

  const text = await bayunCore.lockText(sessionId, message.value, encryptionPolicy, keyGenerationPolicy, room);
  message.value = ''
  const company = await bayunCore.lockText(sessionId, companyName, encryptionPolicy, keyGenerationPolicy, room);
  const unix = await bayunCore.lockText(sessionId, companyEmployeeId, encryptionPolicy, keyGenerationPolicy, room);


  const user_id = JSON.parse(state['ls/supabase.auth.token']).user.id
  const { data, error } = await supabase
  .from('chat_history')
  .insert([
    { user_id, room_id: room, text, companyName: company, companyEmployeeId: unix },
  ])
  .select()

  if(error) {
    $.teach({ error })
    return
  }
}

$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    position: relative;
    height: 100%;
    font-size: 1rem;
  }

  & .unix-item {
    clear: both;
  }

  & [data-remove] {
    border: none;
    border-radius: 0;
    background: white;
    color: dodgerblue;
  }

  & [data-remove]:hover,
  & [data-remove]:focus {
    background-color: #E83FB8;
    color: white;
  }

  &[shell] {
    display: block;
    background: black;
    padding: 1rem;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  & .admin-grid {
    background: white;
    padding: 1rem;
    color: dodgerblue;
    display: grid;
  }

  @media (min-width: 640px) {
    & .admin-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
  }

  & sticky-note {
    place-self: center;
  }

  & .captains-log {
    max-height: 100%;
    padding: 6rem 1rem;
    overflow: auto;
  }

  & .log {
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    overflow-anchor: auto !important;
    padding: 6rem 0 1rem;
  }

  & .new-message-form {
    width: 100%;
    position: relative;
    z-index: 2;
  }
  & .story-chat-form,
  & .story-chat-row {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: .5rem;
    width: 100%;
    overflow: auto;
  }

  & .story-chat-row {
  }

  & .story-chat-form [type="text"] {
    grid-column: 1/8;
  }

  & .story-chat-row > * {
    flex: 1;
  }

  & .new-message-form input {
    border: 1px solid orange;
    background: rgba(255,255,255,.15);
    padding: 0 1rem;
    color: white;
    border-radius: 1rem;
    width: 100%;
  }

  @media print {
    & button, & .new-message-form {
      display: none;

    }
    & .captains-log {
      max-height: initial;
    }
    body {
      overflow: visible !important;
    }
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 2;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
		padding-right: 1rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

  & .grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    height: 100%;
    max-height: 100vh;
  }

  & .all-logs {
    background: linear-gradient(var(--wheel-0-0), var(--wheel-0-4));
  }

  & .all-logs button {
    display: block;
    background: none;
    color: white;
    text-shadow: 0 0 1px 1px rgba(0,0,0,.85);
    font-weight: 400;
    padding: .5rem;
    border: none;
    width: 100%;
    text-align: left;
  }

  & textarea {
    width: 100%;
    display: block;
    resize: none;
    background: rgba(0,0,0,.85);
    border: none;
    color: rgba(255,255,255,.65);
    border-radius: 0;
    padding: 8px 2rem 8px 8px;
    max-height: 35vh;
  }

  & .actions {
    display: flex;
    justify-content: end;
  }

  & .text-well {
    background: rgba(0,0,0,.25);
  }

  & .send {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: .5rem;
    z-index: 1;
    border-radius: 0;
    background-color: white;
    color: dodgerblue;
    transition: background-color 200ms ease-in-out;
    border: none;
  }

  & .message {
    position: relative;
    border: none;
    padding: 3px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: .5rem;
  }

  & .message .body {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    vertical-align: top;
  }

  & .message.originator {
    color: rgba(0,0,0.9);
  }

  & .meta {
  }

  & .avatar {
    max-width: 2rem;
    max-height: 2rem;
    float: left;
    margin: 0 1rem;
    border-radius: 100%;
  }

  & .originator .avatar {
    display: none;
  }

  & .action-accordion {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 50px;
    height: 50px;
    background: rgba(0,0,0,.65);
    border: 2px solid dodgerblue;
    color: rgba(255,255,255,.85);
    border-radius: 100%;
    opacity: .5;
    transition: all 200ms ease-in-out;
    z-index: 10;
  }
  & .action-accordion:hover {
    background: dodgerblue;
    border: 2px solid rgba(255,255,255,1);
    opacity: 1;
  }
  & .actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: right;
    z-index: 10;
  }
  & .actions button {
    background-color: white;
    color: dodgerblue;
    border: none;
    line-height: 1rem;
    padding: .5rem;
    font-size: 1rem;
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    background-color: dodgerblue;
    color: white;
  }

  & .message-picture {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
  }

  & .message-picture img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  & .launch {
    border-radius: 100%;
    border: 1px solid rgba(0,0,0,.65);
    color: rgba(0,0,0,.65);
    background: white;
    height: 32px;
    width: 32px;
    line-height: 1;
    text-align: center;
  }

  & .launch:hover,
  & .launch:focus {
    border-color: white;
    color: white;
    background: dodgerblue;
  }
`)

$.when('input', 'textarea', (event) => {
  event.target.style.height = (event.target.scrollHeight) + "px";
});

$.when('blur', 'textarea', (event) => {
  clearCursor(event.target.closest($.link))
});


$.when('scroll', 'textarea', drawLines);

function drawLines (event) {
  const scrollTop = event.target.scrollTop;
  event.target.style.backgroundPosition = `0px ${-scrollTop}px`;
}

$.when('click', '[data-join]', async (event) => {
  const {
    sessionId,
  } = getSession()
  const room = getRoom(event.target)
  await bayunCore.joinPublicGroup(sessionId, room).catch(error => {
    console.log("Error caught");
    console.log(error);
  });
})

$.when('click', '[data-video]', (event) => {
  const room = getRoom(event.target)
  showModal(`
    <iframe src="/app/live-help?room=${room}"></iframe>
  `)
})
$.when('click', '[data-info]', (event) => {
  const room = getRoom(event.target)
  const {
    sessionId,
  } = getSession()

  const { groupList, groupName } = $.learn()

  const view = Object.keys(groupList).map(company => {
    const items = groupList[company].members.map(unix => {
    const removeButton = groupList ? `
          <button data-remove data-unix="${unix}" data-tooltip="Remove" data-company="${company}">
            <span name="message-timestamp"><sl-icon name="trash"></sl-icon></span>
            (remove)
          </button>
      ` : `
        hey
      `
      return `
        <div class="unix-item">
          <span style="float: right;">
            ${removeButton}
          </span>
          ${unix}
        </div>
      `
    }).join('')
    return `
      <div class="companyName">
        ${company}
      </div>
      ${items}
    `
  }).join('')

  showModal(`
    <secure-chat shell="true">
      <div class="groupName">
        ${groupName}
      </div>
      <div class="admin-grid">
        <div class="invite">
          Invite to group:<br>
          <bayun-addmembers></bayun-addmembers>
          <button class="button" data-add>Invite to Group</button>
        </div>
        <div class="manage">
          Manage group:<br>
          ${view}
        </div>
        <div class="manage">
          <button data-video>
            Video Chat
          </button>
          <button data-leave>
            Leave
          </button>
          <button class="button" data-delete disabled>
            Delete
          </button>
        </div>
      </div>
    </secure-chat>
  `)
});

$.when('click', '[data-add]', async (event) => {
  const {
    sessionId,
  } = getSession()
  const room = getRoom(event.target)
  const groupMembers = event.target.closest($.link).querySelector('bayun-addmembers').list || []

  const addMembersResponse = await bayunCore.addMembersToGroup(sessionId,room,groupMembers);

  const addedMembersCount = addMembersResponse.addedMembersCount;
  console.log("Total Members Added : ",addedMembersCount);
  //Iterating over the list of error objects
  if(addMembersResponse.addMemberErrObject.length!=0){
      let errorList = addMembersResponse.addMemberErrObject;

      for(let i = 0 ; i < errorList.length ; i++){
        let errorMessage = errorList[i].errorMessage;
        console.log("Error Message: ",errorMessage);
        //Iterating over the list of members those who couldn't be added to the group
        for(let j = 1 ; j <= errorList[i].membersList.length ; j++){
          let memberDetails = errorList[i].membersList[j-1];
          console.log("Details for "+(j)+" employee");
          console.log("company employee ID: ",memberDetails.companyEmployeeId);
          console.log("company name: ",memberDetails.companyName);
        }
      }
    }
  });


$.when('click', '[data-remove]', (event) => {
  const {
    sessionId
  } = getSession()
  const room = getRoom(event.target)
  const { company, unix } = event.target.dataset

  bayunCore.removeMemberFromGroup(
    sessionId,
    room,
    unix,
    company
  )
  .then(result => {
    console.log("Response received for removeMemberFromGroup.");
    console.log(result);
  })
  .catch(error => {
    console.log("Error caught");
    console.log(error);
  });
});

$.when('click', '[data-leave]', (event) => {
  const {
    sessionId
  } = getSession()
  const room = getRoom(event.target)
  bayunCore.leaveGroup(sessionId, room)
    .then(result => {
      console.log("Response received for leaveGroup.");
      console.log(result);
  })
  .catch(error => {
    console.log("Error caught");
    console.log(error);
  });
});

$.when('click', '[data-delete]', (event) => {
  const {
    sessionId
  } = getSession()
  const room = getRoom(event.target)
  bayunCore.deleteGroup(sessionId, room)
    .then(result => {
      console.log("Response received for deleteGroup.");
      console.log(result);
  })
  .catch(error => {
    console.log("Error caught");
    console.log(error);
  });
});
$.when('click', '.launch', (event) => {
  const { id } = event.target.dataset

  const { text } = $.learn().jokes[id]
  showModal(`
    <div class="full-child-xml-html" style="padding: 0 1rem; background: white; position: absolute; inset: 0;">
      <div style="margin: 0 auto; max-width: 6in; background: white; height: 100%;">
        ${render(text)}
      </div>
    </div>
  `)
})

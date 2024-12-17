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


const $ = module('camp-chat', { jokes: {}, room: 'general' })
state[`ls/${$.link}`] ||= {room: null}

export function getRoom(target) {
  return target.closest($.link).getAttribute('room') || $.learn().room
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

  const room = target.getAttribute('room')
  if(target.subscribedTo === room || !room) return
  target.subscribedTo = room

  $.teach({ jokes: [], room })
  
  const { data: plan98_group_text, error } = await supabase
  .from('plan98_group_text')
  .select("*")
  // Filters
  .eq('room', room)
  .range(0, 25)

  plan98_group_text.map(async (row) => {
    const text = await bayunCore.unlockText(sessionId, row.text)
    const unix = await bayunCore.unlockText(sessionId, row.companyEmployeeId)
    const company = await bayunCore.unlockText(sessionId, row.companyName)
    $.teach({
      id: row.id,
      created_at: row.created_at,
      text,
      companyName: company,
      companyEmployeeId: unix
    }, mergeJoke)
  })

  supabase.channel('custom-whatever-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'plan98_group_text' },
    async (payload) => {
      if (
        payload.new.room === room
      ) {
        const text = await bayunCore.unlockText(sessionId, payload.new.text)
        const unix = await bayunCore.unlockText(sessionId, payload.new.companyEmployeeId)
        const company = await bayunCore.unlockText(sessionId, payload.new.companyName)

        $.teach({
          id: payload.new.id,
          room: payload.new.room,
          created_at: payload.new.created_at,
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

  state[`ls/${$.link}`].groupName = null
  state[`ls/${$.link}`].groupList = null
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

      state[`ls/${$.link}`].groupName = result.groupName
      state[`ls/${$.link}`].groupList = groupList
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

$.when('input', 'textarea', (event) => {
  const room = getRoom(event.target)
  state[`ls/drafts/${room}`] = event.target.value
})

$.when('change', '', (event) => {
  const room = getRoom(event.target)
  $.teach({ room })
})

$.draw(target => {
  if(target.getAttribute('shell')) return
  const { sessionId, companyEmployeeId, companyName } = getSession()
  connect(target)
  if(!sessionId) return `
    <sticky-note>
      <comedy-notebook></comedy-notebook>
    </sticky-note>
  `
  const { jokes, room } = $.learn()

  const { groupList } = state[`ls/${$.link}`]
  if(!room) {
    return 'Please Consider...'
  }
  const draft = escapeHyperText(state[`ls/drafts/${room}`])

  const actions = groupList && groupList[companyName]?.members.includes(companyEmployeeId) ? `
    <button data-info>
      Group Info
    </button>
    <button data-leave>
      Leave
    </button>
    ` : `
    <button data-join>
      Join
    </button>
  `

  const view = `
    <div class="actions">
      ${actions}
    </div>

    <div class="log">
      <div class="content">
        ${Object.keys(jokes).map((id) => {
          const { created_at, text, companyEmployeeId: unix, companyName: company } = jokes[id]
          const color = doingBusinessAs[company] ? doingBusinessAs[company].color : 'dodgerblue'
          const { avatar } = social(company, unix)
          return `
            <div aria-role="button" class="message ${companyName} ${companyEmployeeId === unix && companyName === company ? 'originator' : ''}" style="--business-color: ${color}" data-id="${id}">
              <div class="meta" data-tooltip="${created_at}">
                <quick-media class="avatar" key="${avatar}">
                  <img src="${avatar}" />
                </quick-media>
              </div>
              <div class="body">${escapeHyperText(text)}</div>
            </div>
          `
        }).join('')}
      </div>
    </div>
    <form class="new-message-form" data-command="enter">
      <button class="button send" type="submit" data-command="enter">
        <sl-icon name="send"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message">${draft}</textarea>
      </div>
    </form>
  `

  return view
})

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

async function send(event) {
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()
  const room = getRoom(event.target)

  const text = await bayunCore.lockText(sessionId, message.value, encryptionPolicy, keyGenerationPolicy, room);
  message.value = ''
  const company = await bayunCore.lockText(sessionId, companyName, encryptionPolicy, keyGenerationPolicy, room);
  const unix = await bayunCore.lockText(sessionId, companyEmployeeId, encryptionPolicy, keyGenerationPolicy, room);

  state[`ls/drafts/${room}`] = ''

  const { data, error } = await supabase
  .from('plan98_group_text')
  .insert([
    { room, text, companyName: company, companyEmployeeId: unix },
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
    grid-template-rows: 1fr calc(9rem + 8px);
    position: relative;
    height: 100%;
    color: white;
    font-size: 1rem;
  }

  &[shell] {
    display: block;
    color: rgba(0,0,0,.85);
    background: rgba(255,255,255, .65);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1rem;
    width: 100%;
    max-width: 320px;
    max-height: 480px;
    height: 100%;
    overflow: auto;
  }

  & sticky-note {
    place-self: center;
  }

  & .new-message-form button {
    position: relative;
    z-index: 2;
    height: 2rem;
    padding: .25rem 1rem;
    margin: .5rem;
  }

  & .new-message-form button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & .new-message-form button:hover,
  & .new-message-form button:focus {
    background: saddlebrown;
    color: lemonchiffon;
  }

  & .captains-log {
    max-height: 100%;
    padding: 6rem 1rem;
    overflow: auto;
    background: linear-gradient(135deg, rgba(0, 0, 0, 1), rgba(0,0,0,.85))
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

  & [data-create] {
    background: dodgerblue;
    color: white;
  }

  & textarea {
    width: 100%;
    display: block;
    resize: none;
    line-height: 2rem;
    height: 6rem;
    border: none;
    background: rgba(0,0,0,.85);
    color: white;
    border-radius: .5rem;
    padding: 8px;
  }

  & .text-well {
    background: rgba(0,0,0,.25);
    padding: 8px;
  }

  & .send {
    float: right;
  }

  & .message {
    margin: .5rem 4rem .5rem 4rem;
    padding: .5rem;
    border-radius: 1rem;
    background: linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.6)), var(--business-color, dodgerblue);
    text-shadow: 1px 1px rgba(0,0,0,.65);
    color: white;
    position: relative;
    border: none;
  }

  & .message .body {
    white-space: pre;
  }

  & .message.originator {
    margin: 1rem 1rem 1rem 7rem;
    background: rgba(13,13,13,.85);
  }

  & .meta {
    position: absolute;
    display: grid;
    grid-template-columns: auto 1fr;
    left: -4rem;
  }

  & .avatar {
    max-width: 2rem;
    max-height: 2rem;
    float: left;
    margin: 0 1rem;
    border-radius: 100%;
  }

  & .message > * {
    pointer-events: none;
  }

  & .originator .avatar {
    display: none;
  }

  & .actions {
    z-index: 10;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: none;
    background: black;
  }

  @media screen {
    & {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-rows: 2rem 1fr;
    }

    & .actions {
      display: flex;
    }
  }
 
  & .actions button {
    background: black;
    color: rgba(255,255,255,.85);
    border: none;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: 0 .5rem;
    font-size: 1rem;
    line-height: 2rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button.active,
  & .joke-actions button.active,
  & .actions button:hover,
  & .joke-actions button:hover {
    color: #fff;
    background: #54796d;
  }



  & .button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
  }

  & .button:focus,
  & .button:hover {
    background-color: rebeccapurple;
    color: white;
  }

  & quick-media {
    border-radius: 100%;
    overflow: hidden;
  }
`)

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
    const groupType = BayunCore.GroupType.PUBLIC;

    bayunCore.createGroup(sessionId, room, groupType)
        .then(async result => {
          await bayunCore.joinPublicGroup(sessionId, result.groupId).catch(error => {
            console.log("Error caught");
            console.log(error);
          })
          .catch(error => {
            console.log("Error caught");
            console.log(error);
          });
        });
  })
})

$.when('click', '[data-info]', (event) => {
  const room = getRoom(event.target)
  const {
    sessionId,
  } = getSession()

  const { groupList, groupName } = state[`ls/${$.link}`]

  const view = Object.keys(groupList).map(company => {
    const items = groupList[company].members.map(unix => {
    const removeButton = groupList ? `
          <button data-remove data-unix="${unix}" data-company="${company}">
            Remove
          </button>
      ` : `
        hey
      `
      return `
        <div class="unix-item">
          ${unix}
          ${removeButton}
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
    <chat-room shell="true">
      <div class="groupName">
        ${groupName}
      </div>
      Add names below to invite them to the group!
      <br>
      <br>
      <bayun-addmembers></bayun-addmembers>
      <button class="button" data-add>Invite to Group</button>

      ${view}
      <button class="button" data-delete disabled>
        Delete
      </button>
    </chat-room>
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
$.when('click', '.message', (event) => {
  const { id } = event.target.dataset

  const { text } = $.learn().jokes[id]
  showModal(`
    <div class="full-child-xml-html" style="padding: 0 1rem; background: rgba(200,200,200,1); position: absolute; inset: 0;">
      <div style="margin: 0 auto; max-width: 6in; background: white; height: 100%;">
        ${render(text)}
      </div>
    </div>
  `)
})

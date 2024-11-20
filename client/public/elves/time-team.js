import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import { render } from '@sillonious/saga'
import { bayunCore } from '@sillonious/vault'
import { getSession, clearSession } from './bayun-wizard.js'
import 'gun'

const Gun = window.Gun
const gun = Gun(['https://gun.1998.social/gun']);

const encryptionPolicy = BayunCore.EncryptionPolicy.GROUP;
const keyGenerationPolicy = BayunCore.KeyGenerationPolicy.ENVELOPE;

/*
   ^
  <@>
  !&{
   #
*/

async function handleBayunErrors(room, error) {
  const {
    sessionId,
  } = getSession()
  if(error === 'BayunErrorGroupDoesNotExistsForGroupId') {
    await bayunCore.createGroup(sessionId, room, BayunCore.GroupType.PUBLIC)
    bayunCore.joinPublicGroup(sessionId, room).catch((e) => {
      console.error(e)
    });
  }
  console.log("Error caught");
  console.log(error);
}

const $ = module('time-team')

export function joinRoom(r) {
  const {
    sessionId,
  } = getSession()

  bayunCore.joinPublicGroup(sessionId, r).catch(handleBayunErrors.bind(null, r));
}

export function getRoom(node) {
  const room = node.closest($.link).getAttribute('room')
  return room
}

export function getSrc(node) {
  return node.closest($.link).getAttribute('src')
}



function connect(target) {
  const {
    sessionId,
  } = getSession()

  if(!sessionId) return

  const room = getRoom(target)
  if(target.subscribedTo === room) return
  target.subscribedTo = room

  $.teach({ jokes: [] })

  const src = getSrc(event.target)
  gun.get($.link).get(src).map().on(observe(room))

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

      $.teach({ groupName: result.groupName })
      $.teach({ groupList: groupList })
    })
    .catch(handleBayunErrors.bind(null, room));
}

const processedTimestamps = new Set();
function observe(room) {
  return async function observer(payload, timestamp) {
    if(!timestamp) return
    if(!payload) return
    if (!processedTimestamps.has(timestamp)) {
      processedTimestamps.add(timestamp);
      /*
      const text = await bayunCore.unlockText(
        sessionId,
        payload.text
      )
      const unix = await bayunCore.unlockText(
        sessionId,
        payload.companyEmployeeId
      )
      const company = await bayunCore.unlockText(
        sessionId,
        payload.companyName
      )
      */

      $.teach({ [timestamp]: payload }, add(timestamp, room))
    }
  }
}

function add(timestamp, room) {
  return (state, payload) => {
    return {
      ...state,
      ...payload,
      [room]: [...(state[room] || []), timestamp]
    }
  }
}

$.when('input', 'textarea', (event) => {
  const room = getRoom(event.target)
})

$.draw(target => {
  if(target.getAttribute('shell')) return
  const { sessionId } = getSession()
  connect(target)
  if(!sessionId) {
    return !target.innerHTML ? `
      <bayun-wizard src="/app/time-team"></bayun-wizard>
    ` : null
  }
  const { groupList } = state[`ls/${$.link}`]
  const room = getRoom(target)
  if(!room) {
    return 'Please Consider...'
  }

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

  const chats = $.learn()[room] || []

  const view = `
    <div class="actions">
      ${actions}
    </div>

    <div class="log">
      <div class="content">
        ${chats.map((timestamp) => {
          const {
            created_at,
            text,
            companyEmployeeId: unix,
            companyName: company
          } = $.learn()[timestamp]
          const color = doingBusinessAs[company] ? doingBusinessAs[company].color : 'dodgerblue'
          const { avatar } = social(company, unix)
          return `
            <div aria-role="button" class="message ${company} ${companyEmployeeId === unix && companyName === company ? 'originator' : ''}" style="--business-color: ${color}" data-timestamp="${timestamp}">
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
      <button class="send" type="submit" data-command="enter">
        <sl-icon name="arrow-up-circle"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message"></textarea>
      </div>
    </form>
  `

  return view
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  saveCursor(target)
}

function afterUpdate(target) {
  replaceCursor(target)
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
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const {
    sessionId,
  } = getSession()
  const room = getRoom(event.target)
/*
  const text = await bayunCore.lockText(
    sessionId,
    message.value,
    encryptionPolicy,
    keyGenerationPolicy,
    room
  );
  const company = await bayunCore.lockText(
    sessionId,
    companyName,
    encryptionPolicy,
    keyGenerationPolicy,
    room
  );
  const unix = await bayunCore.lockText(
    sessionId,
    companyEmployeeId,
    encryptionPolicy,
    keyGenerationPolicy,
    room
  );
  */

  const payload = {
    room,
    text: message.value,
    companyName,
    companyEmployeeId
  }

  message.value = ''
  const src = getSrc(event.target)
  gun.get($.link).get(src).get(new Date().toISOString()).put(payload)
}

$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    position: relative;
    height: 100%;
    color: white;
    font-size: 1rem;
    background: black;
    overflow: auto;
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

  & [data-create] {
    background: dodgerblue;
    color: white;
  }

  & textarea {
    width: 100%;
    display: block;
    resize: none;
    border: none;
    background: rgba(0,0,0,.85);
    color: white;
    border-radius: 0;
    padding: 8px;
    max-height: 25vh;
  }

  & .text-well {
    background: rgba(0,0,0,.25);
    padding: 4px;
  }

  & .send {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: .3rem;
    background: dodgerblue;
    margin: .5rem;
    color: white;
    z-index: 1;
    border-radius: 100%;
    display: grid;
    border: none;
  }

  & .message {
    position: relative;
    border: none;
    padding: 3px;
  }

  & .message .body {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    vertical-align: top;
    pointer-events: none;
    margin-left: 2.5rem;
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
  & .actions button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: white;
    border: none;
    line-height: 1rem;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: .5rem;
    font-size: 1rem;
    --v-font-mono: 0;
    --v-font-casl: 1;
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .actions button:hover {
    background-color: rebeccapurple;
  }

  & quick-media {
    border-radius: 100%;
    overflow: hidden;
  }
`)

$.when('input', 'textarea', (event) => {
  event.target.style.height = "auto";
  event.target.style.height = (event.target.scrollHeight) + "px";
});

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', 'textarea', event => {
  if(event.keyCode === enter && !event.shiftKey) {
    event.preventDefault()
    const form = event.target.closest($.link).querySelector('form')

    form.requestSubmit()
  }
})


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
  await bayunCore.joinPublicGroup(sessionId, room).catch(handleBayunErrors.bind(null, room));
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
  const { timestamp } = event.target.dataset

  const { text } = $.learn()[timestamp]
  showModal(`
    <div class="full-child-xml-html" style="padding: 0 1rem; background: #54796d; position: absolute; inset: 0;">
      <div class="screenplay">
        ${render(text)}
      </div>
    </div>
  `)
})

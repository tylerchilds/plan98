import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import supabase from '@sillonious/database'
import { render } from '@sillonious/saga'
import { BayunCore } from '@sillonious/vault'
import { getSession, clearSession } from './comedy-notebook.js'

/*
   ^
  <@>
  !&{
   #
*/

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const $ = module('chat-room', { jokes: {} })

export function setRoom(room) {
  $.teach({ room })
}

async function connect(target) {
  const {
    sessionId,
  } = getSession()

  let { room } = $.learn();
  if(!sessionId) return

  if(target.subscribedTo === room) return
  target.subscribedTo = room

  $.teach({ jokes: [] })
  
  const { data: plan98_group_text, error } = await supabase
  .from('plan98_group_text')
  .select("*")
  // Filters
  .eq('room', room)
  .range(0, 25)

  plan98_group_text.map(async (row) => {
    const text = await bayunCore.unlockText(sessionId, row.text)
debugger
    $.teach({ id: row.id, created_at: row.created_at, text }, mergeJoke)
  })

  supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'plan98_solo_text' },
    async (payload) => {
      if (
        payload.new.room === room
      ) {
        const setup = payload.new.setup
        const text = await bayunCore.unlockText(sessionId, payload.new.text)

        $.teach({ id: payload.new.id, setup, text }, mergeJoke)
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteJoke)
      }
    }
  )
  .subscribe()
}

function mergeJoke(state, payload) {
  return {
    ...state,
    jokes: {
      ...state.jokes,
      [payload.id]: { 
        text: payload.text,
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
  const { room } = $.learn()
  state[`ls/drafts/${room}`] = event.target.value
})

$.when('click', '[data-create]', () => {
  const { sessionId } = getSession()
  const groupType = BayunCore.GroupType.PUBLIC;
  bayunCore.createGroup(sessionId, "General", groupType)
    .then(result => {
      getMyGroups()
      getOtherGroups()

      state[`ls/drafts/${room}`] = event.target.value
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

function drawGroupButton(group) {
  return `
    <button class="select-group" data-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

$.draw(target => {
  const { sessionId } = getSession()
  connect(target)
  if(!sessionId) return `
    <sticky-note>
      <comedy-notebook></comedy-notebook>
    </sticky-note>
  `
  const { room, jokes } = $.learn()

  if(!room) {
    return 'Please select a room'
  }
  const draft = state[`ls/drafts/${room}`]

  const lines = getLines(target)

  const view = `
    <div class="log">
      ${Object.keys(jokes).map((id) => {
        return `
          <div class="message">
            ${jokes[id].text}
          </div>
        `
      }).join('')}
    </div>
    <div class="communicator">
      <form class="new-message-form" data-command="enter">
        <button class="send" type="submit" data-command="enter">
          Send
        </button>
        <textarea name="message" style="background-image: ${lines}">${draft}</textarea>
      </form>
    </div>
  `

  return view
})

$.when('click', '.select-group', (event) => {
  const { id } = event.target.dataset
})

$.when('click', 'button[data-command]', send)
$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { command } = event.target.dataset
  send(event)
})

async function send(event) {
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const {
    sessionId,
  } = getSession()
  const { room } = $.learn()
 
  const text = await bayunCore.lockText(sessionId, message.value);
  const { data, error } = await supabase
  .from('plan98_group_text')
  .insert([
    { room, text },
  ])
  .select()

  if(error) {
    $.teach({ error })
    return
  }

}

$.when('click', '[data-infinity]', () => {
  showModal(`
  `)
})

$.when('click', '[data-party]', () => {
  showModal(`
    <sticky-note>
      <qr-code text="${window.location.href}"></qr-code>
    </sticky-note>
  `)
})
$.when('click', '[data-logout]', () => {
  clearSession()
})

function getLines(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}

$.style(`
  & {
    display: grid;
    position: relative;
    height: 100%;
    background: linear-gradient(135deg, var(--wheel-0-0), 60%, var(--wheel-0-4));
    color: white;
    line-height: 2rem;
    font-size: 1rem;
  }

  & sticky-note {
    place-self: center;
  }

  & .communicator button {
    position: relative;
    z-index: 2;
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: all 100ms;
    padding: .25rem 1rem;
  }

  & .communicator button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & .communicator button:hover,
  & .communicator button:focus {
    background: linear-gradient(rgba(0,0,0,.85) 80%, dodgerblue);
    color: white;
  }

  & .captains-log {
    max-height: 100%;
    padding: 6rem 1rem;
    overflow: auto;
    background: linear-gradient(135deg, rgba(0, 0, 0, 1), rgba(0,0,0,.85))
  }

  & .communicator {
    position: absolute;
    height: 6rem;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: rgba(0,0,0,.85);
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

  & .communicator input {
    border: 1px solid orange;
    background: rgba(255,255,255,.15);
    padding: 0 1rem;
    color: white;
    border-radius: 1rem;
    width: 100%;
  }

  @media print {
    & button, & .communicator {
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
    line-height: 2rem;
    height: 6rem;
    border: none;
  }

  & .send {
    float: right;
  }

  & .message {
    margin: 1rem;
    padding: .5rem;
    border-radius: 1rem;
    background: dodgerblue;
    color: white;
  }
`)

$.when('scroll', 'textarea', drawLines);

function drawLines (event) {
  const scrollTop = event.target.scrollTop;
  event.target.style.backgroundPosition = `0px ${-scrollTop}px`;
}


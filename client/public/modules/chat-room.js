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
    const ceid = await bayunCore.unlockText(sessionId, row.companyEmployeeId)
    const cn = await bayunCore.unlockText(sessionId, row.companyName)
    $.teach({
      id: row.id,
      created_at: row.created_at,
      text,
      companyName: cn,
      companyEmployeeId: ceid
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
        const ceid = await bayunCore.unlockText(sessionId, payload.new.companyEmployeeId)
        const cn = await bayunCore.unlockText(sessionId, payload.new.companyName)

        $.teach({
          id: payload.new.id,
          room: payload.new.room,
          created_at: payload.new.created_at,
          text,
          companyName: cn,
          companyEmployeeId: ceid
        }, mergeJoke)
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
  const { room } = $.learn()
  state[`ls/drafts/${room}`] = event.target.value
})

$.draw(target => {
  const { sessionId, companyEmployeeId, companyName } = getSession()
  connect(target)
  if(!sessionId) return `
    <sticky-note>
      <comedy-notebook></comedy-notebook>
    </sticky-note>
  `
  const { room, jokes } = $.learn()

  if(!room) {
    return 'Pick a room!'
  }
  const draft = escapeHyperText(state[`ls/drafts/${room}`])

  const lines = getLines(target)

  const view = `
    <div class="log">
      ${Object.keys(jokes).map((id) => {
        const { created_at, text, companyEmployeeId: ceid, companyName: cn } = jokes[id]
        console.log(cn)
        return `
          <div class="message ${companyName} ${companyEmployeeId === ceid && companyName === cn ? 'originator' : ''}">
            <div class="meta" data-tooltip="${created_at}">
              <object class="avatar" data="/cdn/tychi.me/photos/unprofessional-headshot.jpg" type="image/png">
                <img src="/cdn/${companyName}/${companyEmployeeId}/avatar.jpg" />
              </object>
            </div>
            <div class="body">
              ${text}
            </div>
          </div>
        `
      }).join('')}
    </div>
    <form class="new-message-form" data-command="enter">
      <button class="send" type="submit" data-command="enter">
        Send
      </button>
      <textarea name="message" style="background-image: ${lines}">${draft}</textarea>
    </form>
  `

  return view
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
  const { room } = $.learn()
 
  const text = await bayunCore.lockText(sessionId, message.value);
  const cn = await bayunCore.lockText(sessionId, companyName);
  const ceid = await bayunCore.lockText(sessionId, companyEmployeeId);
  const { data, error } = await supabase
  .from('plan98_group_text')
  .insert([
    { room, text, companyName: cn, companyEmployeeId: ceid },
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
    grid-template-rows: 1fr 8rem;
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

  & .new-message-form button {
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

  & .new-message-form button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & .new-message-form button:hover,
  & .new-message-form button:focus {
    background: linear-gradient(rgba(0,0,0,.85) 80%, dodgerblue);
    color: white;
  }

  & .captains-log {
    max-height: 100%;
    padding: 6rem 1rem;
    overflow: auto;
    background: linear-gradient(135deg, rgba(0, 0, 0, 1), rgba(0,0,0,.85))
  }

  & .log {
    overflow: auto;
    padding: 6rem 0 1rem;
  }

  & .new-message-form {
    width: 100%;
    position: relative;
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
    line-height: 2rem;
    height: 6rem;
    border: none;
  }

  & .send {
    float: right;
  }

  & .message {
    margin: 1rem 4rem 1rem 4rem;
    padding: .5rem;
    border-radius: 1rem;
    background: dodgerblue;
    color: white;
    position: relative;
  }

  & .message.originator {
    margin: 1rem 1rem 1rem 7rem;
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

  & .originator .avatar {
    display: none;
  }
`)

$.when('scroll', 'textarea', drawLines);

function drawLines (event) {
  const scrollTop = event.target.scrollTop;
  event.target.style.backgroundPosition = `0px ${-scrollTop}px`;
}


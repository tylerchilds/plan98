import elf from '@silly/elf'
import { pause, resume } from './paper-pocket.js'
import { toast } from './plan98-toast.js'

const $ = elf('synthia-assistant', {
  messages: {},
  sidebar: self.innerWidth > 768
})

function connect(target) {
  if(target.subscribed) return
  target.subscribed = true

  $.teach({ messages: {} })

  const intakeId = self.crypto.randomUUID()

  const encodedIntakeForm = btoa(
    JSON.stringify({
      title: 'Customer Intake',
      description: 'To get contacted by a human, provide your name and a phone number or email.',
      actionLabel: 'Send Details',
      databaseTable: 'contacts',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text'
        },
        {
          name: 'email',
          label: 'Email',
          type: 'text'
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'text'
        },
      ]
    })
  )

  const messageId = self.crypto.randomUUID()

  const data = [
    {
      id: messageId,
      created_at: new Date().toJSON(),
      text: 'Welcome! To learn about the computer, start by asking questions. For human assitance, request a human.',
      type: 'bot',
      actions: {
        [intakeId]: {
          label: 'Request Human',
          'json-rpc': {
            request: {
              "jsonrpc": "2.0",
              "id": intakeId,
              "method": 'open',
              "params": {
                app: 'secure-form',
                appTitle: 'Secure Form',
                data: encodedIntakeForm
              }
            },
            response: null
          }
        }
      }
    }
  ]

  data.map((row) => {
    $.teach(row, mergeMessage)
  })
}

function mergeMessage(state, payload) {
  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.id]: payload
    }
  }
}

function deleteMessage(state, payload) {
  const newState = {
    ...state,
  }

  delete newState.messages[payload.id]

  return newState
}

$.draw(target => {
  connect(target)
  const {
    humanPromptUrl,
    humanPromptTitle,
    humanPromptId,
    notification,
    chatActive,
    messages,
    sidebar
  } = $.learn()

  const view = `
    <button class="chat-toggle ${chatActive?'active':'inactive'}">
      ${chatActive
        ? `<sl-icon name="x-lg"></sl-icon>`
        : `<sl-icon name="chat"></sl-icon>`
      }
    </button>
    ${chatActive ? `
      <button class="sidebar-toggle">
        <sl-icon name="list"></sl-icon>
      </button>
      <div class="chat-realm ${sidebar?'show-sidebar':''}">
        <div class="chat-sidebar">
          <div class="sidebar-title">
            Computer
          </div>
          <button class="sidebar-action active">
            Introduction
          </button>
        </div>
        <div>
          <div class="chat-pane">
            <div class="log">
              <div class="chat-content">
                ${Object.keys(messages).map((id) => {
                  const { created_at, text, type, actions={} } = messages[id]
                  const actionsHTML = Object.keys(actions).map(key => {
                    const { label } = actions[key]
                    const { response } = actions[key]['json-rpc']

                    return response ? `
                      <div class="message-response">
                        ${response.error ? `
                          ${response.error.message}

                          <button class="message-action" data-message="${id}" data-action="${key}">
                            Try Again
                          </button>
                        `: 'Finished'}
                      </div>
                    `: `
                      <button class="message-action" data-message="${id}" data-action="${key}">
                        ${label}
                      </button>
                    `
                  })
                  return `${ type === 'bot' ? `
                      <div class="message bot" data-id="${id}">
                        <div class="meta">
                          <div class="message-picture">
                            <img src="/public/cdn/hivelabworks.com/classic-logo.svg" />
                          </div>
                        </div>
                        <div class="body">${escapeHyperText(text)}</div>
                        ${actionsHTML? `
                          <div class="message-actions">
                            ${actionsHTML}
                          </div>
                        `:''}
                      </div>
                    ` : `
                      <div aria-role="button" class="message human" data-id="${id}">
                        <div class="body">${escapeHyperText(text)}</div>
                      </div>
                    `}
                  `
                }).join('')}
              </div>
            </div>
            <form class="new-message-form">
              <div class="text-well">
                <textarea name="message" placeholder="Say something"></textarea>
                <button class="send" type="submit">
                  <sl-icon name="arrow-up"></sl-icon>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ` : `
      ${notification ? `
        <button class="chat-notification">
          <img src="/public/cdn/hivelabworks.com/classic-logo.svg" />
black
          <div class="notification-body">
            ${notification}
          </div>
        </button>
      `:''}
    `}
  `

  return humanPromptUrl ? `
    <div class="human-prompt ${chatActive ? 'active' :'' }">
      <button class="human-unprompt" data-id="${humanPromptId}">
        <sl-icon name="x-lg"></sl-icon>
      </button>
      <div class="human-app">
        <div class="human-app-title">${humanPromptTitle}</div>
        <iframe src="${humanPromptUrl}" title="Await Human"></iframe>
      </div>
    </div>
    ${view}
  `: view
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

$.when('click', '.message-action', async (event) => {
  const { message:mID, action: aID } = event.target.dataset

  const { messages } = $.learn()

  const { actions } = messages[mID] || {}

  if(!actions) return

  const action = actions[aID]

  if(!action) return

  const { request } = action['json-rpc']

  if(request.id) {
    const response = await humanRPC(request).catch((error) => {
      $.teach(error, responseReducer(mID))
    })

    if(response) {
      $.teach(response, responseReducer(mID))
    }
  } else {
    try {
      humanRPC(request)
    } catch(e) {
      console.error(e)
    }
  }
})

function responseReducer(mID) {
  return (state, payload) => {
        return {
          ...state,
          messages: {
            ...state.messages,
            [mID]: {
              ...state.messages[mID],
              actions: {
                ...state.messages[mID].actions,
                [payload.id]: {
                  ...state.messages[mID].actions[payload.id],
                  'json-rpc': {
                    ...state.messages[mID].actions[payload.id]['json-rpc'],
                    response: payload
                  }
                }
              }
            }
          }
        }
      }
}

const humanMethods = {
  open: (request, resolve, reject) => {
    const { params } = request
    $.teach({
      humanPromptUrl: `/app/${params.app}?data=${params.data}&rpcID=${request.id}`,
      humanPromptTitle: params.appTitle,
      humanPromptId: request.id,
    })
    return function callback(response) {
      $.teach({
        humanPromptUrl: null,
        humanPromptId: null,
        humanPromptTitle: null
      })
      if(response.error) {
        reject(response)
      } else {
        resolve(response)
      }
    }
  }
}

const callbacks = {}

function humanRPC(request) {
  return new Promise((resolve, reject) => {
    if(humanMethods[request.method]) {
      callbacks[request.id] = humanMethods[request.method](request, resolve, reject)
    } else {
      reject({
        "jsonrpc": "2.0",
        id: rpcID,
        error: {
          code: '-32601',
          message: 'Method not found',
        }
      })
    }
  })
}

self.addEventListener('message', function handleMessage(event) {
  if(event.data.type === 'human-rpc') {
    const { response } = event.data
    callbacks[response.id](response)
  } 
});

$.when('click', '.human-unprompt', () => {
  const { humanPromptId } = $.learn()

  const callback = callbacks[humanPromptId]

  if(callback) {
    callback({
      "jsonrpc": "2.0",
      id: humanPromptId,
      error: {
        code: '-32000',
        message: 'Declined by you.'
      }
    })
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

$.when('keypress', '[name="message"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send(e)
  }
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  send(event)
})

function send(event) {
  const root = event.target.closest($.link)
  const message = root.querySelector('[name="message"]')

  const text = message.value
  message.value = ''

  if(text.trim()) {
    const row ={
      id: self.crypto.randomUUID(),
      created_at: new Date().toJSON(),
      text,
      type: 'human'
    }

    $.teach(row, mergeMessage)
  }
}

export function humanMessage(text) {
  const row ={
    id: self.crypto.randomUUID(),
    created_at: new Date().toJSON(),
    text,
    type: 'human'
  }

  $.teach(row, mergeMessage)
}

export function botMessage(text) {
  const row ={
    id: self.crypto.randomUUID(),
    created_at: new Date().toJSON(),
    text,
    type: 'bot'
  }

  $.teach(row, mergeMessage)
  $.teach({ notification: text })
}


$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    font-size: 1rem;
  }

  & .chat-realm {
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    top: 0;
    display: grid;
    grid-template-columns: 1fr;
    background: #2b2b2b;
    z-index: 10;
  }

  & .chat-sidebar {
    background: #1c1c1c;
    color: white;
    display: none;
    padding: 3.5rem 1rem 1rem;
  }
  & .show-sidebar .chat-sidebar {
    position; absolute;
    left: 0;
    display: block;
    width: 320px;
    max-width: 100vw;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    display: block;
  }

  @media (min-width: 48rem) {
    & .chat-realm.show-sidebar {
      grid-template-columns: 320px 1fr;
    }

    & .chat-sidebar {
      position: static !important;
    }
  }

  & .chat-pane {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
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
  }

  & .chat-content {
    padding-top: 1rem;
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
    background: black;
    border: none;
    color: rgba(255,255,255,.85);
    border-radius: 0;
    padding: 8px 48px 8px 8px;
    max-height: 35vh;
    font-size: 1rem;
  }

  & textarea:focus {
    outline-offset: -2px;
    outline-color: rgba(255,255,255,.5);
  }

  & .actions {
    display: flex;
    justify-content: end;
  }

  & .text-well {
    position: relative;
  }

  & .send {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 34px;
    height: 34px;
    background: dodgerblue;
    color: white;
    font-size: 16px;
    padding: .5rem;
    z-index: 1;
    border-radius: 100%;
    transition: background-color 200ms ease-in-out;
    border: none;
  }

  & .message {
    position: relative;
    border: none;
    display: grid;
    grid-template-columns: auto 1fr;
    margin: 0 .5rem .5rem;
    background: white;
    border-radius: 4px;
    overflow: hidden;
  }

  & .message-response {
    grid-column: -1 / 1;
  }

  & .message-actions {
    grid-column: -1 / 1;
    padding: 8px;
    background: black;
  }

  & .message-actions button {
    background: dodgerblue;
    border: none;
    border-radius: 4px;
    color: white;
    padding: .5rem;
    font-size: 1rem;
  }

  & .message .body {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    vertical-align: top;
    padding: 8px;
  }

  & .message.bot {
    margin-right: 3rem;
    background: rgba(0,0,0,.25);
    color: rgba(255,255,255,.85);
  }

  & .message.human {
    margin-left: 3rem;
    background: rgba(0,0,0,.65);
    color: rgba(255,255,255,.85);
  }


  & .message .meta {
    padding: 8px;
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

  & .chat-toggle {
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    right: 2px;
    z-index: 20;
    font-size: 16px;
    padding: 0;
    top: 2px;
  }

  & .chat-notification {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 66px;
    background: white;
    padding: 8px;
    border-radius: 4px;
    display: grid;
    grid-template-columns: 2rem 1fr;
    gap: 1rem;
    font-size: 1.2rem;
    color: rgba(0,0,0,.65);
    font-weight: bold;
    text-align: left;
    border: 2px solid gold;
  }

  & .human-prompt {
    position: absolute;
    z-index: 9000;
    inset: 0;
    display: none;
    background: rgba(0,0,0,.65);
    padding: 0;
    margin: auto;
    display: grid;
    place-items: center;
  }

  & .human-app {
    display: grid;
    grid-template-rows: 3rem 1fr;
    height: 100%;
  }

  & .human-app-title {
    font-weight: bold;
    text-align: center;
    color: white;
    font-size: 1.5rem;
    line-height: 3rem;
  }

  & .human-prompt.active {
    display: block;
  }

  & .human-prompt iframe {
    max-width: 55ch;
    margin: auto;
  }

  & .human-unprompt {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    top: 2px;
    right: 2px;
    z-index: 20;
    font-size: 16px;
  }

  & .sidebar-toggle {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    top: 2px;
    left: 2px;
    z-index: 20;
    font-size: 16px;
  }

  & .sidebar-title {
    font-weight: bold;
    font-size: 1.5rem;
    color: rgba(255,255,255,.4);
  }

  & .sidebar-action {
    background: rgba(255,255,255,.2);
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    border: none;
    margin: .5rem 0;
    border-radius: 4px;
    display: block;
    width: 100%;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`)


$.when('click', '.chat-notification', () => {
  pause()
  $.teach({ chatActive: true, notification: null })
})

$.when('click', '.sidebar-toggle', () => {
  $.teach({ sidebar: !$.learn().sidebar })
})


export function launchAI() {
  pause()
  $.teach({ chatActive: true })
}

$.when('click', '.chat-toggle', () => {
  const { chatActive } = $.learn()
  const next = !chatActive
  next ? pause() : resume()
  $.teach({ chatActive: next, notification: null })
})

$.when('input', 'textarea', (event) => {
  event.target.style.height = (event.target.scrollHeight) + "px";
});

$.when('blur', 'textarea', (event) => {
  clearCursor(event.target.closest($.link))
});

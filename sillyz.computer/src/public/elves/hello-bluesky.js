import elf from "@silly/tag"
import { render } from '@sillonious/saga'
import { BskyAgent } from '@atproto/api'

let agent

const blueskyCreds = state['ls/blueskyCreds'] || {}
const $ = elf('hello-bluesky', {
  feed: null,
  service: blueskyCreds.service,
  identifier: blueskyCreds.identifier,
  password: ''
})

function fetchTimeline() {
  agent.getTimeline({
    cursor: "",
    limit: 30,
  }).then(({ data }) => {
    $.teach({ feed: data.feed })
  });
}

$.when('click', '[data-logout]', (event) => {
  logout()
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const { service, identifier } = $.learn()

  state['ls/blueskyCreds'] = {
    service,
    identifier,
  }

  login()
})

async function login() {
  const { service, identifier, password} = $.learn()

  if(!blueskyCreds.service) return

  agent = new BskyAgent({
    service
  })

  await agent.login({
    identifier,
    password
  })

  $.teach({ authenticated: true })

}

async function logout() {
  const blueskyCreds = state['ls/blueskyCreds'] = {}
  $.teach({ authenticated: false })
}

function loginForm() {
  const { service, identifier, password } = $.learn()

  return `
    <form method="post">
      <label class="field">
        <span class="label">Service</span>
        <input data-bind value="${service}" type="text" name="service" placeholder="https://1998.social" required/>
      </label>
      <label class="field">
        <span class="label">Identifier</span>
        <input data-bind value="${identifier}" type="text" name="identifier" placeholder="tychi.1998.social" required/>
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input data-bind value="${password}" type="password" name="password"  required/>
      </label>
      <button type="submit">
        Connect
      </button>
    </form>
  `
}

$.draw(target => {
  const { feed, authenticated } = $.learn()
  const blueskyCreds = state['ls/blueskyCreds']

  if(!authenticated) {
    return loginForm()
  }

  if(authenticated && !feed) {
    fetchTimeline()
    return
  }

  const view = `
    <div class="log">
      <button data-logout>logout</button>
      <div class="content">
        ${feed.map(({ post }) => {
          return `
            <div aria-role="button" class="message">
              <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="meta" data-tooltip='${post.author.handle}'>
                <img src="${post.author.avatar}" class="avatar" />
                ${post.author.displayName}
              </a>
              <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
              <div class="body">${escapeHyperText(post.record.text)}</div>
            </div>
          `
        }).join('')}
      </div>
    </div>
    <form class="send-form" data-command="enter">
      <button data-tooltip="send" class="button send" type="submit" data-command="enter">
        <sl-icon name="arrow-up"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message" placeholder="Today..."></textarea>
      </div>
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

$.when('click', 'a', (event) => {
  event.stopPropagation()
})

$.when('click', '.message', (event) => {
  const text = event.target.querySelector('.body').innerText

  if(text) {
    showModal(`
      <div style="height: 100%; background: rgba(128,128,128,1); overflow: auto; width: 100%;">
        <div class="screenplay">
          ${render(text)}
        </div>
      </div>
    `)
  }
})
$.when('submit', '.send-form', (event) => {
  event.preventDefault()
  send(event)
})

async function send(event) {
  const message = event.target.closest($.link).querySelector('[name="message"]')

  await agent.post({
    text: message.value,
    createdAt: new Date().toISOString()
  })

  fetchTimeline()
}

$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    position: relative;
    height: 100%;
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

  & .send-form button {
    position: absolute;;
    right: 0;
    bottom: 0;
    z-index: 2;
    height: 2rem;
    padding: .25rem 1rem;
    margin: .5rem;
  }

  & .send-form button[disabled] {
    opacity: .5;
    background: rgba(255,255,255,.5);
  }

  & .send-form button:hover,
  & .send-form button:focus {
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

  & [name="message"] {
    padding-right: 3rem;
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

  & .content {
    display: flex;
    flex-direction: column-reverse;
  }

  & .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 100%;
    float: left;
    margin-right: .5rem;
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
    border-radius: .5rem;
    padding: 8px;
  }

  & .text-well {
    background: rgba(0,0,0,.25);
    padding: 8px;
  }

  & .send {
    position: absolute;
    bottom: 0;
    right: 0;
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
  }

  & .originator .avatar {
    display: none;
  }

  & .actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    text-align: right;
    z-index: 10;
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
  & .joke-actions button:focus,
  & .actions button:hover,
  & .joke-actions button:hover {
    background-color: rebeccapurple;
  }

  & .button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
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

$.when('input', 'textarea', (event) => {
  event.target.style.height = "auto";
  event.target.style.height = (event.target.scrollHeight) + "px";
});

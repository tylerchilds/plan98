import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import { render } from '@sillonious/saga'
import { BayunCore } from '@sillonious/vault'
import 'gun'
const Gun = window.Gun
const gun = Gun(['https://gun.1998.social/gun']);
import { getSession, clearSession } from './comedy-notebook.js'
import { setRoom } from './chat-room.js'

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

const $ = module('party-chat', { virtual: true, otherGroups: [], myGroups: [] })

function getMyGroups() {
  const { sessionId } = getSession()
  bayunCore.getMyGroups(sessionId)
    .then(result => {
      $.teach({ myGroups: result })
  })
  .catch(error => {
        console.log("Error caught");
        console.log(error);
  });
}

function getOtherGroups() {
  const { sessionId } = getSession()
  bayunCore.getUnjoinedPublicGroups(sessionId)
    .then(result => {
      $.teach({ otherGroups: result })
    })
    .catch(error => {
          console.log("Error caught");
          console.log(error);
    });
}


$.when('click', '[data-create]', () => {
  const { sessionId } = getSession()
  const groupType = BayunCore.GroupType.PUBLIC;
  bayunCore.createGroup(sessionId, "General", groupType)
    .then(result => {
      getMyGroups()
      getOtherGroups()
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

$.when('click', '.other-groups button', (event) => {
  const { sessionId } = getSession()
  const { id } = event.target.dataset
  bayunCore.joinPublicGroup(sessionId, id)
    .then(result => {
      getMyGroups()
      activateGroup(sessionId, id)
    })
    .catch(error => {
          console.log("Error caught");
          console.log(error);
    });
})

$.when('click', '.my-groups button', (event) => {
  const { sessionId } = getSession()
  const { id } = event.target.dataset

  activateGroup(sessionId, id)
})

function activateGroup(sessionId, id) {
  bayunCore.getGroupById(sessionId, id)
    .then(result => {
      setRoom(result.groupId)
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
}

const commands = {
  comment: '!',
  address: '#',
  puppet: '@',
  parenthetical: '&',
  quote: '>',
  module: '<',
  donottouch: '{',
  effect: '^',
  enter: ' ',
}

function drawGroupButton(group) {
  return `
    <button class="select-group" data-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

$.draw(target => {
  const { sessionId } = getSession()
  if(!sessionId) return `
    <sticky-note>
      <comedy-notebook></comedy-notebook>
    </sticky-note>
  `
  getMyGroups()
  getOtherGroups()
  const { file } = sourceFile(target)
  const log = render(file) || ''
  const { myGroups, otherGroups } = $.learn()

  const view = `
    <div name="transport">
      <div name="actions">
        <button data-zero>Clear</button>
        <button data-party>Invite</button>
        <button data-logout>Logout</button>
      </div>
    </div>
    <div class="grid">
      <div class="all-logs">
        <div class="my-groups">
          MY GROUPS
          ${myGroups.map(drawGroupButton).join('')}
        </div>
        <div class="other-groups">
          OTHER GROUPS
          ${otherGroups.map(drawGroupButton).join('')}
        </div>
        <button data-create>
          Create
        </button>
      </div>
      <div class="captains-log">
        <chat-room></chat-room>
      </div>
    </div>
  `

  return view
})

function source(target) {
  const hardcoded = window.location.pathname
  const queried = plan98.parameters.get($.link)
  const today = new Date().toJSON().slice(0, 10)
  const dynamic = `/public/journal/${today}.saga`
  return hardcoded || queried || dynamic
}

function sourceFile(target) {
  const path = source(target)
  const entry = gun.get($.link).get(path)
  if(!target.subscribed) {
    entry.on((data) => {
      $.teach({[path]: data})
    });
    target.subscribed = true
  }

  let file = `<hello-world

# Write once, run globally.

The world runs on computers that fit under our desks, on our laps, in our pockets, around our bodies, and throughout our homes and businesses.

@ Presenter
> Have you wondered how these all work?

> Have you ever wished you could control them yourself?

> Have you ever tried to build your own?

> What was the hardest part?

<div
html: <sillyz-ocarina></sillyz-ocarina>
style: height: 100vh;

<story-board

<mine-sweeper
<mind-chaos3d
<mind-chess

<title-page
title: Hello World
author: Thesillonious Caramera

# Exterior Home

Carrying an UMBRELLA and wearing a JESTER HAT is THESILLONIOUS CARAMERA

@ Thesillonious Caramera
& winking
> I didn't break the windows if you didn't

THESILLONIOUS CARAMERA vanishes, leaving behind a NOTE with a maze and a message in BLUE PENCIL

@ NOTE
> the rest is up to you

^ Fade Out

<infinite-canvas
src: /cdn/sillyz.computer/index.canvas

<quick-media
id: quick-media-demo
`
  const data = $.learn()[path] || { file }

  return data
    ? data
    : (function initialize() {
      fetch(path).then(async (res) => {
        if(res.status === 200) {
          file = await res.text()
        }
      }).catch(e => {
        console.error(e)
      }).finally(() => {
        entry.put({ file })
      })

      return data
    })()
}

$.when('click', '.select-group', (event) => {
  const { id } = event.target.dataset
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { command } = event.target.dataset
  send(event)
})
function send(event) {
  let { file } = sourceFile(event.target)
  const message = event.target.closest($.link).querySelector('[name="message"]')
  const path = source(event.target)
  const { command } = event.target.dataset
  if(!commands[command]) return
  const symbol = commands[command]
  file = file+'\n'+symbol+message.value
  gun.get($.link).get(path).put({ file }, () => {
    message.value = ''
  })
}

$.when('click', '[data-zero]', () => {
  const path = source(event.target)
  gun.get($.link).get(path).put({file: ''})
})

$.when('click', '[data-infinity]', () => {
  const { saga } = doingBusinessAs[plan98.parameters.get('world') || 'sillyz.computer']
  showModal(`
    <sticky-note class="maximized">
      <div style="position: fixed; margin: auto; display: grid; place-items: center; bottom: 1rem; left: 1rem; right: 1rem; z-index: 2;">
        <div style="background: rgba(0,0,0,.85); color: #fff; padding: 1rem; border-radius: 1rem;">
          Find the debugger and see
        </div>
      </div>
      <hyper-script src="${saga}"></hyper-script>
      <plan98-console></plan98-console>
    </sticky-note>
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

$.style(`
  & {
    display: grid;
    position: relative;
    height: 100%;
    background: linear-gradient(135deg, var(--wheel-0-0), 60%, var(--wheel-0-4));
    color: white;

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

  & .story-chat-form {
    display: grid;
    grid-template-columns: 1fr auto;
    margin-bottom: .5rem;
  }

  & .captains-log {
    width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 2rem 1rem;
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
`)

import module from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import { render } from '@sillonious/saga'
import { BayunCore } from '@sillonious/vault'
import { getSession, clearSession } from './comedy-notebook.js'
import { setRoom, getRoom } from './chat-room.js'

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
  const { group } = $.learn()
  const groupType = BayunCore.GroupType.PUBLIC;
  bayunCore.createGroup(sessionId, group, groupType)
    .then(result => {
      getMyGroups()
      getOtherGroups()
      $.teach({ group: '' })
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
    <comedy-notebook></comedy-notebook>
  `
  getMyGroups()
  getOtherGroups()
  const { myGroups, otherGroups, group='' } = $.learn()

  const view = `
    <div class="grid">
      <div class="all-logs">
        <div class="my-groups">
          <div class="subtitle">MY GROUPS</div>
          ${myGroups.map(drawGroupButton).join('')}
        </div>

        <div class="subtitle">NEW GROUP</div>
        <input data-bind placeholder="New Friends" type="text" name="group" value="${group}" />
        <button data-create>
          Create
        </button>

        <div class="other-groups">
          <div class="subtitle">OTHER GROUPS</div>
          ${otherGroups.map(drawGroupButton).join('')}
        </div>
        <button data-party>Invite</button>
        <button data-logout>Logout</button>
      </div>
      <div class="captains-log">
        <chat-room></chat-room>
      </div>
    </div>
  `

  return view
})

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})



$.when('click', '[data-zero]', () => {
  const { room } = $.learn()
  const { sessionId } = getSession()
  bayunCore.leaveGroup(sessionId, room)
    .then(result => {
      getMyGroups()
      setRoom(null)
    })
    .catch(error => {
          console.log("Error caught");
          console.log(error);
    });
})

$.when('click', '.select-group', (event) => {
  const { id } = event.target.dataset
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
    overflow: hidden;
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
    max-height: calc(100% - 2rem);
    padding: 0;
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
    background: linear-gradient(transparent, rgba(0,0,0,.85)), linear-gradient(var(--wheel-0-0), var(--wheel-0-4));
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

  & .subtitle {
    color: rgba(255,255,255,.65);
    font-weight: 800;
    font-size: .8rem;
    margin: 2rem .5rem .5rem;
  }

  & [name="group"] {
    padding: .5rem;
  }
`)

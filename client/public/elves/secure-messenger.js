import elf from '@silly/tag'
import { doingBusinessAs } from "@sillonious/brand"
import { showModal } from './plan98-modal.js'
import { render } from '@sillonious/saga'
import { BayunCore } from '@sillonious/vault'
import { bayunCore } from '@sillonious/vault'
import { getSession, logout } from './bayun-wizard.js'

/*
   ^
  <@>
  !&{
   #
*/

const $ = elf('secure-messenger', {
  menu: false,
  otherGroups: [],
  myGroups: []
})

export async function getMyGroups() {
  const { sessionId } = getSession()
  return await bayunCore.getMyGroups(sessionId)
    .then(result => {
      $.teach({ myGroups: result })
      return result
  })
  .catch(error => {
        console.log("Error caught");
        console.log(error);
  });
}

export async function getOtherGroups() {
  const { sessionId } = getSession()
  return await bayunCore.getUnjoinedPublicGroups(sessionId)
    .then(result => {
      $.teach({ otherGroups: result })
      return result
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
      setRoom(result.groupId)
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
  $.teach({ menu: false })
})

$.when('click', '.my-groups button', (event) => {
  const { sessionId } = getSession()
  const { id } = event.target.dataset

  activateGroup(sessionId, id)
  $.teach({ menu: false })
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
  const { room } = $.learn()
  return `
    <button class="select-group ${room === group.groupId ? 'active':''}" data-id="${group.groupId}">
      ${group.groupName} (${group.groupId})
    </button>
  `
}

function connect(target) {
  if(target.connected) return
  target.connected = true
  getMyGroups()
  getOtherGroups()
}

$.draw(target => {
  const { sessionId, companyName, companyEmployeeId } = getSession()
  if(!sessionId) {
    target.innerHTML = `
      <secure-authentication></secure-authentication>
    `
    return
  }
  connect(target)
  const { myGroups, otherGroups, group='', menu, room } = $.learn()

  const view = `
    <div class="grid-layout ${menu?'menu-active':''}">
      <div class="all-logs">
        <div>
          Work Profile:
          ${companyEmployeeId}@${companyName}

          <button data-logout>
            Logout
          </button>
        </div>
        <label class="field">
          <span class="label">Group Name</span>
          <input data-bind placeholder="(Amigos)" type="text" name="group" value="${group}" />
        </label>
        <button data-create>
          Create Group
        </button>

        <div class="my-groups">
          <div class="subtitle">MY GROUPS</div>
          ${myGroups.map(drawGroupButton).join('')}
        </div>

        <div class="other-groups">
          <div class="subtitle">OTHER GROUPS</div>
          ${otherGroups.map(drawGroupButton).join('')}
        </div>
      </div>
      <div class="captains-log">
        <div class="mobile-back">
          <button data-back>
            Menu
          </button>
        </div>
        ${room ? `
          <iframe name="chat-frame" src="/app/secure-chat?room=${room}"></iframe>
        `: `
          <div style="padding: 1rem; margin: 3rem auto; max-width: 55ch;">
            <p>
              Welcome to the Secure Messenger.
            </p>

            <p>
              All chats here are end to end encrypted.
            </p>

            <p>
              To get started, press the Menu button and join a chat room.
            </p>
          </div>
        `}
      </div>
    </div>
  `

  return view
})

$.when('click', '[data-logout]', () => {
  logout()
})

function setRoom(room) {
  $.teach({ room })
}

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})



$.when('click', '[data-back]', () => {
  $.teach({ menu: !$.learn().menu })
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
  setRoom(id)
})

$.style(`
  & {
    display: grid;
    position: relative;
    height: 100%;
    color: rgba(0,0,0,.65);
    overflow: hidden;
  }

  & .select-group.active {
    color: white;
    background: dodgerblue;
  }

  & sticky-note {
    place-self: center;
  }

  & .captains-log {
    width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 0;
    overflow: auto;
    background: white;
    display: grid;
    position: relative;
  }

  & .grid-layout {
    height: 100%;
    max-height: 100vh;
    display: grid;
  }

  @media (max-width: 767px) {
    & .grid-layout {
      grid-template-areas: "stack";
    }
    & .captains-log,
    & .all-logs {
      grid-area: stack;
    }

    & .captains-log {
      z-index: 1;
    }

    & .menu-active .all-logs {
      z-index: 2;
    }

  }

  @media (min-width: 768px) {
    & .grid-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
    }

    & .mobile-back {
      display: none;
    }
  }

  & .mobile-back {
    position: absolute;
    top: 0;
    left: 0;
  }

  & .all-logs {
    overflow-y: auto;
    overflow-x: hidden;
    background: white;
    box-shadow: 0 4px 9px 4px rgba(0,0,0,.05);
  }

  & .all-logs button {
    display: block;
    background: white;
    color: dodgerblue;
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
    color: rgba(0,0,0,.65);
    font-weight: 800;
    font-size: .8rem;
    margin: 2rem .5rem .5rem;
  }

  & [name="group"] {
    padding: .5rem;
  }

  & .field {
    padding: .5rem;
    margin-bottom: 0;
  }
`)

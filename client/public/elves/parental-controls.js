import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getCompanies } from './bayun-wizard.js'
import { getMyGroups, getOtherGroups } from './party-chat.js'
import { social, setRoom, getRoom } from './chat-room.js'

const companies = getCompanies().map((company) => {
  return `
    <option value="${company}">
      ${company}
    </option>
  `
}).join('')

const companiesField = `
  <label>Organization</label>
  <select name="companyName" class="companyName">
    ${companies}
  </select>
`

const currentWorkingDirectory = '/sagas/'

const personalLolol = [
  {
    label: 'My',
    lol: [
      {
        label: 'profile',
        laugh: 'profile.saga'
      },
      {
        label: 'braid',
        laugh: 'braid.saga'
      },
    ]
  }
]

const lolol = [
  {
    label: 'Welcome',
    lol: [
      {
        label: 'Start',
        laugh: 'start.saga'
      },
      {
        label: 'Search',
        laugh: 'search.saga'
      },
      {
        label: 'Secure',
        laugh: 'secure.saga'
      }
    ]
  },
  {
    label: 'Office',
    lol: [
      {
        label: 'Script',
        laugh: 'script.saga'
      },
      {
        label: 'Notes',
        laugh: 'notes.saga'
      },
      {
        label: 'Boards',
        laugh: 'boards.saga'
      },
      {
        label: 'Browser',
        laugh: 'browser.saga'
      },
      {
        label: 'Maps',
        laugh: 'maps.saga'
      },

    ]
  },
  {
    label: 'Sports',
    lol: [
      {
        label: 'Football',
        laugh: 'football.saga'
      },
      {
        label: 'Baseball',
        laugh: 'baseball.saga'
      },
    ]
  },
  {
    label: 'Toys',
    lol: [
      {
        label: 'Minesweeper',
        laugh: 'mine-sweeper.saga'
      },
      {
        label: 'Paint App',
        laugh: 'paint.saga'
      },
      {
        label: 'Free Cell',
        laugh: 'free-cell.saga'
      },
      {
        label: 'F-DOS',
        laugh: 'fdos.saga'
      },
      {
        label: 'Sonic A.I.R.',
        laugh: 'sonic.saga'
      },
      {
        label: 'Mind Chess',
        laugh: 'mind-chess.saga'
      },
      {
        label: 'Pocket Dexter',
        laugh: 'pokedex.saga'
      },
    ]
  },
  {
    label: 'Lore',
    lol: [
      {
        label: 'Sagas',
        laugh: 'sagas.saga'
      },
      {
        label: 'Elves',
        laugh: 'elves.saga'
      },
    ]
  },
  {
    label: 'Chats',
    lol: [
      {
        label: 'General',
        laugh: 'general.saga'
      },
      {
        label: 'Random',
        laugh: 'random.saga'
      },
    ]
  },
  {
    label: 'Insights',
    lol: [
      {
        label: 'Inbound',
        laugh: 'inbound.saga'
      },
      {
        label: 'Outbound',
        laugh: 'outbound.saga'
      },
    ]
  },
  {
    label: 'Hard Mode',
    lol: [
      {
        label: 'Development Environment',
        laugh: 'code.saga'
      },
      {
        label: 'File System',
        laugh: 'files.saga'
      },

      {
        label: 'A-Frame',
        laugh: 'aframe.saga'
      },
      {
        label: 'Havok',
        laugh: 'havok.saga'
      },

    ]
  },
]
const { laugh } = lolol[0].lol[0]
let lastLaugh = laugh
let lastSidebar = false
let lastUser = false
let lastAuthState = false

const $ = module('parental-controls', {
  content: '...',
  laugh,
  activeDialect: '/en-us/',
  activeWorld: 'sillyz.computer',
  chatRooms: [],
  sidebar: false,
  avatar: false,
  lololID: 0,
  lolID: 0,
})

outLoud(laugh, 0, 0)

function refreshRooms() {
  getMyGroups().then(chatRooms => {
    $.teach({ chatRooms })
  })

  getOtherGroups().then(otherChatRooms => {
    $.teach({ otherChatRooms })
  })
}
refreshRooms()

$.draw((target) => {
  const { sessionId, companyName, companyEmployeeId } = getSession()
  const { avatar, sidebar, laugh, saga, lolID, lololID } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar
  const user = social(companyName, companyEmployeeId)

  debugger
  const authState = sessionId
  const avatarHTML = sessionId ? `
    <div data-avatar>
      <quick-media key="${user.avatar}"></quick-media>
    </div>
  ` : `
    <img data-avatar src="/cdn/tychi.me/photos/professional-headshot.jpg" alt="" />
  `

  const authChip = sessionId ? `
    <div class="tongue">
      <div class="quick-auth">
        <div class="console">
          <label>Organization</label>
          <div class="companyName">
            ${companyName}
          </div>
        </div>
        <div class="player">
          <label>Member</label>
          <div class="companyEmployeeId">
            ${companyEmployeeId}
          </div>
        </div>
        <button class="auth-button" data-disconnect>
          Disconnect
        </button>
      </div>
    </div>
  ` : `
    <div class="tongue">
      <form method="post" class="quick-auth">
        <div class="console">
          ${companiesField}
        </div>
        <div class="player">
          <label>Member</label>
          <input placeholder="player" name="companyEmployeeId" />
        </div>
        <div class="password">
          <label>Password</label>
          <input type="password" name="password" />
        </div>

        <button class="auth-button" type="submit">
          Connect
        </button>
      </form>
    </div>
  `

  if(authState !== lastAuthState && target.querySelector('.control-avatar')) {
    lastAuthState = authState
    target.querySelector('.control-avatar').innerHTML = authChip
    target.querySelector('[data-sidebar]').innerHTML = avatarHTML
    return
  }


  if(laugh !== lastLaugh && target.querySelector('iframe')) {
    lastLaugh = laugh
    target.querySelector('iframe').src = saga
    target.querySelector('.-active').classList.remove('-active')
    target.querySelector(`.control-tab[data-lol="${lolID}"][data-lolol="${lololID}"]`).classList.add('-active')
    return
  }

  if(sidebar !== lastSidebar && target.querySelector('[data-sidebar]')) {
    lastSidebar = sidebar
    sidebar
      ? target.querySelector('data-tooltip').classList.add('sidebar')
      : target.querySelector('data-tooltip').classList.remove('sidebar')
    return
  }


  if(user !== lastUser && target.querySelector('[data-avatar]')) {
    lastUser = user.company + user.unix
    return
  }

  return `
    <data-tooltip class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-toggle">
        <button data-sidebar>
          ${avatarHTML}
        </button>
      </div>
      <div class="control-tab-list">
        <div class="control-avatar">
          ${authChip}
        </div>

        <div class="tastebuds">
          ${personalLolol.map((x, index) => {
            return `
              <div class="heading-label">${x.label}</div>
              ${myLol(x.lol, index)}
            `
          }).join('')}

          <chat-lists></chat-lists>
        </div>

        ${lolol.map((x, index) => {
          return `
            <div class="heading-label">${x.label}</div>
            ${lol(x.lol, index)}
          `
        }).join('')}

        <hr>
      </div>
      <div class="control-view ${sidebar ? '' : 'no-sidebar' }">
        <iframe src="${saga}" title="Okay"></iframe>
      </div>
    </data-tooltip>
  `
})

function scrollSave() {
  const list = this.querySelector('.control-tab-list')
  if(!list) return
  this.dataset.top = list.scrollTop
}

function scrollSidebar() {
  const list = this.querySelector('.control-tab-list')
  if(!list) return
  list.scrollTop = this.dataset.top
}

function myLol(laughs, lolol) {
  return laughs.map((y, lol) => {
    return `
      <button class="control-tab" data-lolol="${lolol}" data-lol="${lol}" data-laugh="${y.laugh}">
        ${y.label}
      </button>
    `
  }).join('')
}

function lol(laughs, lolol) {
  const { lololID, lolID } = $.learn()
  return laughs.map((y, lol) => {
    const isActive = lololID === lolol && lolID === lol
    return `
      <button class="control-tab ${isActive ? '-active' : '' }" data-lolol="${lolol}" data-lol="${lol}" data-laugh="${y.laugh}">
        ${y.label}
      </button>
    `
  }).join('')
}

$.when('click', '[data-laugh]', async (event) => {
  const { laugh, lol, lolol } = event.target.dataset
  const lolID = parseInt(lol, 10)
  const lololID = parseInt(lolol, 10)
  outLoud(laugh, lolID, lololID)
})

$.when('click', '[data-sidebar]', async (event) => {
  const { sidebar } = $.learn()
  $.teach({ sidebar: !sidebar })
})

$.when('click', '.in-group', async (event) => {
  const { groupId } = event.target.dataset
  setRoom(groupId)
  outLoud('chat-room.saga')
})

$.when('click', '.out-group', async (event) => {
  const { groupId } = event.target.dataset
  setRoom(groupId)
  outLoud('chat-room.saga')
})


export function getSession() {
  return state['ls/bayun'] || {}
}

function clearSession() {
  state['ls/bayun'] = {}
}

function setSession({ sessionId, companyName, companyEmployeeId }) {
  state['ls/bayun'] = {
    sessionId,
    companyName,
    companyEmployeeId
  }
}

$.when('submit', '.quick-auth', async (event) => {
  event.preventDefault()

  const companyEmployeeId = event.target.companyEmployeeId.value
  const companyName = event.target.companyName.value
  const password = event.target.password.value

  const successCallback = async data => {
    const {
      sessionId,
    } = data

    setSession({ sessionId, companyName, companyEmployeeId })
    refreshRooms()
  };

  const failureCallback = error => {
    $.teach({ error: `${error}` })
  };

  bayunCore.loginWithPassword(
    '', //sessionId,
    companyName,
    companyEmployeeId,
    password,
    true, //autoCreateEmployee,
    null, // TODO: @bayun, what is?
    noop.bind('securityQuestionsCallback'),
    noop.bind('passphraseCallback'),
    successCallback,
    failureCallback
  );
})

function noop(){}

$.when('click', '[data-disconnect]', async () => {
  clearSession()
})

function outLoud(nextLaugh, lolID, lololID) {
  const { laugh, activeDialect, activeWorld } = $.learn()
  const key = currentWorkingDirectory + activeWorld + activeDialect + nextLaugh
  $.teach({ laugh: nextLaugh, saga: key, lolID, lololID })
}

$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .quick-auth {
    background: rgba(0,0,0,.85);
    border-radius: 1rem;
    overflow: hidden;
  }

  & .quick-auth label {
    color: rgba(255,255,255,.65);
    padding: 0 1rem;
    text-transform: uppercase;
    font-size: .85rem;
    font-weight: 800;
  }

  & .control-toggle {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
  }

  & .control {
    display: grid;
    grid-template-columns: 1fr;
  }

  & .control.sidebar {
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    display: none;
  }
  & .sidebar .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
  }
  & .multiplayer.control-tab-list {
    overflow: hidden;
  }
  & .control-tab {
    display: block;
    border: 0;
    border-radius: 1rem;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: 1rem;
    color: dodgerblue;
    background: rgba(255,255,255,.85);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    background: dodgerblue;
    color: white;
  }

  & .control-toggle .control-tab {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem;
    color: white;
    font-size: 1rem;
    border-radius: 0 1rem 1rem 0;
    background-image: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: rgba(0,0,0,.5);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle .control-tab:hover,
  & .control-toggle .control-tab:focus {
    background-color: rgba(0,0,0,.25);
    color: white;
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  & .control-avatar {
    max-width: 100%;
    width: 320px;
    pointer-events: none;
  }

  & .control-avatar.show {

  }

  & data-tooltip,
  & xml-html,
  & data-tooltip .control {
    height: 100%;
  }
  & plan98-filesystem,
  & code-module {
    color: black;
  }

  & .heading-label {
    margin-top: 2rem;
    color: rgba(0,0,0,.5);
    text-align: right;
    font-weight: 600;
  }

  & hr {
    border-color: rgba(0,0,0,.05);
  }

  & poker-face {
    display: block;
    height: 280px;
  }

  & img + .heading-label {
    margin-top: 0;
  }

  & [data-sidebar] {
    font-size: 1.5rem;
    font-weight: 800;
    background: transparent;
    padding: 0;
    border: none;
    border-radius: 100%;
    width: 80px;
    height: 80px;
    color: rgba(255,255,255,.5);
    transition: background 200ms ease-in-out;
    display: grid;
    place-content: center;
  }

  & [data-sidebar]:focus,
  & [data-sidebar]:hover {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  & .control-avatar {
  }

  & .control-avatar .auth-button {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
    background-color: lime;
    color: white;
    display: block;
    border: 0;
    border-radius: 0 0 1rem 1rem;
    line-height: 1;
    width: 4rem;
    width: 100%;
    text-align: left;
    padding: 1rem;
    transition: all 200ms ease-in-out;
    flex: none;
  }

  & .control-avatar [data-disconnect] {
    background-color: orange;
  }


  & .control-avatar button:hover,
  & .control-avatar button:focus {
    background-color: rebeccapurple;
    color: white;
  }

  & .player {
  }

  & .control-avatar .console {
    background: rgba(128,128,128,.5);
    padding-top: 64px;
  }

  & .control-avatar input {
    border: none;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: .5rem 1rem;
    margin-bottom: .5rem;
    max-width: 100%;
  }

  & .control-avatar .companyName {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }
  & .control-avatar .companyEmployeeId {
    padding: .5rem 1rem;
    margin-bottom: .5rem;
  }


  & [data-avatar] {
    max-width: 72px;
    border-radius: 100%;
    overflow: hidden;
    padding: 0;
    aspect-ratio: 1;
    z-index: 10;
    pointer-events: none;
  }

  & .tongue {
    color: rgba(255,255,255,.85);
    transition: opacity 200ms ease-in-out;
    overflow: auto;
    width: 100%;
    pointer-events: all;
  }

  & .tastebuds {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  }

  & .password {
    background: black;
  }

  & .console select {
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    width: 100%;
    display: block;
  }
`)


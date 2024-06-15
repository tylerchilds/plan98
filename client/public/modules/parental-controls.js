import module from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'
import { getMyGroups, getOtherGroups } from './party-chat.js'
import { render } from '@sillonious/saga'
import { setRoom, getRoom } from './chat-room.js'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'

const lolol = [
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
        label: 'Code',
        laugh: 'code.saga'
      },
    ]
  },
]

const $ = module('parental-controls', {
  content: '...',
  activeDialect: '/en-us/',
  activeWorld: 'sillyz.computer',
  chatRooms: [],
  sidebar: true,
  activeLolol: 0,
  activeLol: 0
})

outLoud(lolol[0].lol[0].laugh)

getMyGroups().then(chatRooms => $.teach({ chatRooms }))

$.draw((target) => {
  const { sessionId, companyName, companyEmployeeId } = getSession()
  const { sidebar, content, chatRooms } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar

  const authChip = `
    <poker-face></poker-face>
  `

  target.innerHTML = `
    <data-tooltip class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-toggle">
        <button data-sidebar>
          ${sidebar ? 'Menu.' : 'Menu?'}
        </button>
      </div>
      <div class="control-tab-list">
        <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
        ${lolol.map((x, index) => {
          return `
            <div class="heading-label">${x.label}</div>
            ${lol(x.lol, index)}
          `
        }).join('')}

        <hr>
        ${sessionId ? `
          <div class="heading-label">Chat</div>
          ${chatRooms.map(chat).join('')}
        ` : ``}
        ${authChip}
      </div>
      <div class="control-view ${sidebar ? '' : 'no-sidebar' }">
        ${content}
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

function chat(group) {
  return `
    <button class="control-tab" data-group-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

function lol(laughs, lolol) {
  const { activeLolol, activeLol } = $.learn()
  return laughs.map((y, lol) => {
    const isActive = activeLolol === lolol && activeLol === lol
    return `
      <button class="control-tab ${isActive ? '-active' : '' }" data-lolol="${lolol}" data-lol="${lol}" data-laugh="${y.laugh}">
        ${y.label}
      </button>
    `
  }).join('')
}

$.when('click', '[data-laugh]', async (event) => {
  const { laugh, lol, lolol } = event.target.dataset
  $.teach({ activeLol: parseInt(lol, 10), activeLolol: parseInt(lolol, 10) })
  outLoud(laugh)
})

$.when('click', '[data-sidebar]', async (event) => {
  const { sidebar } = $.learn()
  $.teach({ sidebar: !sidebar })
})

$.when('click', '[data-group-id]', async (event) => {
  const { groupId } = event.target.dataset
  setRoom(groupId)
  $.teach({ content: '<chat-room></chat-room>' })
})



function outLoud(laugh) {
  const { activeDialect, activeWorld } = $.learn()
  const key = currentWorkingDirectory + activeWorld + activeDialect + laugh
  $.teach({ content: null })

  fetch(raw+key)
    .then(async response => {
      if(response.status === 404) {
        $.teach({ content: '404' })
        return
      }
      const saga = await response.text()
      const content = render(saga)

      $.teach({ content })
    })
    .catch(e => {

      $.teach({ content: `Error... ${e}` })
      console.error(e)
    })
}

$.style(`
  & {
    display: block;
    height: 100%;
    background: linear-gradient(165deg, rgba(255,255,255,.85) 60%, dodgerblue);
    overflow: hidden;
    position: relative;
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
    padding: 1rem 1rem 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
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

  & .control-toggle button {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem;
    position: relative;
    top: 2rem;
    color: white;
    font-size: 1rem;
    border-radius: 0 1rem 1rem 0;
    background-image: linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.5));
    background-color: rgba(0,0,0,.5);
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle button:hover,
  & .control-toggle button:focus {
    background-color: rgba(0,0,0,.25);
    color: white;
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
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
`)


import module from '@silly/tag'
import { getSession, clearSession } from './comedy-notebook.js'
import { getMyGroups, getOtherGroups } from './party-chat.js'
import { render } from '@sillonious/saga'
import { setRoom, getRoom } from './chat-room.js'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'

const $ = module('parental-controls', {
  content: '<comedy-notebook></comedy-notebook>',
  activeDialect: '/en-us/',
  activeWorld: 'sillyz.computer',
  chatRooms: []
})

getMyGroups().then(chatRooms => $.teach({ chatRooms }))

const lolol = [
  {
    label: 'Office',
    lol: [
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

$.draw((target) => {
  const { sessionId } = getSession()
  if(!sessionId) return `
    <comedy-notebook></comedy-notebook>
  `

  const { content, chatRooms } = $.learn()
  target.beforeUpdate = scrollSave
  target.afterUpdate = scrollSidebar

  const authChip = `
    <poker-face></poker-face>
  `

  target.innerHTML = `
    <data-tooltip class="control" aria-live="assertive">
      <div class="control-tab-list">
        ${authChip}
        ${lolol.map((x, index) => {
          return `
            <div class="heading-label">${x.label}</div>
            ${lol(x.lol)}
          `
        }).join('')}

        <hr>

        <div class="heading-label">Chat</div>
        ${chatRooms.map(chat).join('')}
      </div>
      <div class="control-view">
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

function lol(laughs) {
  return laughs.map((y, index) => `
    <button class="control-tab" data-laugh="${y.laugh}">
      ${y.label}
    </button>
  `).join('')
}

$.when('click', '[data-laugh]', async (event) => {
  const { laugh } = event.target.dataset
  outLoud(laugh)
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
  }

  & .control {
    display: grid;
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    gap: .5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem 1rem 1rem;
    overflow: auto;
    background: rgba(255,255,255,.65);
    position: relative;
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

  & .control-view {
    overflow: auto;
    position: relative;
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
`)


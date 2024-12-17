import elf from '@silly/elf'
import { getSession, logout } from './bayun-wizard.js'

const currentWorkingDirectory = '/sagas/'

const lolol = [
  {
    label: 'Company',
    lol: [
      {
        label: 'Landing',
        laugh: 'memex.saga'
      },
      {
        label: 'Pitch',
        laugh: 'draft-pitch.md'
      },
      {
        label: 'Deck',
        laugh: 'draft-deck.saga'
      },

      {
        label: 'About',
        laugh: 'about.md'
      },
      {
        label: 'FAQ',
        laugh: 'faq.md'
      },
    ]
  },
  {
    label: 'Experiments',
    lol: [
      {
        label: 'Secure Email',
        laugh: 'encrypted-email.saga'
      },
      {
        label: 'File System',
        laugh: 'file-system.saga'
      },
      {
        label: 'Bulletin Board',
        laugh: 'bulletin-board.saga'
      },
      {
        label: 'Video Conference',
        laugh: 'video-conference.saga'
      },
      {
        label: 'Payment Dashboard',
        laugh: 'payment-dashboard.saga'
      },
      {
        label: 'Quick Chat',
        laugh: 'quick-chat.saga'
      },
      {
        label: 'Private Notes',
        laugh: 'private-notes.saga'
      },
      {
        label: 'Calendar',
        laugh: 'calendar.saga'
      },
    ]
  },

]
let laugh = self.location.hash?.split('#')[1]

laugh ||= lolol[0].lol[0].laugh

let x, y = 0
lolol.forEach((list, newX) => {
  const newY = list.lol.findIndex(item => {
    return item.laugh === laugh
  })

  if(newY >= 0) {
    x = newX
    y = newY
  }
})

const lololID = x
const lolID = y
console.log(lololID, lolID)

const $ = elf('enterprise-dashboard', {
  content: '...',
  laugh,
  activeDialect: '/en-us/',
  activeWorld: 'hivelabworks.com',
  chatRooms: [],
  sidebar: true,
  avatar: false,
  lololID,
  lolID,
})

outLoud(laugh, lololID, lolID)

$.draw((target) => {
  const { saga, sidebar } = $.learn()
  const { sessionId } = getSession()

  if(!sessionId && target.dataset.mode !== 'auth') {
    target.dataset.mode = 'auth'
    return `
      <bayun-wizard></bayun-wizard>
    `
  }

  if(sessionId && target.dataset.mode !== 'admin') {
    target.dataset.mode = 'admin'
  }

  if(target.dataset.mode === 'auth') {
    return
  }

  return `
    <div class="header">
      <button data-sidebar>
        <span style="display: grid;">
          <sl-icon name="layout-sidebar-inset"></sl-icon>
        </span>
        <span class="logomark">Hive Labworks</span>
      </button>
      <div class="admin-actions">
        <button data-logout>
          Logout
        </button>
      </div>
    </div>

    <div class="control ${sidebar ? 'sidebar': ''}" aria-live="assertive">
      <div class="control-tab-list">
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
    </div>
  `
}, {
  beforeUpdate: (target) => {
    { scrollSave(target) }
  },
  afterUpdate: (target) => {
    { scrollSidebar(target) }
    { // recover icons from the virtual dom
      [...target.querySelectorAll('sl-icon')].map(node => {
        const nodeParent = node.parentNode
        const icon = document.createElement('sl-icon')
        icon.name = node.name
        node.remove()
        nodeParent.appendChild(icon)
      })
    }
  }
})

function scrollSave(target) {
  const list = target.querySelector('.control-tab-list')
  if(!list) return
  target.dataset.top = list.scrollTop
}

function scrollSidebar(target) {
  const list = target.querySelector('.control-tab-list')
  if(!list) return
  list.scrollTop = target.dataset.top
}

function lol(laughs, lolol) {
  const { lololID, lolID } = $.learn()
  return laughs.map((y, lol) => {
    const isActive = lololID === lolol && lolID === lol
    console.log({ lololID, lolol, lolID, lol })

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

$.when('click', '[data-logout]', async (event) => {
  logout()
})


function outLoud(nextLaugh, lolID, lololID) {
  const { laugh, activeDialect, activeWorld } = $.learn()
  const key = currentWorkingDirectory + activeWorld + activeDialect + nextLaugh
  $.teach({ laugh: nextLaugh, saga: key, lolID, lololID })
  self.location.hash = nextLaugh
}

$.style(`
  & {
    display: block;
    height: 100%;
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
    height: calc(100% - 2rem);
  }

  & .control.sidebar {
    display: grid;
    grid-template-rows: 33% 1fr;
  }

  & .control-tab-list {
    display: none;
  }

  & .sidebar .control-tab-list {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background: rgba(233,233,233,.85);
    z-index: 3;
    overflow-x: hidden;
  }

  @media screen and (min-width: 768px) {
    & .control {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }
    & .control.sidebar {
      position: relative;
      grid-template-columns: 320px auto;
      grid-template-rows: 1fr;
    }

    & .sidebar .control-tab-list {
      position: relative;
      top: 0;
      max-height: auto;
    }
  }


  & .multiplayer.control-tab-list {
    overflow: hidden;
  }
  & .control-tab {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem 1rem;
    color: dodgerblue;
    background: transparent;
    transition: background 200ms ease-in-out;
    border: 1px solid transparent;
    border-left: none;
    border-right: none;
    flex: none;
    font-size: 16px;
  }

  & .control-tab.-active,
  & .control-tab:hover,
  & .control-tab:focus {
    border-top-color: dodgerblue;
    border-bottom-color: dodgerblue;
    color: dodgerblue;
  }

  & .control-toggle .control-tab {
    display: block;
    border: 0;
    line-height: 1;
    width: 4rem;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem;
    font-size: 1rem;
    color: rgb(0,0,0,.65);
    border-radius: 0 1rem 1rem 0;
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle .control-tab:hover,
  & .control-toggle .control-tab:focus {
    color: rgb(0,0,0,.65);
  }


  & .control-view {
    overflow: auto;
    position: relative;
    z-index: 2;
    height: 100%;
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
    margin-top: 1rem;
    color: rgb(0,0,0,.65);
    text-align: left;
    font-weight: 600;
    padding: 0 1rem;
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
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    padding: .25rem .25rem .25rem;
    border: none;
    transition: background 200ms ease-in-out;
    display: inline-grid;
    place-items: center;
    grid-template-columns: auto 1fr;
    gap: .5rem;
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


  & .player {
  }

  & .header {
    background: black;
    color: rgb(0,0,0,.65);
    display: grid;
    grid-template-columns: auto 1fr;
    padding: 0 .5rem;
  }

  & .logomark {
    padding: .25rem;
    display: inline-block;
  }

  & [data-logout] {
    float: right;
    border: none;
    color: gold;
    background: none;
    border: 1px solid black;
  }

  & [data-logout]:hover,
  & [data-logout]:focus {
    border-color: gold;
  }

  & .admin-actions {
    display: grid;
    place-content: center end;
  }
`)


import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getCompanies } from './bayun-wizard.js'

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
    ]
  },

]
const { laugh } = lolol[0].lol[0]
let lastLaugh = laugh
let lastSidebar = false

const $ = module('enterprise-dashboard', {
  content: '...',
  laugh,
  activeDialect: '/en-us/',
  activeWorld: 'hivelabworks.com',
  chatRooms: [],
  sidebar: true,
  avatar: false,
  lololID: 0,
  lolID: 0,
})

outLoud(laugh, 0, 0)

$.draw((target) => {
  const { saga, sidebar } = $.learn()

  return `
    <div class="header">
      <button data-sidebar>
        <sl-icon name="layout-sidebar-inset"></sl-icon>
      </button>
      <span class="logomark">Hive Labworks</span>
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
    display: grid;
    height: 100%;
    overflow: hidden;
    position: relative;
    grid-template-rows: auto 1fr;
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
    height: 100%;
  }

  & .control.sidebar {
    grid-template-columns: 320px auto;
  }

  & .control-tab-list {
    display: none;
  }

  & .sidebar .control-tab-list {
    display: flex;
    flex-direction: column;
    overflow: auto;
    background: rgba(0,0,0,.85);
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
    line-height: 1;
    width: 4rem;
    color: white;
    display: block;
    width: 100%;
    text-align: left;
    padding: .5rem 1rem;
    color: white;
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
    border-top-color: gold;
    border-bottom-color: gold;
    color: gold;
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
    transition: background 200ms ease-in-out;
    flex: none;
  }

  & .control-toggle .control-tab:hover,
  & .control-toggle .control-tab:focus {
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
    margin-top: 1rem;
    color: rgba(255,255,255,.5);
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
    margin: .4rem 0 0 .4rem;
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
    color: white;
  }

  & .logomark {
    padding: .25rem;
    display: inline-block;
  }
`)


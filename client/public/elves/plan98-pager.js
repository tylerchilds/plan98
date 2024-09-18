import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getSession } from './plan98-wallet.js'

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

const $ = module('plan98-pager', {
  chatRooms: [],
})

function refreshRooms() {
  getMyGroups().then(chatRooms => {
    $.teach({ chatRooms })
  })

  getOtherGroups().then(otherChatRooms => {
    $.teach({ otherChatRooms })
  })
}
refreshRooms()

function otherChat(group) {
  return `
    <button class="out-group control-tab" data-group-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

function chat(group) {
  return `
    <button class="in-group control-tab" data-group-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

$.draw(() => {
  const { sessionId } = getSession()
  const { chatRooms, otherChatRooms, chatroom, groupId } = $.learn()
  return `
    <div class="layout">
      <div class="list">
        ${sessionId && chatRooms ? `
          <div class="heading-label">Chat</div>
          ${chatRooms.map(chat).join('')}
        ` : ``}
        ${sessionId && otherChatRooms ? `
          <div class="heading-label">Other Chats</div>
          ${otherChatRooms.map(otherChat).join('')}
        ` : ``}
      </div>
      <div class="event">
        <camp-chat ${groupId? `room="${groupId}"` : ''}></camp-chat>
      </div>
    </div>
  `
}, {afterUpdate})

function afterUpdate(target) {
  {
    const { groupId } = $.learn()
    if(target.dataset.group !== groupId) {
      target.dataset.group = groupId

      document.querySelector('camp-chat').dispatchEvent(new Event('change'))
    }
  }
}

function renderToggle(key, label) {
  const data = $.learn()
  if(!data[key]) return ''

  return `
    <button class="show-workspace ${data.activeWorkspace === key ? 'active' :''} " data-workspace="${key}">
      ${label}
    </button>
  `
}

$.when('click', '.in-group', (event) => {
  const { groupId } = event.target.dataset
  openChat(groupId)
})

$.when('click', '.out-group', (event) => {
  const { groupId } = event.target.dataset
  openChat(groupId)
})

function openChat(groupId) {
  const chatroom = `/app/camp-chat?room=${groupId}`
  $.teach({ groupId })
}

$.style(`
  & {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    height: 100%;
    background: black;
  }

  & .heading-label {
    color: rgba(255,255,255,.85);
  }

  & .layout {
    display: grid;
    grid-template-areas: "list event";
    grid-template-columns: 1fr 1.618fr;
    height: 100%;
  }

  & .event {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  & .list {
    color: rgba(255,255,255,.65);
  }

  & .list button {
    font-weight: 600;
    color: rgba(255,255,255,.65);
    font-size: 1rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    padding: .5rem;
    text-align: left;
    display: block;
    text-align: right;
    width: 100%;
    background: rgba(255,255,255,.05);
  }

  & .list button:hover,
  & .list button:focus {
    color: rgba(255,255,255,1);
    background: rgba(255,255,255,.15);
  }

`)

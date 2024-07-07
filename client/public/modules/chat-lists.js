import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getSession } from './parental-controls.js'

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

const $ = module('chat-lists', {
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
  const { chatRooms, otherChatRooms } = $.learn()
  return `
    ${sessionId && chatRooms ? `
      <div class="heading-label">Chat</div>
      ${chatRooms.map(chat).join('')}
    ` : ``}
    ${sessionId && otherChatRooms ? `
      <div class="heading-label">Other Chats</div>
      ${otherChatRooms.map(otherChat).join('')}
    ` : ``}
  `
})

$.style(`
  & {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
`)

import elf from '@silly/elf'
import geckos from '@geckos.io/client'

// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

const $ = elf('geckos-chat', {
  messages: [],
  participants: [],
  currentRoom: "general"
})

const channel = geckos({ port: 5674 }) // default port is 9208

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  $.teach({ connected: true })

  channel.on('chatMessage', message => {
    $.teach(message, mergeMessage)
  });

  channel.on('userList', participants => {
    $.teach({
      participants
    })
  });
  channel.on('error', (error) => {
    console.error("Geckos Error:", error);
  })
})

function mergeMessage(state, payload) {
  return {
    ...state,
    messages: [...state.messages, payload]
  }
}

const rooms = {
  general: "General",
  random: "Random",
  coding: "Coding"
}

$.draw(target => {
  const {
    message,
    messages,
    participants,
    currentRoom,
    connected
  } = $.learn()

  if(!connected) {
    return `
      <boot>
        <flying-disk></flying-disk>
      </boot>
    `
  }

  mount(target)

  return `
    <select id="roomSelect">
      ${Object.keys(rooms).map(x => {
        return `
          <option value="${x}" ${currentRoom === x ? 'active':''}>${rooms[x]}</option>
        `
      }).join('')}
    </select>
    <div id="participants">${
      participants.map(x => x).join('')
    }</div>
    <div id="messages">${
      messages.map(x => x).join('')
    }</div>
    <form>
      <input type="text" data-bind name="message" value="${message||''}">
      <button id="sendButton">Send</button>
    </form>
  `
})


function joinRoom(currentRoom) {
  channel.emit('joinRoom', currentRoom);
}

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const { currentRoom } = $.learn()
  joinRoom(currentRoom)
}

$.when('change', '#roomSelect', (event) => {
  const currentRoom = event.target.value
  $.teach({ message: '', messages: [], currentRoom })
  joinRoom(currentRoom)
});

$.when('submit', 'form',(event) => {
  event.preventDefault()
  const message = event.target.message.value;
  if (message) {
    console.log(`Sending message: ${message}`); // Log message sent
    channel.emit('chatMessage', message);
    $.teach({ message: '' })
  }
});

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})


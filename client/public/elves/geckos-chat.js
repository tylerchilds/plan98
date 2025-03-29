import elf from '@silly/elf'
import geckos from '@geckos.io/client'

// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

const $ = elf('geckos-chat', {
  messages: [],
  participants: [],
  currentRoom: "general",
  nickname: localStorage.getItem('multiplayer/nickname'),
  password: localStorage.getItem('multiplayer/password'),
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

  channel.on('setNickSuccess', data => {
    const { nickname, password } = data
    debugger

    localStorage.setItem('multiplayer/nickname', nickname)
    localStorage.setItem('multiplayer/password', password)

    $.teach(data)
  });

  channel.on('setNickError', error => {
    console.error(error)
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
    connected,
    nickname,
    password
  } = $.learn()

  if(!password) {
    return `
      <form method="post" name="nickname">
        <p>Please choose a nickname</p>
        <input type="text" data-bind name="nickname" value="${nickname||''}">
        <button id="sendButton">Send</button>
      </form>
    `
  }

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
    <form method="post" name="send">
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

$.when('submit', '[name="nickname"]',(event) => {
  event.preventDefault()
  const nickname = event.target.nickname.value;
  if (nickname) {
    console.log('creating')
    channel.emit('setNick', nickname);
  }
});

$.when('submit', '[name="send"]',(event) => {
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


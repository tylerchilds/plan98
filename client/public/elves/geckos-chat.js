import elf from '@silly/elf'
import { showPanel } from './plan98-panel.js'
import { showModal, hideModal } from './plan98-modal.js'
import { getTheme } from './paper-pocket.js'
import geckos from '@geckos.io/client'

// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

const $ = elf('geckos-chat', {
  messages: [],
  participants: [],
  currentRoom: "general",
  nickname: localStorage.getItem('multiplayer/nickname'),
  password: localStorage.getItem('multiplayer/password'),
  messageText: '',
  messageHeight: null
})

const config = plan98.env.PLAN98_REALTIME ?
  {
    url: plan98.env.PLAN98_REALTIME,
    port: 443,
  } :
  {
    port: 9208
  }

const channel = geckos(config) // default port is 9208

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

const modes = {
  settings: 'settings'
}

const modeRenderers = {
  [modes.settings]: (target) => {
    const {
      nickname,
      newNickname
    } = $.learn()

    return `
      <div class="settings">
        <div class="settings-area">
          <div class="settings-title">Settings</div>
          <form method="post" name="change-nickname">
            <p>You may change your nickname with the form below.</p>
            <label class="field" style="grid-area: name;">
              <span class="label">Nickname</span>
              <input type="text" data-bind name="newNickname" value="${newNickname ||nickname||''}">
            </label>

            <button class="normal-button">Save</button>
          </form>
          <hr>
          <button data-logout class="normal-button">
            Logout
          </button>
        </div>
      </div>
    `
  }
}

$.draw(target => {
  const modality = target.getAttribute('modality')
  if(modeRenderers[modality]) {
    return modeRenderers[modality](target)
  }

  const {
    messageText,
    messageHeight,
    messages,
    participants,
    currentRoom,
    connected,
    nickname,
    password
  } = $.learn()

  if(!password) {
    return `
      <div class="zero-space">
        <div class="zero-content">
          <div class="zero-title">Chat Rooms</div>
          <form method="post" name="set-nickname">
            <p>Please choose a nickname to begin</p>
            <label class="field" style="grid-area: name;">
              <span class="label">Nickname</span>
              <input type="text" data-bind name="nickname" value="${nickname||''}">
            </label>

            <button class="normal-button">Save</button>
          </form>
        </div>
      </div>
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

  const log = messages.map((message) => `
    <div class="message">
      <span class="author">${message.author}:</span> ${message.body}
    </div>
  `).join('')

  return `
    <div class="chat-app">
      <div class="rooms">
        <div class="sticky-item">
          <button class="show-settings">
            <sl-icon name="gear-wide-connected"></sl-icon>
          </button>
          <button class="show-participants">
            ${participants.length}
            <span>
              <sl-icon name="people"></sl-icon>
            </span>
          </button>
        </div>
        ${Object.keys(rooms).map(x => {
          return `
            <button class="room-select ${currentRoom === x ? 'active':''}" data-value="${x}" >${rooms[x]}</button>
          `
        }).join('')}
      </div>
      <div class="chat-area">
        <div class="scroll-back">
          <div class="messages">
            ${log}
          </div>
        </div>
        <form method="POST" name="send">
          <div class="fields">
            <div class="action-row">
              <button>Send</button>
            </div>
            <textarea
              data-bind
              name="messageText"
              placeholder="Ask me anything..."
              value="${escapeHyperText(messageText)}"
              ${messageHeight ? `style="height: ${messageHeight}px"`:''}
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  saveCursor(target)
}

function afterUpdate(target) {
  replaceCursor(target)

  { // recover icons from the virtual dom
    recoverElves(target, 'sl-icon')
  }

  {
    const { messages } = $.learn()
    if(target.lastIndex !== messages.length -1) {
      target.lastIndex = messages.length - 1
      const lastChild = target.querySelector('.messages .message:last-child')
      if(lastChild) {
        lastChild.scrollIntoView()
      }
    }
  }

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
}

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const nodeParent = node.parentNode
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.remove()
    nodeParent.appendChild(newNode)
  })
}


let sel = []
const tags = ['TEXTAREA', 'INPUT']
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.field = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  }
}

function replaceCursor(target) {
  const field = target.querySelector(`[name="${target.dataset.field}"]`)
  
  if(field) {
    field.focus()

    if(tags.includes(field.tagName)) {
      field.selectionStart = sel[0];
      field.selectionEnd = sel[1];
    }
  }
}


function joinRoom(currentRoom) {
  const { nickname } = $.learn()
  channel.emit('joinRoom', {
    roomName: currentRoom,
    nickname
  });
}

function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const { currentRoom } = $.learn()
  joinRoom(currentRoom)
}

$.when('click', '[data-logout]', () => {
  hideModal()
  $.teach({ nickname: null, password: null })

  localStorage.removeItem('multiplayer/nickname')
  localStorage.removeItem('multiplayer/password')
})

$.when('click', '.settings', () => {
  hideModal()
})

$.when('click', '.show-settings', (event) => {
  showModal(`
    <geckos-chat modality="${modes.settings}"></geckos-chat>
  `)
})

$.when('click', '.show-participants', (event) => {
  const { participants } = $.learn()
  showPanel(`
    <div id="participants" style="">
      <div style="font-weight: bold; color: rgba(0,0,0,.65)">${participants.length} Online</div>
      ${
        participants.map(x => `
          <div data-user-id="${x.id}">${x.nickname}</div>
        `).join('')
      }
    </div>
  `)
})

$.when('click', '.room-select', (event) => {
  const currentRoom = event.target.dataset.value
  $.teach({ messageText: '', messageHeight: null, messages: [], currentRoom })
  joinRoom(currentRoom)
});

$.when('submit', '[name="set-nickname"]',(event) => {
  event.preventDefault()
  const nickname = event.target.nickname.value;
  if (nickname) {
    console.log('creating')
    channel.emit('setNick', nickname);
  }
});

$.when('submit', '[name="change-nickname"]',(event) => {
  event.preventDefault()
  const newNickname = event.target.newNickname.value;
  if (newNickname) {
    channel.emit('changeNick', newNickname);
  }
});


$.when('keypress', '[name="send"] [name="messageText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const messageText = event.target.value
    send(messageText)
  }
})


$.when('submit', '[name="send"]',(event) => {
  event.preventDefault()
  const messageText = event.target.messageText.value;
  send(messageText)
});

function send(messageText) {
  if (messageText) {
    const { nickname } = $.learn()
    console.log(nickname, messageText)
    channel.emit('chatMessage', {
      body: messageText,
      author: nickname
    });
    $.teach({ messageText: '', messageHeight: null })
  }
}

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

$.when('focus', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('input', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});


function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.style(`
  & .chat-header {
    padding: .5rem;
    background: rgba(0,0,0,.85);
    color: white;
  }

  & .rooms {
    display: flex;
    overflow: auto;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), var(--root-theme, mediumseagreen);
    max-height: 100%;
  }

  & .room-select {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.85);
    border: 0;
    padding: .5rem 1rem;
    margin: .5rem .25rem;
    text-align: left;
    border-radius: 1rem;
  }

  & .room-select.active {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }


  & .chat-app {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .chat-area {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    background: linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)), var(--root-theme, mediumseagreen);
    overflow: hidden;
  }

  @media (min-width: 36rem) {
    & .chat-app {
      grid-template-rows: auto;
      grid-template-columns: auto 1fr;
    }

    & .rooms {
      flex-direction: column;
    }

    & .room-select {
      margin: .25rem .5rem;
    }
  }


  & [name="send"] {
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .action-row {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    text-align: right;
    padding: 4px;
  }

  & .normal-button,
  & .action-row button {
    padding: .5rem 1rem;
    border-radius: 4px;
    border: none;
    color: white;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .normal-button:hover,
  & .normal-button:focus,
  & .action-row button:hover,
  & .action-row button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & [name="send"] textarea {
    width: 100%;
    display: block;
    resize: none;
    background: linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7)), var(--root-theme, mediumseagreen);
    border: none;
    color: rgba(255,255,255,.85);
    border-radius: 0;
    padding: 8px;
    max-height: 35vh;
    font-size: 1rem;
  }

  & textarea:focus {
    outline-offset: -2px;
  }

  & .scroll-back {
    height: 100%;
    overflow: auto;
  }

  & .messages {
    padding: .5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  & .message {
    overflow: auto;
    border-radius: 1rem;
    margin-right: 2rem;
    padding: 0;
    position: relative;
  }

  & .message.-human {
    margin: 0 0 0 3rem;
    background: rgba(0,0,0,.85);
    color: white;
  }

  & .author {
    color: rgba(0,0,0,.5);
  }

  & .show-settings,
  & .show-participants {
    height: 2rem;
    line-height: 1;
    color: white;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    border-radius: 1rem;
    display: grid;
    padding: .5rem;
    margin: .5rem .25rem;
    gap: .5rem;
    place-content: center;
    border: none;
  }
  & .show-participants {
    grid-template-columns: auto auto;
  }

  & .sticky-item {
    position: sticky;
    top: 0;
    left: 0;
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    display: flex;
    place-content: center;
  }

  & .settings {
    padding: 2rem 0;
    height: 100%;
  }

  & .settings-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(0,0,0,.65);
    margin-bottom: 1rem;
  }
  & .settings-area {
    background: white;
    max-width: 55ch;
    margin: 0 auto;
    padding: 1rem;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);
  }

  & .zero-space {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-35deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      linear-gradient(-65deg, rgba(0,0,0,.15), rgba(0,0,0,.5)),
      var(--root-theme, mediumseagreen);
    height: 100%;
    padding: 1rem 0;
  }

  & .zero-content {
    background: white;
    max-width: 55ch;
    margin: 0 auto;
    padding: 1rem;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);
  }

  & .zero-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(0,0,0,.65);
    margin-bottom: 1rem;
  }
`)

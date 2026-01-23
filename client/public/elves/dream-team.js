import elf from '@plan98/elf'
import { showPanel } from './plan98-panel.js'
import { getTheme } from './paper-pocket.js'
import {
  getSession,
  clearSession,
  getCompanyName,
  getEmployeeId
} from './bayun-wizard.js'
import { bayunCore, BayunCore } from '@sillonious/vault'

const rooms = {
  general: "General",
  random: "Random",
  coding: "Coding",
  encrypted: "Encrypted",
}

// Local decryption cache - stores decrypted messages
const table = {}

// Track which messages are being decrypted to avoid duplicate attempts
const decryptionInProgress = new Set()

const $ = elf('dream-team', {
  messages: {},
  participants: [],
  currentRoom: rooms.general,
  messageText: '',
  messageHeight: null,
  authenticated: !!getSession().sessionId,
  showOverlay: false,
  overlayView: null,
})

// Correct merge handler for adding messages to a specific room
function mergeMessage(room) {
  return (state, payload) => {
    return {
      ...state,
      messages: {
        ...state.messages,
        [room]: {
          ...(state.messages[room] || {}),
          [payload.id]: payload
        }
      }
    }
  }
}

const modes = {
  settings: 'settings'
}

const modeRenderers = {
  [modes.settings]: (target) => {
    return `
      <div class="settings">
        <div class="settings-area">
          <div class="settings-header">
            <div class="settings-title">Settings</div>
            <button data-close-overlay class="normal-button">
              Close
            </button>
          </div>
          <button data-logout class="normal-button">
            Logout
          </button>
          <hr>
          <secure-persona></secure-persona>
        </div>
      </div>
    `
  }
}

$.draw(target => {
  // Don't render anything - afterUpdate handles all DOM building and patching
  return null
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  { // convert a query string to new post
    const q = target.getAttribute('q')
    const room = target.getAttribute('room')
    if(!target.initialized) {
      target.initialized = true

      $.teach({ 
        currentRoom: rooms[room] ? rooms[room] : rooms.general 
      })

      if(q) {
        const message = decodeURIComponent(q)
        $.teach({ messageText: message })
      }
    }
  }

  {
    const { sessionId } = getSession()
    const { currentRoom, messages, authenticated } = $.learn()

    if(!authenticated) return

    if(sessionId && messages[currentRoom]) {
      // Initialize room table if needed
      if(!table[currentRoom]) {
        table[currentRoom] = {}
      }

      // Find messages that need decryption
      const roomMessages = messages[currentRoom]
      
      Object.keys(roomMessages).forEach(mid => {
        const message = roomMessages[mid]
        const decryptKey = `${currentRoom}:${mid}`
        
        // Only decrypt if we haven't already and not in progress
        if(!table[currentRoom][mid] && !decryptionInProgress.has(decryptKey)) {
          // Mark as in progress
          decryptionInProgress.add(decryptKey)
          
          // Add to table immediately with placeholder
          table[currentRoom][mid] = {
            ...message,
            decrypted: 'Decrypting...'
          }
          
          // Decrypt asynchronously
          bayunCore.unlockText(sessionId, message.encrypted)
            .then(decrypted => {
              table[currentRoom][mid] = {
                ...message,
                decrypted
              }
              decryptionInProgress.delete(decryptKey)
              // Update only the specific message element
              updateMessageElement(target, mid, message.author, decrypted)
            })
            .catch(e => {
              console.error('Decryption error:', e)
              const errorMsg = 'Failed to decrypt message. Are you authorized?'
              table[currentRoom][mid] = {
                ...message,
                decrypted: errorMsg
              }
              decryptionInProgress.delete(decryptKey)
              // Update only the specific message element
              updateMessageElement(target, mid, message.author, errorMsg)
            })
        }
      })
    }
  }

  saveCursor(target)
}

// Helper function to update a single message without full re-render
function updateMessageElement(target, messageId, author, decryptedText) {
  const messageEl = target.querySelector(`[data-message-id="${messageId}"]`)
  if (messageEl) {
    messageEl.innerHTML = `<span class="author">${escapeHyperText(author)}:</span> ${escapeHyperText(decryptedText)}`
  }
}

function afterUpdate(target) {
  // Handle modal views first
  const modality = target.getAttribute('modality')
  if(modality && modeRenderers[modality]) {
    if(target.dataset.modality !== modality) {
      target.dataset.modality = modality
      target.innerHTML = modeRenderers[modality](target)
    }
    return
  } else if(target.dataset.modality) {
    // Modality was cleared, reset to main view
    target.dataset.modality = ''
    target.innerHTML = ''
    target.templateBuilt = false // Force template rebuild
  }

  const { authenticated } = $.learn()

  // Initialize DOM template ONCE and never rebuild it
  if(!target.templateBuilt) {
    target.templateBuilt = true
    const { participants } = $.learn()
    target.innerHTML = `
      <div class="zero-space">
        <div class="zero-content">
          <div class="zero-title">Chat Rooms</div>
          <secure-persona></secure-persona>
        </div>
      </div>
      <div class="chat-app" style="display: none;">
        <div class="rooms">
          <div class="sticky-item">
            <button class="show-settings">
              <sl-icon name="gear-wide-connected"></sl-icon>
            </button>
            <button class="show-participants">
              <span class="participant-count">${participants.length}</span>
              <span>
                <sl-icon name="people"></sl-icon>
              </span>
            </button>
          </div>
          ${Object.keys(rooms).map(x => {
            return `
              <button class="room-select" data-value="${rooms[x]}" >${rooms[x]}</button>
            `
          }).join('')}
        </div>
        <div class="chat-area">
          <div class="scroll-back">
            <div class="messages">
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
                placeholder="Say it."
              ></textarea>
            </div>
          </form>
        </div>
      </div>
      <div class="overlay-area"></div>
    `
  }

  // Toggle visibility based on authentication
  const authArea = target.querySelector('.zero-space')
  const chatArea = target.querySelector('.chat-app')
  
  if(authArea && chatArea) {
    if(authenticated) {
      authArea.style.display = 'none'
      chatArea.style.display = 'grid'
    } else {
      authArea.style.display = 'block'
      chatArea.style.display = 'none'
    }
  }

  // Handle overlay
  {
    const { showOverlay, overlayView } = $.learn()
    target.dataset.showOverlay = showOverlay ? 'true' : 'false'
    
    const overlayArea = target.querySelector('.overlay-area')
    
    if(overlayArea && showOverlay && modeRenderers[overlayView]) {
      if(overlayArea.dataset.view !== overlayView) {
        overlayArea.dataset.view = overlayView
        overlayArea.innerHTML = modeRenderers[overlayView](target)
      }
    } else if(overlayArea && !showOverlay) {
      if(overlayArea.innerHTML) {
        overlayArea.dataset.view = ''
        overlayArea.innerHTML = ''
      }
    }
  }

  // If not authenticated, nothing else to patch
  if(!authenticated) return

  // Patch participant count
  {
    const { participants } = $.learn()
    const countEl = target.querySelector('.participant-count')
    if(countEl && countEl.textContent !== participants.length.toString()) {
      countEl.textContent = participants.length
    }
  }

  // Patch active room
  {
    const { currentRoom } = $.learn()
    if(target.lastRoom !== currentRoom) {
      target.querySelectorAll('.room-select').forEach(btn => {
        if(btn.dataset.value === currentRoom) {
          btn.classList.add('active')
        } else {
          btn.classList.remove('active')
        }
      })
      target.lastRoom = currentRoom
    }
  }

  // Patch messages
  {
    const { currentRoom } = $.learn()
    const roomMessages = table[currentRoom] || {}
    const messageCount = Object.keys(roomMessages).length
    
    if(target.lastMessageCount !== messageCount) {
      target.lastMessageCount = messageCount
      const messagesContainer = target.querySelector('.messages')
      
      const log = Object.values(roomMessages)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .map((message) => `
          <div class="message" data-message-id="${message.id}">
            <span class="author">${escapeHyperText(message.author)}:</span> ${escapeHyperText(message.decrypted || 'Decrypting...')}
          </div>
        `).join('') || '...'
      
      messagesContainer.innerHTML = log
    }
  }

  // Patch textarea
  {
    const { messageText, messageHeight } = $.learn()
    const textarea = target.querySelector('[name="messageText"]')
    
    if(textarea) {
      if(textarea.lastValue !== messageText) {
        textarea.lastValue = messageText
        textarea.value = messageText
      }
      
      if(textarea.lastHeight !== messageHeight) {
        textarea.lastHeight = messageHeight
        if(messageHeight) {
          textarea.style.height = `${messageHeight}px`
        } else {
          textarea.style.height = 'auto'
        }
      }
    }
  }

  replaceCursor(target)

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }
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

function mount(target) {
  if(target.mounted) return
  target.mounted = true
}

$.when('click', '[data-help]', function (event) {
  window.location.href = "/app/mark-down?src=/public/cdn/sillyz.computer/index.md"
})

$.when('click', '[data-logout]', () => {
  // Clear caches and update authenticated state
  Object.keys(table).forEach(room => delete table[room])
  decryptionInProgress.clear()
  clearSession()
  $.teach({ messages: {}, authenticated: false, showOverlay: false })
})

$.when('click', '.settings', () => {
  $.teach({ showOverlay: false })
})

$.when('click', '.show-settings', (event) => {
  $.teach({ showOverlay: true, overlayView: modes.settings })
})

$.when('click', '[data-close-overlay]', () => {
  $.teach({ showOverlay: false, overlayView: null })
})

$.when('click', '.show-participants', (event) => {
  const { participants } = $.learn()
  showPanel(`
    <div id="participants" style="">
      <div style="font-weight: bold; color: rgba(0,0,0,.65)">${participants.length} Online</div>
      ${
        participants.map(x => `
          <div data-user-id="${x.id}">${x.id.slice(0, 8)}</div>
        `).join('')
      }
    </div>
  `)
})

$.when('click', '.room-select', (event) => {
  const currentRoom = event.target.dataset.value
  $.teach({ messageText: '', messageHeight: null, currentRoom })
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

async function send(messageText) {
  if (messageText) {
    const { currentRoom } = $.learn()
    const { sessionId } = getSession()

    if(sessionId) {
      const encryptedText = await bayunCore.lockText(
        sessionId, 
        messageText, 
        BayunCore.EncryptionPolicy.Company, 
        BayunCore.KeyGenerationPolicy.Chain, 
        '91'
      );

      const message = {
        id: self.crypto.randomUUID(),
        encrypted: encryptedText,
        author: getEmployeeId(),
        timestamp: Date.now()
      }
      
      $.teach(message, {
        mergeHandler: mergeMessage,
        parameters: [currentRoom]
      })
    }
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

$.when('secure-persona', 'activated', (event) => {
  // User has logged in, trigger a re-render to show the chat interface
  $.teach({ authenticated: true })
})

$.when('secure-persona', 'deactivated', (event) => {
  // User has logged out, clear all caches and messages, trigger re-render
  Object.keys(table).forEach(room => delete table[room])
  decryptionInProgress.clear()
  $.teach({ messages: {}, authenticated: false })
})

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
    position: relative;
  }

  & .author {
    color: rgba(0,0,0,.5);
    font-weight: bold;
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

  & .overlay-area {
    background: white;
    display: none;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 50;
  }

  &[data-show-overlay="true"] .overlay-area {
    display: block;
  }

  & .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  & .settings-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }
`)

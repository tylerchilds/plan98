import elf from '@plan98/elf'
import { showPanel } from './plan98-panel.js'
import { getTheme } from './paper-pocket.js'
import { ai } from './paper-pocket.js'
import {
  getSession,
  clearSession,
  getCompanyName,
  getEmployeeId
} from './bayun-wizard.js'
import { bayunCore, BayunCore } from '@sillonious/vault'

// Local decryption cache - stores decrypted messages
const table = {}

// Track which messages are being decrypted to avoid duplicate attempts
const decryptionInProgress = new Set()

const $ = elf('dream-team', {
  messages: {},
  participants: [],
  currentRoom: null,
  messageText: '',
  messageHeight: null,
  authenticated: !!getSession().sessionId,
  myGroups: [],
  otherGroups: [],
  group: '',
  sidebarWidth: 200,
  sidebarVisible: true,
  activeView: 'chat' // 'chat', 'profile', 'preferences'
})

// Group management functions
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

function activateGroup(sessionId, id) {
  bayunCore.getGroupById(sessionId, id)
    .then(result => {
      $.teach({ currentRoom: result.groupId })
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
}

function drawGroupButton(group) {
  return `
    <button class="room-select" data-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

$.draw(target => {
  // Don't render anything for main view - afterUpdate handles all DOM building and patching
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

      if(room) {
        $.teach({ currentRoom: room })
      }

      if(q) {
        const message = decodeURIComponent(q)
        $.teach({ messageText: message })
      }
    }
  }

  { // Load groups if authenticated
    const { sessionId } = getSession()
    const { authenticated, myGroups } = $.learn()
    
    if(authenticated && sessionId && !target.groupsLoaded) {
      target.groupsLoaded = true
      getMyGroups()
      getOtherGroups()
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
  const { authenticated } = $.learn()

  // Initialize DOM template ONCE and never rebuild it
  if(!target.templateBuilt) {
    target.templateBuilt = true
    const { participants, myGroups, otherGroups, group = '' } = $.learn()
    target.innerHTML = `
      <div class="zero-space">
        <div class="zero-content">
          <div class="zero-title">Chat Rooms</div>
          <secure-persona></secure-persona>
        </div>
      </div>
      <div class="chat-app" style="display: none;">
        <button class="toggle-sidebar" data-toggle-sidebar>
          <sl-icon name="arrow-left-circle-fill"></sl-icon>
        </button>
        <div class="sidebar">
          <div class="sidebar-header">
            <button class="profile-button" data-profile>
              <sl-icon name="person-circle"></sl-icon>
              <span>Profile</span>
            </button>
          </div>
          
          <div class="sidebar-content">
            <div class="group-section">
              <div class="subtitle">MY GROUPS</div>
              <div class="my-groups">
              </div>
            </div>

            <div class="group-section">
              <div class="subtitle">NEW GROUP</div>
              <input data-bind placeholder="New Friends" type="text" name="group" value="${group}" />
              <button data-create>
                Create
              </button>
            </div>

            <div class="group-section">
              <div class="subtitle">OTHER GROUPS</div>
              <div class="other-groups">
              </div>
            </div>
          </div>

          <div class="sidebar-footer">
            <button class="preferences-button" data-preferences>
              <sl-icon name="person-lines-fill"></sl-icon>
              <span>Preferences</span>
            </button>
          </div>
        </div>
        <div class="resizer"></div>
        <div class="main-content">
          <div class="chat-area">
            <div class="scroll-back">
              <div class="messages">
              </div>
            </div>
            <form method="POST" name="send">
              <div class="fields">
                <div class="action-row">
                  <button>Send</button>
                  <button type="button" data-leave-group class="leave-button" style="display: none;">
                    Leave Group
                  </button>
                </div>
                <textarea
                  data-bind
                  name="messageText"
                  placeholder="Say it."
                ></textarea>
              </div>
            </form>
          </div>
          <div class="profile-area" style="display: none;">
            <div class="content-header">
              <h2>Profile</h2>
              <button class="back-button" data-back-to-chat>
                <sl-icon name="arrow-left"></sl-icon>
                Back to Chat
              </button>
            </div>
            <div class="content-body">
              <secure-persona></secure-persona>
            </div>
          </div>
          <div class="preferences-area" style="display: none;">
            <div class="content-header">
              <h2>Preferences</h2>
              <button class="back-button" data-back-to-chat>
                <sl-icon name="arrow-left"></sl-icon>
                Back to Chat
              </button>
            </div>
            <div class="content-body">
              ${ai('')}
            </div>
          </div>
        </div>
      </div>
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

  // Apply sidebar width and visibility
  {
    const { sidebarWidth, sidebarVisible } = $.learn()
    const sidebar = target.querySelector('.sidebar')
    const chatApp = target.querySelector('.chat-app')
    const toggleBtn = target.querySelector('.toggle-sidebar')
    
    if(sidebar && chatApp) {
      if(sidebar.style.width !== `${sidebarWidth}px`) {
        sidebar.style.width = `${sidebarWidth}px`
      }
      
      chatApp.dataset.sidebarVisible = sidebarVisible ? 'true' : 'false'
      chatApp.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
      
      // Update toggle button position
      if(toggleBtn && window.innerWidth > 768) {
        const leftPos = sidebarVisible ? `calc(${sidebarWidth}px + .5rem)` : '.5rem'
        if(toggleBtn.style.left !== leftPos) {
          toggleBtn.style.left = leftPos
        }
      }
    }
  }

  // Update toggle button icon based on sidebar visibility
  {
    const { sidebarVisible } = $.learn()
    const toggleBtn = target.querySelector('.toggle-sidebar sl-icon')
    if(toggleBtn) {
      const iconName = sidebarVisible ? 'arrow-left-circle-fill' : 'arrow-right-circle-fill'
      if(toggleBtn.getAttribute('name') !== iconName) {
        toggleBtn.setAttribute('name', iconName)
      }
    }
  }

  // If not authenticated, nothing else to patch
  if(!authenticated) return

  // Handle view switching
  {
    const { activeView } = $.learn()
    const chatArea = target.querySelector('.chat-area')
    const profileArea = target.querySelector('.profile-area')
    const preferencesArea = target.querySelector('.preferences-area')
    
    if(chatArea && profileArea && preferencesArea) {
      chatArea.style.display = activeView === 'chat' ? 'grid' : 'none'
      profileArea.style.display = activeView === 'profile' ? 'block' : 'none'
      preferencesArea.style.display = activeView === 'preferences' ? 'block' : 'none'
    }
  }

  // Patch my groups
  {
    const { myGroups, currentRoom } = $.learn()
    const myGroupsContainer = target.querySelector('.my-groups')
    
    if(myGroupsContainer) {
      const groupsHtml = myGroups.map(group => {
        const isActive = currentRoom === group.groupId ? 'active' : ''
        return `
          <button class="room-select my-group ${isActive}" data-id="${group.groupId}">
            ${group.groupName}
          </button>
        `
      }).join('')
      
      if(myGroupsContainer.dataset.lastGroups !== groupsHtml) {
        myGroupsContainer.dataset.lastGroups = groupsHtml
        myGroupsContainer.innerHTML = groupsHtml
      }
    }
  }

  // Patch other groups
  {
    const { otherGroups } = $.learn()
    const otherGroupsContainer = target.querySelector('.other-groups')
    
    if(otherGroupsContainer) {
      const groupsHtml = otherGroups.map(group => {
        return `
          <button class="room-select other-group" data-id="${group.groupId}">
            ${group.groupName}
          </button>
        `
      }).join('')
      
      if(otherGroupsContainer.dataset.lastGroups !== groupsHtml) {
        otherGroupsContainer.dataset.lastGroups = groupsHtml
        otherGroupsContainer.innerHTML = groupsHtml
      }
    }
  }

  // Patch group input
  {
    const { group } = $.learn()
    const groupInput = target.querySelector('[name="group"]')
    if(groupInput && groupInput.value !== group) {
      groupInput.value = group
    }
  }

  // Show/hide leave button based on current room
  {
    const { currentRoom } = $.learn()
    const leaveButton = target.querySelector('[data-leave-group]')
    if(leaveButton) {
      leaveButton.style.display = currentRoom ? 'inline-block' : 'none'
    }
  }

  // Patch messages
  {
    const { currentRoom } = $.learn()
    const roomMessages = table[currentRoom] || {}
    const messageCount = Object.keys(roomMessages).length
    
    if(target.lastMessageCount !== messageCount || target.lastRoom !== currentRoom) {
      target.lastMessageCount = messageCount
      target.lastRoom = currentRoom
      const messagesContainer = target.querySelector('.messages')
      
      const log = Object.values(roomMessages)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .map((message) => `
          <div class="message" data-message-id="${message.id}">
            <span class="author">${escapeHyperText(message.author)}:</span> ${escapeHyperText(message.decrypted || 'Decrypting...')}
          </div>
        `).join('') || (currentRoom ? '...' : '<div class="empty-state">Select or create a group to start chatting</div>')
      
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
  $.teach({ 
    messages: {}, 
    authenticated: false,
    myGroups: [],
    otherGroups: [],
    currentRoom: null
  })
})

$.when('click', '[data-toggle-sidebar]', (event) => {
  const { sidebarVisible } = $.learn()
  $.teach({ sidebarVisible: !sidebarVisible })
})

$.when('click', '[data-profile]', (event) => {
  $.teach({ activeView: 'profile' })
})

$.when('click', '[data-preferences]', (event) => {
  $.teach({ activeView: 'preferences' })
})

$.when('click', '[data-back-to-chat]', (event) => {
  $.teach({ activeView: 'chat' })
})

// Create group handler
$.when('click', '[data-create]', () => {
  const { sessionId } = getSession()
  const { group } = $.learn()
  
  if(!group.trim()) return
  
  const groupType = BayunCore.GroupType.PUBLIC;
  bayunCore.createGroup(sessionId, group, groupType)
    .then(result => {
      $.teach({ currentRoom: result.groupId, group: '' })
      getMyGroups()
      getOtherGroups()
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

// Join group from other groups (click on other-group button)
$.when('click', '.other-group', (event) => {
  const { sessionId } = getSession()
  const { id } = event.target.dataset
  bayunCore.joinPublicGroup(sessionId, id)
    .then(result => {
      getMyGroups()
      getOtherGroups()
      activateGroup(sessionId, id)
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

// Select group from my groups
$.when('click', '.my-group', (event) => {
  const { sessionId } = getSession()
  const { id } = event.target.dataset
  activateGroup(sessionId, id)
})

// Leave group handler
$.when('click', '[data-leave-group]', () => {
  const { currentRoom } = $.learn()
  const { sessionId } = getSession()
  
  if(!currentRoom) return
  
  bayunCore.leaveGroup(sessionId, currentRoom)
    .then(result => {
      $.teach({ currentRoom: null })
      getMyGroups()
      getOtherGroups()
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

// Resizer functionality
$.when('mousedown', '.resizer', (event) => {
  event.preventDefault()
  const target = event.target.closest($.link)
  const sidebar = target.querySelector('.sidebar')
  const startX = event.pageX
  const startWidth = sidebar.offsetWidth

  function handleMouseMove(e) {
    const deltaX = e.pageX - startX
    const newWidth = Math.max(150, Math.min(500, startWidth + deltaX))
    $.teach({ sidebarWidth: newWidth })
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

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

    if(!currentRoom) {
      console.log('No room selected')
      return
    }

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
      
      // Store room in the payload itself to avoid closure issues
      $.teach({
        room: currentRoom,
        message: message
      }, (state, payload) => {
        const { room, message } = payload
        return {
          ...state,
          messages: {
            ...state.messages,
            [room]: {
              ...(state.messages[room] || {}),
              [message.id]: message
            }
          }
        }
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
  $.teach({ 
    messages: {}, 
    authenticated: false,
    myGroups: [],
    otherGroups: [],
    currentRoom: null
  })
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
  & {
    display: block;
    height: 100%;
    overflow: hidden;
  }

  & .toggle-sidebar {
    position: absolute;
    top: .5rem;
    left: .5rem;
    z-index: 150;
    height: 2.5rem;
    width: 2.5rem;
    display: grid;
    place-content: center;
    color: white;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
    transition: all 200ms ease-in-out;
  }

  & .toggle-sidebar:hover {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    transform: scale(1.1);
  }

  & .toggle-sidebar sl-icon {
    font-size: 1.5rem;
  }

  & .sidebar {
    display: flex;
    flex-direction: column;
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    overflow: hidden;
    width: 200px;
    min-width: 150px;
    max-width: 500px;
    transition: transform 200ms ease-in-out;
  }

  & .sidebar-header {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: .5rem;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  & .profile-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .75rem 1rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    font-size: .9rem;
    transition: background 200ms ease-in-out;
  }

  & .profile-button:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .profile-button sl-icon {
    font-size: 1.2rem;
  }

  & .sidebar-content {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
  }

  & .sidebar-footer {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
    padding: .5rem;
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,.1);
  }

  & .preferences-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .75rem 1rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    font-size: .9rem;
    transition: background 200ms ease-in-out;
  }

  & .preferences-button:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .preferences-button sl-icon {
    font-size: 1.2rem;
  }

  & .resizer {
    width: 4px;
    background: rgba(0,0,0,.25);
    cursor: col-resize;
    flex-shrink: 0;
    transition: background 200ms ease-in-out;
  }

  & .resizer:hover {
    background: var(--root-theme, mediumseagreen);
  }

  & .room-select {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.65);
    border: 0;
    padding: .5rem 1rem;
    margin: .25rem .5rem;
    text-align: left;
    border-radius: 1rem;
    cursor: pointer;
    display: block;
    width: calc(100% - 1rem);
  }

  & .room-select:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }

  & .room-select.active {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
  }

  & .chat-app {
    display: grid;
    grid-template-columns: auto 4px 1fr;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .main-content {
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .chat-area {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    background: linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)), var(--root-theme, mediumseagreen);
    overflow: hidden;
  }

  & .profile-area,
  & .preferences-area {
    height: 100%;
    overflow: auto;
    background: linear-gradient(rgba(255,255,255,.85), rgba(255,255,255,.85)), var(--root-theme, mediumseagreen);
  }

  & .content-header {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  & .content-header h2 {
    color: white;
    margin: 0;
    font-size: 1.25rem;
  }

  & .back-button {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .5rem 1rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    font-size: .9rem;
    transition: background 200ms ease-in-out;
  }

  & .back-button:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .content-body {
    padding: 2rem;
  }

  & [name="send"] {
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .action-row {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    text-align: right;
    padding: 4px;
    display: flex;
    gap: .5rem;
    justify-content: flex-end;
  }

  & .normal-button,
  & .action-row button {
    padding: .5rem 1rem;
    border-radius: 4px;
    border: none;
    color: white;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    cursor: pointer;
  }

  & .normal-button:hover,
  & .normal-button:focus,
  & .action-row button:hover,
  & .action-row button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .leave-button {
    background: linear-gradient(rgba(139, 0, 0, .5), rgba(139, 0, 0, .65)), var(--root-theme, mediumseagreen) !important;
  }

  & .leave-button:hover,
  & .leave-button:focus {
    background: linear-gradient(rgba(178, 34, 34, .5), rgba(178, 34, 34, .65)), var(--root-theme, mediumseagreen) !important;
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
    min-height: 100%;
  }

  & .message {
    overflow: auto;
    border-radius: 1rem;
    position: relative;
  }

  & .empty-state {
    color: rgba(0,0,0,.35);
    text-align: center;
    padding: 2rem;
    font-style: italic;
  }

  & .author {
    color: rgba(0,0,0,.5);
    font-weight: bold;
  }

  & .subtitle {
    color: rgba(255,255,255,.65);
    font-weight: 800;
    font-size: .8rem;
    margin: 2rem .5rem .5rem;
  }

  & .group-section {
    margin-bottom: 1rem;
  }

  & .group-section input {
    padding: .5rem;
    border: 1px solid rgba(255,255,255,.25);
    background: rgba(255,255,255,.15);
    color: white;
    border-radius: 4px;
    margin: 0 .5rem;
    width: calc(100% - 1rem);
  }

  & .group-section input::placeholder {
    color: rgba(255,255,255,.5);
  }

  & [data-create] {
    background: linear-gradient(rgba(30, 144, 255, .5), rgba(30, 144, 255, .65)), var(--root-theme, mediumseagreen);
    color: white;
    border: none;
    padding: .5rem 1rem;
    border-radius: 4px;
    margin: .25rem .5rem;
    cursor: pointer;
    display: block;
    width: calc(100% - 1rem);
  }

  & [data-create]:hover {
    background: linear-gradient(rgba(30, 144, 255, .65), rgba(30, 144, 255, .85)), var(--root-theme, mediumseagreen);
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

  /* Responsive: Hide sidebar by default on mobile, show toggle button */
  @media (max-width: 768px) {
    & .chat-app {
      grid-template-columns: 1fr;
    }

    & .sidebar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
      transform: translateX(-100%);
      box-shadow: 2px 0 8px rgba(0,0,0,.3);
    }

    & .chat-app[data-sidebar-visible="true"] .sidebar {
      transform: translateX(0);
    }

    & .chat-app[data-sidebar-visible="true"] .toggle-sidebar {
      left: calc(200px + .5rem);
    }

    & .resizer {
      display: none;
    }
  }

  /* Desktop: Always show sidebar, hide mobile toggle */
  @media (min-width: 769px) {
    & .chat-app[data-sidebar-visible="false"] {
      grid-template-columns: 4px 1fr;
    }

    & .chat-app[data-sidebar-visible="false"] .sidebar {
      display: none;
    }

    & .chat-app[data-sidebar-visible="false"] .resizer {
      cursor: pointer;
      background: var(--root-theme, mediumseagreen);
    }

    & .chat-app[data-sidebar-visible="false"] .toggle-sidebar {
      left: .5rem;
    }

    & .chat-app[data-sidebar-visible="true"] .toggle-sidebar {
      left: calc(var(--sidebar-width, 200px) + .5rem);
    }
  }
`)

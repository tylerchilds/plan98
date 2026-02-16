import mvc from '@plan98/elf'
import diffHTML from 'diffhtml'
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
import './secure-followers.js'

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

// Local decryption cache - stores decrypted messages
const table = {}
let lastMyGroupIds = null
let lastOtherGroupIds = null

// Track which messages are being decrypted to avoid duplicate attempts
const decryptionInProgress = new Set()
let wasAtBottom = true

const $ = mvc('dream-team', {
  synthia: {},
  players: {},
  messages: {},
  threads: {}, // { [roomId]: { [parentMessageId]: { [replyId]: message } } }
  activeThread: null, // messageId of thread being viewed (shown in right panel)
  threadPanelWidth: 350,
  participants: [],
  currentRoom: null,
  attachments: [],      // main message attachments
  replyAttachments: [], // reply attachments
  messageHeight: null,
  replyHeight: null,
  myGroups: [],
  otherGroups: [],
  group: '',
  groupType: 'public', // 'public' or 'private'
  sidebarWidth: 200,
  sidebarVisible: true,
  view: 'profile', // use views.profile constant
  iframeSrc: null,
  showActionMenu: false, // for three-dot menu in action bar
  showAttachments: false,
  activeMessageMenu: null, // for message three-dot menus
  currentGroupInfo: null, // for manage-group view
  addMemberCompany: '',
  addMemberEmployee: ''
})

const getMyId = () => `${getEmployeeId()}@${getCompanyName()}`

const join = (state, player) => ({
  ...state,
  players: {
    ...state.players,
    [player.id]: { ...player, online: true }
  }
})

const leave = (state, id) => ({
  ...state,
  players: {
    ...state.players,
    [id]: { ...state.players[id], online: false }
  }
})

// Group management functions
export async function getMyGroups() {
  const { sessionId } = getSession()
  return await bayunCore.getMyGroups(sessionId)
    .then(result => {
      $.whisper({ myGroups: result })
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
      $.whisper({ otherGroups: result })
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
      $.whisper({ currentRoom: result.groupId, showActionMenu: false, view: 'chat' })
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
}

function loadGroupInfo(sessionId, groupId) {
  bayunCore.getGroupById(sessionId, groupId)
    .then(result => {
      const groupList = result.groupMembers.reduce((all, one) => {
        if(!all[one.companyName]) {
          all[one.companyName] = {
            members: []
          }
        }
        all[one.companyName].members.push(one.companyEmployeeId)
        return all
      }, {})

      $.controller({
        currentGroupInfo: {
          groupId: result.groupId,
          groupName: result.groupName,
          groupList: groupList
        }
      })
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
}

const views = {
  chat: 'chat',
  profile: 'profile',
  preferences: 'preferences',
  newGroup: 'new-group',
  manageGroup: 'manage-group',
  wallet: 'wallet',
  shell: 'shell',
  desktop: 'desktop',
  mobile: 'mobile',
  files: 'files',
  console: 'console',
  coop: 'coop',
  video: 'video',
  archive: 'archive',
  studio: 'studio',
  iframe: 'iframe'
}

const viewRenderers = {
  [views.chat]: (target) => {
    const { currentRoom } = $.model()
    if (!currentRoom) return viewRenderers[views.profile](target)
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="video-chat-btn" data-launcher="video">
              <sl-icon name="camera-video"></sl-icon>
            </button>
            <div class="action-menu-container">
              <button class="action-menu-trigger" data-action-menu>
                <sl-icon name="three-dots-vertical"></sl-icon>
              </button>
              <div class="action-menu" data-menu-dropdown>
                <button class="action-menu-item" data-manage-group>
                  <sl-icon name="people"></sl-icon>
                  <span>Manage Group</span>
                </button>
                <button class="action-menu-item" data-leave-group>
                  <sl-icon name="box-arrow-left"></sl-icon>
                  <span>Leave Group</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-body">
          <div class="chat-main">
            <div class="scroll-back" data-scrollback="main">
              <div class="messages">
              </div>
              <button class="scroll-anchor-btn" data-scroll-anchor="main" style="display:none;">
                <sl-icon name="arrow-down"></sl-icon>
              </button>
            </div>
            <form method="POST" name="send">
              <div class="fields">
                <div class="action-row">
                  <div class="formatting-tools">
                    <button type="button" class="fmt-btn" data-format="bold"><sl-icon name="type-bold"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="italic"><sl-icon name="type-italic"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="strikethrough"><sl-icon name="type-strikethrough"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="code"><sl-icon name="code"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="list-ul"><sl-icon name="list-ul"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="list-ol"><sl-icon name="list-ol"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="blockquote"><sl-icon name="blockquote-left"></sl-icon></button>
                  </div>
                </div>
                <div class="compose-row">
                  <button type="button" class="compose-btn attach-btn" data-attach>
                    <sl-icon name="paperclip"></sl-icon>
                  </button>
                  <div class="tiptap-editor" data-editor="main"></div>
                  <button type="submit" class="compose-btn send-btn">
                    <sl-icon name="arrow-up"></sl-icon>
                  </button>
                </div>
                <div class="attachment-preview" data-preview="main"></div>
                <div class="attachments-resizer" data-resize-attachments></div>
                <div class="attachments-panel">
                  <plan98-gallery mode="picker"></plan98-gallery>
                </div>
              </div>
            </form>
          </div>
          <div class="thread-resizer"></div>
          <div class="thread-panel">
            <div class="thread-header">
              <span class="thread-title">Thread</span>
              <button class="close-thread" data-close-thread>
                <sl-icon name="x"></sl-icon>
              </button>
            </div>
            <div class="thread-scroll">
              <div class="thread-parent">
              </div>
              <div class="thread-messages">
              </div>
            </div>
            <form method="POST" name="send-reply">
              <div class="fields">
                <div class="action-row">
                  <div class="formatting-tools">
                    <button type="button" class="fmt-btn" data-format="bold"><sl-icon name="type-bold"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="italic"><sl-icon name="type-italic"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="strikethrough"><sl-icon name="type-strikethrough"></sl-icon></button>
                    <button type="button" class="fmt-btn" data-format="code"><sl-icon name="code"></sl-icon></button>
                  </div>
                </div>
                <div class="compose-row">
                  <button type="button" class="compose-btn attach-btn" data-attach-reply>
                    <sl-icon name="paperclip"></sl-icon>
                  </button>
                  <div class="tiptap-editor" data-editor="reply"></div>
                  <button type="submit" class="compose-btn send-btn">
                    <sl-icon name="arrow-up"></sl-icon>
                  </button>
                </div>
                <div class="attachment-preview" data-preview="reply"></div>
                <div class="attachments-resizer" data-resize-attachments-reply></div>
                <div class="attachments-panel attachments-panel-reply">
                  <plan98-gallery mode="picker"></plan98-gallery>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

    `
  },
  [views.profile]: (target) => `
    <div class="app-area">
      <div class="action-bar">
        <div class="action-bar-left"></div>
        <div class="action-bar-center"></div>
        <div class="action-bar-right">
        </div>
      </div>

      <plan98-gallery></plan98-gallery>
    </div>
  `,
  [views.preferences]: (target) => `
    <div class="app-area">
      <div class="action-bar">
        <div class="action-bar-left"></div>
        <div class="action-bar-center"></div>
        <div class="action-bar-right">
        </div>
      </div>
     
      <div class="preferences-area ai-content"></div>
    </div>
  `,
  [views.newGroup]: (target) => `
    <div class="app-area">
      <div class="action-bar">
        <div class="action-bar-left"></div>
        <div class="action-bar-center"></div>
        <div class="action-bar-right">
          <button class="back-button" data-back-to-chat>
            <sl-icon name="x"></sl-icon>
          </button>
        </div>
      </div>
      <div class="content-body">
        <div class="new-group-form">
          <h2>Create New Group</h2>
          <div class="form-field">
            <label for="group-name">Group Name</label>
            <input data-bind placeholder="Enter group name..." type="text" name="group" id="group-name" />
          </div>
          <div class="form-field">
            <label>Group Type</label>
            <div class="group-type-toggle">
              <button class="type-btn active" data-group-type="public">
                <sl-icon name="globe"></sl-icon>
                <span>Public</span>
              </button>
              <button class="type-btn" data-group-type="private">
                <sl-icon name="lock"></sl-icon>
                <span>Private</span>
              </button>
            </div>
            <p class="type-description" data-type-desc>Anyone can discover and join this group</p>
          </div>
          <button class="create-group-btn" data-create>
            <sl-icon name="plus-circle"></sl-icon>
            <span>Create Group</span>
          </button>
        </div>
      </div>
    </div>

  `,
  [views.manageGroup]: (target) => `
    <div class="app-area">
      <div class="action-bar">
        <div class="action-bar-left"></div>
        <div class="action-bar-center"></div>
        <div class="action-bar-right">
          <button class="back-button" data-back-to-chat>
            <sl-icon name="x"></sl-icon>
          </button>
        </div>
      </div>
      <div class="content-body">
        <div class="manage-group-form">
          <h2 class="manage-group-title">Manage Group</h2>
          <div class="manage-group-name"></div>

          <div class="manage-section">
            <h3>Add Member</h3>
            <div class="add-member-form">
              <div class="form-field">
                <label for="add-member-company">Company Name</label>
                <input data-bind placeholder="Enter company name..." type="text" name="addMemberCompany" id="add-member-company" />
              </div>
              <div class="form-field">
                <label for="add-member-employee">Employee ID</label>
                <input data-bind placeholder="Enter employee ID..." type="text" name="addMemberEmployee" id="add-member-employee" />
              </div>
              <button class="add-member-btn" data-add-member>
                <sl-icon name="person-plus"></sl-icon>
                <span>Add Member</span>
              </button>
            </div>
          </div>

          <div class="manage-section">
            <h3>Current Members</h3>
            <div class="members-list">
              <div class="loading-members">Loading members...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  [views.wallet]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>
        <iframe src="/app/plan98-wallet?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },

  [views.shell]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>
        <iframe src="/app/ur-shell?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.desktop]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/multi-task?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.mobile]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/mobile-device?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.files]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/file-surf?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.console]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/paper-pocket?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.coop]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/paper-pocket?rom=couch-coop&id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.archive]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/time-machine?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },

  [views.studio]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/v-log?id=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.video]: (target) => {
    const { currentRoom } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="/app/live-help?room=${currentRoom || ''}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  },
  [views.iframe]: (target) => {
    const { iframeSrc } = $.model()
    return `
      <div class="app-area">
        <div class="action-bar">
          <div class="action-bar-left"></div>
          <div class="action-bar-center"></div>
          <div class="action-bar-right">
            <button class="back-button" data-back-to-chat>
              <sl-icon name="x"></sl-icon>
            </button>
          </div>
        </div>

        <iframe src="${iframeSrc}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `
  }
}

function drawGroupButton(group) {
  return `
    <button class="room-select" data-id="${group.groupId}">
      ${group.groupName}
    </button>
  `
}

$.view(target => {
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
        $.controller({ currentRoom: room })
      }

      if(q) {
        const message = decodeURIComponent(q)
        //$.whisper({ messageText: message })
      }
    }
  }

  {
    const { sessionId } = getSession()
    const { currentRoom, messages, threads } = $.model()

    const id = getMyId()
    const me = $.model().players[id]
    const isOnline = !!me?.online

    if(isOnline) {

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

    // Decrypt thread replies
    if(sessionId && threads[currentRoom]) {
      // Initialize thread table if needed
      if(!table[`${currentRoom}:threads`]) {
        table[`${currentRoom}:threads`] = {}
      }

      const roomThreads = threads[currentRoom]

      Object.keys(roomThreads).forEach(parentId => {
        if(!table[`${currentRoom}:threads`][parentId]) {
          table[`${currentRoom}:threads`][parentId] = {}
        }

        const threadReplies = roomThreads[parentId]

        Object.keys(threadReplies).forEach(replyId => {
          const reply = threadReplies[replyId]
          const decryptKey = `${currentRoom}:thread:${parentId}:${replyId}`

          // Only decrypt if we haven't already and not in progress
          if(!table[`${currentRoom}:threads`][parentId][replyId] && !decryptionInProgress.has(decryptKey)) {
            // Mark as in progress
            decryptionInProgress.add(decryptKey)

            // Add to table immediately with placeholder
            table[`${currentRoom}:threads`][parentId][replyId] = {
              ...reply,
              decrypted: 'Decrypting...'
            }

            // Decrypt asynchronously
            bayunCore.unlockText(sessionId, reply.encrypted)
              .then(decrypted => {
                table[`${currentRoom}:threads`][parentId][replyId] = {
                  ...reply,
                  decrypted
                }
                decryptionInProgress.delete(decryptKey)
                // Update only the specific reply element
                updateReplyElement(target, replyId, reply.author, decrypted)
              })
              .catch(e => {
                console.error('Reply decryption error:', e)
                const errorMsg = 'Failed to decrypt reply.'
                table[`${currentRoom}:threads`][parentId][replyId] = {
                  ...reply,
                  decrypted: errorMsg
                }
                decryptionInProgress.delete(decryptKey)
                updateReplyElement(target, replyId, reply.author, errorMsg)
              })
          }
        })
      })
    }
  }

  saveCursor(target)
}

function parseDecrypted(decryptedText) {
  try {
    const parsed = JSON.parse(decryptedText)
    return {
      html: parsed.html || '',
      attachments: parsed.attachments || []
    }
  } catch {
    // Legacy messages that are just plain HTML
    return { html: decryptedText, attachments: [] }
  }
}

function renderDecrypted(decryptedText) {
  if (!decryptedText || decryptedText === 'Decrypting...') return escapeHyperText('Decrypting...')
  const { html, attachments } = parseDecrypted(decryptedText)
  return sanitizeHTML(html) + renderAttachments(attachments)
}

function renderAttachmentPreview(attachments) {
  if (!attachments || !attachments.length) return ''
  return attachments.map(att => {
    const record = att.record || att
    const cid = att.cid || ''
    if (record.$type === 'computer.sillyz.data.image') {
      return `<div class="preview-item" data-remove-attachment="${cid}">
        <was-image src="${record.src}"></was-image>
        <button class="preview-remove"><sl-icon name="x"></sl-icon></button>
      </div>`
    }
    if (record.$type === 'computer.sillyz.data.video') {
      return `<div class="preview-item" data-remove-attachment="${cid}">
        <was-video src="${record.src}"></was-video>
        <button class="preview-remove"><sl-icon name="x"></sl-icon></button>
      </div>`
    }
    return `<div class="preview-item text-preview" data-remove-attachment="${cid}">
      <span>${escapeHyperText((record.text || '').slice(0, 40))}</span>
      <button class="preview-remove"><sl-icon name="x"></sl-icon></button>
    </div>`
  }).join('')
}

function renderAttachments(attachments) {
  if (!attachments.length) return ''
  return `<div class="message-attachments">${
    attachments.map(att => {
      if (att.$type === 'computer.sillyz.data.image') {
        return `<was-image src="${att.src}" class="attachment-thumb"></was-image>`
      }
      if (att.$type === 'computer.sillyz.data.video') {
        return `<was-video src="${att.src}" class="attachment-thumb"></was-video>`
      }
      return `<div class="attachment-text">${escapeHyperText((att.text || '').slice(0, 120))}</div>`
    }).join('')
  }</div>`
}

function updateMessageElement(target, messageId, author, decryptedText) {
  const messageEl = target.querySelector(`[data-message-id="${messageId}"] .message-body`)
  if (messageEl) {
    const { html, attachments } = parseDecrypted(decryptedText)
    messageEl.innerHTML = `<span class="author">${escapeHyperText(author)}</span> ${sanitizeHTML(html)}${renderAttachments(attachments)}`

    if (wasAtBottom) {
      const scrollback = target.querySelector('[data-scrollback="main"]')
      if (scrollback) scrollback.scrollTop = scrollback.scrollHeight
    }
  }
}

function updateReplyElement(target, replyId, author, decryptedText) {
  const replyEl = target.querySelector(`[data-reply-id="${replyId}"] .message-body`)
  if (replyEl) {
    const { html, attachments } = parseDecrypted(decryptedText)
    replyEl.innerHTML = `<span class="author">${escapeHyperText(author)}</span> ${sanitizeHTML(html)}${renderAttachments(attachments)}`

    const threadScroll = target.querySelector('.thread-scroll')
    if (threadScroll) threadScroll.scrollTop = threadScroll.scrollHeight
  }
}

function afterUpdate(target) {
  const id = getMyId()
  const me = $.model().players[id]
  const isOnline = !!me?.online

  // Initialize DOM template ONCE and never rebuild it
  if(!target.templateBuilt) {
    target.templateBuilt = true
    const { participants, myGroups, otherGroups, group = '' } = $.model()
    target.innerHTML = `
      <div class="zero-space">
        <div class="zero-content">
          <div class="zero-title">Phlogin</div>
          <secure-persona></secure-persona>
        </div>
      </div>
      <div class="chat-app" style="display: none;">
        <button class="toggle-sidebar" data-toggle-sidebar>
          <sl-icon name="arrow-left-circle-fill"></sl-icon>
        </button>
        <div class="sidebar">
          <div class="sidebar-inner">
            <div class="sidebar-header">
              <button class="standard-button profile-button" data-profile>
                <span>
                  <sl-icon name="person-circle"></sl-icon>
                </span>
                <span>Me</span>
              </button>
            </div>

            <div class="sidebar-content">
              <div class="group-section">
                <div class="subtitle-row">
                  <span class="subtitle">MY GROUPS</span>
                  <button class="add-group-btn" data-new-group>
                    <sl-icon name="plus"></sl-icon>
                  </button>
                </div>
                <div class="my-groups">
                </div>
              </div>

              <div class="group-section">
                <div class="subtitle">OTHER GROUPS</div>
                <div class="other-groups">
                </div>
              </div>

              <div class="app-launcher-section">
                <div class="subtitle">APPS</div>
                <button class="app-launcher-btn" data-launcher="wallet">
                  <span>
                    <sl-icon name="key"></sl-icon>
                  </span>
                  <span>Keys</span>
                </button>
                <button class="app-launcher-btn" data-launcher="shell">
                  <span>
                    <sl-icon name="terminal"></sl-icon>
                  </span>
                  <span>Shell</span>
                </button>
                <button class="app-launcher-btn" data-launcher="desktop">
                  <span>
                    <sl-icon name="window-stack"></sl-icon>
                  </span>
                  <span>Doors</span>
                </button>
                <button class="app-launcher-btn" data-launcher="mobile">
                  <span>
                    <sl-icon name="phone"></sl-icon>
                  </span>
                  <span>Mobile</span>
                </button>
                <button class="app-launcher-btn" data-launcher="files">
                  <span>
                    <sl-icon name="folder2"></sl-icon>
                  </span>
                  <span>Files</span>
                </button>
                <button class="app-launcher-btn" data-launcher="console">
                  <span>
                    <sl-icon name="controller"></sl-icon>
                  </span>
                  <span>Console</span>
                </button>
                <button class="app-launcher-btn" data-launcher="coop">
                  <span>
                    <sl-icon name="border"></sl-icon>
                  </span>
                  <span>Coop</span>
                </button>
                <button class="app-launcher-btn" data-launcher="archive">
                  <span>
                    <sl-icon name="archive"></sl-icon>
                  </span>
                  <span>Archive</span>
                </button>
                <button class="app-launcher-btn" data-launcher="studio">
                  <span>
                    <sl-icon name="palette"></sl-icon>
                  </span>
                  <span>Studio</span>
                </button>
              </div>
            </div>

            <div class="sidebar-footer">
              <button class="standard-button footer-button" data-preferences>
                <span>
                  <sl-icon name="gear"></sl-icon>
                </span>
                <span>Preferences</span>
              </button>
            </div>
            <div class="resizer"></div>
          </div>
        </div>
        <div class="main-content">
        </div>
      </div>
    `
  }

  // Toggle visibility based on authentication
  const authArea = target.querySelector('.zero-space')
  const chatApp = target.querySelector('.chat-app')

  if(authArea && chatApp) {
    if(isOnline) {
      authArea.style.display = 'none'
      chatApp.style.display = 'grid'
    } else {
      authArea.style.display = 'block'
      chatApp.style.display = 'none'
    }
  }

  // If not authenticated, stop here
  if(!isOnline) {
    // Apply sidebar width and visibility
    {
      const { sidebarWidth, sidebarVisible } = $.model()
      const sidebar = target.querySelector('.sidebar')
      const chatAppEl = target.querySelector('.chat-app')
      const toggleBtn = target.querySelector('.toggle-sidebar')

      if(sidebar && chatAppEl) {
        if(sidebar.style.width !== `${sidebarWidth}px`) {
          sidebar.style.width = `${sidebarWidth}px`
        }

        chatAppEl.dataset.sidebarVisible = sidebarVisible ? 'true' : 'false'
        chatAppEl.style.setProperty('--sidebar-width', `${sidebarWidth}px`)

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
      const { sidebarVisible } = $.model()
      const toggleBtn = target.querySelector('.toggle-sidebar sl-icon')
      if(toggleBtn) {
        const iconName = sidebarVisible ? 'arrow-left-circle-fill' : 'arrow-right-circle-fill'
        if(toggleBtn.getAttribute('name') !== iconName) {
          toggleBtn.setAttribute('name', iconName)
        }
      }
    }
    return
  }

  {
    const { view } = $.model()
    const mainContent = target.querySelector('.main-content')

    if (mainContent && mainContent.dataset.view !== view) {
      // Leaving chat — clean up editors before innerHTML wipe
      if (mainContent.dataset.view === views.chat) {
        destroyTiptapEditors()
      }
      mainContent.dataset.view = view
      const renderer = viewRenderers[view] || viewRenderers[views.profile]
      mainContent.innerHTML = renderer(target)
    }
  }

  {
    const { view } = $.model()
    if (view === views.chat) {
      const mainEditor = target.querySelector('[data-editor="main"]')
      const replyEditor = target.querySelector('[data-editor="reply"]')
      if (mainEditor) initTiptapEditor(mainEditor, 'main', 'Start a conversation...')
      if (replyEditor) initTiptapEditor(replyEditor, 'reply', 'Reply thoughtfully...')
    }
  }

  {
    const { showAttachments } = $.model()
    const attachPanel = target.querySelector('.attachments-panel:not(.attachments-panel-reply)')
    const attachBtn = target.querySelector('[data-attach]')
    if (attachPanel) {
      attachPanel.classList.toggle('open', showAttachments)
    }
    if (attachBtn) {
      attachBtn.classList.toggle('active', showAttachments)
    }
    const attachResizer = target.querySelector('[data-resize-attachments]')
    if (attachResizer) {
      attachResizer.style.display = showAttachments ? 'block' : 'none'
    }
  }

  // Apply sidebar width and visibility
  {
    const { sidebarWidth, sidebarVisible } = $.model()
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
    const { sidebarVisible } = $.model()
    const toggleBtn = target.querySelector('.toggle-sidebar sl-icon')
    if(toggleBtn) {
      const iconName = sidebarVisible ? 'arrow-left-circle-fill' : 'arrow-right-circle-fill'
      if(toggleBtn.getAttribute('name') !== iconName) {
        toggleBtn.setAttribute('name', iconName)
      }
    }
  }

  // Handle group type toggle UI
  {
    const { groupType } = $.model()
    const publicBtn = target.querySelector('[data-group-type="public"]')
    const privateBtn = target.querySelector('[data-group-type="private"]')
    const typeDesc = target.querySelector('[data-type-desc]')

    if(publicBtn && privateBtn && typeDesc) {
      publicBtn.classList.toggle('active', groupType === 'public')
      privateBtn.classList.toggle('active', groupType === 'private')
      typeDesc.textContent = groupType === 'public' 
        ? 'Anyone can discover and join this group'
        : 'Only invited members can join this group'
    }
  }

  // Handle thread panel visibility
  {
    const { activeThread, threadPanelWidth } = $.model()
    const threadPanel = target.querySelector('.thread-panel')
    const threadResizer = target.querySelector('.thread-resizer')
    const chatBody = target.querySelector('.chat-body')

    if(threadPanel && threadResizer && chatBody) {
      if(activeThread) {
        threadPanel.style.display = 'grid'
        threadPanel.style.width = `${threadPanelWidth}px`
        threadResizer.style.display = 'block'
        chatBody.classList.add('thread-open')
      } else {
        threadPanel.style.display = 'none'
        threadResizer.style.display = 'none'
        chatBody.classList.remove('thread-open')
      }
    }
  }

  // Handle action menu visibility
  {
    const { showActionMenu, currentRoom } = $.model()
    const menuDropdown = target.querySelector('[data-menu-dropdown]')
    const menuContainer = target.querySelector('.action-menu-container')

    if(menuDropdown && menuContainer) {
      menuDropdown.classList.toggle('active', showActionMenu)
      // Hide menu container if no room selected
      menuContainer.style.display = currentRoom ? 'block' : 'none'
    }
  }

  // Handle message menu visibility
  {
    const { activeMessageMenu } = $.model()
    const allMessageMenus = target.querySelectorAll('.message-menu')

    allMessageMenus.forEach(menu => {
      const menuId = menu.dataset.messageDropdown
      menu.classList.toggle('active', menuId === activeMessageMenu)
    })
  }

  {
    const { myGroups, currentRoom } = $.model()
    const myGroupsContainer = target.querySelector('.my-groups')

    if(myGroupsContainer) {
      // Cheap array comparison by IDs only
      const currentIds = myGroups.map(g => g.groupId).join(',') + ':' + currentRoom

      if(lastMyGroupIds !== currentIds) {
        lastMyGroupIds = currentIds

        const groupsHtml = myGroups.map(group => {
          const isActive = currentRoom === group.groupId ? 'active' : ''
          return `
            <button class="room-select my-group ${isActive}" data-id="${group.groupId}">
              ${group.groupName}
            </button>
          `
        }).join('')

        myGroupsContainer.innerHTML = groupsHtml
      }
    }
  }

  // Patch other groups
  {
    const { otherGroups } = $.model()
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
    const { group } = $.model()
    const groupInput = target.querySelector('[name="group"]')
    if(groupInput && groupInput.value !== group) {
      groupInput.value = group
    }
  }

  // Patch manage group view
  {
    const { currentGroupInfo, addMemberCompany, addMemberEmployee } = $.model()
    const manageGroupName = target.querySelector('.manage-group-name')
    const membersList = target.querySelector('.members-list')
    const addCompanyInput = target.querySelector('[name="addMemberCompany"]')
    const addEmployeeInput = target.querySelector('[name="addMemberEmployee"]')

    if(manageGroupName && currentGroupInfo) {
      manageGroupName.textContent = currentGroupInfo.groupName || ''
    }

    if(membersList && currentGroupInfo && currentGroupInfo.groupList) {
      const membersHtml = Object.keys(currentGroupInfo.groupList).map(company => {
        const members = currentGroupInfo.groupList[company].members
        const membersItems = members.map(unix => `
          <div class="member-item">
            <span class="member-name">${escapeHyperText(unix)}</span>
            <button class="remove-member-btn" data-remove-member data-company="${escapeHyperText(company)}" data-unix="${escapeHyperText(unix)}">
              <sl-icon name="trash"></sl-icon>
            </button>
          </div>
        `).join('')

        return `
          <div class="company-group">
            <div class="company-name">${escapeHyperText(company)}</div>
            ${membersItems}
          </div>
        `
      }).join('')

      if(membersList.dataset.lastMembers !== membersHtml) {
        membersList.dataset.lastMembers = membersHtml
        membersList.innerHTML = membersHtml || '<div class="no-members">No members found</div>'
      }
    }

    if(addCompanyInput && addCompanyInput.value !== addMemberCompany) {
      addCompanyInput.value = addMemberCompany
    }
    if(addEmployeeInput && addEmployeeInput.value !== addMemberEmployee) {
      addEmployeeInput.value = addMemberEmployee
    }
  }

  // Patch messages
  {
    const { view, currentRoom, threads } = $.model()
    const messagesContainer = target.querySelector('.messages')
    if (view === views.chat && messagesContainer) {
      const roomMessages = table[currentRoom] || {}
      const roomThreads = threads[currentRoom] || {}
      // Also check decrypted thread table for counts
      const decryptedThreads = table[`${currentRoom}:threads`] || {}
      const messageKeys = Object.keys(roomMessages).join(',')
      const threadKeys = JSON.stringify(roomThreads)

      const containerIsEmpty = !messagesContainer.dataset.initialized

      if(containerIsEmpty || target.lastMessageKeys !== messageKeys || target.lastRoom !== currentRoom || target.lastThreadKeys !== threadKeys) {
        messagesContainer.dataset.initialized = 'true'
        target.lastMessageKeys = messageKeys
        target.lastRoom = currentRoom
        target.lastThreadKeys = threadKeys

        const log = Object.values(roomMessages)
          .filter(message => !message.parentId) // Only show top-level messages
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          .map((message) => {
            // Check both state threads and decrypted table for reply count
            const stateReplyCount = roomThreads[message.id] ? Object.keys(roomThreads[message.id]).length : 0
            const tableReplyCount = decryptedThreads[message.id] ? Object.keys(decryptedThreads[message.id]).length : 0
            const replyCount = Math.max(stateReplyCount, tableReplyCount)
            const replyIndicator = replyCount > 0 
              ? `<button class="thread-indicator" data-open-thread="${message.id}">${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}</button>`
              : ''

            const { html, attachments } = parseDecrypted(message.decrypted)
            return `
              <div class="message" data-message-id="${message.id}">
                <div class="message-content">
                  <div class="message-body">
                    <span class="author">${escapeHyperText(message.author)}</span> ${message.decrypted === 'Decrypting...' ? 'Decrypting...' : sanitizeHTML(html) + renderAttachments(attachments)}
                  </div>
                  <div class="message-footer">
                    ${replyIndicator}
                  </div>
                </div>
                <div class="message-menu-container">
                  <button class="message-menu-trigger" data-message-menu="${message.id}">
                    <sl-icon name="three-dots-vertical"></sl-icon>
                  </button>
                  <div class="message-menu" data-message-dropdown="${message.id}">
                    <button class="message-menu-item" data-reply="${message.id}">
                      <sl-icon name="reply"></sl-icon>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            `
          }).join('') || '<div class="empty-state">No messages yet. Start the conversation!</div>'

        if(messagesContainer) {
          messagesContainer.innerHTML = log
        }
      }
    }
  }

  // Patch thread view
  {
    const { activeThread, currentRoom } = $.model()

    if(activeThread && currentRoom) {
      const parentMessage = table[currentRoom]?.[activeThread]
      const threadParent = target.querySelector('.thread-parent')
      const threadMessages = target.querySelector('.thread-messages')
      const threadReplies = table[`${currentRoom}:threads`]?.[activeThread] || {}

      if(threadParent && parentMessage) {
        const parentHtml = `
          <div class="message parent-message">
            <div class="message-body">
              <span class="author">${escapeHyperText(parentMessage.author)}</span> ${renderDecrypted(parentMessage.decrypted)}
            </div>
          </div>
        `
        if(threadParent.dataset.lastParent !== parentHtml) {
          threadParent.dataset.lastParent = parentHtml
          threadParent.innerHTML = parentHtml
        }
      }

      if(threadMessages) {
        const repliesHtml = Object.values(threadReplies)
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          .map(reply => `
            <div class="message reply-message" data-reply-id="${reply.id}">
              <div class="message-body">
                <span class="author">${escapeHyperText(reply.author)}</span> ${renderDecrypted(reply.decrypted)}
              </div>
            </div>
          `).join('') || '<div class="empty-state">No replies yet</div>'

        if(threadMessages.dataset.lastReplies !== repliesHtml) {
          threadMessages.dataset.lastReplies = repliesHtml
          threadMessages.innerHTML = repliesHtml
        }
      }
    }
  }

  // Patch message textarea
  /*
  {
    const { messageText, messageHeight } = $.model()
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
  */

  // Patch reply textarea
  /*
  {
    const { replyText, replyHeight } = $.model()
    const textarea = target.querySelector('[name="replyText"]')

    if(textarea) {
      if(textarea.lastValue !== replyText) {
        textarea.lastValue = replyText
        textarea.value = replyText
      }

      if(textarea.lastHeight !== replyHeight) {
        textarea.lastHeight = replyHeight
        if(replyHeight) {
          textarea.style.height = `${replyHeight}px`
        } else {
          textarea.style.height = 'auto'
        }
      }
    }
  }
  */

  replaceCursor(target)

  {
    const theme = getTheme()
    if(target.theme !== theme) {
      target.theme = theme
      document.body.style.setProperty('--root-theme', theme)
    }
  }

  {
    const { view, synthia } = $.model()
    const aiContent = target.querySelector('.ai-content')

    if(view === 'preferences' && aiContent) {
      const operation = escapeHyperText(synthia.prompt || '')
      diffHTML.innerHTML(aiContent, ai(operation))
    }
  }

  {
    const { view } = $.model()
    const launcherBtns = target.querySelectorAll('[data-launcher]')
    launcherBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.launcher === view)
    })
  }

  {
    const scrollback = target.querySelector('[data-scrollback="main"]')
    const scrollBtn = target.querySelector('[data-scroll-anchor="main"]')

    if (scrollback && scrollBtn) {
      // Set up scroll listener once
      if (!scrollback._scrollListenerAttached) {
        scrollback._scrollListenerAttached = true

        scrollback.addEventListener('scroll', () => {
          const threshold = 80
          const atBottom = scrollback.scrollHeight - scrollback.scrollTop - scrollback.clientHeight < threshold
          wasAtBottom = atBottom
          scrollBtn.style.display = atBottom ? 'none' : 'flex'
        })

        // Start scrolled to bottom
        scrollback.scrollTop = scrollback.scrollHeight
        wasAtBottom = true
      }

      // If user was at bottom when new messages arrived, scroll down
      if (wasAtBottom) {
        requestAnimationFrame(() => {
          scrollback.scrollTop = scrollback.scrollHeight
        })
      }
    }
  }

  {
    const { attachments, replyAttachments } = $.model()

    const mainPreview = target.querySelector('[data-preview="main"]')
    if (mainPreview) {
      const html = renderAttachmentPreview(attachments)
      if (mainPreview.dataset.last !== html) {
        mainPreview.dataset.last = html
        mainPreview.innerHTML = html
      }
    }

    const replyPreview = target.querySelector('[data-preview="reply"]')
    if (replyPreview) {
      const html = renderAttachmentPreview(replyAttachments)
      if (replyPreview.dataset.last !== html) {
        replyPreview.dataset.last = html
        replyPreview.innerHTML = html
      }
    }
  }
}

$.when('click', '.ai-content a[href]', (event) => {
  event.preventDefault()
  $.whisper({ view: views.iframe, iframeSrc: event.target.href })
})

$.when('click', '[data-format]', (event) => {
  const format = event.target.closest('[data-format]').dataset.format
  // Determine which editor based on closest form
  const form = event.target.closest('form')
  const name = form?.name === 'send-reply' ? 'reply' : 'main'
  const editor = editors[name]
  if (!editor) return

  const commands = {
    'bold': () => editor.chain().focus().toggleBold().run(),
    'italic': () => editor.chain().focus().toggleItalic().run(),
    'strikethrough': () => editor.chain().focus().toggleStrike().run(),
    'code': () => editor.chain().focus().toggleCode().run(),
    'list-ul': () => editor.chain().focus().toggleBulletList().run(),
    'list-ol': () => editor.chain().focus().toggleOrderedList().run(),
    'blockquote': () => editor.chain().focus().toggleBlockquote().run()
  }

  if (commands[format]) commands[format]()
})

$.when('click', '[data-attach]', (event) => {
  const { showAttachments } = $.model()
  $.whisper({ showAttachments: !showAttachments })
})

$.when('click', '[data-attach-reply]', (event) => {
  const form = event.target.closest('form')
  const panel = form?.querySelector('.attachments-panel-reply')
  const resizer = form?.querySelector('[data-resize-attachments-reply]')
  if (panel) {
    const isOpen = panel.classList.toggle('open')
    if (resizer) resizer.style.display = isOpen ? 'block' : 'none'
  }
})

$.when('click', '[data-remove-attachment]', (event) => {
  const cid = event.target.closest('[data-remove-attachment]').dataset.removeAttachment
  const form = event.target.closest('form')
  const isReply = form?.name === 'send-reply'
  const key = isReply ? 'replyAttachments' : 'attachments'
  const current = $.model()[key] || []
  $.whisper({ [key]: current.filter(a => a.cid !== cid) })
})

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
})

$.when('click', '[data-toggle-sidebar]', (event) => {
  const { sidebarVisible } = $.model()
  $.whisper({ sidebarVisible: !sidebarVisible })
})

$.when('click', '[data-profile]', (event) => {
  $.whisper({ view: 'profile', showActionMenu: false })
})

$.when('click', '[data-preferences]', (event) => {
  $.whisper({ view: 'preferences', showActionMenu: false })
})

// New group view handler
$.when('click', '[data-new-group]', (event) => {
  $.whisper({ view: 'new-group', showActionMenu: false })
})

$.when('click', '[data-back-to-chat]', (event) => {
  const { currentRoom } = $.model()
  $.whisper({ view: currentRoom ? 'chat' : 'profile', showActionMenu: false })
})

// Close thread panel
$.when('click', '[data-close-thread]', (event) => {
  $.whisper({ activeThread: null })
})

// App launcher handlers
$.when('click', '[data-launcher]', (event) => {
  const { launcher } = event.target.dataset
  $.whisper({ view: launcher })
})

// Group type toggle
$.when('click', '[data-group-type]', (event) => {
  const groupType = event.target.closest('[data-group-type]').dataset.groupType
  $.controller({ groupType })
})

// Action menu toggle
$.when('click', '[data-action-menu]', (event) => {
  event.stopPropagation()
  const { showActionMenu } = $.model()
  $.whisper({ showActionMenu: !showActionMenu, activeMessageMenu: null })
})

// Message menu toggle
$.when('click', '[data-message-menu]', (event) => {
  event.stopPropagation()
  const messageId = event.target.closest('[data-message-menu]').dataset.messageMenu
  const { activeMessageMenu } = $.model()
  $.whisper({ 
    activeMessageMenu: activeMessageMenu === messageId ? null : messageId,
    showActionMenu: false 
  })
})

// Close menus when clicking elsewhere
$.when('click', '', (event) => {
  const { showActionMenu, activeMessageMenu } = $.model()
  if((showActionMenu || activeMessageMenu) && 
    !event.target.closest('.action-menu-container') && 
    !event.target.closest('.message-menu-container')) {
    $.whisper({ showActionMenu: false, activeMessageMenu: null })
  }
})

// Create group handler
$.when('click', '[data-create]', () => {
  const { sessionId } = getSession()
  const { group, groupType } = $.model()

  if(!group.trim()) return

  // Use PUBLIC or PRIVATE based on selection
  const bayunGroupType = groupType === 'private' 
    ? BayunCore.GroupType.PRIVATE 
    : BayunCore.GroupType.PUBLIC;

  bayunCore.createGroup(sessionId, group, bayunGroupType)
    .then(result => {
      $.whisper({ currentRoom: result.groupId, group: '', groupType: 'public', showActionMenu: false, view: 'chat' })
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

// Manage group handler
$.when('click', '[data-manage-group]', () => {
  const { currentRoom } = $.model()
  const { sessionId } = getSession()

  if(!currentRoom) return

  // Load group info and switch to manage view
  loadGroupInfo(sessionId, currentRoom)
  $.whisper({ view: 'manage-group', showActionMenu: false, addMemberCompany: '', addMemberEmployee: '' })
})

// Add member handler
$.when('click', '[data-add-member]', async () => {
  const { currentRoom, addMemberCompany, addMemberEmployee } = $.model()
  const { sessionId } = getSession()

  if(!currentRoom || !addMemberCompany.trim() || !addMemberEmployee.trim()) return

  const groupMembers = [{
    companyName: addMemberCompany.trim(),
    companyEmployeeId: addMemberEmployee.trim()
  }]

  try {
    const addMembersResponse = await bayunCore.addMembersToGroup(sessionId, currentRoom, groupMembers)

    const addedMembersCount = addMembersResponse.addedMembersCount
    console.log("Total Members Added:", addedMembersCount)

    if(addMembersResponse.addMemberErrObject.length !== 0) {
      let errorList = addMembersResponse.addMemberErrObject
      for(let i = 0; i < errorList.length; i++) {
        console.log("Error Message:", errorList[i].errorMessage)
      }
    }

    // Clear inputs and refresh group info
    $.controller({ addMemberCompany: '', addMemberEmployee: '' })
    loadGroupInfo(sessionId, currentRoom)
  } catch(error) {
    console.log("Error caught")
    console.log(error)
  }
})

// Remove member handler
$.when('click', '[data-remove-member]', (event) => {
  const { currentRoom } = $.model()
  const { sessionId } = getSession()
  const { company, unix } = event.target.closest('[data-remove-member]').dataset

  if(!currentRoom || !company || !unix) return

  bayunCore.removeMemberFromGroup(sessionId, currentRoom, unix, company)
    .then(result => {
      console.log("Response received for removeMemberFromGroup.")
      console.log(result)
      // Refresh group info
      loadGroupInfo(sessionId, currentRoom)
    })
    .catch(error => {
      console.log("Error caught")
      console.log(error)
    })
})

// Leave group handler
$.when('click', '[data-leave-group]', () => {
  const { currentRoom } = $.model()
  const { sessionId } = getSession()

  if(!currentRoom) return

  bayunCore.leaveGroup(sessionId, currentRoom)
    .then(result => {
      $.whisper({ currentRoom: null, showActionMenu: false, view: 'profile', activeThread: null })
      // Refresh group lists after leaving
      getMyGroups()
      getOtherGroups()
    })
    .catch(error => {
      console.log("Error caught");
      console.log(error);
    });
})

// Thread handlers
$.when('click', '[data-reply]', (event) => {
  const messageId = event.target.closest('[data-reply]').dataset.reply
  $.whisper({ activeThread: messageId, showActionMenu: false, activeMessageMenu: null })
})

// Reply count toggles thread open/closed
$.when('click', '[data-open-thread]', (event) => {
  const messageId = event.target.dataset.openThread
  const { activeThread } = $.model()
  // Toggle: if already open on this thread, close it
  const newThread = activeThread === messageId ? null : messageId
  $.whisper({ activeThread: newThread, showActionMenu: false, activeMessageMenu: null })
})

$.when('click', '.message-attachments was-image img', (event) => {
  const src = event.target.closest('was-image').getAttribute('src')
  if (!src) return

  // Create fullscreen overlay
  const overlay = document.createElement('div')
  overlay.className = 'fullscreen-overlay'
  overlay.innerHTML = `<was-image src="${src}" class="fullscreen-image"></was-image>`
  overlay.addEventListener('click', () => overlay.remove())
  event.target.closest($.link).appendChild(overlay)
})

$.when('mousedown', '[data-resize-attachments], [data-resize-attachments-reply]', (event) => {
  event.preventDefault()
  const panel = event.target.nextElementSibling
  if (!panel) return
  const startY = event.pageY
  const startHeight = panel.offsetHeight

  function handleMouseMove(e) {
    const deltaY = startY - e.pageY
    const newHeight = Math.max(100, Math.min(600, startHeight + deltaY))
    panel.style.height = `${newHeight}px`
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

// Thread panel resizer
$.when('mousedown', '.thread-resizer', (event) => {
  event.preventDefault()
  const target = event.target.closest($.link)
  const threadPanel = target.querySelector('.thread-panel')
  const startX = event.pageX
  const startWidth = threadPanel.offsetWidth

  function handleMouseMove(e) {
    const deltaX = startX - e.pageX
    const newWidth = Math.max(250, Math.min(600, startWidth + deltaX))
    $.whisper({ threadPanelWidth: newWidth })
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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
    $.whisper({ sidebarWidth: newWidth })
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

$.when('keydown', '.tiptap-content', (e) => {
   if (e.key === 'Enter' && !e.shiftKey) {
    const form = e.target.closest('form')
    const name = form?.name === 'send-reply' ? 'reply' : 'main'
    const editor = editors[name]

    // Let Tiptap handle Enter normally inside lists, blockquotes, and code blocks
    if (editor && (
      editor.isActive('bulletList') ||
      editor.isActive('orderedList') ||
      editor.isActive('blockquote') ||
      editor.isActive('codeBlock')
    )) {
      return // don't prevent default, let Tiptap do its thing
    }

    e.preventDefault()
    if (form?.name === 'send') {
      send()
    } else if (form?.name === 'send-reply') {
      sendReply()
    }
  }
})

$.when('submit', '[name="send"]', (event) => {
  event.preventDefault()
  send()
})

$.when('submit', '[name="send-reply"]', (event) => {
  event.preventDefault()
  sendReply()
})

$.when('click', '[data-scroll-anchor]', (event) => {
  const target = event.target.closest($.link)
  const scrollback = target.querySelector('[data-scrollback="main"]')
  if (scrollback) {
    scrollback.scrollTo({ top: scrollback.scrollHeight, behavior: 'smooth' })
  }
})

async function send() {
  const messageText = getTiptapText('main')
  const { attachments } = $.model()
  if (!messageText.trim() && (!attachments || !attachments.length)) return

  const { currentRoom } = $.model()
  const { sessionId } = getSession()

  if(!currentRoom) {
    console.log('No room selected')
    return
  }

  if(sessionId) {
    const { attachments } = $.model()
    const messageHTML = getTiptapHTML('main')
    const payload = JSON.stringify({
      html: messageHTML,
      attachments: attachments.map(a => a.record)
    })
    const encryptedText = await bayunCore.lockText(
      sessionId,
      payload,
      BayunCore.EncryptionPolicy.Group,
      BayunCore.KeyGenerationPolicy.Group,
      currentRoom
    );

    const message = {
      id: self.crypto.randomUUID(),
      encrypted: encryptedText,
      author: getEmployeeId(),
      timestamp: Date.now(),
      room: currentRoom
    }

    $.controller({ message }, (state, payload) => {
      const message = payload.message
      const room = message.room
      return Object.assign({}, state, {
        messages: Object.assign({}, state.messages, {
          [room]: Object.assign({}, state.messages ? state.messages[room] : {}, {
            [message.id]: message
          })
        })
      })
    })
  }
  clearTiptapEditor('main')
  $.whisper({ showAttachments: false, attachments: [] })
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scrollback = document.querySelector(`${$.link} [data-scrollback="main"]`)
      if (scrollback) scrollback.scrollTop = scrollback.scrollHeight
      wasAtBottom = true
    })
  })
}

async function sendReply() {
  const replyText = getTiptapText('reply')
  const { replyAttachments } = $.model()
  if (!replyText.trim() && (!replyAttachments || !replyAttachments.length)) return

  const { currentRoom, activeThread } = $.model()
  const { sessionId } = getSession()

  if(!currentRoom || !activeThread) {
    console.log('No room or thread selected')
    return
  }

  if(sessionId) {
    const replyHTML = getTiptapHTML('reply')
    const { replyAttachments } = $.model()
    const payload = JSON.stringify({
      html: replyHTML,
      attachments: replyAttachments.map(a => a.record)
    })
    const encryptedText = await bayunCore.lockText(
      sessionId,
      payload,
      BayunCore.EncryptionPolicy.Group, 
      BayunCore.KeyGenerationPolicy.Group, 
      currentRoom
    );

    const reply = {
      id: self.crypto.randomUUID(),
      encrypted: encryptedText,
      author: getEmployeeId(),
      timestamp: Date.now(),
      parentId: activeThread,
      room: currentRoom
    }

    $.controller({ reply }, (state, payload) => {
      const reply = payload.reply
      const room = reply.room
      const parentId = reply.parentId
      return Object.assign({}, state, {
        threads: Object.assign({}, state.threads, {
          [room]: Object.assign({}, state.threads ? state.threads[room] : {}, {
            [parentId]: Object.assign({}, state.threads && state.threads[room] ? state.threads[room][parentId] : {}, {
              [reply.id]: reply
            })
          })
        })
      })
    })
  }
  clearTiptapEditor('reply')
  $.whisper({ replyAttachments: [] })
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const threadScroll = document.querySelector(`${$.link} .thread-scroll`)
      if (threadScroll) threadScroll.scrollTop = threadScroll.scrollHeight
    })
  })
}

$.when('gallery-share', 'plan98-gallery', (event) => {
  const form = event.target.closest('form')
  const isReply = form?.name === 'send-reply'
  const { items } = event.detail
  const key = isReply ? 'replyAttachments' : 'attachments'
  const current = $.model()[key] || []

  // Dedupe by cid
  const existing = new Set(current.map(i => i.cid))
  const merged = [...current, ...items.filter(i => !existing.has(i.cid))]

  $.whisper({ [key]: merged, showAttachments: false })
})

let groupsLoaded = false

$.when('activated', 'secure-persona', (event) => {
  // User has logged in, trigger a re-render to show the chat interface
  const id = getMyId()
  $.controller({
    id,
    color: $.model().color,
    lastSeen: Date.now()
  }, join)

  if (!groupsLoaded) {
    groupsLoaded = true
    getMyGroups()
    getOtherGroups()
  }
})

$.when('deactivated', 'secure-persona', (event) => {
  groupsLoaded = false
  Object.keys(table).forEach(room => delete table[room])
  decryptionInProgress.clear()
  destroyTiptapEditors()
  $.controller(getMyId(), leave)
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

function sanitizeHTML(html = '') {
  const allowed = ['p','br','strong','em','s','code','pre','ul','ol','li','blockquote']
  const div = document.createElement('div')
  div.innerHTML = html

  function clean(node) {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === 3) continue // text nodes are fine
      if (child.nodeType !== 1) { child.remove(); continue }

      const tag = child.tagName.toLowerCase()
      if (!allowed.includes(tag)) {
        // unwrap: keep children, remove the tag
        while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child)
        child.remove()
      } else {
        // strip all attributes
        while (child.attributes.length > 0) child.removeAttribute(child.attributes[0].name)
        clean(child)
      }
    }
  }

  clean(div)
  return div.innerHTML
}

const editors = {}

function initTiptapEditor(container, name, placeholderText) {
  if (!container) return null

  // If editor exists but its DOM is detached, destroy it
  if (editors[name]) {
    if (!editors[name].options.element?.isConnected) {
      editors[name].destroy()
      delete editors[name]
    } else {
      return editors[name]
    }
  }

  const editor = new Editor({
    element: container,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholderText })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-content'
      }
    }
  })

  editors[name] = editor
  return editor
}

function getTiptapText(name) {
  const editor = editors[name]
  if (!editor) return ''
  return editor.getText()
}

function getTiptapHTML(name) {
  const editor = editors[name]
  if (!editor) return ''
  return editor.getHTML()
}

function clearTiptapEditor(name) {
  const editor = editors[name]
  if (editor) editor.commands.clearContent()
}

function destroyTiptapEditors() {
  Object.keys(editors).forEach(name => {
    editors[name].destroy()
    delete editors[name]
  })
}

$.skin(`
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

  & .sidebar-inner {
    position: relative;
    padding-right: .5rem;
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
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
    place-items: center;
    gap: .5rem;
  }

  & .profile-button > span ,
  & .footer-button > span {
    display: inline-grid;
    place-items: center;
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

  & .footer-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: .5rem;
    cursor: pointer;
  }

  & .footer-button:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .footer-button sl-icon {
    font-size: 1.2rem;
  }

  & .resizer {
    width: 4px;
    background: black;
    cursor: col-resize;
    flex-shrink: 0;
    transition: background 200ms ease-in-out;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
  }

  & .resizer:hover {
    background: var(--root-theme, mediumseagreen);
  }

  & .attachments-resizer {
    display: none;
    height: 4px;
    background: rgba(255,255,255,.1);
    cursor: row-resize;
  }

  & .attachments-resizer:hover {
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
    grid-template-columns: auto 1fr;
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
    grid-template-rows: auto 1fr;
    height: 100%;
    background: linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)), var(--root-theme, mediumseagreen);
    overflow: hidden;
  }

  & .chat-body {
    display: grid;
    grid-template-columns: 1fr;
    height: 100%;
    overflow: hidden;
  }

  & .chat-body.thread-open {
    grid-template-columns: 1fr 4px auto;
  }

  & .chat-main {
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;
  }

  & .thread-resizer {
    width: 4px;
    background: black;
    cursor: col-resize;
    display: none;
    transition: background 200ms ease-in-out;
  }

  & .thread-resizer:hover {
    background: var(--root-theme, mediumseagreen);
  }

  & .thread-panel {
    display: none;
    grid-template-rows: auto 1fr auto;
    background: linear-gradient(rgba(255,255,255,.85), rgba(255,255,255,.85)), var(--root-theme, mediumseagreen);
    border-left: 1px solid rgba(0,0,0,.1);
    min-width: 250px;
    max-width: 600px;
    overflow: hidden;
  }

  & .thread-header {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    padding: .5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  & .thread-title {
    color: rgba(255,255,255,.85);
    font-weight: 600;
  }

  & .close-thread {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: transparent;
    color: rgba(255,255,255,.65);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 200ms ease-in-out;
  }

  & .close-thread:hover {
    background: rgba(255,255,255,.1);
    color: rgba(255,255,255,.85);
  }

  & .thread-scroll {
    overflow: auto;
  }

  & .app-area {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(rgba(255,255,255,.85), rgba(255,255,255,.85)), var(--root-theme, mediumseagreen);
  }

  & .video-area {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
  }

  & .action-bar {
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
    min-height: calc(2.5rem + 1rem);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: .5rem;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  & .action-bar-left {
    display: flex;
    align-items: center;
    gap: .5rem;
  }

  & .action-bar-center {
    flex: 1;
  }

  & .action-bar-right {
    display: flex;
    align-items: center;
    gap: .5rem;
  }

  & .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background 200ms ease-in-out;
  }

  & .back-button:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .back-button sl-icon {
    font-size: 1.2rem;
  }

  & .action-menu-container {
    position: relative;
  }

  & .action-menu-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background 200ms ease-in-out;
  }

  & .action-menu-trigger:hover {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
  }

  & .action-menu-trigger sl-icon {
    font-size: 1.2rem;
  }

  & .video-chat-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background 200ms ease-in-out;
  }

  & .video-chat-btn:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .video-chat-btn sl-icon {
    font-size: 1.2rem;
  }

  & .action-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
    border-radius: .5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,.3);
    min-width: 150px;
    z-index: 200;
    overflow: hidden;
  }

  & .action-menu.active {
    display: block;
  }

  & .action-menu-item {
    display: flex;
    align-items: center;
    gap: .5rem;
    width: 100%;
    padding: .75rem 1rem;
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    cursor: pointer;
    font-size: .9rem;
    text-align: left;
    white-space: nowrap;
    transition: background 200ms ease-in-out;
  }

  & .action-menu-item:hover {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
  }

  & .action-menu-item sl-icon {
    font-size: 1rem;
  }

  & .content-body {
    padding: 2rem;
    overflow: auto;
  }

  & [name="send"],
  & [name="send-reply"] {
    display: grid;
    grid-template-rows: auto auto;
  }

  & .action-row {
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    padding: 4px 8px;
    display: flex;
    gap: .5rem;
    align-items: center;
    min-height: 2rem;
  }

  & .formatting-tools {
    display: flex;
    gap: .25rem;
    align-items: center;
    flex: 1;
  }

  & .compose-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: end;
    background: linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7)), var(--root-theme, mediumseagreen);
  }

  & .compose-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: transparent;
    color: rgba(255,255,255,.5);
    border: none;
    cursor: pointer;
    transition: all 200ms ease-in-out;
    flex-shrink: 0;
  }

  & .compose-btn:hover {
    color: rgba(255,255,255,.85);
  }

  & .compose-btn sl-icon {
    font-size: 1.1rem;
  }

  & .send-btn {
    background: linear-gradient(rgba(0,0,0,.3), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    margin: 0 .25rem .25rem 0;
  }

  & .send-btn:hover {
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.35)), var(--root-theme, mediumseagreen);
    color: white;
  }

  & .normal-button {
    padding: .5rem 1rem;
    border-radius: 4px;
    border: none;
    color: white;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    cursor: pointer;
  }

  & .normal-button:hover,
  & .normal-button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & [name="send"] textarea,
  & [name="send-reply"] textarea {
    width: 100%;
    display: block;
    resize: none;
    background: transparent;
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
    justify-content: flex-end;
    min-height: 100%;
  }

  & .thread-messages {
    padding: .5rem;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  & .reply-message {
    background: rgba(0,0,0,.05);
  }

  & .thread-parent {
    background: linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.1)), var(--root-theme, mediumseagreen);
    padding: .5rem;
    border-bottom: 2px solid rgba(0,0,0,.2);
  }

  & .thread-parent .message {
    background: rgba(255,255,255,.5);
  }

  & .message {
    display: flex;
    align-items: flex-start;
    gap: .5rem;
    border-radius: .5rem;
    position: relative;
    padding: .5rem;
    margin-bottom: .25rem;
  }

  & .message:hover {
    background: rgba(255,255,255,.3);
  }

  & .message:hover .message-menu-trigger {
    opacity: 1;
  }

  & .message-content {
    flex: 1;
    min-width: 0;
  }

  & .message-body {
    overflow: auto;
    word-wrap: break-word;
  }

  & .message-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: .25rem;
  }

  & .message-menu-container {
    position: relative;
    flex-shrink: 0;
  }

  & .message-menu-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: transparent;
    color: rgba(0,0,0,.4);
    border: none;
    border-radius: .25rem;
    cursor: pointer;
    opacity: 0;
    transition: all 200ms ease-in-out;
  }

  & .message-menu-trigger:hover {
    background: rgba(0,0,0,.1);
    color: rgba(0,0,0,.7);
  }

  & .message-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: linear-gradient(rgba(0,0,0,.95), rgba(0,0,0,.95)), var(--root-theme, mediumseagreen);
    border-radius: .5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,.3);
    min-width: 120px;
    z-index: 200;
    overflow: hidden;
  }

  & .message-menu.active {
    display: block;
  }

  & .message-menu-item {
    display: flex;
    align-items: center;
    gap: .5rem;
    width: 100%;
    padding: .5rem .75rem;
    background: transparent;
    color: rgba(255,255,255,.85);
    border: none;
    cursor: pointer;
    font-size: .85rem;
    text-align: left;
    transition: background 200ms ease-in-out;
  }

  & .message-menu-item:hover {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
  }

  & .message-menu-item sl-icon {
    font-size: .9rem;
  }

  & .thread-indicator {
    background: transparent;
    border: 1px solid rgba(0,0,0,.2);
    color: rgba(0,0,0,.6);
    cursor: pointer;
    padding: .25rem .5rem;
    border-radius: 1rem;
    font-size: .8rem;
    transition: all 200ms ease-in-out;
  }

  & .thread-indicator:hover {
    background: rgba(0,0,0,.1);
    border-color: rgba(0,0,0,.4);
    color: rgba(0,0,0,.8);
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

  & .video-content {
    height: 100%;
    overflow: hidden;
  }

  & .new-group-form,
  & .manage-group-form {
    max-width: 400px;
  }

  & .new-group-form h2,
  & .manage-group-form h2 {
    margin: 0 0 1.5rem 0;
    color: rgba(0,0,0,.75);
  }

  & .manage-group-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: rgba(0,0,0,.65);
    margin-bottom: 1.5rem;
    padding-bottom: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.1);
  }

  & .manage-section {
    margin-bottom: 2rem;
  }

  & .manage-section h3 {
    margin: 0 0 1rem 0;
    color: rgba(0,0,0,.65);
    font-size: 1rem;
  }

  & .add-member-form {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .add-member-btn {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .5rem 1rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    color: white;
    border: none;
    border-radius: .5rem;
    cursor: pointer;
    font-size: .9rem;
    transition: background 200ms ease-in-out;
    margin-top: .5rem;
    width: fit-content;
  }

  & .add-member-btn:hover {
    background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .members-list {
    background: rgba(0,0,0,.05);
    border-radius: .5rem;
    padding: .5rem;
  }

  & .company-group {
    margin-bottom: 1rem;
  }

  & .company-group:last-child {
    margin-bottom: 0;
  }

  & .company-name {
    font-weight: 600;
    color: rgba(0,0,0,.65);
    padding: .25rem .5rem;
    background: rgba(0,0,0,.05);
    border-radius: .25rem;
    margin-bottom: .5rem;
    font-size: .85rem;
  }

  & .member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.05);
  }

  & .member-item:last-child {
    border-bottom: none;
  }

  & .member-name {
    color: rgba(0,0,0,.75);
  }

  & .remove-member-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: transparent;
    color: rgba(0,0,0,.4);
    border: none;
    border-radius: .25rem;
    cursor: pointer;
    transition: all 200ms ease-in-out;
  }

  & .remove-member-btn:hover {
    background: rgba(220,53,69,.1);
    color: #dc3545;
  }

  & .loading-members,
  & .no-members {
    color: rgba(0,0,0,.5);
    text-align: center;
    padding: 1rem;
    font-style: italic;
  }

  & .form-field {
    margin-bottom: 1rem;
  }

  & .form-field label {
    display: block;
    margin-bottom: .5rem;
    color: rgba(0,0,0,.65);
    font-weight: 500;
  }

  & .form-field input {
    width: 100%;
    padding: .75rem;
    border: 1px solid rgba(0,0,0,.2);
    background: white;
    color: rgba(0,0,0,.85);
    border-radius: .5rem;
    font-size: 1rem;
  }

  & .form-field input:focus {
    outline: none;
    border-color: var(--root-theme, mediumseagreen);
    box-shadow: 0 0 0 3px rgba(60, 179, 113, .2);
  }

  & .group-type-toggle {
    display: flex;
    gap: .5rem;
    margin-bottom: .5rem;
  }

  & .type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .75rem 1rem;
    background: white;
    color: rgba(0,0,0,.5);
    border: 2px solid rgba(0,0,0,.15);
    border-radius: .5rem;
    cursor: pointer;
    font-size: .9rem;
    transition: all 200ms ease-in-out;
  }

  & .type-btn:hover {
    border-color: rgba(0,0,0,.3);
    color: rgba(0,0,0,.7);
  }

  & .type-btn.active {
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.1)), var(--root-theme, mediumseagreen);
    border-color: var(--root-theme, mediumseagreen);
    color: rgba(0,0,0,.85);
  }

  & .type-btn sl-icon {
    font-size: 1rem;
  }

  & .type-description {
    margin: 0;
    font-size: .85rem;
    color: rgba(0,0,0,.5);
    font-style: italic;
  }

  & .create-group-btn {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .75rem 1.5rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    color: white;
    border: none;
    border-radius: .5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background 200ms ease-in-out;
  }

  & .create-group-btn:hover {
    background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }

  & .subtitle {
    color: rgba(255,255,255,.65);
    font-weight: 800;
    font-size: .8rem;
    margin: 1rem .5rem .5rem;
  }

  & .app-launcher-section {
    padding: .5rem;
    display: flex;
    flex-direction: column;
    gap: .25rem;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  & .app-launcher-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .5rem 1rem;
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: background 200ms ease-in-out;
  }

  & .app-launcher-btn:hover {
    background: linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
  }

  & .app-launcher-btn.active {
    background: linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.85)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,1);
  }

  & .app-launcher-btn sl-icon {
    font-size: 1rem;
  }

  & .subtitle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 1rem .5rem .5rem;
  }

  & .subtitle-row .subtitle {
    margin: 0;
  }

  & .add-group-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: transparent;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.3);
    border-radius: .25rem;
    cursor: pointer;
    transition: all 200ms ease-in-out;
  }

  & .add-group-btn:hover {
    background: rgba(255,255,255,.1);
    color: rgba(255,255,255,.85);
    border-color: rgba(255,255,255,.5);
  }

  & .add-group-btn sl-icon {
    font-size: .85rem;
  }

  & .group-section {
    margin-bottom: .5rem;
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
  }

  /* Desktop: Always show sidebar, hide mobile toggle */
  @media (min-width: 769px) {
    & .chat-app[data-sidebar-visible="false"] {
      grid-template-columns: 1fr;
    }

    & .chat-app[data-sidebar-visible="false"] .sidebar {
      display: none;
    }

    & .chat-app[data-sidebar-visible="false"] .resizer {
      background: var(--root-theme, mediumseagreen);
    }

    & .chat-app[data-sidebar-visible="false"] .toggle-sidebar {
      left: .5rem;
    }

    & .chat-app[data-sidebar-visible="true"] .toggle-sidebar {
      left: calc(var(--sidebar-width, 200px) + .5rem);
    }
  }

   & .tiptap-editor {
    min-height: 2.5rem;
    max-height: 35vh;
    overflow-y: auto;
    flex: 1;
  }

  & .tiptap-content {
    outline: none;
    padding: 8px;
    color: rgba(255,255,255,.85);
    font-size: 1rem;
    min-height: 1.5em;
    word-wrap: break-word;
  }

  & .tiptap-content p {
    margin: 0;
  }

  & .tiptap-content p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: rgba(255,255,255,.35);
    pointer-events: none;
    float: left;
    height: 0;
  }

  & .tiptap-content blockquote {
    border-left: 3px solid rgba(255,255,255,.3);
    padding-left: .75rem;
    margin: .25rem 0;
  }

  & .tiptap-content code {
    background: rgba(0,0,0,.3);
    padding: .1rem .3rem;
    border-radius: 3px;
    font-size: .9em;
  }

  & .tiptap-content ul,
  & .tiptap-content ol {
    padding-left: 1.5rem;
    margin: .25rem 0;
  }

  & .fmt-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: transparent;
    color: rgba(255,255,255,.45);
    border: none;
    border-radius: .25rem;
    cursor: pointer;
    transition: all 150ms ease-in-out;
  }

  & .fmt-btn:hover {
    color: rgba(255,255,255,.85);
    background: rgba(255,255,255,.1);
  }

  & .fmt-btn sl-icon {
    font-size: .9rem;
  }

  & .attachments-panel {
    display: none;
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.9)), var(--root-theme, mediumseagreen);
    border-top: 1px solid rgba(255,255,255,.1);
    height: 200px;
    overflow: auto;
  }

  & .attachments-panel.open {
    display: block;
  }

  & .attach-btn.active {
    color: rgba(255,255,255,.85);
    background: rgba(255,255,255,.1);
  }

  & .scroll-anchor-btn {
    position: sticky;
    bottom: .5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.8)), var(--root-theme, mediumseagreen);
    color: rgba(255,255,255,.85);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
    z-index: 10;
    transition: all 200ms ease-in-out;
  }

  & .scroll-anchor-btn:hover {
    background: linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.6)), var(--root-theme, mediumseagreen);
    transform: translateX(-50%) scale(1.1);
  }

  & .scroll-anchor-btn sl-icon {
    font-size: 1.2rem;
  }

  & .preferences-area {
    height: 100%;
    overflow: auto;
  }

  & .message-attachments {
    display: flex;
    gap: .25rem;
    flex-wrap: wrap;
    margin-top: .25rem;
  }

  & .attachment-thumb {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: .25rem;
  }

  & .attachment-text {
    background: rgba(0,0,0,.05);
    padding: .25rem .5rem;
    border-radius: .25rem;
    font-size: .85rem;
    max-width: 200px;
  }

  & .attachment-preview {
    display: flex;
    gap: .25rem;
    padding: .25rem .5rem;
    overflow-x: auto;
    background: linear-gradient(rgba(0,0,0,.75), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
  }

  & .attachment-preview:empty {
    display: none;
  }

  & .preview-item {
    position: relative;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border-radius: .25rem;
    overflow: hidden;
    cursor: pointer;
  }

  & .preview-item img,
  & .preview-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & .preview-item.text-preview {
    background: rgba(255,255,255,.1);
    display: grid;
    place-content: center;
    padding: .25rem;
    font-size: .6rem;
    color: rgba(255,255,255,.65);
  }

  & .preview-remove {
    position: absolute;
    top: 0;
    right: 0;
    width: 1.25rem;
    height: 1.25rem;
    background: rgba(0,0,0,.7);
    color: white;
    border: none;
    border-radius: 0 0 0 .25rem;
    cursor: pointer;
    display: grid;
    place-content: center;
    font-size: .6rem;
  }

  & .preview-remove:hover {
    background: rgba(220,53,69,.9);
  }

  & .fullscreen-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,.9);
    display: grid;
    place-content: center;
    cursor: zoom-out;
  }

  & .fullscreen-image {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    object-fit: contain;
  }
`)

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset

  if(bind) {
    $.whisper({
      bind: bind,
      name: event.target.name,
      value: event.target.value
    }, (state, payload) => {
      return {
        ...state,
        [payload.bind]: {
          ...state[payload.bind],
          [payload.name]: payload.value
        }
      }
    })
  } else {
    const { name, value } = event.target;
    $.whisper({ [name]: value })
  }
})

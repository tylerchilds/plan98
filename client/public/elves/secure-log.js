import elf from '@silly/elf'
import supabase from '@sillonious/database'
import { disconnect, $ as $login } from './hive-login.js'
import { bayunCore, BayunCore } from '@sillonious/vault'
import {
  getSession,
  clearSession,
} from './bayun-wizard.js'

import { toast } from './plan98-toast.js'
import { render } from '@sillonious/saga'
import { showModal } from './plan98-modal.js'
import { popover } from './data-popover.js'
import { marked } from "marked"
import { GoogleGenerativeAI } from "@google/generative-ai"
import {
  getFontSizeOptions,
  getFontSize,
  setFontSize,
  getFontFamilyOptions,
  getFontFamily,
  setFontFamily,
  getThemes,
  setTheme,
  getTheme,
} from '@hive/brand'

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

const renderer = new marked.Renderer();

renderer.codespan = (code) => {
  return `<code>${escapeHyperText(decodeHtmlEntities(code))}</code>`;
};

// Override code block rendering
renderer.code = (code, language) => {
  let decodedCode = decodeHtmlEntities(code); // First decode pass
  decodedCode = decodeHtmlEntities(decodedCode); // Second decode to fix double encoding

  const langClass = language ? ` class="language-${language}"` : "";
  return `<pre><code${langClass}>${escapeHyperText(decodedCode)}</code></pre>`;
};

marked.setOptions({
  renderer,
  gfm: true,        // Enable GitHub Flavored Markdown
  breaks: false,    // Keep standard line breaks
  smartypants: false, // Prevent automatic quote conversions
});

const zeroState = {
  secureSession: getSession(),
  loggedIn: false,
  sidebar: self.innerWidth > 768,
  newLogName: '',
  logBookId: null,
  paneUrl: '/app/agentic-dash',
  profile: {},
  logBooks: {},
  threads: {},
  myBooks: [],
  ourBooks: [],
  messageText: '',
  replyText: '',
  messageHeight: null,
  messageEncrypted: false,
  messageType: null,
  replyHeight: null,
  replyEncrypted: false,
  replyType: null,
  messageMode: 'normal',
  threadMode: 'normal',
  settingsKey: 'theme',
  settings: {
    theme: {
      label: 'Theme',
      description: 'The color of the console',
      options: getThemes(),
      value: getTheme()
    },
    fontSize: {
      label: 'Font Size',
      description: 'The size of words and numbers.',
      options: getFontSizeOptions(),
      value: getFontSize(),
    },
    fontFamily: {
      label: 'Font Family',
      description: 'The shapes of the letters.',
      options: getFontFamilyOptions(),
      value: getFontFamily(),
    },
  },

}

const profile = plan98.parameters.get('profile')
let customArgs = {}

if(profile) {
  customArgs = {
    ...customArgs,
    settingsModal: 'custom-hypertext',
    settingsCustomHyperText: `
      <hive-profile data-user="${profile}"></hive-profile>
    `
  }
}

const $ = elf('secure-log', {
  ...zeroState,
  ...customArgs,
  loggedIn: !!$login.learn().user
})

$.when('click', '[data-profile]', async () => {
  const { profile } = event.target.dataset
  $.teach({
    settingsModal: 'custom-hypertext',
    settingsCustomHyperText: profile ? `
      <hive-profile data-user="${profile}"></hive-profile>
    ` : `
      <hive-profile></hive-profile>
    `
  })
})

$.when('click', '[data-profile-qr]', async () => {
  const userId = $login.learn().user?.id
  $.teach({
    settingsModal: 'custom-hypertext',
    settingsCustomHyperText: `
      <div style="height: 100%; width: 100%; overflow: hidden;">
        <div style="padding: 51px; height: 100%; display: flex;">
          <qr-code src="${window.location.origin}/?profile=${userId}" no-link="true" style="width: 75vmin; height: 75vmin;" target="_top"></qr-code>
        </div>
      </div>
    `
  })
})


$.when('click', '[data-security]', async (event) => {
  event.preventDefault()
  $.teach({ settingsModal: 'security' })
})

$.when('click', '[data-logout]', async (target) => {
  disconnect()
  $.teach(zeroState)
})

$.when('connected', 'hive-login', (event) => {
  $.teach({ loggedIn: true })
})

$.when('disconnected', 'hive-login', (event) => {
  $.teach(zeroState)
})

$.when('activated', 'hive-persona', (event) => {
  $.teach({ secureSession: getSession() })
})

$.when('deactivated', 'hive-persona', (event) => {
  $.teach({ secureSession: getSession() })
})

async function fetchProfile(target) {
  if(target.fetchedProfile) return
  target.fetchedProfile = true
  const userId = $login.learn().user?.id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, persona!persona_user_id_fkey1(moniker, organization, id, bayun_group_id)')
    .eq('user_id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  if(profile) {
    $.teach({ profile })
  }
}

function initializeUserLogbooks(target) {
  if(target.fetchedBooks) return
  target.fetchedBooks = true
  // Immediately fetch logbooks
  fetchUserLogbooks();

  // Set up real-time subscription
  const channel = supabase
    .channel('user-logbooks')
    // Listen for changes in log_book table
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'log_book'
      },
      () => fetchUserLogbooks()
    )
    // Listen for changes in log_group table
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'log_group'
      },
      () => fetchUserLogbooks()
    )
    .subscribe();

  return () => channel.unsubscribe();
}

async function fetchUserLogbooks() {
  const userId = $login.learn().user?.id
  try {
    // Get logbooks owned by user
    const { data: ownedBooks, error: ownedError } = await supabase
      .from('log_book')
      .select('*')
      .eq('owner_id', userId)
      .neq('deleted', true);

    if (ownedError) throw ownedError;

    // Get logbooks where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('log_group')
      .select(`
        log_book_id,
        log_book!inner(*)
      `)
      .eq('member_id', userId)
      .neq('log_book.deleted', true);

    if (memberError) throw memberError;

    // Extract and process the member logbooks
    const memberBooks = memberData
      .map(item => item.log_book)
      .filter(book => book !== null && book.owner_id !== userId); // Filter out owned books

    // Update the UI with both sets of books
    $.teach({
      myBooks: ownedBooks || [],
      ourBooks: memberBooks || []
    });

  } catch (error) {
    console.error('Error fetching logbooks:', error);
  }
}

let currentChannel
let channelObserver
const channelOffsets = {}

async function fetchLogs(target) {
  const { logBookId } = $.learn()
  if(!logBookId) {

    if(channelObserver) {
      channelObserver.disconnect()
    }

    return
  }
  if(target.book === logBookId) return
  target.book = logBookId

  if(currentChannel) {
    currentChannel.unsubscribe()
  }

  if(channelObserver) {
    channelObserver.disconnect()
  }

  supabase
    .from('log_book')
    .select('*')
    .eq('id', logBookId)
    .single()
    .then(({ data, error }) => {
      if(error) {
        console.error(error)
      } else {
        $.teach({ logBookOwnerId: data.owner_id })
      }
    }).catch(console.error)

  $.teach({ messages: {}, loadingMessages: true })
  const data = await queryMessages()
  $.teach({ loadingMessages: false })

  $.teach(data.reverse(), prependMessages(logBookId))

  channelObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if(entry.isIntersecting) {
        $.teach({ loadingMessages: true })
        console.log('ok')
        const data = await queryMessages()
        $.teach({ loadingMessages: false })

        $.teach(data.reverse(), prependMessages(logBookId))
      }
    });
  }, {
    root: target.querySelector('.message-log'),
    rootMargin: '0px',
    threshold: 0,
  });

  channelObserver.observe(target.querySelector('.load-more-messages'))

  currentChannel = supabase.channel('log_listener')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'log' },
    async (payload) => {
      const currentBook = `${payload.new.log_book_id}` === logBookId
      if (payload.new.parent_id === null && currentBook) {

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', payload.new.owner_id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }

        const log = await maybeDecrypt({
          id: payload.new.id,
          owner_id: payload.new.owner_id,
          created_at: payload.new.created_at,
          profiles: profileData,
          encrypted: payload.new.encrypted,
          text: payload.new.text,
          type: payload.new.type,
        })

        $.teach(log, mergeMessage(logBookId))
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteMessage(logBookId))
      }

      if(payload.new.parent_id !== null) {
        const { data: childCountData, error: childCountError } = await supabase
          .from('log')
          .select(`
            child_logs:log!parent_id(count)
          `)
          .eq('id', payload.new.parent_id)
          .eq('log_book_id', payload.new.log_book_id)
          .single()

        if (childCountError) {
          console.error('Error counting replies:', childCountError)
        } else {
          const childCount = childCountData.child_logs[0].count

          $.teach({
            id: payload.new.parent_id,
            childCount
          }, mergeMessage(logBookId))

        }
      }
    }
  )
  .subscribe()
}

let currentThread
let threadObserver
const threadOffsets = {}

async function fetchThread(target) {
  const { threadId } = $.learn()
  if(!threadId) {

    if(threadObserver) {
      threadObserver.disconnect()
    }

    return
  }
  if(target.thread === threadId) return
  target.thread = threadId

  if(currentThread) {
    currentThread.unsubscribe()
  }

  if(threadObserver) {
    threadObserver.disconnect()
  }

  $.teach({ threadMessages: {}, loadingReplies: true })
  const data = await queryReplies()
  $.teach({ loadingReplies: false })

  $.teach(data.reverse(), prependReplies(threadId))

  threadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if(entry.isIntersecting) {
        $.teach({ loadingReplies: true })
        const data = await queryReplies()
        $.teach({ loadingReplies: false })

        $.teach(data.reverse(), prependReplies(threadId))
      }
    });
  }, {
    root: target.querySelector('.reply-log'),
    rootMargin: '0px',
    threshold: 0,
  });

  threadObserver.observe(target.querySelector('.load-more-replies'))

  currentThread = supabase.channel('thread_listener')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'log' },
    async (payload) => {
      if (payload.new.parent_id === threadId && `${payload.new.parent_id}` === threadId) {

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', payload.new.owner_id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }

        const log = await maybeDecrypt({
          id: payload.new.id,
          owner_id: payload.new.owner_id,
          created_at: payload.new.created_at,
          profiles: profileData,
          encrypted: payload.new.encrypted,
          text: payload.new.text,
          type: payload.new.type
        })

        $.teach(log, mergeThreadMessage(threadId))
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteThreadMessage(threadId))
      }
    }
  )
  .subscribe()
}


const rangeLength = 10
async function queryMessages() {
  const { logBookId } = $.learn()
  const start = channelOffsets[logBookId] || 0
  channelOffsets[logBookId] = start + rangeLength
  const { data, error } = await supabase
    .from('log')
    .select(`
      *,
      child_logs:log!parent_id(count),
      profiles!inner(user_id, nick, picture)
    `)
    .is('parent_id', null)
    .eq('log_book_id', logBookId)
    .order('created_at', { ascending: false })
    .range(start, channelOffsets[logBookId])

  if(error) {
    console.error(error)
    return []
  }

  try {
    return await Promise.all(data.map(maybeDecrypt))
  } catch(e) {
    console.error(e)
    return data
  }
}

async function maybeDecrypt(log) {
  const { encrypted, text } = log
  const { sessionId } = getSession()

  if(encrypted && !sessionId) {
     return {
      ...log,
      text: `Connect a secure session to decrypt this message by <button class="as-link" data-security>clicking here</button>.`
    }
  }

  if(encrypted) {
    try {
      const decryptedText = await bayunCore.unlockText(sessionId, text)

      return {
        ...log,
        text: decryptedText
      }
    } catch(e) {
      console.error(e)

      return {
        ...log,
        text: 'Befriend this person to be able to read their secure messages.'
      }
    }
  }

  return log
}

async function queryReplies() {
  const { threadId } = $.learn()
  const start = threadOffsets[threadId] || 0
  threadOffsets[threadId] = start + rangeLength
  const { data, error } = await supabase
    .from('log')
    .select(`
      *,
      profiles!inner(user_id, nick, picture)
    `)
    .or(`parent_id.eq.${threadId},id.eq.${threadId}`)
    .order('created_at', { ascending: false })
    .range(start, threadOffsets[threadId])

  if(error) {
    console.error(error)
    return []
  }

  try {
    return await Promise.all(data.map(maybeDecrypt))
  } catch(e) {
    console.error(e)
    return data
  }
}

function messagesToCollection(collection, row) {
  const childCount = row.child_logs[0].count

  collection[row.id] = {
    id: row.id,
    created_at: row.created_at,
    profiles: row.profiles,
    encrypted: row.encrypted,
    owner_id: row.owner_id,
    text: row.text,
    type: row.type,
    childCount
  }

  return collection
}

function appendMessages(logBookId) {
  return function reducer(state, payload) {
    const newMessages = payload.reduce(messagesToCollection, {})

    return {
      ...state,
      logBooks: {
        ...state.logBooks,
        [logBookId]: {
          ...(state.logBooks[logBookId] || {}),
          ...newMessages
        }
      }
    }
  }
}

function prependMessages(logBookId) {
  return function reducer(state, payload) {
    const newMessages = payload.reduce(messagesToCollection, {})

    return {
      ...state,
      logBooks: {
        ...state.logBooks,
        [logBookId]: {
          ...newMessages,
          ...(state.logBooks[logBookId] || {}),
        }
      }
    }
  }
}


function mergeMessage(logBookId) {
  return function reducer(state, payload) {
    return {
      ...state,
      logBooks: {
        ...state.logBooks,
        [logBookId]: {
          ...(state.logBooks[logBookId] || {}),
          [payload.id]: {
            ...((state.logBooks[logBookId] || {})[payload.id] || {}),
            ...payload
          }
        }
      }
    }
  }
}

function deleteMessage(logBookId) {
  return function reducer(state, payload) {
    const newState = {
      ...state,
    }

    try {
      delete newState.logBooks[logBookId][payload.id]
    } catch(e) {
      console.error(e)
    }

    return newState
  }
}

function repliesToCollection(collection, row) {
  collection[row.id] = {
    id: row.id,
    created_at: row.created_at,
    profiles: row.profiles,
    encrypted: row.encrypted,
    owner_id: row.owner_id,
    text: row.text,
    type: row.type
  }

  return collection
}


function prependReplies(threadId) {
  return function reducer(state, payload) {
    const newReplies = payload.reduce(repliesToCollection, {})

    return {
      ...state,
      threads: {
        ...state.threads,
        [threadId]: {
          ...newReplies,
          ...(state.threads[threadId] || {}),
        }
      }
    }
  }
}


function mergeThreadMessage(threadId) {
  return function reducer(state, payload) {
    return {
      ...state,
      threads: {
        ...state.threads,
        [threadId]: {
          ...(state.threads[threadId] || {}),
          [payload.id]: payload,
        }
      }
    }
  }
}

function deleteThreadMessage(threadId) {
  return function reducer(state, payload) {
    const newState = {
      ...state,
    }

    try {
      delete newState.threads[threadId][payload.id]
    } catch(e) {
      console.error(e)
    }

    return newState
  }
}


function renderActions(target) {
  const {
    logBookId,
    logBookName,
    settingsModal,
    logBookOwnerId,
    groupMembers,
    nonGroupMembers,
    settingsCustomHyperText
  } = $.learn()

  if(!settingsModal) return ''
  if(settingsModal === target.settingsModal) return
  target.settingsModal = settingsModal

  const userId = $login.learn().user?.id

  if(settingsModal === 'custom-hypertext') {

    return `
      <div class="custom-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="custom-body">
          ${settingsCustomHyperText}
        </div>
      </div>
    `
  }

  if(settingsModal === 'preferences') {
    const { settings, settingsKey } = $.learn()
    const email = $login.learn().user?.email

    const list = Object.keys(settings).map((key, i) => {
      const setting = settings[key]
      return `
        <div aria-role="button" class="setting ${settingsKey === key ? 'focused':''}" data-key="${key}">
          <div class="setting-label">
            ${setting.label}
          </div>
          <div class="setting-description">
            ${setting.description}
          </div>
          <div class="options-list">
            <div class="setting-options">
              ${setting.options.map((x) => {
                return `
                  <button data-setting="${key}" data-value="${x}" class="option ${setting.value === x?'selected':''}">
                    ${x}
                  </button>
                `
              }).join('')}
            </div>
          </div>
        </div>
      `
    }).join('')

    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="channel-actions-body">
          <div class="channel-actions-header">
            Preferences
          </div>
          <div style="margin-bottom: 1rem;">
            You are logged in as: <strong>${email}</strong>
          </div>
          <div class="menu-list">
            ${list}
          </div>
        </div>
      </div>
    `
  }

  if(settingsModal === 'security') {
    debugger
    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="settings-modal-body">
          <div class="settings-modal-header">
            Security
          </div>
          <div>
            <hive-persona></hive-persona>
          </div>
        </div>
      </div>

    `
  }

  if(settingsModal === 'loading') {
    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="channel-actions-body">
          <div class="channel-actions-header">
            ${logBookName}
          </div>

          <div>
            <flying-disk></flying-disk>
          </div>
        </div>
      </div>
    `
  }

  if(settingsModal === 'create') {
    const { newLogName } = $.learn()
    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="channel-actions-body">
          <div class="channel-actions-header">
            Create Channel
          </div>

          <form class="new-log-form modal-form">
            <label class="field">
              <span class="label">Channel Name</span>
              <input data-bind name="newLogName" value="${newLogName}" placeholder="Project Idea">
            </label>
            <button class="action-button" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    `
  }

  if(settingsModal === 'list') {
    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="channel-actions-body">
          <div class="channel-actions-header">
            ${logBookName}
          </div>

          <div class="book-actions">
            <button class="channel-invite">
              <span>
                <sl-icon name="people"></sl-icon>
              </span>
              People
            </button>


            ${userId !== logBookOwnerId ? `
              <button class="group-leave" data-book="${logBookId}" data-member="${userId}">
                <span>
                  <sl-icon name="door-closed"></sl-icon>
                </span>
                Leave
              </button>
            `:''}
            ${userId === logBookOwnerId ? `
              <button class="book-delete" data-book="${logBookId}">
                <span>
                  <sl-icon name="trash3"></sl-icon>
                </span>
                Delete
              </button>
            `:''}
          </div>
        </div>
      </div>
    `
  }

  if(settingsModal === 'invite') {
    return `
      <div class="channel-actions-overlay">
        <button class="close-channel-actions">
          <sl-icon name="x-lg"></sl-icon>
        </button>
        <div class="channel-actions-body">
          <div class="channel-actions-header">
            ${logBookName}
          </div>

          <div class="book-users">
            <div class="modal-title">Group Members</div>
            ${groupMembers.map((member) => {
              return `
                <div class="book-group-member">
                  <div class="member-picture">
                    <img src="${member.picture || '/public/cdn/hivelabworks.com/classic-logo.svg'}" />
                  </div>
                  <div class="member-handle" data-tooltip="${member.email}">
                    ${member.nick || member.email}
                  </div>
                  <div class="member-remove">
                    ${member.user_id !== logBookOwnerId && (userId === logBookOwnerId || member.user_id === userId) ? `
                      <button class="inline-action group-remove" data-book="${logBookId}" data-member="${member.user_id}">
                        <span>
                          <sl-icon name="door-closed"></sl-icon>
                        </span>
                        ${ member.user_id === userId ? `
                          Leave
                        `: `
                          Kick
                        ` }
                      </button>
                    `:''}
                  </div>
                </div>
              `
            }).join('')}

            ${userId === logBookOwnerId ? `
              <div class="modal-title">Invite People</div>
              ${nonGroupMembers.map((member) => {
                return `
                  <div class="book-group-nonmember">
                    <div class="member-picture">
                      <img src="${member.picture || '/public/cdn/hivelabworks.com/classic-logo.svg'}" />
                    </div>
                    <div class="member-handle" data-tooltip="${member.email}">
                      ${member.nick || member.email}
                    </div>
                    <div class="member-invite">
                      <button class="inline-action group-invite" data-book="${logBookId}" data-member="${member.user_id}">
                        <span>
                          <sl-icon name="door-open"></sl-icon>
                        </span>
                        Invite
                      </button>
                    </div>
                  </div>
                `
              }).join('')}
            `:''}
            </div>
        </div>
      </div>
    `
  }

}

let genAI
let gemini

if(plan98.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(plan98.env.GEMINI_API_KEY);
  gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

function ollamaHandler(model) {
  return async (text) => {
    const url = `${plan98.env.OLLAMA_BASE_URL}/api/generate`;
    const headers = {
      "Content-Type": "application/json",
    }

    return await fetch(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        model,
        prompt: text,
        stream: false
      })
    }).then((response) => response.text()).then((result) => {
      return JSON.parse(result).response
    }).catch(e => {
      console.error(e)
    })
  }
}

const localModels = {
  'deepseek-r1:1.5b': {
    label: 'Deepseek-r1 1.5b',
    handler: ollamaHandler
  },
  'gemma3:1b': {
    label: 'Gemma3 1b',
    handler: ollamaHandler
  },
  'mistral:7b': {
    label: 'Mistral 7b',
    handler: ollamaHandler
  },
  'llama3.2:3b': {
    label: 'Llama 3.2 3b',
    handler: ollamaHandler
  }
}

let enabledModels = []
if(plan98.env.OLLAMA_BASE_URL && plan98.env.OLLAMA_MODELS){
  enabledModels = plan98.env.OLLAMA_MODELS.split(',').reduce((models, model) => {
    if(localModels[model]) {
      models.push({
        ...localModels[model],
        key: model
      })
    }
    return models
  }, [])
}

const enabledHandlers = enabledModels.reduce((models, model) => {
  if(localModels[model.key]) {
    const { handler } = localModels[model.key]
    models[model.key] = handler(model.key)
  }
  return models
}, {})

const enabledModelRenderers = enabledModels.reduce((models, model) => {

  function renderer(message) {
    const { created_at, id, text } = message
    const { threadId, logBookId } = $.learn()

    const userId = $login.learn().user?.id
      return `
        <div class="ai-message">
          ${message.owner_id === userId ? `
            <button class="ai-context" data-id="${id}" ${threadId?`data-thread="${threadId}"`:''} data-book="${logBookId}">
              <sl-icon name="three-dots-vertical"></sl-icon>
            </button>
          `:''}

          <div class="ai-name">
            ${model.label}
          </div>
          <div class="ai-body markdown">
            ${marked(text)}
          </div>
        </div>
      `
  }

  models[model.key] = renderer
  return models
}, {})

const aiHandlers = {
  ...enabledHandlers,
  google: async (text) => {
    const result = await gemini.generateContent(text);
    return result.response.text();
  }
}

export async function handlePrompt(event, root) {
  popover()
  const { id, book, ai } = root.dataset

  const { logBooks } = $.learn()
  const messages = logBooks[book] || {}
  const message = messages[id]

  if(aiHandlers[ai]) {
    $.teach({ replyThinking: true, panel: true, threadId: id })
    const userId = $login.learn().user?.id

    const text = await aiHandlers[ai](message.text)

    const { data, error } = await supabase
      .from('log')
      .insert([
        { log_book_id: book, parent_id: id, type: ai, text, owner_id: userId },
      ])
      .select()

    $.teach({ replyThinking: false })
    if(error) {
      $.teach({ error })
      return
    }
  }
}

export async function handlePromptReply(event, root) {
  popover()
  const { id, book, thread, ai } = root.dataset

  const { threads } = $.learn()
  const messages = threads[thread] || {}
  const message = messages[id]

  if(aiHandlers[ai]) {
    $.teach({ panel: true, replyThinking: true })
    const userId = $login.learn().user?.id

    const text = await aiHandlers[ai](message.text)

    const { data, error } = await supabase
      .from('log')
      .insert([
        { log_book_id: book, parent_id: thread, type: ai, text, owner_id: userId },
      ])
      .select()

    $.teach({ replyThinking: false })
    if(error) {
      $.teach({ error })
      return
    }
  }
}

const logTypeRenderers = {
  ...enabledModelRenderers,
  google: (message) => {
    const { created_at, id, text } = message
    const { threadId, logBookId } = $.learn()

  const userId = $login.learn().user?.id
    return `
      <div class="ai-message">
        ${message.owner_id === userId ? `
          <button class="ai-context" data-id="${id}" ${threadId?`data-thread="${threadId}"`:''} data-book="${logBookId}">
            <sl-icon name="three-dots-vertical"></sl-icon>
          </button>
        `:''}

        <div class="ai-name">
          Gemini
        </div>
        <div class="ai-body markdown">
          ${marked(text)}
        </div>
      </div>
    `
  }
}

$.draw(target => {
  const {
    loggedIn,
    humanPromptUrl,
    humanPromptTitle,
    humanPromptId,
    logBookId,
    threadId,
    sidebar,
    panel,
    ourBooks,
    myBooks,
    profile,
    logBooks,
    paneUrl,
    logBookName,
    messageText,
    messageHeight,
    messageMode,
    messageEncrypted,
    messageType,
    secureSession,
    grabbing,
    loadingMessages
  } = $.learn()

  if(!loggedIn) {
    return `
      <div>
      ${renderActions(target)}
      </div>
      <button class="sidebar-toggle">
        <sl-icon name="list"></sl-icon>
      </button>
      <div class="chat-realm ${grabbing? 'grabbed':''} ${sidebar?'show-sidebar':''}">
        <div class="chat-sidebar light-sidebar">
          <div data-resize-sidebar></div>
          <div class="chat-sidebar-inner">
            <hive-login></hive-login>
          </div>
        </div>
        <div class="content-area">
          <div class="zero-state">
            <iframe src="${paneUrl?paneUrl:'/app/agentic-dash'}"></iframe>
          </div>
        </div>
      </div>
    `
  }

  fetchProfile(target)
  initializeUserLogbooks(target)
  fetchLogs(target)
  fetchThread(target)

  const userId = $login.learn().user?.id

  const messages = logBooks[logBookId] || {}

  const view = `
    <div>
    ${renderActions(target)}
    </div>
    <button class="sidebar-toggle">
      <sl-icon name="list"></sl-icon>
    </button>
    <div class="chat-realm ${grabbing? 'grabbed':''} ${sidebar?'show-sidebar':''} ${panel?'show-panel':''}">
      <div class="chat-sidebar">
        <div class="profile-actions">
          <button class="profile-photo" data-profile>
            <img src="${profile.picture || '/public/cdn/hivelabworks.com/classic-logo.svg'}" />
          </button>
            ${ secureSession.sessionId
              ? `
                <button class="profile-icon secure" data-security>
                  <sl-icon name="shield-fill-check"></sl-icon>
                </button>
              `
              : `
                <button class="profile-icon insecure" data-security>
                  <sl-icon name="shield-fill-x"></sl-icon>
                </button>
              `
            }
          <button data-profile-qr class="profile-icon qr-code">
            <sl-icon name="qr-code"></sl-icon>
          </button>
          <button data-logout class="logout-icon">
            <sl-icon name="box-arrow-right"></sl-icon>
          </button>
        </div>
        <div data-resize-sidebar></div>
        <div class="chat-sidebar-inner">
          <div class="sidebar-title">
            <div>
              My Projects
            </div>
            <button data-new-log class="plus-icon">
              <sl-icon name="plus-lg"></sl-icon>
            </button>
          </div>

          ${myBooks.map((book) => `
            <button data-name="${book.name}" data-id="${book.id}" class="read-book sidebar-action ${logBookId === `${book.id}`?'active':''}">${book.name}</button>
          `).join('')}

          <div class="sidebar-title">
            All Projects
          </div>

          ${ourBooks.map((book) => `
            <button data-name="${book.name}" data-id="${book.id}" class="read-book sidebar-action ${logBookId === `${book.id}`?'active':''}">${book.name}</button>
          `).join('')}
        </div>
        <div class="chat-footer">
          <button class="action-icon show-preferences">
            <sl-icon name="sliders"></sl-icon>
          </button>
          <button class="action-button show-preferences">Preferences</button>
        </div>
      </div>
      <div class="content-area">
        ${logBookId ? `
          <div class="channel-actions">
            <button class="launch-meeting action-icon" data-room="${logBookName}">
              <sl-icon name="camera-video"></sl-icon>
            </button>
            <button class="open-channel-actions action-icon">
              <sl-icon name="three-dots-vertical"></sl-icon>
            </button>
          </div>
          <div class="chat-pane">
            <div class="log message-log">
              <div class="chat-content">
                ${loadingMessages ? `<flying-disk class="log-loader"></flying-disk>`:``}
                <div class="load-more-messages"></div>
                ${Object.keys(messages).map((id) => {
                  const { created_at, encrypted, childCount, profiles, owner_id, text, type, actions={} } = messages[id]

                  if(type && logTypeRenderers[type]) {
                    return logTypeRenderers[type](messages[id])
                  }

                  const actionsHTML = Object.keys(actions).map(key => {
                    const { label } = actions[key]
                    const { response } = actions[key]['json-rpc']

                    return response ? `
                      <div class="message-response">
                        ${response.error ? `
                          ${response.error.message}

                          <button class="message-action" data-message="${id}" data-action="${key}">
                            Try Again
                          </button>
                        `: 'Finished'}
                      </div>
                    `: `
                      <button class="message-action" data-message="${id}" data-action="${key}">
                        ${label}
                      </button>
                    `
                  })
                  return `${ owner_id !== userId ? `
                      <div class="message other ${childCount > 0 ?'has-thread':''}" data-id="${id}">
                        ${encrypted?`<div class="encrypted-chip"></div>`:''}
                        <div class="meta">
                          <button class="message-picture" data-profile="${owner_id}">
                            <img src="${ profiles.picture || '/public/cdn/hivelabworks.com/classic-logo.svg'}" />
                          </button>
                        </div>
                        <div class="body markdown">${marked(text)}</div>
                        <button class="message-context" data-id="${id}" data-book="${logBookId}">
                          <sl-icon name="three-dots-vertical"></sl-icon>
                        </button>

                        ${actionsHTML? `
                          <div class="message-actions">${actionsHTML}</div>
                        `:''}
                        ${childCount > 0 ? `
                          <button class="show-thread" data-thread="${id}">
                            View Thread (${childCount})
                          </button>
                        `:''}
                      </div>
                    ` : `
                      <div aria-role="button" class="message me ${childCount > 0 ?'has-thread':''}" data-id="${id}">
                        ${encrypted?`<div class="encrypted-chip"></div>`:''}
                        <div>
                        <div class="body markdown">${marked(text)}</div>
                        </div>
                        ${childCount > 0 ? `
                          <button class="show-thread" data-thread="${id}">
                            View Thread (${childCount})
                          </button>
                        `:''}

                        <button class="message-context" data-id="${id}" data-book="${logBookId}">
                          <sl-icon name="three-dots-vertical"></sl-icon>
                        </button>
                      </div>
                    `}
                  `
                }).join('')}
              </div>
            </div>
            ${ messageMode === 'edit' ? `
              <form class="edit-message-form">
                <div class="edit-actions">
                  <button data-edit-cancel>Cancel</button>
                </div>
                <div class="text-well">
                  <textarea
                    data-bind
                    name="messageText"
                    placeholder="Share to ${logBookName}"
                    value="${escapeHyperText(messageText)}"
                    ${messageHeight ? `style="height: ${messageHeight}px"`:''}
                  ></textarea>
                  <button class="edit" type="submit">
                    <sl-icon name="floppy2"></sl-icon>
                  </button>
                </div>
              </form>
            `: `
              <div class="post-actions">
                <div class="post-actions-inner">
                  <button data-key="messageType" data-value="text" class="post-type ${!messageType || messageType === 'text' ?'post-type-active':''}">
                    <sl-icon name="type"></sl-icon>
                  </button>
                  <button  data-key="messageType" data-value="media" class="post-type ${ messageType === 'media' ?'post-type-active':''}">
                    <sl-icon name="images"></sl-icon>
                  </button>
                  <button data-key="messageType" data-value="audio" class="post-type ${ messageType === 'audio' ?'post-type-active':''}">
                    <sl-icon name="mic"></sl-icon>
                  </button>
                  <button data-key="messageType" data-value="attachments" class="post-type ${ messageType === 'attachments' ?'post-type-active':''}">
                    <sl-icon name="paperclip"></sl-icon>
                  </button>
                  <span class="encryption-status">
                    ${ secureSession.sessionId && profile.persona && profile.persona.bayun_group_id
                      ? messageEncrypted ? `
                        <button data-key="messageEncrypted" class="encryption-type encryption-type-encrypted">
                          <sl-icon name="shield-fill-check"></sl-icon>
                        </button>
                      ` : `
                        <button data-key="messageEncrypted" class="encryption-type encryption-type-unencrypted">
                          <sl-icon name="shield-fill-x"></sl-icon>
                        </button>
                      `
                      : `
                        <button class="encryption-type encryption-type-unauthenticated">
                          <sl-icon name="shield-fill-exclamation"></sl-icon>
                        </button>
                      `
                    }
                  </span>
                </div>
              </div>

              <form class="new-message-form">
                ${renderMessageArea()}
              </form>
            `}
          </div>
        `:`
          <div class="zero-state">
            <iframe src="${paneUrl?paneUrl:'/app/agentic-dash'}"></iframe>
          </div>
        `}
      </div>
      <div class="chat-panel">
        <div data-resize-panel></div>
        <div class="panel-actions">
          <button class="close-panel action-icon">
            <sl-icon name="x-lg"></sl-icon>
          </button>
        </div>
        ${threadId?renderThread():''}
      </div>
    </div>
  `

  return humanPromptUrl ? `
    <div class="human-prompt ${humanPromptId ? 'active' :'' }">
      <button class="human-unprompt" data-id="${humanPromptId}">
        <sl-icon name="x-lg"></sl-icon>
      </button>
      <div class="human-app">
        <div class="human-app-title">${humanPromptTitle}</div>
        <iframe src="${humanPromptUrl}" title="Await Human"></iframe>
      </div>
    </div>
    ${view}
  `: view
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  saveCursor(target)
}

function afterUpdate(target) {
  replaceCursor(target)

  {
    recoverElves(target, 'sl-icon')
    recoverElves(target, 'hive-login')
    recoverElves(target, 'hive-persona')
    recoverElves(target, 'hive-profile')
    recoverElves(target, 'flying-disk')
  }

  {
    const { messageMode } = $.learn()

    if(messageMode === 'edit' && target.lastMode !== 'edit') {
      target.lastMode = messageMode
      target.querySelector('[name="messageText"]').focus()
    }

    if(messageMode === 'normal' && target.lastMode !== 'normal') {
      target.lastMode = messageMode
    }
  }

  {
    const { settingsKey } = $.learn()

    if(target.settingsKey !== settingsKey) {
      target.settingsKey = settingsKey
      const active = target.querySelector('.setting.focused')

      if(active) {
        active.scrollIntoView()
      }
    }
  }

  {
    const active = target.querySelector('.setting.focused .option.selected')
    if(active) {
      active.scrollIntoView({
        block: "nearest",  // Keeps the vertical position as close as possible
        inline: "center"    // Scrolls only in the inline direction
      });
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
    node.replaceWith(newNode)
  })
}
function renderReplyArea() {
  const {
    replyHeight,
    replyText,
    replyType
  } = $.learn()

  if(replyType === 'audio') {
    return `
      <div class="wip-uploader">
        Audio Recorder TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(replyType === 'media') {
    return `
      <div class="wip-uploader">
        Media Uploader TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(replyType === 'attachments') {
    return `
      <div class="wip-uploader">
        Attachment Uploader TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(! replyType || replyType === 'text') {
    return `
      <div class="text-well">
        <textarea
          data-bind
          name="replyText"
          placeholder="Reply"
          value="${escapeHyperText(replyText)}"
          ${replyHeight ? `style="height: ${replyHeight}px"`:''}
        ></textarea>
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }
}


function renderMessageArea() {
  const {
    logBookName,
    messageHeight,
    messageText,
    messageType
  } = $.learn()

  if(messageType === 'audio') {
    return `
      <div class="wip-uploader">
        Audio Recorder TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(messageType === 'media') {
    return `
      <div class="wip-uploader">
        Media Uploader TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(messageType === 'attachments') {
    return `
      <div class="wip-uploader">
        Attachment Uploader TBD
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }

  if(! messageType || messageType === 'text') {
    return `
      <div class="text-well">
        <textarea
          data-bind
          name="messageText"
          placeholder="Share to ${logBookName}"
          value="${escapeHyperText(messageText)}"
          ${messageHeight ? `style="height: ${messageHeight}px"`:''}
        ></textarea>
        <button class="send" type="submit">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
      </div>
    `
  }
}

function renderThread() {
  const { threadId, threads, loadingReplies, replyThinking, threadMode, replyText, replyHeight, replyEncrypted, replyType, secureSession, logBookId, profile } = $.learn()

  const userId = $login.learn().user?.id
  const messages = threads[threadId] || {}
  return `
    <div class="chat-pane">
      <div class="log reply-log">
        <div class="chat-content">
          ${loadingReplies ? `<flying-disk class="log-loader for-replies"></flying-disk>`:``}
          <div class="load-more-replies"></div>
          ${Object.keys(messages).map((id) => {
            const { created_at, encrypted, childCount, profiles, owner_id, text, type } = messages[id]

            if(type && logTypeRenderers[type]) {
              return logTypeRenderers[type](messages[id])
            }

            return `${ owner_id !== userId ? `
                <div class="message other" data-id="${id}">
                  ${encrypted?`<div class="encrypted-chip"></div>`:''}
                  <div class="meta">
                    <button class="message-picture" data-profile="${owner_id}">
                      <img src="${ profiles.picture || '/public/cdn/hivelabworks.com/classic-logo.svg'}" />
                    </button>
                  </div>
                  <div class="body markdown">${marked(text)}</div>
                  <button class="thread-context" data-id="${id}" data-thread="${threadId}" data-book="${logBookId}">
                    <sl-icon name="three-dots-vertical"></sl-icon>
                  </button>
                </div>
              ` : `
                <div aria-role="button" class="message me" data-id="${id}">
                  ${encrypted?`<div class="encrypted-chip"></div>`:''}
                  <div>
                  <div class="body markdown">${marked(text)}</div>
                  </div>
                  ${childCount > 0 ? `
                    <button data-thread="${id}">
                      View Thread (${childCount})
                    </button>
                  `:''}

                  <button class="thread-context" data-id="${id}" data-thread="${threadId}" data-book="${logBookId}">
                    <sl-icon name="three-dots-vertical"></sl-icon>
                  </button>
                </div>
              `}
            `
          }).join('')}
        </div>
      </div>
      ${ threadMode === 'edit' ? `
        ${replyThinking ? '<flying-disk></flying-disk>' : ''}
        <form class="edit-reply-form">
          <div class="edit-actions">
            <button data-edit-reply-cancel>Cancel</button>
          </div>
          <div class="text-well">
            <textarea
              data-bind
              name="replyText"
              placeholder="Reply..."
              value="${escapeHyperText(replyText)}"
              ${replyHeight ? `style="height: ${replyHeight}px"`:''}
            ></textarea>
            <button class="edit" type="submit">
              <sl-icon name="floppy2"></sl-icon>
            </button>
          </div>
        </form>
      `: `
        ${replyThinking ? '<flying-disk></flying-disk>' : ''}
        <div class="post-actions">
          <div class="post-actions-inner">
            <button data-key="replyType" data-value="text" class="post-type ${!replyType || replyType === 'text' ?'post-type-active':''}">
              <sl-icon name="type"></sl-icon>
            </button>
            <button data-key="replyType" data-value="media" class="post-type ${ replyType === 'media' ?'post-type-active':''}">
              <sl-icon name="images"></sl-icon>
            </button>
            <button data-key="replyType" data-value="audio" class="post-type ${ replyType === 'audio' ?'post-type-active':''}">
              <sl-icon name="mic"></sl-icon>
            </button>
            <button data-key="replyType" data-value="attachments" class="post-type ${ replyType === 'attachments' ?'post-type-active':''}">
              <sl-icon name="paperclip"></sl-icon>
            </button>
            <span class="encryption-status">
              ${ secureSession.sessionId && profile.persona && profile.persona.bayun_group_id
                ? replyEncrypted ? `
                  <button data-key="replyEncrypted" class="encryption-type encryption-type-encrypted">
                    <sl-icon name="shield-fill-check"></sl-icon>
                  </button>
                ` : `
                  <button data-key="replyEncrypted" class="encryption-type encryption-type-unencrypted">
                    <sl-icon name="shield-fill-x"></sl-icon>
                  </button>
                `
                : `
                  <button class="encryption-type encryption-type-unauthenticated">
                    <sl-icon name="shield-fill-exclamation"></sl-icon>
                  </button>
                `
              }
            </span>
          </div>
        </div>

        <form class="new-reply-form">
          ${renderReplyArea()}
        </form>
      `}
    </div>
  `

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

function clearCursor(target) {
  target.dataset.field = null
  sel = []
}

export function handleScriptify(event, root) {
  popover()
  const { id, book } = root.dataset

  const { logBooks } = $.learn()
  const messages = logBooks[book] || {}
  const message = messages[id]
  showModal(`
    <div class="full-child-xml-html" style="background: white; position: absolute; inset: 0;">
      <div style="background: white; overflow: auto; height: 100%;">
        ${render(message.text)}
      </div>
    </div>
  `)
}

export function handleScriptifyReply(event, root) {
  popover()
  const { id, thread } = root.dataset

  const { threads } = $.learn()
  const messages = threads[thread] || {}
  const message = messages[id]
  showModal(`
    <div class="full-child-xml-html" style="background: white; position: absolute; inset: 0;">
      <div style="background: white; overflow: auto; height: 100%;">
        ${render(message.text)}
      </div>
    </div>
  `)
}

$.when('click', '.post-type', (event) => {
  const { key, value } = event.target.dataset

  $.teach({ [key]: value })
})

$.when('click', '.encryption-type-unauthenticated', (event) => {
  $.teach({ settingsModal: 'security' })
})

$.when('click', '.encryption-type-unencrypted', (event) => {
  const { key } = event.target.dataset

  $.teach({ [key]: true })
})

$.when('click', '.encryption-type-encrypted', (event) => {
  const { key } = event.target.dataset

  $.teach({ [key]: false })
})


$.when('click', '.channel-actions-overlay', (event) => {
  if(event.target.closest('.channel-actions-body')) return

  $.teach({ settingsModal: null })
})


$.when('click', ':not(.chat-panel)', (event) => {
  if(event.target.closest('.chat-panel')) return
  if(event.target.closest('hive-login')) return

  $.teach({ panel: false, threadId: null })
})

$.when('click', '.show-thread', (event) => {
  const { thread } = event.target.dataset
  $.teach({ panel: true, threadId: thread })
})

$.when('click', '.show-preferences', (event) => {
  $.teach({ settingsModal: 'preferences' })
})


export function handleReplyMessage(event, root) {
  popover()
  const { id } = root.dataset

  $.teach({ panel: true, threadId: id })
}

$.when('click', '[data-edit-cancel]', (event) => {
  event.preventDefault()
  $.teach({ messageMode: 'normal', messageHeight: null, messageText: '', editId: null })
})

$.when('click', '[data-edit-reply-cancel]', (event) => {
  event.preventDefault()
  $.teach({ threadMode: 'normal', replyHeight: null, replyText: '', replyEditId: null })
})


export function handleEditMessage(event, root) {
  popover()
  const { id, book } = root.dataset

  const { logBooks } = $.learn()
  const messages = logBooks[book] || {}
  const message = messages[id]

  $.teach({ messageMode: 'edit', messageText: message.text, editId: id })
}

export function handleEditReply(event, root) {
  popover()
  const { id, thread } = root.dataset

  const { threads } = $.learn()
  const messages = threads[thread] || {}
  const message = messages[id]

  $.teach({ threadMode: 'edit', replyText: message.text, replyEditId: id })
}

export async function handleDeleteMessage(event, root) {
  popover()
  const { id } = root.dataset
 
  const { error } = await supabase
  .from('log')
  .delete()
  .match({ id: id });

  if(error) {
    console.error(error)
  }
}

export async function handleDeleteReply(event, root) {
  popover()
  const { id } = root.dataset
 
  const { error } = await supabase
  .from('log')
  .delete()
  .match({ id: id });

  if(error) {
    console.error(error)
  }
}

$.when('click', '.message-context', (event) => {
  const { id, book } = event.target.dataset
  const { logBooks } = $.learn()
  const messages = logBooks[book] || {}
  const message = messages[id]
  const userId = $login.learn().user?.id

  if(message.owner_id === userId) {

    popover(event, `
      <action-script data-id="${id}" data-action="handleDeleteMessage" data-script="/public/elves/secure-log.js">
        <div style="display: grid; color: firebrick; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="trash3"></sl-icon>
          </span>
          Delete
        </div>
      </action-script>
      <hr>
      <action-script data-id="${id}" data-book="${book}" data-action="handleEditMessage" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="pencil"></sl-icon>
          </span>
          Edit
        </div>
      </action-script>
      <action-script data-id="${id}" data-book="${book}" data-action="handleReplyMessage" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="reply"></sl-icon>
          </span>
          Reply
        </div>
      </action-script>
      <hr>
      <action-script data-id="${id}" data-book="${book}" data-action="handlePrompt" data-ai="google" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="eyeglasses"></sl-icon>
          </span>
          Prompt Gemini
        </div>
      </action-script>

      ${enabledModels.map(model => `
        <action-script data-id="${id}" data-book="${book}" data-action="handlePrompt" data-ai="${model.key}" data-script="/public/elves/secure-log.js">
          <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
            <span>
              <sl-icon name="eyeglasses"></sl-icon>
            </span>
            Prompt ${model.label}
          </div>
        </action-script>
      `).join('')}

      <action-script data-id="${id}" data-book="${book}" data-action="handleScriptify" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="magic"></sl-icon>
          </span>
          Scriptify
        </div>
      </action-script>
    `)
  } else {
    popover(event, `
      <action-script data-id="${id}" data-book="${book}" data-action="handleScriptify" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="magic"></sl-icon>
          </span>
          Scriptify
        </div>
      </action-script>
    `)
  }
})

$.when('click', '.ai-context', (event) => {
  const { id, book, thread } = event.target.dataset

  let message

  if(thread) {
    const { threads } = $.learn()
    const messages = threads[thread] || {}
    message = messages[id]
  } else {
    const { logBooks } = $.learn()
    const messages = logBooks[book] || {}
    message = messages[id]
  }
  const userId = $login.learn().user?.id

  if(message.owner_id === userId) {

    popover(event, `
      <action-script data-id="${id}" data-action="handleDeleteMessage" data-script="/public/elves/secure-log.js">
        <div style="display: grid; color: firebrick; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="trash3"></sl-icon>
          </span>
          Delete
        </div>
      </action-script>
    `)
  }
})


$.when('click', '.thread-context', (event) => {
  const { id, book, thread } = event.target.dataset
  const { threads } = $.learn()
  const messages = threads[thread] || {}
  const message = messages[id]
  const userId = $login.learn().user?.id

  if(message.owner_id === userId) {

    popover(event, `
      <action-script data-id="${id}" data-action="handleDeleteReply" data-script="/public/elves/secure-log.js">
        <div style="display: grid; color: firebrick; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="trash3"></sl-icon>
          </span>
          Delete
        </div>
      </action-script>
      <hr>
      <action-script data-id="${id}" data-thread="${thread}" data-action="handleEditReply" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="pencil"></sl-icon>
          </span>
          Edit
        </div>
      </action-script>
      <hr>
      <action-script data-id="${id}" data-thread="${thread}" data-book="${book}" data-action="handlePromptReply" data-ai="google" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="eyeglasses"></sl-icon>
          </span>
          Prompt Gemini
        </div>
      </action-script>

      ${enabledModels.map(model => `
        <action-script data-id="${id}" data-thread="${thread}" data-book="${book}" data-action="handlePromptReply" data-ai="${model.key}" data-script="/public/elves/secure-log.js">
          <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
            <span>
              <sl-icon name="eyeglasses"></sl-icon>
            </span>
            Prompt ${model.label}
          </div>
        </action-script>
      `).join('')}

      <action-script data-id="${id}" data-thread="${thread}" data-action="handleScriptifyReply" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="magic"></sl-icon>
          </span>
          Scriptify
        </div>
      </action-script>
    `)
  } else {
    popover(event, `
      <action-script data-id="${id}" data-thread="${thread}" data-action="handleScriptifyReply" data-script="/public/elves/secure-log.js">
        <div style="display: grid; gap: .5rem; grid-template-columns: auto 1fr; align-items: center;">
          <span>
            <sl-icon name="magic"></sl-icon>
          </span>
          Scriptify
        </div>
      </action-script>
    `)
  }
})


$.when('click', '.read-book', async (event) => {
  const { id, name } = event.target.dataset
  $.teach({
    sidebar: false,
    paneUrl: null,
    logBookId: id,
    logBookName: name
  })
})

$.when('click', '[data-new-log]', async () => {
  $.teach({ settingsModal: 'create' })
})

$.when('submit', '.new-log-form', async (event) => {
  event.preventDefault()
  const { newLogName } = $.learn()
  const userId = $login.learn().user?.id
  const { data, error } = await supabase.from('log_book')
    .insert({
      name: newLogName,
      owner_id: userId,
    })
    .select()
    .single();

  if(error) {
    console.error(error)
    return
  }

  $.teach({
    logBookName: newLogName,
    logBookId: `${data.id}`,
    settingsModal: null,
    sidebar: false,
    newLogName: ''
  })

})

$.when('click', '.message-action', async (event) => {
  const { message:mID, action: aID } = event.target.dataset

  const { messages } = $.learn()

  const { actions } = messages[mID] || {}

  if(!actions) return

  const action = actions[aID]

  if(!action) return

  const { request } = action['json-rpc']

  if(request.id) {
    const response = await humanRPC(request).catch((error) => {
      $.teach(error, responseReducer(mID))
    })

    if(response) {
      $.teach(response, responseReducer(mID))
    }
  } else {
    try {
      humanRPC(request)
    } catch(e) {
      console.error(e)
    }
  }
})

function responseReducer(mID) {
  return (state, payload) => {
        return {
          ...state,
          messages: {
            ...state.messages,
            [mID]: {
              ...state.messages[mID],
              actions: {
                ...state.messages[mID].actions,
                [payload.id]: {
                  ...state.messages[mID].actions[payload.id],
                  'json-rpc': {
                    ...state.messages[mID].actions[payload.id]['json-rpc'],
                    response: payload
                  }
                }
              }
            }
          }
        }
      }
}

const humanMethods = {
  open: (request, resolve, reject) => {
    const { params } = request
    $.teach({
      humanPromptUrl: `/app/${params.app}?data=${params.data}&rpcID=${request.id}`,
      humanPromptTitle: params.appTitle,
      humanPromptId: request.id,
    })
    return function callback(response) {
      $.teach({
        humanPromptUrl: null,
        humanPromptId: null,
        humanPromptTitle: null
      })
      if(response.error) {
        reject(response)
      } else {
        resolve(response)
      }
    }
  }
}

const callbacks = {}

function humanRPC(request) {
  return new Promise((resolve, reject) => {
    if(humanMethods[request.method]) {
      callbacks[request.id] = humanMethods[request.method](request, resolve, reject)
    } else {
      reject({
        "jsonrpc": "2.0",
        id: rpcID,
        error: {
          code: '-32601',
          message: 'Method not found',
        }
      })
    }
  })
}

self.addEventListener('message', function handleMessage(event) {
  if(event.data.type === 'human-rpc') {
    const { response } = event.data
    callbacks[response.id](response)
  } 
});

$.when('click', '.human-unprompt', () => {
  const { humanPromptId } = $.learn()

  const callback = callbacks[humanPromptId]

  if(callback) {
    callback({
      "jsonrpc": "2.0",
      id: humanPromptId,
      error: {
        code: '-32000',
        message: 'Declined by you.'
      }
    })
  }
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

$.when('keypress', '.edit-message-form [name="messageText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    edit(e)
  }
})

$.when('submit', '.edit-message-form', (event) => {
  event.preventDefault()
  edit(event)
})

async function edit(event) {
  const root = event.target.closest($.link)

  const { logBooks, logBookId, editId, profile } = $.learn()

  const { type, encrypted } = logBooks[logBookId][editId]

  if(!type || type === 'text') {
    const message = root.querySelector('[name="messageText"]')

    const text = message.value.trim()

    if(text) {
      const userId = $login.learn().user?.id

      if(encrypted) {
        if(!profile.persona && !profile.persona.bayun_group_id) {
          console.error('No bayun group id for persona')
          return
        }
        const { sessionId } = getSession()
        const encryptedText = await bayunCore.lockText(sessionId, text, BayunCore.EncryptionPolicy.GROUP, BayunCore.KeyGenerationPolicy.ENVELOPE, profile.persona.bayun_group_id);
        const { editId } = $.learn()
        const { data, error } = await supabase
          .from('log')
          .update({ text: encryptedText })  // Set deleted to true instead of deleting
          .match({ id: editId });

        if(error) {
          $.teach({ error })
          return
        }
      } else {
        const { editId } = $.learn()
        const { data, error } = await supabase
          .from('log')
          .update({ text })  // Set deleted to true instead of deleting
          .match({ id: editId });

        if(error) {
          $.teach({ error })
          return
        }
      }

      $.teach({ messageText: '', messageHeight: null, editId: null, messageMode: 'normal' })
    }
  }
}

$.when('keypress', '.edit-reply-form [name="replyText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    editReply(e)
  }
})

$.when('submit', '.edit-reply-form', (event) => {
  event.preventDefault()
  editReply(event)
})

async function editReply(event) {
  const root = event.target.closest($.link)

  const { threads, threadId, replyEditId, profile } = $.learn()

  const { type, encrypted } = threads[threadId][replyEditId]

  if(!type || type === 'text') {
    const message = root.querySelector('[name="replyText"]')

    const text = message.value.trim()

    if(text) {
      if(encrypted) {
        if(!profile.persona && !profile.persona.bayun_group_id) {
          console.error('No bayun group id for persona')
          return
        }
        const { sessionId } = getSession()
        const encryptedText = await bayunCore.lockText(sessionId, text, BayunCore.EncryptionPolicy.GROUP, BayunCore.KeyGenerationPolicy.ENVELOPE, profile.persona.bayun_group_id);
        const { data, error } = await supabase
          .from('log')
          .update({ text: encryptedText })  // Set deleted to true instead of deleting
          .match({ id: replyEditId });

        if(error) {
          $.teach({ error })
          return
        }
      } else {
        const { data, error } = await supabase
          .from('log')
          .update({ text })  // Set deleted to true instead of deleting
          .match({ id: replyEditId });

        if(error) {
          $.teach({ error })
          return
        }
      }

      $.teach({ replyText: '', replyHeight: null, replyId: null, threadMode: 'normal' })
    }
  }

}



$.when('keypress', '.new-message-form [name="messageText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send(e)
  }
})

$.when('submit', '.new-message-form', (event) => {
  event.preventDefault()
  send(event)
})

async function send(event) {
  const root = event.target.closest($.link)

  const { messageType, messageEncrypted } = $.learn()

  if(!messageType || messageType === 'text') {
    const message = root.querySelector('[name="messageText"]')

    const text = message.value.trim()

    if(text) {
      const { logBookId, profile } = $.learn()
      const userId = $login.learn().user?.id

      if(messageEncrypted) {
        if(!profile.persona && !profile.persona.bayun_group_id) {
          console.error('No bayun group id for persona')
          return
        }
        const { sessionId } = getSession()
        const encryptedText = await bayunCore.lockText(sessionId, text, BayunCore.EncryptionPolicy.GROUP, BayunCore.KeyGenerationPolicy.ENVELOPE, profile.persona.bayun_group_id);

        const { data, error } = await supabase
          .from('log')
          .insert([
            {
              log_book_id: logBookId,
              text: encryptedText,
              owner_id: userId,
              encrypted: messageEncrypted
            },
          ])
          .select()

        if(error) {
          $.teach({ error })
          return
        }
      } else {
        const { data, error } = await supabase
          .from('log')
          .insert([
            {
              log_book_id: logBookId,
              text,
              owner_id: userId,
            },
          ])
          .select()

        if(error) {
          $.teach({ error })
          return
        }
      }

      $.teach({ messageText: '', messageHeight: null })
    }
  }
}

$.when('keypress', '.new-reply-form [name="replyText"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendReply(e)
  }
})

$.when('submit', '.new-reply-form', (event) => {
  event.preventDefault()
  sendReply(event)
})

async function sendReply(event) {
  const root = event.target.closest($.link)

  const { replyType, replyEncrypted } = $.learn()

  if(!replyType || replyType === 'text') {
    const message = root.querySelector('[name="replyText"]')

    const text = message.value.trim()

    if(text) {
      const { logBookId, threadId, profile } = $.learn()
      const userId = $login.learn().user?.id

      if(replyEncrypted) {
        if(!profile.persona && !profile.persona.bayun_group_id) {
          console.error('No bayun group id for persona')
          return
        }
        const { sessionId } = getSession()
        const encryptedText = await bayunCore.lockText(sessionId, text, BayunCore.EncryptionPolicy.GROUP, BayunCore.KeyGenerationPolicy.ENVELOPE, profile.persona.bayun_group_id);

        const { data, error } = await supabase
          .from('log')
          .insert([
            {
              log_book_id: logBookId,
              parent_id: threadId,
              text: encryptedText,
              encrypted: replyEncrypted,
              owner_id: userId
            },
          ])
          .select()

        if(error) {
          $.teach({ error })
          return
        }
      } else {
        const { data, error } = await supabase
          .from('log')
          .insert([
            {
              log_book_id: logBookId,
              parent_id: threadId,
              text,
              owner_id: userId
            },
          ])
          .select()

        if(error) {
          $.teach({ error })
          return
        }
      }

      $.teach({ replyText: '', replyHeight: null })
    }
  }
}


$.style(`
  & {
    position: relative;
    height: 100%;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10000;
    background: var(--root-theme, transparent);
    mix-blend-mode: soft-light;
    opacity: .5;
  }

  & .inline-action {
    background: rgba(0,0,0,.25);
    padding: .5rem;
    color: rgba(255,255,255,.85);
    border: none;
    text-align: left;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: .5rem;
    border-radius: 4px;
  }

  & .inline-action:hover,
  & .inline-action:focus {
    background: rgba(0,0,0,.5);
  }

  & .inline-action sl-icon {
    padding-top: .125rem;
  }



  & .book-actions {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .book-actions button {
    background: rgba(0,0,0,.25);
    padding: .5rem;
    font-size: 1.2rem;
    color: rgba(255,255,255,.85);
    border: none;
    text-align: left;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: .5rem;
    border-radius: 4px;
    max-width: 20ch;
    width: 100%;
    margin: auto;
  }

  & .book-actions button sl-icon {
    padding-top: .25rem;
  }

  & .book-actions button:hover,
  & .book-actions button:focus {
    background: rgba(0,0,0,.5);
  }

  & .zero-state {
    height: 100%;
  }

  & .zero-state iframe {
    border: none;
    height: 100%;
    width: 100%;
  }

  & .chat-realm {
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    top: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    background: #2b2b2b;
    z-index: 10;
  }

  & .chat-realm.grabbed {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  & .chat-sidebar-inner {
    position: relative;
    padding: 3.5rem .5rem 1rem;
    overflow: auto;
    height: 100%;
    display: none;
  }

  & .chat-sidebar {
    background: #1c1c1c;
    color: white;
    overflow: auto;
  }

  & .chat-sidebar.light-sidebar {
    color: #1c1c1c;
    background: white;
  }
  & .show-sidebar .chat-sidebar {
    position; absolute;
    left: 0;
    display: block;
    width: clamp(240px, var(--sidebar-width, 320px), 100%);
    max-width: 100vw;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 25;
    padding-right: 10px;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  & .show-sidebar .chat-sidebar-inner {
    display: block;
  }

  & .chat-footer {
    padding: .5rem;
    position: absolute;
    bottom: 0;
    z-index: 100;
  }

  & .chat-footer .action-button {
    display: none;
    width: 100%;
  }
  & .show-sidebar .chat-footer .action-button {
    display: block;
  }

  & .show-sidebar .chat-footer .action-icon {
    display: none;
  }

  & .chat-footer .action-icon {
    display: block;
  }



  & .show-sidebar .chat-footer {
    position: relative;
  }

  & .modal-form {
    background: rgba(0,0,0,.5);
    border-radius: 4px;
    padding: 1rem;
  }

  & .action-button {
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.65);
    border-radius: 4px;
    padding: .5rem 1rem;
    font-weight: bold;
    border: none;
  }

  & .action-button:hover,
  & .action-button:focus {
    background: rgba(255,255,255,1);
    color: rgba(0,0,0,.85);
  }

  & .chat-panel {
    background: #303030;
    color: white;
    display: none;
    overflow: auto;
  }

  & .show-panel .chat-panel {
    position; absolute;
    right: 0;
    display: block;
    width: clamp(240px, var(--panel-width, 320px), 100%);
    padding-left: 10px;
    max-width: 100vw;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 25;
    display: block;
  }

  &  [data-resize-sidebar] {
    display: none;
  }
  & .show-sidebar [data-resize-sidebar] {
    position: absolute;
    display: block;
    top: 0;
    bottom: 0;
    left: clamp(240px, var(--sidebar-width, 320px), 100%);
    transform: translateX(-10px);
    width: 10px;
    background: rgba(255,255,255,.05);
    z-index: 10;
    cursor: col-resize;
  }

  & [data-resize-panel] {
    position: absolute;
    top: 0;
    bottom: 0;
    right: clamp(240px, var(--panel-width, 320px), 100%);
    transform: translateX(10px);
    width: 10px;
    background: rgba(255,255,255,.05);
    z-index: 10;
    cursor: col-resize;
  }

  & .chat-panel .chat-pane {
    padding-left: 10px;
  }

  & .chat-realm.show-sidebar {
    grid-template-columns: 1fr;
  }
  & .chat-realm.show-sidebar .profile-actions {
    padding: .5rem .5rem .5rem calc(34px + 1.5rem);
    flex-direction: row;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
  }

  & .profile-actions {
    display: flex;
    flex-direction: column;
    padding: calc(34px + 1.5rem) .5rem;
    height: 100%;
    justify-content: right;
    gap: 1rem;
    background: #181818;
    border-bottom: 1px solid rgba(0,0,0,.25);
    z-index: 25;
  }


  @media (min-width: 48rem) {
    & .chat-realm.show-sidebar {
      grid-template-columns: clamp(240px, var(--sidebar-width, 320px), 100%) 1fr;
    }

    & .chat-sidebar {
      position: relative !important;
    }
  }

  & .content-area {
    position: relative;
  }

  & .chat-pane {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto auto;
    position: absolute;
    inset: 0;
    padding-top: 51px;
  }

  & .unix-item {
    clear: both;
  }

  & [data-remove] {
    border: none;
    border-radius: 0;
    background: white;
    color: dodgerblue;
  }

  & [data-remove]:hover,
  & [data-remove]:focus {
    background-color: #E83FB8;
    color: white;
  }

  &[shell] {
    display: block;
    background: black;
    padding: 1rem;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  & .admin-grid {
    background: white;
    padding: 1rem;
    color: dodgerblue;
    display: grid;
  }

  @media (min-width: 640px) {
    & .admin-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }
  }

  & sticky-note {
    place-self: center;
  }

  & .log {
    overflow: auto;
    display: flex;
    flex-direction: column-reverse;
    overflow-anchor: auto !important;
    position: relative;
  }

  & .log-loader {
    transform: translateY(-1rem);
  }

  & .log-loader.for-replies {
    transform: translateY(0);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  & .chat-content {
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  & .post-actions {
    max-width: 100%;
    overflow: auto;
    padding: 4px;
    height: calc(2rem + 8px);
    background: rgba(0,0,0,.5);
  }

  & .encryption-type,
  & .post-type {
    border: none;
    border-radius: 100%;
    background: transparent;
    color: rgba(255,255,255,.65);
    padding: 0;
    display: grid;
    place-items: center;
    font-size: 1rem;
    width: 2rem;
    height: 2rem;
    line-height: 1;
  }

  & .encryption-type:hover,
  & .encryption-type:focus,
  & .post-type:hover,
  & .post-type:focus {
    color: rgba(255,255,255,1);
  }

  & .post-type-active,
  & .post-type-active:hover,
  & .post-type-active:focus {
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,1);
  }

  & .encryption-type-encrypted {
    color: mediumseagreen;
  }

  & .encryption-type-encrypted:hover,
  & .encryption-type-encrypted:focus {
    background: mediumseagreen;
    color: white;
  }

  & .encryption-type-unencrypted {
    color: firebrick;
  }

  & .encryption-type-unencrypted:hover,
  & .encryption-type-unencrypted:focus {
    background: firebrick;
    color: white;
  }

  & .encryption-type-unauthenticated {
    color: gold;
  }

  & .encryption-type-unauthenticated:hover,
  & .encryption-type-unauthenticated:focus {
    background: gold;
    color: white;
  }

  & .post-actions-inner {
    display: flex;
    gap: .25rem;
  }

  & .encryption-status {
    margin-left: auto;
  }
  & .post-actions {
  }
  & .edit-actions {
    padding: 4px;
    background: rgba(255,255,255,.15);
  }

  & [data-edit-reply-cancel],
  & [data-edit-cancel] {
    background: rgba(0,0,0,.25);
    padding: .5rem 1rem;
    color: rgba(255,255,255,.85);
    border: none;
    text-align: left;
    border-radius: 4px;
  }

  & .edit-reply-form,
  & .edit-message-form {
    width: 100%;
    position: relative;
    z-index: 2;
  }

  & .edit-reply-form input,
  & .edit-message-form input {
    border: 1px solid orange;
    background: rgba(255,255,255,.15);
    padding: 0 1rem;
    color: white;
    border-radius: 1rem;
    width: 100%;
  }

  & .new-reply-form,
  & .new-message-form {
    width: 100%;
    position: relative;
    z-index: 2;
  }

  & .new-reply-form input,
  & .new-message-form input {
    border: 1px solid orange;
    background: rgba(255,255,255,.15);
    padding: 0 1rem;
    color: white;
    border-radius: 1rem;
    width: 100%;
  }

  @media print {
    & button, & .new-message-form {
      display: none;

    }
    body {
      overflow: visible !important;
    }
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 2;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
		padding-right: 1rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

  & .grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    height: 100%;
    max-height: 100vh;
  }

  & [name="replyText"],
  & [name="messageText"] {
    width: 100%;
    display: block;
    resize: none;
    background: black;
    border: none;
    color: rgba(255,255,255,.85);
    border-radius: 0;
    padding: 8px 48px 8px 8px;
    max-height: 35vh;
    font-size: 1rem;
  }

  & [name="replyText"]:focus,
  & [name="messageText"]:focus {
    outline-offset: -2px;
    outline-color: rgba(255,255,255,.5);
  }

  & .actions {
    display: flex;
    justify-content: end;
  }

  & .text-well {
    position: relative;
  }
  
  & .wip-uploader {
    padding: 1rem;
    background: rgba(0,0,0,.85);
    color: white;
  }

  & .edit,
  & .send {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 34px;
    height: 34px;
    background: dodgerblue;
    color: white;
    font-size: 16px;
    padding: .5rem;
    z-index: 1;
    border-radius: 100%;
    transition: background-color 200ms ease-in-out;
    border: none;
  }

  & .message {
    position: relative;
    border: none;
    margin: 0 .5rem .5rem;
    background: white;
    border-radius: 4px;
    overflow: hidden;
  }

  & .message .encrypted-chip {
    position: absolute;
    pointer-event: none;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: dodgerblue;
    opacity: .5;
  }

  & .message-response {
    grid-column: -1 / 1;
  }

  & .message-actions {
    grid-column: -1 / 1;
    padding: 8px;
    background: black;
  }

  & .message-actions:empty {
    display: none;
  }

  & .message-actions button {
    background: dodgerblue;
    border: none;
    border-radius: 4px;
    color: white;
    padding: .5rem;
    font-size: 1rem;
  }

  & .message .body {
    overflow-wrap: break-word;
    vertical-align: top;
    padding: 0 .5rem;
  }

  & .message.has-thread {
    margin-bottom: 2rem;
    overflow: visible;
  }

  & .message .show-thread {
    position: absolute;
    bottom: 0;
    transform: translateY(100%);
    padding: 0;
    border: none;
    border-radius: 0;
    color: rgba(255,255,255,.65);
    background: transparent;
    right: 0;
    font-size: .9rem;
    padding: .25rem .5rem;
  }


  & .message .show-thread:hover,
  & .message .show-thread:focus {
    color: rgba(255,255,255,.65);
  }

  & .message {
    word-break: break-word;
  }

  & .message.other {
    margin-right: 3rem;
    background: rgba(0,0,0,.25);
    color: rgba(255,255,255,.85);
    grid-template-columns: auto 1fr auto;
    display: grid;
  }

  & .ai-message {
    padding: 1rem;
    position: relative;
    color: rgba(255,255,255,.85);
  }

  & .ai-name {
    font-weight: bold;
    text-align: center;
  }

  & .ai-body {
    word-break: break-word;
    overflow: auto;
    max-width: 55ch;
    margin: 0 auto;
  }
  & .message.me {
    display: grid;
    grid-template-columns: 1fr auto;
    margin-left: 3rem;
    background: rgba(0,0,0,.65);
    color: rgba(255,255,255,.85);
  }


  & .message .meta {
    padding: 8px;
  }

  & .message-picture {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    border: none;
    padding: 0;
    background: transparent;
  }

  & .message-picture img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  & .human-prompt {
    position: absolute;
    z-index: 9000;
    inset: 0;
    display: none;
    background: rgba(0,0,0,.65);
    padding: 0;
    margin: auto;
    display: grid;
    place-items: center;
  }

  & .human-app {
    display: grid;
    grid-template-rows: 3rem 1fr;
    height: 100%;
  }

  & .human-app-title {
    font-weight: bold;
    text-align: center;
    color: white;
    font-size: 1.5rem;
    line-height: 3rem;
  }

  & .human-prompt.active {
    display: block;
  }

  & .human-prompt iframe {
    max-width: 55ch;
    margin: auto;
  }

  & .human-unprompt {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    top: .5rem;
    right: .5rem;
    z-index: 20;
    font-size: 16px;
  }

  & .custom-overlay,
  & .channel-actions-overlay {
    position: absolute;
    inset: 0;
    paddin: 1rem;
    z-index: 100;
    background: rgba(0,0,0,.85);
    overflow: hidden;
  }

  & .custom-overlay {
    background: white;
  }

  & .channel-actions-header {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(255,255,255,.75);
    margin-bottom: 1rem;
    margin-right: 34px;
  }

  & .channel-actions-body {
    background: rgba(69,69,69,1);
    max-width: 100%;
    width: 55ch;
    padding: 1rem;
    color: white;
    position: relative;
    margin: 0 auto;
    max-height: 100%;
    overflow: auto;
  }

  & .settings-modal-header {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(0,0,0,.75);
    margin-bottom: 1rem;
    margin-right: 34px;
  }

  & .custom-body {
    position: relative;
    max-height: 100%;
    overflow: auto;
    height: 100%;
  }
  & .settings-modal-body {
    position: relative;
    max-height: 100%;
    max-width: 55ch;
    margin: 0 auto;
    overflow: auto;
    background: white;
    padding: 1rem;
  }

  & .book-users {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  & .book-group-member {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    border-radius: 4px;
    background: rgba(255,255,255,.15);
    gap: 1rem;
    padding: .5rem;
    align-items: center;
  }

  & .book-group-nonmember {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    background: rgba(255,255,255,.15);
    border-radius: 4px;
    gap: 1rem;
    padding: .5rem;
    align-items: center;
  }

  & .member-handle {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .member-picture img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  & .channel-actions {
    display: flex;
    place-items: center;
    gap: .5rem;
    position: absolute;
    padding: .5rem;
    left: 0;
    top: 0;
    right: 0;
    z-index: 9;
    background: #3d3d3d;
    justify-content: end;
  }

  & .close-channel-actions {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    top: .5rem;
    right: .5rem;
    z-index: 9;
    font-size: 16px;
  }

  & .panel-actions {
    display: flex;
    place-items: center;
    gap: .5rem;
    position: absolute;
    padding: .5rem;
    left: 0;
    top: 0;
    right: 0;
    z-index: 9;
    background: #3d3d3d;
    justify-content: end;
  }

  & .action-icon {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    font-size: 16px;
  }

  & .sidebar-toggle {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    position: absolute;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    top: .5rem;
    left: .5rem;
    z-index: 20;
    font-size: 16px;
  }

  & .profile-photo img {
    object-fit: cover;
    height: 100%;
  }

  & .ai-context,
  & .thread-context,
  & .message-context {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    overflow: hidden;
    color: rgba(255,255,255,.35);
    z-index: 20;
    font-size: 16px;
    background: transparent;
    border: none;
  }

  & .ai-context {
    position: absolute;
    right: .5rem;
    top: .5rem;
  }

  & .ai-context:hover,
  & .thread-context:hover,
  & .message-context:hover {
    color: rgba(255,255,255,.85);
  }

  & .logout-icon {
    margin-left: auto;
    margin-top: auto;
  }

  & .plus-icon,
  & .profile-icon,
  & .profile-photo,
  & .logout-icon {
    padding: 0;
    border-radius: 100%;
    display: grid;
    place-items: center;
    background: white;
    width: 34px;
    height: 34px;
    overflow: hidden;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.35);
    background: black;
    z-index: 20;
    font-size: 16px;
  }

  & .profile-photo {
    display: block;
  }

  & .profile-icon.secure {
    background: mediumseagreen;
  }

  & .profile-icon.insecure {
    background: firebrick;
  }

  & .sidebar-title {
    font-weight: bold;
    font-size: 1rem;
    color: rgba(255,255,255,.4);
    margin-bottom: .5rem;
    padding: 1rem 0 0;
    display: grid;
    place-items: end start;
    grid-template-columns: 1fr auto;
  }

  & .sidebar-action.active {
    background: rgba(255,255,255,.2);
  }

  & .sidebar-action {
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: .5rem;
    border: none;
    border-radius: 4px;
    display: block;
    width: 100%;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  @media (min-width: 60rem) {
  }

  & .load-more-replies,
  & .load-more-messages {
    transform: translateY(20px);
  }

  & .setting {
    display: block;
    padding: 1rem;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
    padding: .5rem 1rem;
    border: none;
    color: white;
    display: inline-block;
  }

  & .setting:not(.focused) > * {
    pointer-events: none;
  }

  & .setting.focused .message-body {
    font-weight: bold;
  }

  & .setting-label {
    color: rgba(255,255,255,.85);
    font-weight: bold;
  }

  & .setting-description {
    color: rgba(255,255,255,.65);
  }

  & .setting.focused .setting-label {
    color: rgba(0,0,0,.85);
    font-weight: bold;
  }

  & .setting.focused .setting-description {
    color: rgba(0,0,0,.65);
  }

  & .setting-options {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }

  & .setting-options .option:not(.selected) {
    display: none;
  }

  & .setting.focused {
    color: black;
    background: white;
  }

  & .setting.focused .option {
    display: block;
  }

  & .option.selected {
    display: block;
  }

  & .option {
    border: none;
    border-radius: 2px;
    white-space: nowrap;
    padding: 4px 8px;
    color: rgba(0,0,0,.85);
  }

  & .option.selected {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), var(--root-theme, black);
    color: white;
  }

  & .options-list {
    overflow-x: auto;
    max-width: 100%;
  }

  & .as-link {
    padding: 0;
    text-decoration: underline;
    color: dodgerblue;
    background: transparent;
    border: none;
    cursor: pointer;
  }
`)

const sideEffects = {
  theme: (value) => {
    setTheme(value)
  },
  fontSize: (value) => {
    setFontSize(value)
  },
  fontFamily: (value) => {
    setFontFamily(value)
  },
}

function settingsChange(settingsKey, nextValue) {
  if(sideEffects[settingsKey]) {
    sideEffects[settingsKey](nextValue)
  }
}

function selectedSettingsReducer(state, payload) {
  const { settingsKey } = state
  return {
    ...state,
    settings: {
      ...state.settings,
      [settingsKey]: {
        ...state.settings[settingsKey],
        value: payload.value
      }
    }
  }
}

$.when('click', '.setting', (event) => {
  const { key } = event.target.dataset
  $.teach({ settingsKey: key })
})

$.when('click', '.setting.focused .option', () => {
  const { value } = event.target.dataset

  const { settingsKey } = $.learn()

  settingsChange(settingsKey, value)

  $.teach({
    value
  }, selectedSettingsReducer)
})




$.when('click', '.markdown a', (event) => {
  event.preventDefault()
  self.open(event.target.getAttribute('href'), '_blank');
})

$.when('click', '.chat-notification', () => {
  $.teach({ chatActive: true, notification: null })
})

$.when('click', '.sidebar-toggle', () => {
  $.teach({ sidebar: !$.learn().sidebar })
})

$.when('click', '.launch-app', (event) => {
  const { url } = event.target.dataset
  $.teach({
    sidebar: false,
    panel: false,
    threadId: null,
    logBookId: null,
    logBookName: null,
    paneUrl: url
  })
})


$.when('click', '.launch-meeting', (event) => {
  const { room } = event.target.dataset
  showModal(`
    <hive-meet room="${room}"></hive-meet>
  `)
})

$.when('click', '.open-channel-actions', () => {
  $.teach({ settingsModal: 'list' })
})

$.when('click', '.close-panel', (event) => {
  $.teach({ panel: false, threadId: null })
})

$.when('click', '.close-channel-actions', () => {
  $.teach({ settingsModal: null })
})


$.when('click', '.group-invite', async (event) => {
  const { book, member } = event.target.dataset
  
  const { data, error } = await supabase
    .from('log_group')
    .insert([{ log_book_id: book, member_id: member }]);

  if (error) console.error(error);
  fetchGroupMembers(book)
})

$.when('click', '.group-leave', async (event) => {
  const { book, member } = event.target.dataset
  
  const { error } = await supabase
  .from('log_group')
  .delete()
  .match({ log_book_id: book, member_id: member });

  if (error) console.error(error);
  $.teach({
    settingsModal: null,
    logBookId: null,
    logBookName: null,
    paneUrl: null
  })
})

$.when('click', '.book-delete', async (event) => {
  const { book } = event.target.dataset
  
  const { error } = await supabase
    .from('log_book')
    .update({ deleted: true })  // Set deleted to true instead of deleting
    .match({ id: book });

  if (error) console.error(error);
  $.teach({
    settingsModal: null,
    logBookId: null,
    logBookName: null,
    paneUrl: null
  })
})



$.when('click', '.group-remove', async (event) => {
  const { book, member } = event.target.dataset
  
  const { error } = await supabase
  .from('log_group')
  .delete()
  .match({ log_book_id: book, member_id: member });

  if (error) console.error(error);
  fetchGroupMembers(book)
})

$.when('click', '.channel-invite', async (event) => {
  const { logBookId } = $.learn()
  $.teach({ settingsModal: 'loading', groupMembers: [], nonGroupMembers: [] })

  fetchGroupMembers(logBookId)
})

async function fetchGroupMembers(logBookId) {
  const { data: memberIds, error: memberError } = await supabase
    .from('log_group')
    .select('member_id')
    .eq('log_book_id', logBookId);

  if (memberError) console.error("Error fetching member IDs:", memberError);

  // Convert to array (handle null case)
  const memberIdArray = memberIds?.map(row => row.member_id) || [];

  const userId = $login.learn().user?.id
  memberIdArray.push(userId)

  const usersNotInLogGroupQuery = memberIdArray.length
    ? supabase
        .from('user_emails')
        .select('user_id, email, nick, picture') // No duplicate column issue
        .not('user_id', 'in', `(${memberIdArray.join(',')})`)
    : supabase.from('user_emails').select('user_id, email, nick, picture');

  const usersInLogGroupQuery = memberIdArray.length
    ? supabase
        .from('user_emails')
        .select('user_id, email, nick, picture')
        .in('user_id', memberIdArray)
    : Promise.resolve({ data: [], error: null });

  const [usersNotInLogGroup, usersInLogGroup] = await Promise.all([
    usersNotInLogGroupQuery,
    usersInLogGroupQuery
  ]);

  $.teach({ settingsModal: 'invite', groupMembers: usersInLogGroup.data || [], nonGroupMembers: usersNotInLogGroup.data || [] })

}



export function launchAI() {
  $.teach({ chatActive: true })
}

$.when('click', '.chat-toggle', () => {
  const { chatActive } = $.learn()
  const next = !chatActive
  $.teach({ chatActive: next, notification: null })
})

$.when('focus', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('input', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('blur', '[name="messageText"]', (event) => {
  clearCursor(event.target.closest($.link))
});

$.when('focus', '[name="replyText"]', (event) => {
  $.teach({ replyHeight: event.target.scrollHeight })
});

$.when('input', '[name="replyText"]', (event) => {
  $.teach({ replyHeight: event.target.scrollHeight })
});

$.when('blur', '[name="replyText"]', (event) => {
  clearCursor(event.target.closest($.link))
});



$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})


$.when('pointerdown', '[data-resize-sidebar]', event => {
  $.teach({ grabbing: true })
  document.addEventListener("pointermove", resizeSidebar, false);
  document.addEventListener("pointerup", () => {
    $.teach({ grabbing: false })
    document.removeEventListener("pointermove", resizeSidebar, false);
  }, false);
})

function resizeSidebar(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = event.touches[0].clientX
  } else {
    width = event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}

$.when('pointerdown', '[data-resize-panel]', event => {
  $.teach({ grabbing: true })
  document.addEventListener("pointermove", resizePanel, false);
  document.addEventListener("pointerup", () => {
    $.teach({ grabbing: false })
    document.removeEventListener("pointermove", resizePanel, false);
  }, false);
})

function resizePanel(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = window.innerWidth - event.touches[0].clientX
  } else {
    width = window.innerWidth - event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--panel-width", size);
}


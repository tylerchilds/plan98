import elf from "@silly/elf"
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'

import { BskyAgent } from '@atproto/api'

let agent

const defaultCreds = {
  service: 'https://1998.social',
  moniker: 'tychi.1998.social'
}

const blueskyCreds = {
  service: localStorage.getItem('blue-sky/service') || defaultCreds.service,
  moniker: localStorage.getItem('blue-sky/moniker') || defaultCreds.moniker
}

const modes = {
  me: 'me',
  timeline: 'timeline',
  alerts: 'alerts',
  settings: 'settings',
}

const navigation = {
  [modes.me]: {
    icon: '',
    label: 'Profile'
  },
  [modes.timeline]: {
    icon: '',
    label: 'Timeline'
  },
  [modes.alerts]: {
    icon: '',
    label: 'Alerts'
  },
  [modes.settings]: {
    icon: '',
    label: 'Settings'
  },
}

const $ = elf('blue-sky', {
  service: blueskyCreds.service,
  moniker: blueskyCreds.moniker,
  password: '',
  mode: modes.timeline,
})

// Resume a session from stored data
function resumeSession() {
  const savedSession = localStorage.getItem('blue-sky/session')
  if (savedSession) {
    const { service } = $.learn()
    try {
      agent = new BskyAgent({
        service
      })

      const sessionData = JSON.parse(savedSession)
      agent.resumeSession(sessionData)
      $.teach({ authenticated: true })
    } catch (error) {
      console.error('Failed to resume session:', error)
    }
  }
}

resumeSession()

const cursors = {}
async function fetchMyTimeline() {
  const cursor = cursors.myTimeline
  const response = await agent.getAuthorFeed({
    cursor,
    actor: agent.session?.handle, // Or agent.session?.did
    limit: 20
  });

  if (response.success) {
    const { feed, cursor } = response.data;
    cursors.myTimeline = cursor
    $.teach(feed, mergeFeed('myTimeline'))
  } else {
    console.error('Failed to fetch your posts:', response.error);
  }
}

function fetchHomeTimeline() {
  const cursor = cursors.homeTimeline || ''
  agent.getTimeline({
    cursor,
    limit: 30,
  }).then(({ data }) => {
    const { feed, cursor } = data
    cursors.homeTimeline = cursor
    $.teach(feed, mergeFeed('homeTimeline'))
  });
}

function mergeFeed(feed) {
  return (state, payload) => {
    const all = state[feed] || []
    return {
      ...state,
      [feed]: [...all, ...payload]
    }
  }
}

function fetchAlerts() {
  const cursor = cursors.alerts || ''
  agent.listNotifications({
    cursor,
    limit: 20 // Optional: number of notifications to retrieve
  }).then(({ data }) => {
    const { notifications, cursor } = data
    cursors.alerts = cursor
    $.teach(notifications, mergeFeed('alerts'))
  })
}

async function fetchProfile() {
  try {
    // Assuming you have your handle stored in a variable called 'myHandle'
    const response = await agent.getProfile({
      actor: agent.session?.handle, // Or agent.session?.did if you have that
    });

    if (response.success) {
      const profile = response.data;
      $.teach({ profile })
      fetchMyTimeline()
    } else {
      console.error('Failed to fetch profile:', response.error);
    }
  } catch (error) {
    console.error('An error occurred while fetching your profile:', error);
  }
}

$.when('click', '[data-mode]', (event) => {

  const { mode } = event.target.dataset
  if(modes[mode]) {
    $.teach({ mode })
  }
})

$.when('click', '[data-draft]', (event) => {
  $.teach({ drafting: true })
})

$.when('click', '[data-mode-error]', (event) => {
  $.teach({ mode: modes.timeline })
})


$.when('click', '[data-logout]', (event) => {
  logout()
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const { service, moniker } = $.learn()

  localStorage.setItem('blue-sky/service', service)
  localStorage.setItem('blue-sky/moniker', moniker)

  login()
})

async function login() {
  const { service, moniker, password} = $.learn()

  if(!service) return

  try {
    agent = new BskyAgent({
      service
    })

    const { success, data } = await agent.login({
      identifier: moniker,
      password
    })

    console.log(data)

     // Save session data for persistence
    if (success) {
      const sessionData = agent.session
      localStorage.setItem('blue-sky/session', JSON.stringify(sessionData))

      $.teach({ authenticated: true })
    }
  } catch (error) {
    console.error('Login failed:', error)
    return false
  }
}

async function logout() {

  localStorage.removeItem('blue-sky/service')
  localStorage.removeItem('blue-sky/moniker')
  localStorage.removeItem('blue-sky/session')


  $.teach({
    authenticated: false,
    moniker: defaultCreds.moniker,
    service: defaultCreds.service,
  })
}

function loginForm() {
  const { service, moniker, password } = $.learn()

  return `
    <form method="post">
      <label class="field">
        <span class="label">Service</span>
        <input data-bind value="${service}" type="text" name="service" placeholder="https://1998.social" required/>
      </label>
      <label class="field">
        <span class="label">Handle</span>
        <input data-bind value="${moniker}" type="text" name="moniker" placeholder="tychi.1998.social" required/>
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input data-bind value="${password}" type="password" name="password"  required/>
      </label>
      <button type="submit">
        Connect
      </button>
    </form>
  `
}

function renderPost({ post }) {
  return `
    <div class="post">
      <div class="post-gutter">
        <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="post-handle">
            ${post.author.displayName}
          </a>
          <span class="post-timestamp">
            <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${escapeHyperText(post.record.text)}</div>
      </div>
    </div>
  `
}

function renderNotification(post) {
  return `
    <div class="post">
      <div class="post-gutter">
        <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="post-handle">
            ${post.author.displayName}
          </a>
          ·
          <sl-relative-time date="${post.indexedAt}" format="long"></sl-relative-time>
        </div>
        <div class="body">${escapeHyperText(post.reason)}</div>
      </div>
    </div>
  `
}


const modeRenderers = {
  [modes.me]: (target) => {
    const { profile } = $.learn()

    if(!profile) {
      fetchProfile()
      return `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
    }

    const {
      avatar,
      banner,
      createdAt,
      displayName,
      handle,
      description,
      followersCount,
      followsCount,
      postsCount
    } = profile

    const { myTimeline } = $.learn()

    return `
      <button class="new-post" data-draft>
        New
      </button>
      <div class="profile">
        <div class="hero">
          <img src="${banner}" />
        </div>
        <div class="profile-information">
          <div class="profile-gutter">
            <div class="profile-picture">
              <img src="${avatar}" class="profile-avatar" />
            </div>
          </div>
          <div class="profile-content">
            <div class="profile-stats">
              <div class="stat">
                <div class="stat-value">
                  ${followersCount}
                </div>
                <div class="stat-label">
                  Followers
                </div>
              </div>
              <div class="stat">
                <div class="stat-value">
                  ${followsCount}
                </div>
                <div class="stat-label">
                  Following
                </div>
              </div>
              <div class="stat">
                <div class="stat-value">
                  ${postsCount}
                </div>
                <div class="stat-label">
                  Posts
                </div>
              </div>
            </div>
          </div>
          <div class="profile-contact">
            <div class="profile-displayname">
              ${displayName}
            </div>
            <div class="profile-handle">
              ${handle}
            </div>
            <div class="profile-description">
              ${description}
            </div>
            <div class="profile-since">
              since: <sl-format-date date="${createdAt}" month="long" year="numeric"></sl-format-date>
            </div>
          </div>
        </div>
        <div class="feed">
          ${myTimeline ? myTimeline.map(renderPost).join('') : ''}
        </div>
      </div>
    `

  },
  [modes.timeline]: (target) => {
    const { homeTimeline } = $.learn()

    if(!homeTimeline) {
      fetchHomeTimeline()
      return `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
    }

    return `
      <div class="feed">
        ${homeTimeline.map(renderPost).join('')}
      </div>
      <button class="new-post" data-draft>
        New
      </button>
    `
  },
  [modes.alerts]: (target) => {
    const { alerts } = $.learn()

    if(!alerts) {
      fetchAlerts()
      return `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
    }

    return `
      <div class="feed">
        ${alerts.map(renderNotification).join('')}
      </div>
    `
  },
  [modes.settings]: (target) => {
    return `
      <button data-logout>logout</button>
    `
  },
}

function non() {
  return `
    You're lost.
    <button data-mode-error>
      Return Home
    </button>
  `
}

function renderByMode(target) {
  const { mode } = $.learn()

  return (modeRenderers[mode] || non)(target)
}

function postOverlay(target) {
  const { drafting }  = $.learn()

  if(!drafting) return

  return `
    <div class="post-overlay">
      <form class="send-form" data-command="enter">
        <button data-tooltip="send" class="button send" type="submit" data-command="enter">
          <sl-icon name="arrow-up"></sl-icon>
        </button>
        <div class="text-well">
          <textarea name="message" placeholder="Today..."></textarea>
        </div>
      </form>
    </div>
  `
}

$.draw(target => {
  const { authenticated, mode } = $.learn()

  if(!authenticated) {
    return loginForm()
  }

  const view = `
    <div class="app">
      <div class="sidebar">
        ${Object.keys(navigation).map((key) => {
          const { icon, label } = navigation[key]
          return `
            <button data-mode="${key}" class="tab ${mode === key ? 'active':''}">
              <span class="navigation-icon">
                ${icon}
              </span>
              <span class="navigation-label">
                ${label}
              </span>
            </button>
          `
        }).join('')}
      </div>
      <div class="content">
        ${renderByMode(target)}
      </div>
      ${postOverlay(target) || ''}
    </div>
  `

  return view
}, {
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
    }
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

$.style(`
  & {
    position: relative;
    display: block;
    overflow: hidden;
    height: 100%;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
  }

  & .app {
    display: grid;
    grid-template-columns: auto 1fr;
    overflow: hidden;
    height: 100%;
    max-width: 48rem;
    margin: 0 auto;
  }

  & .post-overlay {
    position: absolute;
    inset: 0;
  }

  & .content {
    height: 100%;
    overflow: auto;
    background: rgba(255,255,255,.65);
  }

  & .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: rgba(0,0,0,.65);
  }

  & .sidebar button {
    text-align: left;
    padding: .5rem;
    border-radius: 0;
    border: none;
    color: var(--root-theme, mediumseagreen);
    background: none;
  }

  & .new-post {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
  }

  & .feed {
    display: flex;
    flex-direction: column;
  }

  & .post {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: .5rem;
    border-bottom: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .post-avatar {
    border-radius: 100%;
    display: block;
    overflow: hidden;
  }

  & .post-timestamp {
    color: rgba(0,0,0,.45);
    float: right;
  }

  & .sidebar .tab {
    background: rgba(0,0,0,.85);
  }

  & .sidebar .tab.active {
    color: rgba(0,0,0,.85);
    background: var(--root-theme, mediumseagreen);
  }

  & .profile-information {
    display: grid;
    grid-template-columns: 132px 1fr;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    position: relative;
    padding: .5rem 1rem;
  }

  & .profile-picture {
    position: absolute;
    top: -66px;
  }

  & .profile-avatar {
    border-radius: 100%;
    border: 2px solid rgba(0,0,0,.25);
    width: 128px;
    height: 128px;
  }

  & .profile-contact {
    grid-column: -1 / 1;
    padding: 1rem 0 0;
  }

  & .profile-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  & .stat {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  & .stat-value {
    font-weight: bold;
  }

  & .stat-label {
    color: rgba(255,255,255,.65);
  }

  & .profile-displayname {
    font-size: 2rem;
    font-weight: bold;
    color: rgba(255,255,255,1);
  }

  & .profile-handle {
    color: rgba(255,255,255,.45);
  }

  & .profile-description {
    
  }

  & .profile-since {
    color: rgba(255,255,255,.65);
  }
`)

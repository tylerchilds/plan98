import elf from "@silly/elf"

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
  home: 'home',
  alerts: 'alerts',
  settings: 'settings',
}

const navigation = {
  [modes.me]: {
    icon: '',
    label: 'My Profile'
  },
  [modes.home]: {
    icon: '',
    label: 'Home'
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
  mode: modes.home,
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
  $.teach({ mode: modes.home })
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
        <div class="profile-columns">
          <div class="profile-information">
            <img src="${avatar}" />
            ${displayName}
            ${handle}
            ${followersCount}
            ${followsCount}
            ${postsCount}
            ${description}
            ${createdAt}
          </div>
          <div class="profile-actions">
            <button>
              Edit Profile
            </button>
          </div>
        </div>
        <div class="profile-feed">
          ${myTimeline ? myTimeline.map(({ post }) => {
            return `
              <div aria-role="button" class="message">
                <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="meta" data-tooltip='${post.author.handle}'>
                  <img src="${post.author.avatar}" class="avatar" />
                  ${post.author.displayName}
                </a>
                <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
                <div class="body">${escapeHyperText(post.record.text)}</div>
              </div>
            `
          }).join('') : ''}
        </div>
      </div>
    `

  },
  [modes.home]: (target) => {
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
        ${homeTimeline.map(({ post }) => {
          return `
            <div aria-role="button" class="message">
              <a href="https://bsky.app/profile/${post.author.handle}" target="_blank" class="meta" data-tooltip='${post.author.handle}'>
                <img src="${post.author.avatar}" class="avatar" />
                ${post.author.displayName}
              </a>
              <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
              <div class="body">${escapeHyperText(post.record.text)}</div>
            </div>
          `
        }).join('')}
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
      <div class="alerts">
        ${alerts.map((alert) => {
          return `
            <div aria-role="button" class="message">
              <a href="https://bsky.app/profile/${alert.author.handle}" target="_blank" class="meta" data-tooltip='${alert.author.handle}'>
                <img src="${alert.author.avatar}" class="avatar" />
                ${alert.author.displayName}
              </a>
              <sl-relative-time date="${alert.indexedAt}" format="long"></sl-relative-time>
              <div class="body">${alert.reason}</div>
            </div>
          `
        }).join('')}
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
  const { authenticated } = $.learn()

  if(!authenticated) {
    return loginForm()
  }

  const view = `
    <div class="app">
      <div class="sidebar">
        ${Object.keys(navigation).map((key) => {
          const { icon, label } = navigation[key]
          return `
            <button data-mode="${key}">
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
  }

  & .app {
    display: grid;
    grid-template-columns: auto 1fr;
    overflow: hidden;
    height: 100%;
  }

  & .post-overlay {
    position: absolute;
    inset: 0;
  }

  & .content {
    height: 100%;
    overflow: auto;
  }

  & .sidebar {
    display: flex;
    flex-direction: column;
  }

  & .new-post {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
  }
`)

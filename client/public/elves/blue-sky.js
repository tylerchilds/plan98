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

const $ = elf('blue-sky', {
  feed: null,
  service: blueskyCreds.service,
  moniker: blueskyCreds.moniker,
  password: ''
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

function fetchTimeline() {
  agent.getTimeline({
    cursor: "",
    limit: 30,
  }).then(({ data }) => {
    $.teach({ feed: data.feed })
  });
}

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

$.draw(target => {
  const { feed, authenticated } = $.learn()

  if(!authenticated) {
    return loginForm()
  }

  if(authenticated && !feed) {
    fetchTimeline()
    return
  }

  const view = `
    <div class="log">
      <button data-logout>logout</button>
      <div class="content">
        ${feed.map(({ post }) => {
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
    </div>
    <form class="send-form" data-command="enter">
      <button data-tooltip="send" class="button send" type="submit" data-command="enter">
        <sl-icon name="arrow-up"></sl-icon>
      </button>
      <div class="text-well">
        <textarea name="message" placeholder="Today..."></textarea>
      </div>
    </form>
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


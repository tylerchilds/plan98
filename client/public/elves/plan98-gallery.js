import { Self } from "@plan98/types"

import {
  getPersona,
} from './secure-persona.js'

import {
  getSession
} from './bayun-wizard.js'

import { get, put } from './plan98-wallet.js'

const views = {
  createPost: 'createPost',
  account: 'account',
  profile: 'profile',
}

const $ = Self('plan98-gallery', {
  draft: '',
  draftHeight: null
})

$.when('json-rpc', 'quick-start', async (event) => {
  if(event.detail.method === 'done') {
    event.target.closest($.link).innerHTML = ''
    $.teach({ authenticated: true })
  }
})

function getTimeline(id) {
  const state = $.learn()
  return state[id] || []
}

function setTimeline(timelineUR, post) {
  $.teach({ timelineUR, post }, (state, payload) => {
    return {
      ...state,
      [payload.timelineUR]: [
        ...(state[payload.timelineUR] || []),
        payload.post
      ]
    }
  })
}

export async function fetchTimeline(timelineUR = "public") {
  const timelinePath = `/${$.link}/${timelineUR}.json`
  return await get(timelinePath)
}

export async function publish(post, timelineUR = "public") {
  const { companyEmployeeId, companyName } = $.learn()
  const timelinePath = `/${$.link}/${timelineUR}.json`

  const resource = {
    uri: timelinePath,
    cid: crypto.randomUUID(),
    author: {
      moniker: companyEmployeeId,
      group: companyName
    },
    record: post
  }

  setTimeline(timelineUR, resource)

  const response = await get(timelinePath)
    .catch(error => {
      console.error(error)
    })

  if(response) {
    const json = await response.text()
    const data = JSON.parse(json)

    put(timelinePath, JSON.stringify({
      ...data,
      timeline: [
        ...(data.timeline || []),
        resource
      ]
    }), { type: 'application/json' })
  } else {
    put(timelinePath, JSON.stringify({
      timeline: [
        resource
      ]
    }), { type: 'application/json' })
  }
}

function getProfile() {
  return {
    avatar: null,
    banner: null,
    createdAt: new Date().toISOString(),
    moniker: 'Anonymous User',
    group: 'anonymous',
    description: '',
    followersCount: 0,
    followingCount: 0,
    mutualsCount: 0,
    viewer: {}
  }
}

function setProfile(targetId, profile) {
  $.teach({ [`profile-${targetId}`]: profile })
}

function getTimelineUR(target) {
  return target.closest('face-less').getAttribute('ur') || 'public'
}

$.when('click', '.manage-account', (event) => {
  const timelineUR = getTimelineUR(event.target)
  $.teach({ activeTimeline: timelineUR, currentView: views.account })
})

$.when('click', '.view-profile', (event) => {
  const timelineUR = getTimelineUR(event.target)
  $.teach({ activeTimeline: timelineUR, currentView: views.profile })
})


$.when('click', '.new-post', (event) => {
  const timelineUR = getTimelineUR(event.target)
  $.teach({ activeTimeline: timelineUR, currentView: views.createPost })
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: '', draftHeight: null, currentView: views.profile })
})

$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  const { draft, activeTimeline } = $.learn()
  
  if (!draft.trim()) return

  // Bluesky-compatible post structure
  const historicalNugget = {
    $type: 'computer.sillyz.data.text',
    text: draft,
    createdAt: new Date().toLocaleString('en-us'),
  }

  publish(historicalNugget, activeTimeline)

  $.teach({ draft: '', draftHeight: null, currentView: views.profile })
})

$.when('input', '[data-input]', (event) => {
  $.teach({ [event.target.name]: event.target.value })
})

$.when('focus', '[name="draft"]', (event) => {
  $.teach({ draftHeight: event.target.scrollHeight })
})

$.when('input', '[name="draft"]', (event) => {
  $.teach({ draftHeight: event.target.scrollHeight })
})

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char])
  )
}

function renderProfile(profile) {
  if(!profile) {
    return `
      <div class="loading">Loading...</div>
    `
  }

  const {
    avatar,
    banner,
    createdAt,
    moniker,
    group,
    description,
    mutualsCount,
    followersCount,
    followingCount,
    viewer
  } = profile

  return `
    <div class="profile">
      <button class="manage-account">
        Account
      </button>
      <div class="hero">
        ${banner ? `<img src="${banner}" />` : ''}
      </div>
      <div class="profile-information">
        <div class="profile-gutter">
          <div class="profile-picture">
            ${avatar 
              ? `<img src="${avatar}" class="profile-avatar" />`
              : `<div class="profile-avatar placeholder"></div>`
            }
          </div>
        </div>
        <div class="profile-content">
          <div class="profile-stats">
            <div class="stat">
              <div class="stat-value">
                ${mutualsCount}
              </div>
              <div class="stat-label">
                Mutuals
              </div>
            </div>
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
                ${followingCount}
              </div>
              <div class="stat-label">
                Following
              </div>
            </div>
          </div>
        </div>
        <div class="profile-contact">
          <div class="profile-displayname">
            ${escapeHyperText(moniker)}
          </div>
          <div class="profile-group">
            ${escapeHyperText(group)}
          </div>
          <div class="profile-description">${escapeHyperText(description)}</div>
          <div class="profile-since">
            since: ${new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  `
}

const recordRenderers = {
  'computer.sillyz.data.video': (record) => {
    return `
      <was-video src="${record.src}"></was-video>
    `
  },
  'computer.sillyz.data.image': (record) => {
    return `
      <was-image src="${record.src}"></was-video>
    `
  },
  'computer.sillyz.data.text': (record) => {
    return escapeHyperText(record.text)
  },
  text: (record) => {
    return escapeHyperText(record.text)
  }
}

function renderRecord(record) {

  return (recordRenderers[record.$type] || recordRenderers.text)(record)
}

function renderPost(resource) {
  const { cid, uri, record, author } = resource

  return `
    <div class="post" data-cid="${cid}" data-uri="${uri}">
      <div class="post-gutter">
        <div class="post-avatar">
          <div class="avatar placeholder"></div>
        </div>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <span class="post-displayname">${escapeHyperText(resource.author.moniker)}</span>
          <span class="post-group">
            ${escapeHyperText(author.group)}
          </span>
          <span class="post-timestamp">
            ${new Date(record.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div class="body">
          <div class="post-text">${renderRecord(record)}</div>
          <div class="post-footer">
            <div class="post-action-container">
              <button data-action="reply" data-cid="${cid}" data-uri="${uri}" class="footer-action">
                0
                <span>💬</span>
              </button>
            </div>
            <div class="post-action-container">
              <button data-action="repost" data-cid="$cid}" data-uri="${uri}" class="footer-action">
                0
                <span>🔄</span>
              </button>
            </div>
            <div class="post-action-container">
              <button data-action="like" data-cid="${cid}" data-uri="${uri}" class="footer-action">
                0
                <span>❤️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderTimeline(timeline) {
  if(!timeline || timeline.length === 0) {
    return `<div class="empty-timeline">No posts yet. Create your first post!</div>`
  }
  return timeline.map(renderPost).join('')
}

function renderProfileView(timelineUR) {
  const profile = getProfile()
  const timeline = getTimeline(timelineUR)

  return `
    <button class="new-post">
      Create
    </button>
    <div class="scrollable-view">
      ${renderProfile(profile)}
      <div class="feed">
        ${renderTimeline(timeline)}
      </div>
    </div>
  `
}

function renderCreatePost() {
  const { draft, draftHeight } = $.learn()

  return `
    <div class="overlay-background">
      <div class="form-card">
        <form action="post" method="post" class="draft-template">
          <div class="draft-header">
            <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="button">
              Cancel
            </button>
            <button class="standard-button" style="place-self: end;" type="submit">
              Post
            </button>
          </div>
          <div class="text-well">
            <textarea
              class="draft-content"
              data-input
              name="draft"
              placeholder="What's good?"
              ${draftHeight ? `style="height: ${draftHeight}px"` : ''}
            >${escapeHyperText(draft)}</textarea>
          </div>
          <div class="draft-footer">
            <div style="place-self: end">
              ${300 - draft.length}
            </div>
          </div>
        </form>
      </div>
    </div>
  `
}

$.draw(target => {
  const { currentView, authenticated } = $.learn()

  if(!authenticated) {
    return `
      <quick-start></quick-start>
    `
  }

  if (currentView === views.createPost) {
    return renderCreatePost()
  }

  if (currentView === views.account) {
    return `
      <div>
        <button class="view-profile">
          Profile
        </button>
        <secure-persona></secure-persona>
      </div>
    `
  }

  return renderProfileView(target.ur || 'public')
}, {
  async beforeUpdate(target) {
    if(!target.mounted) {
      target.mounted = true
      try {
        const timelineUR = getTimelineUR(target)

        const response = await fetchTimeline(timelineUR)
        const json = await response.text()

        const data = JSON.parse(json)

        $.teach({ timelineUR, data }, (state, payload) => {
          return {
            ...state,
            [payload.timelineUR]: payload.data.timeline
          }
        })
      } catch(error) {
        console.log(error)
      }
    }
  }
})

$.when('activated', 'secure-persona', (event) => {
  $.teach({
    authenticated: true
  })
})

$.when('deactivated', 'secure-persona', (event) => {
  $.teach({
    authenticated: false
  })
})


$.style(`
  & {
    position: relative;
    display: block;
    overflow: hidden;
    height: 100%;
  }

  & .scrollable-view {
    overflow: auto;
    height: 100%;
  }

  & .feed {
    display: flex;
    flex-direction: column-reverse;
  }

  & .empty-timeline {
    text-align: center;
    padding: 2rem;
    color: rgba(0,0,0,.5);
  }

  & .post {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: .5rem;
    border: none;
    border-bottom: 1px solid rgba(0,0,0,.15);
    background: transparent;
    color: rgba(0,0,0,.85);
    padding: .5rem 1rem;
    text-align: left;
    line-height: 1.3;
  }

  & .post-content {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: .25rem;
  }

  & .post-avatar {
    border-radius: 100%;
    display: block;
    overflow: hidden;
    position: relative;
    z-index: 2;
    width: 42px;
    height: 42px;
  }

  & .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & .avatar.placeholder,
  & .profile-avatar.placeholder {
    background: rgba(0,0,0,.25);
  }

  & .post-gutter {
    position: relative;
  }

  & .post-displayname {
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
    font-weight: bold;
  }

  & .post-group {
    color: rgba(0,0,0,.65);
  }

  & .post-timestamp {
    color: rgba(0,0,0,.45);
    white-space: nowrap;
  }

  & .post-footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin-top: .5rem;
  }

  & .post-action-container {
    text-align: center;
  }

  & .footer-action {
    display: inline-grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: .5rem;
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    border: none;
    border-radius: 0;
    color: rgba(0,0,0,.65);
    opacity: .5;
    cursor: pointer;
  }

  & .footer-action:hover,
  & .footer-action:focus {
    background: linear-gradient(135deg, rgba(0,0,0,.05), rgba(0,0,0,.35)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--root-theme, mediumseagreen);
    opacity: 1;
  }

  & .footer-action span {
    font-size: .75em;
    place-self: end;
  }

  & .post-text {
    margin-bottom: .5rem;
    white-space: pre-wrap;
  }

  & .hero {
    min-height: 66px;
    position: relative;
    background: linear-gradient(135deg, rgba(0,0,0,.1), rgba(0,0,0,.2));
  }

  & .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & .profile-information {
    display: grid;
    grid-template-columns: 132px 1fr;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    position: relative;
    padding: .5rem 1rem;
  }

  @media (max-width: 36rem) {
    & .profile-information {
      grid-template-columns: 1fr;
    }
  }

  & .profile-picture {
    position: absolute;
    top: -66px;
  }

  & .profile-gutter {
    min-height: 66px;
  }

  & .profile-avatar {
    border-radius: 100%;
    border: 2px solid rgba(0,0,0,.25);
    width: 128px;
    height: 128px;
    object-fit: cover;
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

  & .profile-group {
    color: rgba(255,255,255,.45);
  }

  & .profile-description {
    white-space: pre-wrap;
  }

  & .profile-since {
    color: rgba(255,255,255,.65);
  }

  & .new-post {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    padding: .5rem 1rem;
    border: 2px solid var(--root-theme, mediumseagreen);
    background: rgba(0,0,0,.65);
    border-radius: 100px;
    color: rgba(255,255,255,.85);
    display: grid;
    place-content: center;
    font-size: 1rem;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    z-index: 5;
    cursor: pointer;
  }

  & .new-post:hover,
  & .new-post:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
  }

  & .view-profile,
  & .manage-account {
    position: absolute;
    right: 1rem;
    top: 1rem;
    padding: .5rem 1rem;
    border: 2px solid var(--root-theme, mediumseagreen);
    background: rgba(0,0,0,.65);
    border-radius: 100px;
    color: rgba(255,255,255,.85);
    display: grid;
    place-content: center;
    font-size: 1rem;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    z-index: 5;
    cursor: pointer;
  }

  & .view-profile:hover,
  & .view-profile:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
  }

  & .overlay-background {
    padding: 2rem 0;
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .form-card {
    display: grid;
    background: white;
    max-width: 55ch;
    margin: 0 auto;
    padding: .5rem;
    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);
    height: 100%;
    overflow: hidden;
  }

  & .draft-template {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: .5rem;
    overflow: hidden;
    max-height: 100%;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  & .draft-footer {
    display: grid;
  }

  & .draft-content {
    width: 100%;
    resize: none;
    border: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
    font-family: inherit;
    font-size: 1rem;
  }

  & .text-well {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
  }

  & .standard-button {
    padding: .5rem 1rem;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  & .standard-button:hover,
  & .standard-button:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
  }

  & .standard-button.-clear {
    background: transparent;
    color: rgba(0,0,0,.65);
  }

  & .standard-button.-clear:hover,
  & .standard-button.-clear:focus {
    color: rgba(0,0,0,.85);
  }

  & .loading {
    display: grid;
    place-content: center;
    padding: 2rem;
    color: rgba(0,0,0,.5);
  }

  & was-video {
    height: auto;
    background: black;
    max-height: 300px;
  }

  & was-video video {
    object-fit: contain;
    max-height: 300px;
  }

  & was-image {
    height: auto;
    background: black;
    max-height: 300px;
  }

  & was-image img {
    object-fit: contain;
    max-height: 300px;
  }

`)

export default $

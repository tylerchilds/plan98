import elf from "@plan98/elf"

const views = {
  createPost: 'createPost',
  profile: 'profile',
}

const $ = elf('face-less', {
  draft: '',
  draftHeight: null
})

export function shitPost() {
  console.log('cool')
}

function getTimeline(targetId) {
  const state = $.learn()
  return state[`timeline-${targetId}`] || []
}

function setTimeline(targetId, posts) {
  $.teach({ [`timeline-${targetId}`]: posts })
}

function addPost(targetId, post) {
  const timeline = getTimeline(targetId)
  setTimeline(targetId, [post, ...timeline])
}

function getProfile(targetId) {
  const state = $.learn()
  return state[`profile-${targetId}`] || {
    avatar: null,
    banner: null,
    createdAt: new Date().toISOString(),
    displayName: 'Anonymous User',
    handle: 'anonymous',
    description: '',
    followersCount: 0,
    followsCount: 0,
    postsCount: 0,
    viewer: {}
  }
}

function setProfile(targetId, profile) {
  $.teach({ [`profile-${targetId}`]: profile })
}

$.when('click', '.new-post', (event) => {
  const targetId = event.target.closest('face-less').id
  $.teach({ activeTarget: targetId, currentView: views.createPost })
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: '', draftHeight: null, currentView: views.profile })
})

$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  const { draft, activeTarget } = $.learn()
  
  if (!draft.trim()) return

  const profile = getProfile(activeTarget)

  // Bluesky-compatible post structure
  const post = {
    uri: `at://${profile.handle}/app.bsky.feed.post/${crypto.randomUUID()}`,
    cid: crypto.randomUUID(),
    author: {
      did: `did:plc:${crypto.randomUUID()}`,
      handle: profile.handle,
      displayName: profile.displayName,
      avatar: profile.avatar
    },
    record: {
      $type: 'app.bsky.feed.post',
      text: draft,
      createdAt: new Date().toISOString(),
      facets: []
    },
    embed: null,
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,
    viewer: {}
  }

  addPost(activeTarget, { post })
  
  // Update post count
  const currentProfile = getProfile(activeTarget)
  setProfile(activeTarget, {
    ...currentProfile,
    postsCount: currentProfile.postsCount + 1
  })

  $.teach({ draft: '', draftHeight: null, currentView: views.profile })
})

$.when('input', '[data-bind]', (event) => {
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
    displayName,
    handle,
    description,
    followersCount,
    followsCount,
    postsCount,
    viewer
  } = profile

  return `
    <div class="profile">
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
            ${escapeHyperText(displayName)}
          </div>
          <div class="profile-handle">
            ${escapeHyperText(handle)}
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

function renderPost(record) {
  const { post, reason } = record

  return `
    <div class="post" data-cid="${post.cid}" data-uri="${post.uri}">
      <div class="post-gutter">
        <div class="post-avatar">
          ${post.author.avatar 
            ? `<img src="${post.author.avatar}" class="avatar" />`
            : `<div class="avatar placeholder"></div>`
          }
        </div>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <span class="post-displayname">${escapeHyperText(post.author.displayName)}</span>
          <span class="post-handle">
            ${escapeHyperText(post.author.handle)}
          </span>
          <span class="post-timestamp">
            ${new Date(post.record.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div class="body">
          <div class="post-text">${escapeHyperText(post.record.text)}</div>
          <div class="post-footer">
            <div class="post-action-container">
              <button data-action="reply" data-cid="${post.cid}" data-uri="${post.uri}" class="footer-action">
                ${post.replyCount}
                <span>💬</span>
              </button>
            </div>
            <div class="post-action-container">
              <button data-action="repost" data-cid="${post.cid}" data-uri="${post.uri}" class="footer-action">
                ${post.repostCount}
                <span>🔄</span>
              </button>
            </div>
            <div class="post-action-container">
              <button data-action="like" data-cid="${post.cid}" data-uri="${post.uri}" class="footer-action">
                ${post.likeCount}
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

function renderProfileView(targetId) {
  const profile = getProfile(targetId)
  const timeline = getTimeline(targetId)

  return `
    <button class="new-post">
      + New Post
    </button>
    ${renderProfile(profile)}
    <div class="feed">
      ${renderTimeline(timeline)}
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
              data-bind
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
  const { currentView } = $.learn()
  const targetId = target.id || 'default'

  if (currentView === views.createPost) {
    return renderCreatePost()
  }

  return renderProfileView(targetId)
})

$.style(`
  & {
    position: relative;
    display: block;
    overflow: hidden;
    height: 100%;
  }

  & .feed {
    display: flex;
    flex-direction: column;
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
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), mediumseagreen;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
    font-weight: bold;
  }

  & .post-handle {
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
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), mediumseagreen;
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
    background: linear-gradient(135deg, rgba(0,0,0,.05), rgba(0,0,0,.35)), mediumseagreen;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: mediumseagreen;
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

  & .profile-handle {
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
    border: 2px solid mediumseagreen;
    background: rgba(0,0,0,.65);
    border-radius: 100px;
    color: rgba(255,255,255,.85);
    display: grid;
    place-content: center;
    font-size: 1rem;
    background:
      linear-gradient(335deg, mediumseagreen, rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      mediumseagreen;
    z-index: 5;
    cursor: pointer;
  }

  & .new-post:hover,
  & .new-post:focus {
    background:
      linear-gradient(335deg, mediumseagreen, rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      mediumseagreen;
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
      linear-gradient(335deg, mediumseagreen, rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      mediumseagreen;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  & .standard-button:hover,
  & .standard-button:focus {
    background:
      linear-gradient(335deg, mediumseagreen, rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      mediumseagreen;
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
`)

export default $

import elf from "@silly/elf"
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'
import { showModal, hideModal } from './plan98-modal.js'

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
  profile: 'profile',
  timeline: 'timeline',
  alerts: 'alerts',
  settings: 'settings',
}

const navigation = {
  [modes.me]: {
    icon: '<blue-sky view="avatar"></blue-sky>',
    label: 'Profile'
  },
  [modes.timeline]: {
    icon: '<sl-icon name="cup-hot"></sl-icon>',
    label: 'Timeline'
  },
  [modes.alerts]: {
    icon: '<sl-icon name="bell"></sl-icon>',
    label: 'Alerts'
  },
  [modes.settings]: {
    icon: '<sl-icon name="gear-wide-connected"></sl-icon>',
    label: 'Settings'
  },
}

const $ = elf('blue-sky', {
  service: blueskyCreds.service,
  moniker: blueskyCreds.moniker,
  password: '',
  mode: modes.timeline,
  draft: '',
  draftHeight: null
})

// Resume a session from stored data
async function resumeSession() {
  const savedSession = localStorage.getItem('blue-sky/session')
  if (savedSession) {
    $.teach({ loading: true })
    const { service } = $.learn()
    try {
      agent = new BskyAgent({
        service
      })

      const sessionData = JSON.parse(savedSession)
      await agent.resumeSession(sessionData)
      $.teach({ authenticated: true, loading: false  })
      fetchProfile(agent.session?.handle)
    } catch (error) {
      $.teach({ authenticated: false, loading: false  })
      console.error('Failed to resume session:', error)
    }
  }
}

resumeSession()

const cursors = {}
const EOF = 'END_OF_FEED'
async function fetchMyTimeline() {
  const cursor = cursors.myTimeline
  if(cursor === EOF) return
  const response = await agent.getAuthorFeed({
    cursor,
    actor: agent.session?.handle, // Or agent.session?.did
    limit: 20
  });

  if (response.success) {
    const { feed, cursor } = response.data;
    cursors.myTimeline = cursor || EOF
    $.teach(feed, mergeFeed('myTimeline'))
  } else {
    console.error('Failed to fetch your posts:', response.error);
  }
}

async function fetchActiveTimeline(reset) {
  const cursor = !reset ? cursors.activeTimeline : ''
  if(cursor === EOF) return
  const { activeActor } = $.learn()
  const response = await agent.getAuthorFeed({
    cursor,
    actor: activeActor, // Or agent.session?.did
    limit: 20
  });

  if (response.success) {
    const { feed, cursor } = response.data;
    cursors.activeTimeline = cursor || EOF
    $.teach(feed, mergeFeed('activeTimeline'))
  } else {
    console.error('Failed to fetch your posts:', response.error);
  }
}

function fetchHomeTimeline() {
  const cursor = cursors.homeTimeline || ''
  if(cursor === EOF) return
  agent.getTimeline({
    cursor,
    limit: 30,
  }).then(({ data }) => {
    const { feed, cursor } = data
    cursors.homeTimeline = cursor || EOF
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
  if(cursor === EOF) return
  agent.listNotifications({
    cursor,
    limit: 20 // Optional: number of notifications to retrieve
  }).then(({ data }) => {
    const { notifications, cursor } = data
    cursors.alerts = cursor || EOF
    $.teach(notifications, mergeFeed('alerts'))
  })
}

async function fetchProfile(actor) {
  try {
    // Assuming you have your handle stored in a variable called 'myHandle'
    const response = await agent.getProfile({
      actor: actor, // Or agent.session?.did if you have that
    });

    if (response.success) {
      const profile = response.data;
      $.teach({ [actor]: profile })
    } else {
      console.error('Failed to fetch profile:', response.error);
    }
  } catch (error) {
    console.error('An error occurred while fetching your profile:', error);
  }
}

function loadMore(target) {
  const { feed } = target.dataset
  if(!feed) return

  if(feed === 'homeTimeline') {
    fetchHomeTimeline()
    return
  }

  if(feed === 'myTimeline') {
    fetchMyTimeline()
    return
  }

  if(feed === 'activeTimeline') {
    fetchActiveTimeline()
    return
  }


  if(feed === 'alerts') {
    fetchAlerts()
    return
  }
}

$.when('click', '[data-mode]', (event) => {

  const { mode } = event.target.dataset
  if(modes[mode]) {
    $.teach({ mode })
  }
})

$.when('click', '.new-post', (event) => {
  showModal(`
    <blue-sky view="${views.createPost}"></blue-sky>
  `, {
    transparent: true
  })
})

$.when('click', '[data-mode-error]', (event) => {
  $.teach({ mode: modes.timeline })
})


$.when('click', '[data-logout]', (event) => {
  logout()
})

$.when('click', '[data-actor]', (event) => {
  event.preventDefault()
  const { actor } = event.target.dataset
  $.teach({ activeActor: actor, mode: modes.profile, activeTimeline: [] })

  fetchActiveTimeline(true)
  fetchProfile(actor)
})

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: '', draftHeight: null })
  hideModal()
})

$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  const { draft } = $.learn()

  const response = await agent.post({
    text: draft,
    createdAt: new Date().toISOString()
  })

  if(response.validationStatus) {
    $.teach({ draft: '' })
    hideModal()
  }
})


$.when('submit', '[action="login"]', async (event) => {
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

     // Save session data for persistence
    if (success) {
      const sessionData = agent.session
      localStorage.setItem('blue-sky/session', JSON.stringify(sessionData))

      $.teach({ authenticated: true, mode: modes.timeline })
      fetchProfile(agent.session?.handle)
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
    <div class="form-card">
      <div class="card-title">
        Bluesky
      </div>
      <div class="card-description">
        Use your Bluesky account credentials to connect<br/><a href="https://bsky.social/about" target="_blank">Learn More</a>
      </div>
      <form action="login" method="post">
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
        <button class="standard-button" type="submit">
          Connect
        </button>
      </form>
    </div>
  `
}

function renderProfile(profile, timeline) {
  if(!profile) {
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

  return `
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
            @${handle}
          </div>
          <div class="profile-description">${description}</div>
          <div class="profile-since">
            since: <sl-format-date date="${createdAt}" month="long" year="numeric"></sl-format-date>
          </div>
        </div>
      </div>
      <div class="feed">
        ${timeline ? renderTimeline(timeline) : ''}
      </div>
      <div class="load-more" data-feed="${handle === agent.session?.handle?'myTimeline':'activeTimeline'}"></div>
    </div>
  `

}

function renderTimeline(timeline) {
  return `
    ${timeline.map(renderPost).join('')}
  `
}

// the below is claude

/**
 * Process text with facets to create HTML with links, mentions, etc.
 * @param {string} text - The post text content
 * @param {Array} facets - Array of facet objects with byte ranges and features
 * @returns {string} HTML with facets applied
 */
function processTextWithFacets(text, facets) {
  if (!facets || !facets.length) {
    return escapeHyperText(text);
  }

  // Step 1: Create a map of positions to facet info
  const markers = [];
  facets.forEach(facet => {
    const { byteStart, byteEnd } = facet.index;

    // We'll mark where facets start and end
    markers.push({
      position: byteStart,
      type: 'start',
      facet
    });

    markers.push({
      position: byteEnd,
      type: 'end',
      facet
    });
  });

  // Sort markers by position (ascending)
  markers.sort((a, b) => a.position - b.position);

  // Step 2: Generate tokens to mark facet positions
  // We'll use these tokens as placeholders that won't be affected by HTML escaping
  const openTokens = new Map();  // Maps facet to its opening token
  const closeTokens = new Map(); // Maps facet to its closing token

  facets.forEach((facet, index) => {
    // Generate unique tokens for this facet
    const openToken = `__FACET_OPEN_${index}__`;
    const closeToken = `__FACET_CLOSE_${index}__`;

    openTokens.set(facet, openToken);
    closeTokens.set(facet, closeToken);
  });

  // Step 3: Insert tokens into the text
  let tokenizedText = '';
  let lastPos = 0;

  markers.forEach(marker => {
    // Add text segment before this marker
    tokenizedText += text.substring(lastPos, marker.position);

    // Add the appropriate token
    if (marker.type === 'start') {
      tokenizedText += openTokens.get(marker.facet);
    } else {
      tokenizedText += closeTokens.get(marker.facet);
    }

    lastPos = marker.position;
  });

  // Add remaining text
  tokenizedText += text.substring(lastPos);

  // Step 4: Escape the entire text with tokens
  const escapedText = escapeHyperText(tokenizedText);

  // Step 5: Replace tokens with actual HTML tags
  let resultHtml = escapedText;

  facets.forEach((facet, index) => {
    const openToken = openTokens.get(facet);
    const closeToken = closeTokens.get(facet);

    // Get the HTML to use for this facet type
    let openHtml = '';
    let closeHtml = '';

    if (facet.features && facet.features.length > 0) {
      const feature = facet.features[0];

      if (feature.$type === 'app.bsky.richtext.facet#mention') {
        openHtml = `<a href="/app/blue-sky?did=${feature.did}" data-actor="${feature.did}" target="_blank">`;
        closeHtml = '</a>';
      }
      else if (feature.$type === 'app.bsky.richtext.facet#link') {
        openHtml = `<a href="${feature.uri}" target="_blank" rel="noopener noreferrer" class="link">`;
        closeHtml = '</a>';
      }
      else if (feature.$type === 'app.bsky.richtext.facet#tag') {
        // Get tag without # for search query
        const tagName = text.substring(facet.index.byteStart, facet.index.byteEnd).replace(/^#/, '');
        openHtml = `<a href="/search?q=${encodeURIComponent(tagName)}" class="hashtag">`;
        closeHtml = '</a>';
      }
    }

    // Replace tokens with HTML
    resultHtml = resultHtml.replace(openToken, openHtml);
    resultHtml = resultHtml.replace(closeToken, closeHtml);
  });

  return resultHtml;
}

/**
 * Render the appropriate embed for a post
 * @param {Object} embed - The embed object from the post
 * @returns {string} HTML for the embed content
 */
function renderEmbed(embed) {
  if (!embed) return '';

  // Handle different embed types
  switch (embed.$type) {
    case 'app.bsky.embed.video#view':
      return renderVideoEmbed(embed)
    case 'app.bsky.embed.images#view':
      return renderImagesEmbed(embed);

    case 'app.bsky.embed.external#view':
      return renderExternalEmbed(embed);

    case 'app.bsky.embed.record#view':
      return renderRecordEmbed(embed);

    case 'app.bsky.embed.recordWithMedia#view':
      return renderRecordWithMediaEmbed(embed);

    default:
      return ''; // Unknown embed type
  }
}

/**
 * Render images embed
 * @param {Object} embed - The images embed object
 * @returns {string} HTML for the images
 */
function renderVideoEmbed(embed) {
  if (!embed.playlist) return '';

  return `
    <div class="post-video">
      <hls-video src="${embed.playlist}"></hls-video>
    </div>
  `
}


/**
 * Render images embed
 * @param {Object} embed - The images embed object
 * @returns {string} HTML for the images
 */
function renderImagesEmbed(embed) {
  if (!embed.images || !embed.images.length) return '';

  let imagesHtml = '<div class="post-images">';

  embed.images.forEach(image => {
    imagesHtml += `
      <div class="post-image">
        <img src="${image.fullsize}" alt="${image.alt || ''}" 
          loading="lazy" class="post-image-content" />
      </div>
    `;
  });

  imagesHtml += '</div>';
  return imagesHtml;
}

/**
 * Render external link embed
 * @param {Object} embed - The external embed object
 * @returns {string} HTML for the external link preview
 */
function renderExternalEmbed(embed) {
  const external = embed.external;
  if (!external) return '';

  return `
    <a href="${external.uri}" target="_blank" rel="noopener noreferrer" class="external-embed">
      ${external.thumb ? `<img src="${external.thumb}" alt="" class="external-thumb" />` : ''}
      <div class="external-content">
        <div class="external-title">${escapeHyperText(external.title || '')}</div>
        ${external.description ? `<div class="external-description">${escapeHyperText(external.description)}</div>` : ''}
        <div class="external-uri">${new URL(external.uri).hostname}</div>
      </div>
    </a>
  `;
}

/**
 * Render record embed (quote post)
 * @param {Object} embed - The record embed object
 * @returns {string} HTML for the quoted post
 */
function renderRecordEmbed(embed) {
  const record = embed.record;
  if (!record) return '';

  if (record.notFound) {
    return '<div class="quoted-post not-found">Post not found</div>';
  }

  if (record.blocked) {
    return '<div class="quoted-post blocked">Post from a blocked account</div>';
  }

  if (!record.value) {
    return '<div class="quoted-post error">Unable to display this post</div>';
  }

  const author = record.author;
  const content = record.value;

  return `
    <div class="quoted-post">
      <div class="quoted-header">
        <img src="${author.avatar || '/default-avatar.png'}" class="quoted-avatar" alt="" />
        <div class="quoted-name">${escapeHyperText(author.displayName || author.handle)}</div>
        <div class="quoted-handle">@${author.handle}</div>
      </div>
      <div class="quoted-content">
        ${escapeHyperText(content.text || '')}
      </div>
    </div>
  `;
}

/**
 * Render record with media embed
 * @param {Object} embed - The recordWithMedia embed object
 * @returns {string} HTML for the record with media
 */
function renderRecordWithMediaEmbed(embed) {
  let html = '';

  // First render the record
  if (embed.record) {
    html += renderRecordEmbed({ record: embed.record });
  }

  // Then render the media based on its type
  if (embed.media) {
    if (embed.media.$type === 'app.bsky.embed.images') {
      html += renderImagesEmbed({ images: embed.media.images });
    } else if (embed.media.$type === 'app.bsky.embed.external') {
      html += renderExternalEmbed({ external: embed.media.external });
    }
  }

  return html;
}


// the above was claude

const postTypeRenderers = {
  'app.bsky.feed.post': (post) => {
    const {
      likeCount,
      replyCount,
      repostCount,
      record,
    } = post;

    const {
      text,
      facets
    } = record;

    return `
      <div class="post-text">
        ${processTextWithFacets(text, facets)}
      </div>
      ${renderEmbed(post.embed)}
      <div class="post-footer">
        <div class="footer-action">
          ${replyCount}
        </div>
        <div class="footer-action">
          ${likeCount}
        </div>
        <div class="footer-action">
          ${repostCount}
        </div>
      </div>
    `;
  }
};

function renderPost({ post }) {
  return `
    <div class="post">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.handle}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.handle}" target="_blank" class="post-displayname">${post.author.displayName}</a>
          <span class="post-handle">
            @${post.author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${
          postTypeRenderers[post.record.$type]
            ?postTypeRenderers[post.record.$type](post)
            :escapeHyperText(post.record.text)
        }</div>
      </div>
    </div>
  `
}

function renderNotification(post) {
  return `
    <div class="post">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.handle}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.handle}" target="_blank" class="post-displayname">${post.author.displayName}</a>
          <sl-relative-time date="${post.indexedAt}" format="long"></sl-relative-time>
        </div>
        <div class="body">${escapeHyperText(post.reason)}</div>
      </div>
    </div>
  `
}


const modeRenderers = {
  [modes.me]: (target) => {
    const profile = $.learn()[agent.session?.handle]

    const { myTimeline } = $.learn()

    return `
      <button class="new-post">
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      ${renderProfile(profile, myTimeline)}
     `
  },
  [modes.profile]: (target) => {
    const { activeActor } = $.learn()

    const profile = $.learn()[activeActor]

    const { activeTimeline } = $.learn()

    return `
      <button class="new-post">
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      ${renderProfile(profile, activeTimeline)}
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
      <button class="new-post" data-draft>
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      <div class="feed">
        ${homeTimeline.map(renderPost).join('')}
      </div>
      <div class="load-more" data-feed="homeTimeline"></div>
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
      <div class="load-more" data-feed="alerts"></div>
    `
  },
  [modes.settings]: (target) => {
    return `
      <div class="settings-section">
        To disconnect this client, click<br/>
        <button data-logout class="standard-button">Logout</button>
      </div>
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

const views = {
  createPost: 'createPost',
  avatar: 'avatar',
}

const viewRenderers = {
  [views.avatar]: (target) => {
    const profile = $.learn()[agent.session?.handle]

    const {
      avatar
    } = profile || {}

    return avatar ? `
      <img src="${avatar}" class="solo-avatar" />
    ` : `
      <sl-icon name="person-fill"></sl-icon>
    `
  },
  [views.createPost]: (target) => {
    const {
      draft,
      draftHeight
    } = $.learn()

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="post" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
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
                placeholder="Sup, yo?"
                value="${escapeHyperText(draft)}"
                ${draftHeight ? `style="height: ${draftHeight}px"`:''}
              ></textarea>
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
}

$.draw(target => {
  if(!target.mounted) {
    target.mounted = true
    const did = target.getAttribute('did')
    const handle = target.getAttribute('handle')
    const actor = did || handle

    if(actor) {
      $.teach({
        activeActor: actor,
        mode: modes.profile,
        activeTimeline: []
      })
      fetchActiveTimeline(true)
      fetchProfile(actor)
    }
  }
  const view = target.getAttribute('view')
  const { authenticated, mode, loading } = $.learn()

  if(loading) {
    return `
      <loading>
        <flying-disk></flying-disk>
      </loading>
    `
  }

  if(!authenticated) {
    return loginForm()
  }

  if(viewRenderers[view]) {
    return viewRenderers[view](target)
  }

  return `
    <div class="app">
      <div class="sidebar">
        ${Object.keys(navigation).map((key) => {
          const { icon, label } = navigation[key]
          return `
            <button data-mode="${key}" class="navigation ${mode === key ? 'active':''}">
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
    </div>
  `
}, {
  afterUpdate(target) {
    {
      afterUpdateTheme($paperPocket, target)
      recoverElves(target, 'sl-icon')
    }

    {
      const { mode } = $.learn()
      const content = target.querySelector('.content')
      if(content && target.mode !== mode) {
        target.mode = mode
        content.scrollTop = 0
      }
    }

    {
      const { mode, activeActor } = $.learn()
      const watcher = target.querySelector('.load-more')
      if(watcher && (target.observerMode !== mode || target.lastActiveActor === activeActor)) {
        target.observerMode = mode
        target.lastActiveActor = activeActor

        if(target.observer) {
          target.observer.disconnect()
        }

        target.observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(async (entry) => {
            if(entry.isIntersecting) {
              loadMore(entry.target)
            }
          });
        }, {
          root: target.querySelector('.content'),
          rootMargin: '0px',
          threshold: 0,
        });

        target.observer.observe(target.querySelector('.load-more'))
      }
    }
  }
})

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
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.5), rgba(0,0,0,.5), var(--root-theme, mediumseagreen)),
      var(--root-theme, mediumseagreen);
  }

  &[view] {
    background: transparent;
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
    background: rgba(0,0,0,.25);
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
    padding: .5rem;
    border: 2px solid var(--root-theme, mediumseagreen);
    background: rgba(0,0,0,.65);
    border-radius: 100%;
    color: rgba(255,255,255,.85);
    display: grid;
    place-content: center;
    font-size: 2rem;
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    z-index: 5;
  }

  & .new-post:hover,
  & .new-post:focus {
    background:
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(255,255,255,.15) 20%, rgba(255,255,255,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.35), rgba(255,255,255,.35)),
      var(--root-theme, mediumseagreen);
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

  & .post-displayname {
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
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

  & .draft-template {
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    gap: .5rem;
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
  }

  & .sidebar .navigation {
    background: rgba(0,0,0,.85);
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    gap: .5rem;
  }

  & .sidebar .navigation.active {
    color: rgba(0,0,0,.85);
    background: var(--root-theme, mediumseagreen);
  }

  & .navigation-icon {
    border-radius: 100%;
    overflow: hidden;
    text-align: center;
    height: 24px;
    display: grid;
    place-content: center;
  }

  @media (max-width: 36rem) {

    & .sidebar .navigation {
      grid-template-columns: 24px;
    }
    & .navigation-label {
      display: none;
    }
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
    white-space: preserve;
  }

  & .profile-since {
    color: rgba(255,255,255,.65);
  }

  & .load-more {
    transform: translateY(-200px);
  }

  & .overlay-background {
    padding: 2rem 0;
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
  }

  & .form-card {
    background: white;
    max-width: 55ch;
    margin: 0 auto;
    padding: .5rem;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);
  }

  & .card-title {
    color: rgba(0,0,0,.65);
    font-weight: bold;
    font-size: 2rem;
  }

  & .card-description {
    margin-bottom: 1rem;
  }

  & .settings-section {
    padding: 1rem;
  }

  & [data-actor] > * {
    pointer-events: none;
  }
`)

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '.overlay-background', () => {
  hideModal()
})

$.when('focus', '[name="draft"]', (event) => {
  $.teach({ draftHeight: event.target.scrollHeight })
});

$.when('input', '[name="draft"]', (event) => {
  $.teach({ draftHeight: event.target.scrollHeight })
});


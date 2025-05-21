import elf from "@silly/elf"
import $paperPocket, { afterUpdateTheme } from './paper-pocket.js'
import { showModal, hideModal } from './plan98-modal.js'
import { popover } from './data-popover.js'
import TLDs from 'tlds'
import GraphemeSplitter from 'grapheme-splitter'

import { BskyAgent } from '@atproto/api'

const views = {
  createPost: 'createPost',
  replyPost: 'replyPost',
  quotePost: 'quotePost',
  postMenu: 'postMenu',
  post: 'post',
  search: 'search',
  notification: 'notification',
  avatar: 'avatar',
  shareModal: 'shareModal',
  confirmDelete: 'confirmDelete',
}

let agent

export function getAgent() {
  return agent
}

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
  post: 'post',
  timeline: 'timeline',
  alerts: 'alerts',
  search: 'search',
  backpack: 'backpack',
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
  [modes.search]: {
    icon: '<sl-icon name="search"></sl-icon>',
    label: 'Search'
  },
  [modes.backpack]: {
    icon: '<sl-icon name="backpack"></sl-icon>',
    label: 'Backpack'
  },
  [modes.settings]: {
    icon: '<sl-icon name="gear-wide-connected"></sl-icon>',
    label: 'Settings'
  },
}
const timelinesByMode = {
  [modes.me]: 'myTimeline',
  [modes.timeline]: 'homeTimeline',
  [modes.profile]: 'activeTimeline',
}

const $ = elf('blue-sky', {
  service: blueskyCreds.service,
  moniker: blueskyCreds.moniker,
  searchQuery: {},
  password: '',
  mode: modes.timeline,
  draft: '',
  draftHeight: null
}, {
  secure: true
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

      const { success, data } = await agent.resumeSession(sessionData)
      $.teach({ authenticated: true, loading: false, session: { data } })
      fetchProfile(agent.session?.handle)
    } catch (error) {
      $.teach({ authenticated: false, loading: false  })
      console.error('Failed to resume session:', error)
    }
  }
}

resumeSession()

const loading = {}
const cursors = {}
const EOF = 'END_OF_FEED'
async function fetchMyTimeline(reset) {
  const cursor = !reset ? cursors.myTimeline : ''
  if(reset) {
    $.teach({ myTimeline: [] })
  }
  if(cursor === EOF || loading.myTimeline) return

  loading.myTimeline = true
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

  loading.myTimeline = false
}

async function fetchActiveTimeline(reset) {
  const cursor = !reset ? cursors.activeTimeline : ''
  if(reset) {
    $.teach({ activeTimeline: [] })
  }
  if(cursor === EOF || loading.activeTimeline) return
  loading.activeTimeline = true
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

  loading.activeTimeline = false
}

function fetchHomeTimeline(reset) {
  const cursor = !reset ? cursors.homeTimeline : ''
  if(reset) {
    $.teach({ homeTimeline: [] })
  }
  if(cursor === EOF || loading.homeTimeline) return
  loading.homeTimeline = true
  agent.getTimeline({
    cursor,
    limit: 30,
  }).then(({ data }) => {
    const { feed, cursor } = data
    cursors.homeTimeline = cursor || EOF
    $.teach(feed, mergeFeed('homeTimeline'))
  }).finally(() => {
    loading.homeTimeline = false
  })
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

function searchValidate(query) {
  if(!query.q) return false

  return true
}

function fetchSearchResults(reset) {
  const cursor = !reset ? cursors.search : ''
  if(cursor === EOF || loading.search) return
  const { searchQuery } = $.learn()
  if(searchValidate(searchQuery)) {
    loading.search = true
    agent.api.app.bsky.feed.searchPosts({
      ...searchQuery,
      cursor
    }).then(({ data }) => {
      const { posts, cursor } = data
      cursors.search = cursor || EOF
      $.teach(posts, mergeFeed('searchResults'))
    }).finally(() => {
      loading.search = false
    })
  }
}

function fetchAlerts() {
  const cursor = cursors.alerts || ''
  if(cursor === EOF || loading.alerts) return
  loading.alerts = true
  agent.listNotifications({
    cursor,
    limit: 20 // Optional: number of notifications to retrieve
  }).then(({ data }) => {
    const { notifications, cursor } = data
    cursors.alerts = cursor || EOF
    $.teach(notifications, mergeFeed('alerts'))
  }).finally(() => {
    loading.alerts = false
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

async function fetchPost(uri, cid) {
  if($.learn()[cid]) return
  try {
    const response = await agent.getPostThread({ uri });

    if (response.success) {
      $.teach({ [cid]: response.data.thread })
    } else {
      console.error(`Failed to fetch post with URI: ${uri}`, response.error);
    }
  } catch (error) {
    console.error(`An error occurred while fetching post with URI: ${uri}`, error);
    return null;
  }
}

function hideFeedItem(target) {
  target.classList.remove('feed-item-visible')
}


function showFeedItem(target) {
  target.classList.add('feed-item-visible')
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

  if(feed === 'searchResults') {
    fetchSearchResults()
    return
  }
}

const modeSideEffects = {
  [modes.post]: (event) => {
    const { cid, uri } = $.learn()
    fetchPost(uri, cid)
  }
}

function navigatePost(data) {
  const { mode, cid, uri } = data
  $.teach({ mode, cid, uri })

  if(modeSideEffects[mode]) {
    modeSideEffects[mode](event)
  }
}

$.when('click', '[data-q]', (event) => {
  event.preventDefault()
  const { q } = event.target.dataset

  const searchTag = { searchQuery: { q }, searchResults: null }
  saveHistory({ type: 'searchTag', searchTag })
  navigateSearch(searchTag)
})

function navigateSearch(data) {
  const { searchQuery, searchResults } = data
  $.teach({ mode: modes.search, searchQuery, searchResults })
}


$.when('click', '[data-mode]', (event) => {
  const { mode, cid, uri } = event.target.dataset
  if(modes[mode]) {

    const viewPost = { mode, cid, uri }

    saveHistory({ type: 'viewPost', viewPost })
    navigatePost(viewPost)
  }
})

const actionHandlers = {
  like: async (target, { cid, uri }) => {
    const { state } = target.dataset

    try {
      // Create the like record
      const record = {
        $type: 'app.bsky.feed.like',
        subject: {
          uri,
          cid
        },
        createdAt: new Date().toISOString()
      };

      if(state) {
        const deleteResult  = await agent.api.com.atproto.repo.deleteRecord({
          repo: agent.session.did,
          collection: 'app.bsky.feed.like',
          rkey: state.split('/').pop(), // Extract the rkey from the URI
        });

        if (deleteResult.success) {
          $.teach({ cid }, (state, payload) => {
            const { mode } = state
            const record = { ...(state[payload.cid] || { post: { viewer: {}, likeCount: 0 }}) }

            if(!record) return { ...state }
            delete record.post.viewer.like
            record.post.likeCount -= 1

            return {
              ...state,
              [payload.cid]: record,
              [timelinesByMode[mode]]: [
                ...(state[timelinesByMode[mode]] || []).map((data) => {
                  if(data.post.cid === payload.cid) {
                    delete data.post.viewer.like
                    data.post.likeCount -= 1
                  }
                  return data
                })
              ]
            }
          })
        } else {
          console.error('Failed to unlike post:', deleteResult.error);
        }
      } else {
        // Send the like request using the com.atproto.repo.createRecord method
        const response = await agent.api.com.atproto.repo.createRecord({
          repo: agent.session.did,
          collection: 'app.bsky.feed.like',
          record
        });

        if(response.success) {
          $.teach({ cid, uri: response.data.uri }, (state, payload) => {
            const { mode } = state
            const record = { ...(state[payload.cid] || { post: { viewer: {}, likeCount: 0 }}) }

            if(!record) return { ...state }
            record.post.viewer.like = payload.uri
            record.post.likeCount += 1
            return {
              ...state,
              [payload.cid]: record,
              [timelinesByMode[mode]]: [
                ...(state[timelinesByMode[mode]] || []).map((data) => {
                  if(data.post.cid === payload.cid) {
                    data.post.viewer.like = payload.uri
                    data.post.likeCount += 1
                  }
                  return data
                })
              ]
            }
          })
        }

        console.log('Successfully liked post:', response);
        return response;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },
  reply: async (target, { cid, uri }) => {
    const { mode } = $.learn()

    showModal(`
      <blue-sky view="${views.replyPost}"></blue-sky>
    `, {
      transparent: true
    })

    let draftContext = $.learn()[cid] || {}

    if(!draftContext.post) {
      if(!timelinesByMode[mode]) return
      const timeline = timelinesByMode[mode]

      draftContext = $.learn()[timeline].find(data => {
        return data.post.cid === cid
      })
    }
    $.teach({ draftContext })
  },
  quote: async (target, { cid, uri }) => {
    const { mode } = $.learn()

    showModal(`
      <blue-sky view="${views.quotePost}"></blue-sky>
    `, {
      transparent: true
    })

    let draftContext = $.learn()[cid] || {}

    if(!draftContext.post) {
      if(!timelinesByMode[mode]) return
      const timeline = timelinesByMode[mode]

      draftContext = $.learn()[timeline].find(data => {
        return data.post.cid === cid
      })
    }

    $.teach({ draftContext })
  },
}

$.when('click', '[data-action]', (event) => {
  const { action, cid, uri } = event.target.dataset

  if(actionHandlers[action]) {
    actionHandlers[action](event.target, { cid, uri })
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

  saveHistory({ type: 'actor', actor })
  navigateActor(actor)
})

$.when('click', '[data-unfollow]', async (event) => {
  event.preventDefault()
  const { following, handle, did } = event.target.dataset

  await agent.deleteFollow(following)
  fetchProfile(did)
})

$.when('click', '[data-follow]', async (event) => {
  event.preventDefault()
  const { did, handle } = event.target.dataset

  await agent.follow(did)
  fetchProfile(did)
})

async function navigateActor(handleOrDid) {
  let actor = handleOrDid
  if(!handleOrDid.startsWith('did:')) {
    const { data, success } = await agent.resolveHandle({ handle: handleOrDid });

    if(success) {
      actor = data.did
    }
  }
  $.teach({ activeActor: actor, mode: modes.profile })
  fetchActiveTimeline(true)
  fetchProfile(actor)
}

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '[data-cancel-draft]', () => {
  $.teach({ draft: '', draftHeight: null })
  hideModal()
})

$.when('click', '[data-cancel-modal]', () => {
  hideModal()
})

$.when('submit', '[action="search"]', async (event) => {
  event.preventDefault()
  const form = event.target
  const nodes = {
    q: form.q,
    sort: form.sort,
    since: form.since,       // The search query string
    until: form.until,       // The search query string
    mentions: form.mentions,       // The search query string
    author: form.author,       // The search query string
    lang: form.lang,       // The search query string
    domain: form.domain,       // The search query string
    url: form.url,       // The search query string
    tag: form.tag,       // The search query string
    limit: form.limit,       // The search query string
  }

  const searchQuery = Object.keys(nodes).reduce((query, key) => {
    if(nodes[key] && nodes[key].value) {
      query[key] = nodes[key].value
    }
    return query
  }, {})

  $.teach({ searchQuery, searchResults: null })
})


$.when('submit', '[action="copyLink"]', async (event) => {
  event.preventDefault()
  const { mode } = $.learn()
  const cid = event.target.getAttribute('cid')
  const uri = event.target.getAttribute('uri')

  let record = $.learn()[cid] || {}

  if(!record.post) {
    const timeline = timelinesByMode[mode]

    if(!timeline) return

    record = $.learn()[timeline].find(data => {
      return data.post.cid === cid
    })
  }

  const url = window.location.origin+'/app/blue-sky?view='+views.post+'&cid='+record.post.cid+'&uri='+record.post.uri

  alert(url)
})

$.when('submit', '[action="confirmDelete"]', async (event) => {
  event.preventDefault()
  const { mode } = $.learn()
  const cid = event.target.getAttribute('cid')
  const uri = event.target.getAttribute('uri')

  let record = $.learn()[cid] || {}

  if(!record.post) {
    const timeline = timelinesByMode[mode]
    
    if(!timeline) return

    record = $.learn()[timeline].find(data => {
      return data.post.cid === cid
    })
  }

  try {
    await agent.com.atproto.repo.deleteRecord({
      repo: agent.session?.did,
      collection: 'app.bsky.feed.post',          // Collection
      rkey: uri.split('/').pop()
    })

    console.log('Post deleted successfully')
  } catch (error) {
    console.error('Error deleting post:', error)
  }
})



$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  const { draft } = $.learn()

  const facets = await detectFacets(draft)

  const response = await agent.post({
    text: draft,
    facets,
    createdAt: new Date().toISOString()
  })

  if(response.validationStatus) {
    $.teach({ draft: '' })
    hideModal()
  }
})

$.when('submit', '[action="reply"]', async (event) => {
  event.preventDefault()
  const { draft, draftContext } = $.learn()

  const facets = await detectFacets(draft)

  const reply = draftContext.reply ? {
    root: draftContext.reply.root,
    parent: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    }
  } : {
    root: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    },
    parent: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    }
  }
  const response = await agent.post({
    text: draft,
    facets,
    reply,
    createdAt: new Date().toISOString()
  });

  if(response.validationStatus) {
    $.teach({ draft: '' })
    hideModal()
  }
})

$.when('submit', '[action="quote"]', async (event) => {
  event.preventDefault()
  const { draft, draftContext } = $.learn()

  const facets = await detectFacets(draft)

  const reply = draftContext.reply ? {
    root: draftContext.reply.root,
    parent: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    }
  } : {
    root: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    },
    parent: {
      uri: draftContext.post.uri,
      cid: draftContext.post.cid,
    }
  }

  if(draft) {
    const response = await agent.post({
      text: draft,
      facets,
      embed: {
        $type: "app.bsky.embed.record",
        record: {
          uri: draftContext.post.uri,
          cid: draftContext.post.cid
        }
      },

      createdAt: new Date().toISOString()
    });

    if(response.validationStatus) {
      $.teach({ draft: '' })
      hideModal()
    }
  } else {
    const repost = await agent.com.atproto.repo.createRecord({
      repo: agent.session?.did,
      collection: 'app.bsky.feed.repost',
      record: {
        subject: {
          uri: draftContext.post.uri,
          cid: draftContext.post.cid
        },
        createdAt: new Date().toISOString(),
      },
    });

    if(repost.success) {
      $.teach({ draft: '' })
      hideModal()
    }
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

      $.teach({ authenticated: true, mode: modes.timeline, session: { data } })
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
    <div class="login-card">
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

function renderProfile(profile) {
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
    postsCount,
    viewer
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
            ${handle}
          </div>
          <div class="profile-description">${description}</div>
          <div class="profile-since">
            since: <sl-format-date date="${createdAt}" month="long" year="numeric"></sl-format-date>
          </div>
        </div>
      </div>
    </div>
  `

}

function renderTimeline(timeline) {
  if(!timeline) return ''
  return `
    ${timeline.map(renderPost).join('')}
  `
}

// the below is claude

function processTextWithFacets(text, facets) {
  if (!facets || !facets.length) {
    return escapeHyperText(text);
  }

  // Initialize GraphemeSplitter for correct Unicode handling
  const splitter = new GraphemeSplitter();

  // Split text into graphemes (visual characters, including emoji)
  const graphemes = splitter.splitGraphemes(text);

  // Build a mapping from byte offsets to grapheme indices
  const byteToGraphemeMap = new Map();
  let bytePos = 0;

  // For each grapheme, store its starting byte position
  graphemes.forEach((grapheme, index) => {
    byteToGraphemeMap.set(bytePos, index);
    bytePos += new TextEncoder().encode(grapheme).length;
  });
  // Add the end position
  byteToGraphemeMap.set(bytePos, graphemes.length);

  // Helper function to find the closest grapheme index for a byte position
  function findGraphemeIndex(bytePosition) {
    // Exact match
    if (byteToGraphemeMap.has(bytePosition)) {
      return byteToGraphemeMap.get(bytePosition);
    }

    // Find the closest match
    let closestPos = 0;
    for (const [bytePos, graphemeIdx] of byteToGraphemeMap.entries()) {
      if (bytePos <= bytePosition && bytePos > closestPos) {
        closestPos = bytePos;
      }
    }
    return byteToGraphemeMap.get(closestPos);
  }

  // Step 1: Create a map of grapheme positions to facet info
  const markers = [];
  facets.forEach(facet => {
    const { byteStart, byteEnd } = facet.index;

    // Convert byte positions to grapheme indices
    const graphemeStart = findGraphemeIndex(byteStart);
    const graphemeEnd = findGraphemeIndex(byteEnd);

    // Mark where facets start and end using grapheme indices
    markers.push({
      position: graphemeStart,
      type: 'start',
      facet,
      originalBytePos: byteStart
    });

    markers.push({
      position: graphemeEnd,
      type: 'end',
      facet,
      originalBytePos: byteEnd
    });
  });

  // Sort markers by position (ascending)
  markers.sort((a, b) => {
    // First by grapheme position
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // If same position, 'end' markers come before 'start' markers (for nested tags)
    if (a.type !== b.type) {
      return a.type === 'end' ? -1 : 1;
    }
    // If still tied, use original byte position
    return a.originalBytePos - b.originalBytePos;
  });

  // Step 2: Generate tokens to mark facet positions
  const openTokens = new Map();  // Maps facet to its opening token
  const closeTokens = new Map(); // Maps facet to its closing token
  facets.forEach((facet, index) => {
    // Generate unique tokens for this facet
    const openToken = `__FACET_OPEN_${index}__`;
    const closeToken = `__FACET_CLOSE_${index}__`;
    openTokens.set(facet, openToken);
    closeTokens.set(facet, closeToken);
  });

  // Step 3: Insert tokens into the text based on grapheme positions
  let tokenizedText = '';
  let lastPos = 0;

  markers.forEach(marker => {
    // Add graphemes before this marker
    const segment = graphemes.slice(lastPos, marker.position).join('');
    tokenizedText += segment;

    // Add the appropriate token
    if (marker.type === 'start') {
      tokenizedText += openTokens.get(marker.facet);
    } else {
      tokenizedText += closeTokens.get(marker.facet);
    }

    lastPos = marker.position;
  });

  // Add remaining graphemes
  tokenizedText += graphemes.slice(lastPos).join('');

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

      try {
        if (feature.$type === 'app.bsky.richtext.facet#mention') {
          openHtml = `<a href="/app/blue-sky?did=${feature.did}" data-actor="${feature.did}" target="_blank">`;
          closeHtml = '</a>';
        }
        else if (feature.$type === 'app.bsky.richtext.facet#link') {
          openHtml = `<a href="${feature.uri}" target="_blank" rel="noopener noreferrer" class="link">`;
          closeHtml = '</a>';
        }
        else if (feature.$type === 'app.bsky.richtext.facet#tag') {
          // Extract the actual tag content from between the tokens in the escaped HTML
          // This ensures we get the correct content even with emoji
          const tagRegex = new RegExp(`${openToken}(.*?)${closeToken}`);
          const match = tagRegex.exec(resultHtml);
          const tagContent = match ? match[1] : '';
          const tagName = tagContent.replace(/^#/, '');

          openHtml = `<a href="/app/blue-sky?view=${views.search}&q=${encodeURIComponent(tagName)}" data-q="${encodeURIComponent(tagName)}" class="hashtag">`;
          closeHtml = '</a>';
        }
      } catch(e) {
        console.error(e);
        console.log('^^^ for: ', { facet, feature });
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

    case 'app.bsky.graph.defs#starterPackViewBasic':
      return renderStarterPackBasicEmbed(embed);

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
        <img src="${image.fullsize}" alt="${escapeHyperText(image.alt || '')}" 
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
    <a target="_blank" href="${external.uri}">${external.uri || external.title}</a>
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
    if(record.record) {
      return renderEmbed(record)
    }
    return '<div class="quoted-post error">Unable to display this post</div>';
  }

  const author = record.author;
  const content = record.value;

  return `
    <button class="post -quoted" data-mode="${views.post}" data-cid="${record.cid}" data-uri="${record.uri}">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-avatar">
          <img src="${author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-displayname">${author.displayName}</a>
          <span class="post-handle">
            ${author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${record.indexedAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${
          postTypeRenderers[record.$type]
            ?postTypeRenderers[record.$type](embed)
            :escapeHyperText(content.text)
        }</div>
      </div>
    </button>
  `;
}

function renderStarterPackBasicEmbed(embed) {
  const record = embed.record;
  if (!record) return '';

  const author = embed.creator;
  const { name, description } = record;

  return `
    <button class="post -quoted" data-mode="${views.post}" data-cid="${record.cid}" data-uri="${record.uri}">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-avatar">
          <img src="${author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-displayname">${author.displayName}</a>
          <span class="post-handle">
            ${author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${record.indexedAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${name} ${description}</div>
      </div>
    </button>
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
  'app.bsky.feed.post': ({ post, viewer }) => {
    const {
      likeCount,
      replyCount,
      repostCount,
      record,
      cid,
      uri
    } = post;

    const {
      text,
      facets
    } = record;

    return `
      <div class="post-text">${processTextWithFacets(text, facets)}</div>
      ${renderEmbed(post.embed)}
      <div class="post-footer">
        <div class="post-action-container">
          <button data-action="reply" data-cid="${cid}" data-uri="${uri}" class="footer-action">
            ${replyCount}
            <span>
              <sl-icon name="reply"></sl-icon>
            </span>
          </button>
        </div>
        <div class="post-action-container">
          <button data-action="quote" data-cid="${cid}" data-uri="${uri}" class="footer-action">
            ${repostCount}
            <span>
              <sl-icon name="recycle"></sl-icon>
            </span>
          </button>
        </div>
        ${post.viewer?`
          <div class="post-action-container">
            <button data-action="like" ${post.viewer.like ? `data-state="${post.viewer.like}"`:''} data-cid="${cid}" data-uri="${uri}" class="footer-action">
              ${likeCount}
              <span>
                <sl-icon name="heart"></sl-icon>
              </span>
            </button>
          </div>
        `:''}
        <div class="post-action-container">
          <button class="footer-action" data-popover="<blue-sky view='${views.postMenu}' cid='${cid}' uri='${uri}'></blue-sky>" style="grid-template-columns: 1fr;">
            <span>
              <sl-icon name="three-dots"></sl-icon>
            </span>
          </button>
        </div>
      </div>
    `;
  },
  'app.bsky.embed.record#viewRecord': (data) => {
    const {
      value,
      embed,
      cid,
      uri
    } = data.record;

    const {
      text,
      facets
    } = value;

    return `
      <div class="post-text">${processTextWithFacets(text, facets)}</div>
      ${renderEmbed(embed)}
    `;
  }
};

const reasonTypeRenderers = {
  'app.bsky.feed.defs#reasonRepost': (data) => {
    const { by } = data.reason
    const {
      handle,
      did,
      displayName
    } = by
    return `
      <div class="post-reason">
        Reposted by
        <a class="post-displayname" href="/app/blue-sky?handle=${handle}" data-actor="${did}" target="_blank">
          ${displayName}
        </a>
      </div>
    `
  }
}

function renderParent(record) {
  return `
    ${record.parent?renderParent(record.parent):''}
    <div class="parent-context">
      ${renderPost(record)}
    </div>
  `
}

const customPostTypeRenderer = {
  'app.bsky.feed.defs#blockedPost': (record) => {
    return `
      <div class="post">
        <div class="post-gutter">
        </div>
        <div class="post-content">
          Blocked Post
        </div>
      </div>
    `
  }
}

function renderPost(record) {
  const { post, reason, $type } = record
  return customPostTypeRenderer[$type] ? customPostTypeRenderer[$type](record) : `
    ${ reason && reasonTypeRenderers[reason.$type] ? reasonTypeRenderers[reason.$type](record) : ''}
    <div class="post" aria-role="button" data-mode="${views.post}" data-cid="${post.cid}" data-uri="${post.uri}">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
          <span class="post-handle">
            ${post.author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${
          postTypeRenderers[post.record.$type]
            ?postTypeRenderers[post.record.$type](record)
            :escapeHyperText(post.record.text)
        }</div>
      </div>
    </div>
  `
}

const notificationReasonRenderers = {
  mention(post) {
    return `
      <div class="notification-reason">
        Mentioned you
      </div>
      <blue-sky view="${views.notification}" cid="${post.cid}" uri="${post.uri}"></blue-sky>
    `
  },

  reply(post) {
    return `
      <div class="notification-reason">
        Replied here
      </div>
      <blue-sky view="${views.notification}" cid="${post.cid}" uri="${post.uri}"></blue-sky>
    `
  },
  repost(post) {
    return `
      <div class="notification-reason">
        Reposted verbatim
      </div>
      <blue-sky view="${views.notification}" cid="${post.record.subject.cid}" uri="${post.record.subject.uri}"></blue-sky>
    `
  },

  quote(post) {
    return `
      <div class="notification-reason">
        Quoted that
      </div>
      <blue-sky view="${views.notification}" cid="${post.cid}" uri="${post.uri}"></blue-sky>
    `
  },
  like(post) {
    const { handle, displayName } = post.author
    return `
      <div class="notification-reason">
        Liked this
      </div>
      <blue-sky view="${views.notification}" cid="${post.record.subject.cid}" uri="${post.record.subject.uri}"></blue-sky>
    `
  },
  follow(post) {
    return `
      <div class="notification-reason">
        Follows you
      </div>
    `
  }

}

function renderNotification(post) {
  const { author, cid, uri } = post

  return `
    <div class="post" data-mode="${views.post}" data-cid="${cid}" data-uri="${uri}">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-avatar">
          <img src="${author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.did}" target="_blank" class="post-displayname">${author.displayName}</a>
          <span class="post-handle">
            ${author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${post.indexedAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">
          ${(notificationReasonRenderers[post.reason]||((post) => post.reason))(post)}
        </div>
      </div>
    </div>
  `
}


function renderSearchResult(post) {
  return `
    <div class="post" aria-role="button" data-mode="${views.post}" data-cid="${post.cid}" data-uri="${post.uri}">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
          <img src="${post.author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
          <span class="post-handle">
            ${post.author.handle}
          </span>
          <span class="post-timestamp">
            <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
          </span>
        </div>
        <div class="body">${
          postTypeRenderers[post.record.$type]
            ?postTypeRenderers[post.record.$type]({ post })
            :escapeHyperText(post.record.text)
        }</div>
      </div>
    </div>
  `
}

const countCache = {}

const modeRenderers = {
  [modes.me]: (root, container) => {
    const profile = $.learn()[agent.session?.handle]
    const { myTimeline } = $.learn()

    if(!profile) {
      countCache[modes.me] = 0
      container.innerHTML = `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
      return
    }

    const feed = container.querySelector(`.feed.${modes.me}`)

    if(feed) {
      if(myTimeline.length === countCache[modes.me]) return
      const newPosts = myTimeline.slice(countCache[modes.me])
      countCache[modes.me] = myTimeline.length
      const newHTML = newPosts.map(renderPost).join('')
      feed.insertAdjacentHTML('beforeend', newHTML)
      return
    }

    container.innerHTML = `
      <button class="new-post">
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      ${renderProfile(profile)}
      <div class="feed ${modes.me}">
        ${renderTimeline(myTimeline)}
      </div>
      <div class="load-more" data-feed="myTimeline"></div>
    `
  },
  [modes.post]: (root, container) => {
    let { mode, cid, uri } = $.learn()
    cid = cid || root.getAttribute('cid')
    uri = uri || root.getAttribute('uri')
    const record = $.learn()[cid] || {}

    if(!record.post) {
      container.innerHTML = `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
      return
    }

    const active = container.querySelector(`.active-context`)

    if(active && container.cid === cid) {
      return
    }

    container.cid = cid

    container.innerHTML = `
      ${record.parent?renderParent(record.parent):''}
      <div class="active-context">
        ${renderPost(record)}
      </div>
      ${record.replies?renderTimeline(record.replies):''}
    `
  },
  [modes.profile]: (root, container) => {
    const { activeActor, activeTimeline } = $.learn()

    const profile = $.learn()[activeActor]

    if(!profile) {
      container.innerHTML = `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
      return
    }

    const feed = container.querySelector(`.feed.${modes.profile}`)

    if(feed) {
      if(activeTimeline.length === countCache[modes.profile]) return
      const newPosts = activeTimeline.slice(countCache[modes.profile])
      countCache[modes.profile] = activeTimeline.length
      const newHTML = newPosts.map(renderPost).join('')
      feed.insertAdjacentHTML('beforeend', newHTML)
      return
    }

    countCache[modes.profile] = 0
    container.innerHTML = `
      <button class="new-post">
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      ${renderProfile(profile)}
      <div class="feed ${modes.profile}">
        ${renderTimeline(activeTimeline)}
      </div>
      <div class="load-more" data-feed="activeTimeline"></div>
    `
  },

  [modes.timeline]: (root, container) => {
    const { homeTimeline } = $.learn()

    if(!homeTimeline) {
      countCache[modes.timeline] = 0

      fetchHomeTimeline(true)
      container.innerHTML = `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
      return
    }

    const feed = container.querySelector(`.feed.${modes.timeline}`)

    if(feed) {
      if(homeTimeline.length === countCache[modes.timeline]) return
      const newPosts = homeTimeline.slice(countCache[modes.timeline])
      countCache[modes.timeline] = homeTimeline.length
      const newHTML = newPosts.map(renderPost).join('')
      feed.insertAdjacentHTML('beforeend', newHTML)
      return
    }

    countCache[modes.timeline] = homeTimeline.length
    container.innerHTML = `
      <button class="new-post" data-draft>
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      <div class="feed ${modes.timeline}">
        ${homeTimeline.map(renderPost).join('')}
      </div>
      <div class="load-more" data-feed="homeTimeline"></div>
    `
  },
  [modes.alerts]: (root, container) => {
    const { alerts } = $.learn()

    if(!alerts) {
      countCache[modes.alerts] = 0
      fetchAlerts()
      container.innerHTML = `
        <loading>
          <flying-disk></flying-disk>
        </loading>
      `
      return
    }

    const feed = container.querySelector(`.feed.${modes.alerts}`)

    if(feed) {
      if(alerts.length === countCache[modes.alerts]) return
      const newAlerts = alerts.slice(countCache[modes.alerts])
      countCache[modes.alerts] = alerts.length
      const newNotifications = newAlerts.map(renderNotification).join('')
      feed.insertAdjacentHTML('beforeend', newNotifications)
      return
    }
    countCache[modes.alerts] = alerts.length
    container.innerHTML = `
      <div class="feed ${modes.alerts}">
        ${alerts.map(renderNotification).join('')}
      </div>
      <div class="load-more" data-feed="alerts"></div>
    `
  },
  [modes.search]: (root, container) => {
    const { searchResults, advancedSearch, searchQuery } = $.learn()

    if(!searchResults) {
      fetchSearchResults(true)
    }

    const feed = container.querySelector(`.feed.${modes.search}`)
    const form = container.querySelector(`.search-form`)
    const discovery = container.querySelector(`bluesky-discovery`)

    if(form) {
      const advancedForm = container.querySelector(`.advanced-search`)
      if(advancedForm && advancedSearch) {
        advancedForm.classList.add('active')
      } else if(advancedForm) {
        advancedForm.classList.remove('active')
      }
    }

    if(feed && searchResults) {
      if(discovery) {
        discovery.remove()
      }
      if(searchResults.length === countCache[modes.search]) return
      const newPosts = searchResults.slice(countCache[modes.search])
      countCache[modes.search] = searchResults.length
      const newHTML = newPosts.map(renderSearchResult).join('')
      feed.insertAdjacentHTML('beforeend', newHTML)
      return
    }

    if(searchResults && form) return
    countCache[modes.search] = 0
    container.innerHTML = `
      <form action="search" class="search-form">
        <div class="basic-search">
          <div class="row-1fr-auto">
            <input placeholder="joyful" name="q" value="${searchQuery.q || ''}" class="standard-input">
            <button type="submit" class="standard-button">
              Search
            </button>
          </div>
        </div>
        <div class="search-divider">
          <button class="toggle-advanced">
            Toggle Advanced Search
          </button>
        </div>
        <div class="advanced-search ${advancedSearch?'active':''}">
          <div>
            Advanced fields map to the <a target="_blank" href="https://docs.bsky.app/docs/api/app-bsky-feed-search-posts">searchPosts endpoint</a>
          </div>
          <div class="row-1fr-1fr">
            <label class="field">
              <span class="label">Sort</span>
              <input name="sort" value="${searchQuery.sort || 'top'}" value="latest">
            </label>
            <label class="field">
              <span class="label">limit</span>
              <input name="limit" value="${searchQuery.limit || ''}">
            </label>
          </div>

          <div class="row-1fr-1fr">
            <label class="field">
              <span class="label">Since</span>
              <input name="since" value="${searchQuery.since || ''}">
            </label>

            <label class="field">
              <span class="label">Until</span>
              <input name="until" value="${searchQuery.until || ''}">
            </label>
          </div>

          <div class="row-1fr-1fr">
            <label class="field">
              <span class="label">@ Mentions</span>
              <input name="mentions" value="${searchQuery.mentions || ''}">
            </label>
            <label class="field">
              <span class="label"># Tags</span>
              <input name="tag" value="${searchQuery.tag || ''}">
            </label>
          </div>

          <div class="row-1fr-1fr">
            <label class="field">
              <span class="label">Author</span>
              <input name="author" value="${searchQuery.author || ''}">
            </label>

            <label class="field">
              <span class="label">Lang</span>
              <input name="lang" value="${searchQuery.lang || ''}">
            </label>
          </div>

          <div class="row-1fr-1fr">
            <label class="field">
              <span class="label">domain</span>
              <input name="domain" value="${searchQuery.domain || ''}">
            </label>

            <label class="field">
              <span class="label">url</span>
              <input name="url" value="${searchQuery.url || ''}">
            </label>
          </div>
        </div>
      </form>
      <div class="feed ${modes.search}">${
        searchResults
          ? searchResults.map(renderSearchResult).join('')
          : '<bluesky-discovery></bluesky-discovery>'
      }</div>
      <div class="load-more" data-feed="searchResults"></div>
    `
  },
  [modes.backpack]: (root, container) => {
    container.innerHTML = `
      <div class="operating-system">
        <iframe src="/app/plan98-backpack"></iframe>
      </div>
    `
  },
  [modes.settings]: (root, container) => {
    container.innerHTML = `
      <div class="settings-section">
        To disconnect this client, click<br/>
        <button data-logout class="standard-button">Logout</button>
      </div>

      <div class="settings-section">
        <strong>Author's note:</strong><br>
        Probably a flamewar, but. You don't quit vim. You embed it.<br><br>
        <code-module src="${new URL(import.meta.url).pathname}"></code-module>
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

const modeActionRenderers = {
  [modes.me]: (root, container) => {
    container.innerHTML = `
      <div class="action-area">
        <button class="standard-button" data-edit-profile>
          Edit Profile
        </button>
      </div>
    `
  },
  [modes.profile]: (root, container) => {
    const { activeActor } = $.learn()

    const profile = $.learn()[activeActor]

    if(!profile) return
    const { following } = profile.viewer
    container.innerHTML = `
      <div class="action-area">
        ${ following 
          ? `
            <button class="standard-button" data-unfollow data-following="${following}" data-handle="${profile.handle}" data-did="${profile.did}">
              Unfollow
            </button>
          ` : `
            <button class="standard-button" data-follow data-handle="${profile.handle}" data-did="${profile.did}">
              Follow
            </button>
          `
        }
      </div>
    `
  },
}

function renderActionsByMode(root, container) {
  const { mode } = $.learn()
  return (
    modeActionRenderers[mode] || ((_,c) => c.innerHTML = '')
  )(root, container)
}

function renderByMode(root, container) {
  const { mode } = $.learn()

  return (modeRenderers[mode] || non)(root, container)
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
                placeholder="What's good?"
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
  },
  [views.notification]: (target) => {
    const cid = target.getAttribute('cid')
    const uri = target.getAttribute('uri')
    const record = $.learn()[cid]

    if(record) {
      return `
        <div class="notification-context">
          ${renderPost(record)}
        </div>
      `
    }
    return `
      <a href="/app/blue-sky?view=${views.post}&cid=${cid}&uri=${uri}">your post</a>
    `
  },
  [views.replyPost]: (target) => {
    const {
      draft,
      draftHeight,
      draftContext
    } = $.learn()

    const { post } = draftContext

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="reply" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Reply
              </button>
            </div>
            <div class="text-well">
              <textarea
                class="draft-content"
                data-bind
                name="draft"
                placeholder="Write your reply"
                value="${escapeHyperText(draft)}"
                ${draftHeight ? `style="height: ${draftHeight}px"`:''}
              ></textarea>

              <div class="post -quoted">
                <div class="post-gutter">
                  <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
                    <img src="${post.author.avatar}" class="avatar" />
                  </a>
                </div>
                <div class="post-content">
                  <div class="post-meta">
                    <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
                    <span class="post-handle">
                      ${post.author.handle}
                    </span>
                    <span class="post-timestamp">
                      <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
                    </span>
                  </div>
                  <div class="body">${
                    postTypeRenderers[post.record.$type]
                      ?postTypeRenderers[post.record.$type](draftContext)
                      :escapeHyperText(post.record.text)
                  }</div>
                </div>
              </div>
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
  },
  [views.quotePost]: (target) => {
    const {
      draft,
      draftHeight,
      draftContext
    } = $.learn()

    const { post } = draftContext

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="quote" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Quote
              </button>
            </div>
            <div class="text-well">
              <textarea
                class="draft-content"
                data-bind
                name="draft"
                placeholder="What about it?"
                value="${escapeHyperText(draft)}"
                ${draftHeight ? `style="height: ${draftHeight}px"`:''}
              ></textarea>
              <div class="post -quoted">
                <div class="post-gutter">
                  <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
                    <img src="${post.author.avatar}" class="avatar" />
                  </a>
                </div>
                <div class="post-content">
                  <div class="post-meta">
                    <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
                    <span class="post-handle">
                      ${post.author.handle}
                    </span>
                    <span class="post-timestamp">
                      <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
                    </span>
                  </div>
                  <div class="body">${
                    postTypeRenderers[post.record.$type]
                      ?postTypeRenderers[post.record.$type](draftContext)
                      :escapeHyperText(post.record.text)
                  }</div>
                </div>
              </div>
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
  },

  [views.postMenu]: (target) => {
    const { mode } = $.learn()
    const cid = target.getAttribute('cid')
    const uri = target.getAttribute('uri')

    let record = $.learn()[cid] || {}

    if(!record.post) {
      const timeline = $.learn()[timelinesByMode[mode]]

      if(!timeline) return 

      record = timeline.find(data => {
        return data.post.cid === cid
      })

      if(!record) return
    }

    const actions = [
      {
        label: 'Share Menu',
        icon: '<sl-icon name="upload"></sl-icon>',
        action: 'shareMenu'
      },
      {
        label: 'Luau Sandbox',
        icon: '<sl-icon name="box-seam"></sl-icon>',
        action: 'luau'
      },
      {
        label: 'JS Sandbox',
        icon: '<sl-icon name="filetype-js"></sl-icon>',
        action: 'runJs'
      }
    ]

    if(record.post?.author.did === agent.session?.did) {
      actions.push({
        label: 'Delete post',
        icon: '<sl-icon name="trash"></sl-icon>',
        action: 'deletePost'
      })
    }

    return actions.map(action => {
      return `
        <action-script data-action="${action.action}" data-script="${action.script||import.meta.url}" data-cid="${cid}" data-uri="${uri}">
          <div style="display: grid; gap: .5rem; grid-template-columns: 1fr auto; align-items: center;">
            ${action.label}
            <span>
              ${action.icon}
            </span>
          </div>
        </action-script>
      `
    }).join('')
  },
  [views.shareModal]: (target) => {
    const { mode } = $.learn()
    const cid = target.getAttribute('cid')
    const uri = target.getAttribute('uri')

    let record = $.learn()[cid] || {}

    if(!record.post) {
      const timeline = $.learn()[timelinesByMode[mode]]

      if(!timeline) return 

      record = timeline.find(data => {
        return data.post.cid === cid
      })

      if(!record) return
    }

    const { post } = record

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="copyLink" cid="${cid}" uri="${uri}" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Copy Link
              </button>
            </div>
            <div class="text-well">
              <div class="post -quoted">
                <div class="post-gutter">
                  <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
                    <img src="${post.author.avatar}" class="avatar" />
                  </a>
                </div>
                <div class="post-content">
                  <div class="post-meta">
                    <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
                    <span class="post-handle">
                      ${post.author.handle}
                    </span>
                    <span class="post-timestamp">
                      <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
                    </span>
                  </div>
                  <div class="body">${
                    postTypeRenderers[post.record.$type]
                      ?postTypeRenderers[post.record.$type](record)
                      :escapeHyperText(post.record.text)
                  }</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `
  },

  [views.confirmDelete]: (target) => {
    const { mode } = $.learn()
    const cid = target.getAttribute('cid')
    const uri = target.getAttribute('uri')

    let record = $.learn()[cid] || {}

    if(!record.post) {
      const timeline = timelinesByMode[mode]

      if(!timeline) return

      record = $.learn()[timeline].find(data => {
        return data.post.cid === cid
      })
    }

    const { post } = record

    return `
      <div class="overlay-background">
        <div class="form-card">
          <form action="confirmDelete" cid="${cid}" uri="${uri}" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="reset">
                Cancel
              </button>
              <button class="standard-button" style="place-self: end;" type="submit">
                Delete
              </button>
            </div>
            <div class="text-well">
              <div class="card-instructions">
                By pressing "Delete", you confirm your intent to delete the following post:
              </div>
              <div class="post -quoted">
                <div class="post-gutter">
                  <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-avatar">
                    <img src="${post.author.avatar}" class="avatar" />
                  </a>
                </div>
                <div class="post-content">
                  <div class="post-meta">
                    <a href="/app/blue-sky?handle=${post.author.handle}" data-actor="${post.author.did}" target="_blank" class="post-displayname">${post.author.displayName}</a>
                    <span class="post-handle">
                      ${post.author.handle}
                    </span>
                    <span class="post-timestamp">
                      <sl-relative-time date="${post.record.createdAt}" format="long"></sl-relative-time>
                    </span>
                  </div>
                  <div class="body">${
                    postTypeRenderers[post.record.$type]
                      ?postTypeRenderers[post.record.$type](record)
                      :escapeHyperText(post.record.text)
                  }</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `

  },
}

export function deletePost(event, target) {
  popover()
  const { cid, uri } = target.dataset
  showModal(`
    <blue-sky view="${views.confirmDelete}"  cid="${cid}" uri="${uri}"></blue-sky>
  `, {
    transparent: true
  })
}

export function shareMenu(event, target) {
  popover()
  const { cid, uri } = target.dataset
  showModal(`
    <blue-sky view="${views.shareModal}"  cid="${cid}" uri="${uri}"></blue-sky>
  `, {
    transparent: true
  })
}

export function luau(event, target) {
  const { cid, uri } = target.dataset
  popover()

  const { mode } = $.learn()

  let record = $.learn()[cid] || {}

  if(!record.post) {
    const timeline = $.learn()[timelinesByMode[mode]]

    if(!timeline) return 

    record = timeline.find(data => {
      return data.post.cid === cid
    })

    if(!record) return
  }

  const { post } = record

  import('./luau-repl.js').then((module) => {
    const $luau = module.default

    function load() {
      if($luau.learn().ready) {
        try {
          const logs = module.haveLuau(post.record.text)
          showModal(`
            <div style="background: white; white-space: preserve; font-family: 'BerkeleyMono', monospace; padding: 1rem;">${logs.join('\n')}</div>
          `, {
            blockExit: false
          })
        } catch(e) {
          console.error(e)
        }

      } else {
        requestAnimationFrame(load)
      }
    }

    requestAnimationFrame(load)
  }).catch(e => {
    console.error(e)
  })
}

export function runJs(event, target) {
  const { cid, uri } = target.dataset
  popover()

  const { mode } = $.learn()

  let record = $.learn()[cid] || {}

  if(!record.post) {
    const timeline = $.learn()[timelinesByMode[mode]]

    if(!timeline) return 

    record = timeline.find(data => {
      return data.post.cid === cid
    })

    if(!record) return
  }

  const { post } = record

  import('./js-repl.js').then(async (module) => {
    const output = await module.runJs(post.record.text)
    showModal(`
      <div style="background: white; white-space: preserve; font-family: 'BerkeleyMono', monospace; padding: 1rem;">${JSON.stringify(output, '', 2)}</div>
    `, {
      blockExit: false
    })
  }).catch(e => {
    console.error(e)
  })
}



$.draw(target => {
  const view = target.getAttribute('view')
  const query = target.getAttribute('query')
  const uri = target.getAttribute('uri')
  const cid = target.getAttribute('cid')
  const did = target.getAttribute('did')
  const handle = target.getAttribute('handle')
  const actor = did || handle

  if(!target.mounted) {
    target.mounted = true
    if(view === views.notification) {
      fetchPost(uri, cid)
    } else if(view === views.post) {
      fetchPost(uri, cid)
      const viewPost = { mode: modes.post, cid, uri }
      saveHistory({ type: 'viewPost', viewPost })
      navigatePost(viewPost)
    } else if(view === views.search) {
      const searchTag = { searchQuery: { q: target.getAttribute('q') }, searchResults: null }
      saveHistory({ type: 'searchTag', searchTag })
      navigateSearch(searchTag)
    } else if(actor) {
      saveHistory({ type: 'actor', actor })
      navigateActor(actor)
    } else if(!view) {
      self.history.replaceState({
        type: `${$.link}-navigation`,
        patch: { type: 'home', home: true }
      }, "");
    }
  }
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

  if(!target.querySelector('.app')) {
    return `
      <div class="app">
        <div class="sidebar"></div>
        <div class="content">
          <div class="action-bar">
            <button data-back>
              Back
            </button>
            <div class="mode-actions"></div>
          </div>
          <div class="dynamic-region"></div>
        </div>
      </div>
    `
  }
}, {
  beforeUpdate(target) {
    { // convert a query string to new post
      const q = target.getAttribute('q')
      const view = target.getAttribute('view')
      if(!target.initialized) {
        target.initialized = true
        if(q && view !== views.createPost) {
          showModal(`
            <blue-sky view="${views.createPost}" q="${q}"></blue-sky>
          `, {
            transparent: true
          })
        } else if(q) {
          $.teach({
            draft: decodeURIComponent(q)
          })
        }
      }
    }
  },
  afterUpdate(target) {
    requestAnimationFrame((timestamp) => {
      {
        afterUpdateTheme($paperPocket, target)
      }

      {
        const { mode } = $.learn()
        const scrollable = target.querySelector('.dynamic-region')
        const sidebar = target.querySelector('.sidebar')
        if(scrollable && target.mode !== mode) {
          target.mode = mode
          scrollable.scrollTop = 0

          if(sidebar) {
            const navHTML = Object.keys(navigation).map((key) => {
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
            }).join('')

            sidebar.innerHTML = navHTML
          }
        }
      }

      {
        const region = target.querySelector('.dynamic-region')

        if(region) {
          renderByMode(target, region)
        }
      }

      {
        const region = target.querySelector('.mode-actions')

        if(region) {
          renderActionsByMode(target, region)
        }
      }

      {
        const { mode, activeActor } = $.learn()
        const watcher = target.querySelector('.load-more')
        if(watcher) {
          target.observerMode = mode
          target.lastActiveActor = activeActor

          if(target.loaderObserver) {
            target.loaderObserver.disconnect()
          }

          target.loaderObserver = new IntersectionObserver((entries, observer) => {
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

          target.loaderObserver.observe(target.querySelector('.load-more'))

          const feed = target.querySelector('.feed')

          if(feed) {
            if(target.feedObserver) {
              target.feedObserver.disconnect()
            }

            target.feedObserver = new IntersectionObserver((entries, observer) => {
              entries.forEach(async (entry) => {
                if(entry.isIntersecting) {
                  showFeedItem(entry.target)
                } else {
                  hideFeedItem(entry.target)
                }
              });
            }, {
              root: target.querySelector('.content'),
              rootMargin: '0px',
              threshold: 0,
            });

            [...target.querySelectorAll('.feed > *')].map(x => {
              target.feedObserver.observe(x)
            })
          }
        }
      }
    })
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

const encoder = new TextEncoder()
const decoder = new TextDecoder()

class UnicodeString {
  constructor(utf16) {
    this.utf16 = utf16
    this.utf8 = encoder.encode(utf16)
  }

  // helper to convert utf16 code-unit offsets to utf8 code-unit offsets
  utf16IndexToUtf8Index(i) {
    return encoder.encode(this.utf16.slice(0, i)).byteLength
  }
}

async function detectFacets(draft) {
  const text = new UnicodeString(draft)
  let match
  const facets = []
  {
    // mentions
    const re = /(^|\s|\()(@)([a-zA-Z0-9.-]+)(\b)/g
    while ((match = re.exec(text.utf16))) {
      const handle = match[3]
      if (!isValidDomain(handle) && !handle.endsWith('.test')) {
        continue // probably not a handle
      }

      const resolveResponse = await agent.resolveHandle({ handle });

      const start = text.utf16.indexOf(match[3], match.index) - 1
      facets.push({
        $type: 'app.bsky.richtext.facet',
        index: {
          byteStart: text.utf16IndexToUtf8Index(start),
          byteEnd: text.utf16IndexToUtf8Index(start + match[3].length + 1),
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#mention',
            did: resolveResponse.data.did, // must be resolved afterwards
          },
        ],
      })
    }
  }
  {
    // links
    const re =
      /(^|\s|\()((https?:\/\/[\S]+)|((?<domain>[a-z][a-z0-9]*(\.[a-z0-9]+)+)[\S]*))/gim
    while ((match = re.exec(text.utf16))) {
      let uri = match[2]
      if (!uri.startsWith('http')) {
        const domain = match.groups?.domain
        if (!domain || !isValidDomain(domain)) {
          continue
        }
        uri = `https://${uri}`
      }
      const start = text.utf16.indexOf(match[2], match.index)
      const index = { start, end: start + match[2].length }
      // strip ending puncuation
      if (/[.,;!?]$/.test(uri)) {
        uri = uri.slice(0, -1)
        index.end--
      }
      if (/[)]$/.test(uri) && !uri.includes('(')) {
        uri = uri.slice(0, -1)
        index.end--
      }
      facets.push({
        index: {
          byteStart: text.utf16IndexToUtf8Index(index.start),
          byteEnd: text.utf16IndexToUtf8Index(index.end),
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#link',
            uri,
          },
        ],
      })
    }
  }
  {
    const re = /(?:^|\s)(#[^\d\s]\S*)(?=\s)?/g
    while ((match = re.exec(text.utf16))) {
      let [tag] = match
      const hasLeadingSpace = /^\s/.test(tag)

      tag = tag.trim().replace(/\p{P}+$/gu, '') // strip ending punctuation

      // inclusive of #, max of 64 chars
      if (tag.length > 66) continue

      const index = match.index + (hasLeadingSpace ? 1 : 0)

      facets.push({
        index: {
          byteStart: text.utf16IndexToUtf8Index(index),
          byteEnd: text.utf16IndexToUtf8Index(index + tag.length), // inclusive of last char
        },
        features: [
          {
            $type: 'app.bsky.richtext.facet#tag',
            tag: tag.replace(/^#/, ''),
          },
        ],
      })
    }
  }
  return facets.length > 0 ? facets : undefined
}

function isValidDomain(str) {
  return !!TLDs.find((tld) => {
    const i = str.lastIndexOf(tld)
    if (i === -1) {
      return false
    }
    return str.charAt(i - 1) === '.' && i === str.length - tld.length
  })
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

  & [view=${views.notification}] {
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
    overflow: hidden;
    background: rgba(255,255,255,.65);
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .dynamic-region {
    height: 100%;
    overflow: auto;
  }

  & .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: rgba(0,0,0,.25);
  }

  & .sidebar button {
    text-align: left;
    padding: 0 1rem;
    border-radius: 0;
    border: none;
    color: var(--root-theme, mediumseagreen);
    background: none;
    height: 3rem;
    display: grid;
    place-content: center;
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

  & .operating-system {
    height: 100%;
  }

  & .operating-system iframe {
    height: 100%;
    width: 100%;
    display: block;
    border: 0;
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

  & .post.-quoted {
    border: none;
    border-radius: 1rem;
    background:
      linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)),
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    padding: .5rem;
  }

  & .feed > * {
    visibility: hidden;
  }

  & .feed .feed-item-visible {
    visibility: visible;
  }

  & .post.-quoted .post-footer {
    display: none;
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
  }

  & .post-gutter {
    position: relative;
  }
  & .parent-context > .post > .post-gutter::before {
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: -2rem;
    width: 3px;
    background: rgba(0,0,0,.25);
    margin: 0 auto;
    position: absolute;
    z-index: 1;
  }

  & .active-context .post {
    background: rgba(255,255,255,.5);
  }

  & .notification-context {
    padding-top: .5rem;
  }
  & .notification-context .post {
    background: rgba(255,255,255,.5);
    border: none;
    padding: .5rem;
    border-radius: 1rem;
  }

  & .notification-context .post-footer {
    display: none;
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

  & .post-footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-top: .5rem;
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
  }

  & .sidebar .navigation {
    background: rgba(0,0,0,.85);
    display: grid;
    grid-template-columns: 2rem 1fr;
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
    height: 2rem;
    display: grid;
    place-content: center;
  }

  @media (max-width: 36rem) {

    & .sidebar .navigation {
      grid-template-columns: 2rem;
    }

    & .sidebar button {
      width: 3rem;
    }
    & .navigation-label {
      display: none;
    }
  }

  & .hero {
    min-height: 66px;
    position: relative;
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

  & .login-card {
    display: block;
    background: white;
    max-width: 55ch;
    margin: 0 auto;
    padding: .5rem;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);
    overflow: hidden;
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

  & [data-actor] * {
    pointer-events: none !important;
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

  & .post[aria-role="button"] *:not(a, button, img, video) {
    pointer-events: none;
  }

  & .post[aria-role="button"] a,
  & .post[aria-role="button"] button,
  & .post[aria-role="button"] img,
  & .post[aria-role="button"] video {
    pointer-events: all;
  }

  & .post-reason {
    padding: .5rem 1rem 0;
    font-size: .75em;
    font-weight: bold;
    opacity: .65;
  }

  & .post-text {
    margin-bottom: .5rem;
    white-space: preserve;
  }

  & .post-image {
    max-height: 300px;
    background: black;
  }

  & .post-image img {
    object-fit: contain;
    max-height: 300px;
    margin: auto;
    display: block;
  }

  & .post-video {
    max-height: 300px;
    background: black;
  }

  & .post-video hls-video {
    max-height: 300px;
    overflow: hidden;
    background: transparent;
  }
  
  & .post-video hls-video video {
    max-height: 300px;
    object-fit: contain;
  }

  & .card-instructions {
    margin: 1rem 0;
    color: rgba(0,0,0,.65);
  }

  & .text-well {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
  }

  & .action-bar {
    background: rgba(0,0,0,.85);
    backdrop-filter: blur(2px);
    padding: 4px;
    position: sticky;
    top: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: auto 1fr;
  }

  & [data-back] {
    border: none;
    border-radius: 0;
    background: transparent;
    padding: 4px;
    color: rgba(255,255,255,.65);
  }

  & [data-back]:hover,
  & [data-back]:focus, {
    color: rgba(255,255,255,.85);
  }

  & .action-bar .standard-button {
    padding: 4px 8px;
    font-size: 1rem;
  }

  & .notification-reason {
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }

  & .search-form {
    background:
      linear-gradient(rgba(255,255,255,.15), rgba(255,255,255,.15)),
      linear-gradient(335deg, var(--root-theme, mediumseagreen), rgba(0,0,0,.15) 20%, rgba(0,0,0,.25)),
      linear-gradient(-65deg, rgba(0,0,0,.5), rgba(255,255,255,.15)),
      var(--root-theme, mediumseagreen);
    position: sticky;
    top: 0;
    z-index: 10;
    max-height: 100%;
    overflow: auto;
  }

  & .basic-search {
    background: rgba(0,0,0,.85);
    padding: .5rem;
  }

  & .advanced-search {
    padding: .5rem;
    display: none;
    background: rgba(255,255,255,.85);
  }

  & .advanced-search.active {
    display: block;
  }

  & .row-1fr-auto {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr auto;
  }

  & .row-auto-1fr {
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
  }

  & .row-1fr-1fr {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }

  & .search-divider { 
    text-align: center;
  }

  & .toggle-advanced {
    width: 100%;
    border-radius: 0;
    background: transparent;
    padding: .5rem;
    text-align: center;
    border: none;
    color: rgba(255,255,255,.85);
    font-weight: bold;
  }

  & .action-area {
    text-align: right;
  }
`)

$.when('input', '[data-bind]', (event) => {
  $.teach({[event.target.name]: event.target.value })
})

$.when('click', '.toggle-advanced', (event) => {
  event.preventDefault()
  $.teach({ advancedSearch: !$.learn().advancedSearch })
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

$.when('click', '[data-back]', (event) => {
  history.back()
})

function navigateHome(bool) {
  if(bool) {
    $.teach({ mode: modes.timeline })
  } else {
    $.teach({ mode: modes.me })
  }
}

function saveHistory(patch) {
  self.history.pushState({
    type: `${$.link}-navigation`,
    patch
  }, "");
}

function restoreHistory(patch) {
  patchHandlers[patch.type]
    ? patchHandlers[patch.type](patch[patch.type])
    : ''
}

const patchHandlers = {
  actor: navigateActor,
  viewPost: navigatePost,
  searchTag: navigateSearch,
  home: navigateHome,
}

addEventListener("popstate", async (event) => {
  const { type, patch } = event.state || {}
  if(type === `${$.link}-navigation`) {
    restoreHistory(patch)
  }
});

import elf from "@silly/elf"
import { getAgent } from './blue-sky.js'

const $ = elf('bluesky-discovery', {
  feeds: [],
  actors: []
})

function getSuggestedFeeds() {
  const agent = getAgent()

  if(agent) {
    agent.app.bsky.feed.getSuggestedFeeds()
      .then(({ data, success }) => {
        if(success) {
          $.teach({ feeds: data.feeds })
        }
      })
  }
}

function getSuggestions() {
  const agent = getAgent()

  if(agent) {
    agent.app.bsky.actor.getSuggestions()
      .then(({ data, success }) => {
        if(success) {
          $.teach({ actors: data.actors })
        }
      })
  }
}

$.draw((target) => {
  if(!target.mounted) {
    target.mounted = true
    getSuggestions()
    getSuggestedFeeds()
  }
  const { feeds, actors } = $.learn()
  return `
    ${actors.map(renderActor).join('')}
    ${feeds.map(renderFeed).join('')}
  `
})

function renderFeed(data) {
  const {
    did,
    uri,
    cid,
    displayName,
    description,
    creator,
    avatar,
    indexedAt
  } = data

  const author = creator

  return `
    <div class="post-reason">
      Created by
      <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.handle}" target="_blank" class="post-displayname">${author.displayName}</a>
      <span class="post-handle">
        ${author.handle}
      </span>
    </div>

    <div class="post">
      <div class="post-gutter">
        <a href="/app/blue-sky?cid=${cid}&uri=${uri}" data-actor="${author.handle}" target="_blank" class="post-displayname">
          <img src="${avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?cid=${cid}&uri=${uri}" data-actor="${author.handle}" target="_blank" class="post-displayname">${displayName}</a>
        </div>
        <div class="body">${description}</div>
      </div>
    </div>
  `
}
function renderActor(data) {
  const {
    did,
    uri,
    cid,
    displayName,
    description,
  } = data

  const author = data
  return `
    <div class="post">
      <div class="post-gutter">
        <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.handle}" target="_blank" class="post-avatar">
          <img src="${author.avatar}" class="avatar" />
        </a>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <a href="/app/blue-sky?handle=${author.handle}" data-actor="${author.handle}" target="_blank" class="post-displayname">${author.displayName}</a>
          <span class="post-handle">
            ${author.handle}
          </span>
        </div>
        <div class="body">${displayName} ${description}</div>
      </div>
    </div>
  `
}

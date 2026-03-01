import { Self } from "@plan98/types"

import {
  getSession
} from './bayun-wizard.js'

import { get, put } from './plan98-wallet.js'

const views = {
  createPost: 'createPost',
  account: 'account',
  profile: 'profile',
  detail: 'detail',
}

const $ = Self('plan98-gallery', {
  draft: '',
  draftHeight: null,
  thumbSize: 180,
  selected: {}, // { [cid]: true }
})

function isPickerMode(target) {
  return target.closest($.link)?.getAttribute('mode') === 'picker'
}

function getEnforceTypes(target) {
  const raw = target.closest($.link)?.getAttribute('enforceTypes') || ''
  if (!raw.trim()) return null
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}

function getLimit(target) {
  const raw = target.closest($.link)?.getAttribute('limit')
  if (!raw) return Infinity
  const n = parseInt(raw, 10)
  return isNaN(n) ? Infinity : n
}

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
  return target.closest($.link).getAttribute('ur') || 'public'
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

$.when('click', '.gallery-thumb', (event) => {
  const thumb = event.target.closest('.gallery-thumb')
  if (!thumb) return
  const cid = thumb.dataset.cid

  if (isPickerMode(event.target)) {
    const limit = getLimit(event.target)
    const { selected } = $.learn()
    const next = { ...selected }

    if (next[cid]) {
      // Deselect
      delete next[cid]
    } else {
      const currentCount = Object.keys(next).length
      if (currentCount >= limit) {
        if (limit === 1) {
          // For limit=1, replace the existing selection
          const existingKey = Object.keys(next)[0]
          delete next[existingKey]
        } else {
          // At capacity for multi-select, do nothing
          return
        }
      }
      next[cid] = true
    }

    $.teach({ selected: next })
    return
  }

  $.teach({ currentView: views.detail, detailCid: cid })
})

$.when('click', '[data-share-selected]', (event) => {
  const target = event.target.closest($.link)
  const timelineUR = target.getAttribute('ur') || 'public'
  const timeline = getTimeline(timelineUR)
  const { selected } = $.learn()

  const items = timeline.filter(r => selected[r.cid])
  if (!items.length) return

  // Dispatch event for parent to consume
  target.dispatchEvent(new CustomEvent('gallery-share', {
    bubbles: true,
    detail: { items }
  }))

  // Clear selection
  $.teach({ selected: {} })
})

$.when('click', '.back-to-gallery', () => {
  $.teach({ currentView: views.profile, detailCid: null })
})

$.when('submit', '[action="post"]', async (event) => {
  event.preventDefault()
  const { draft, activeTimeline } = $.learn()
  
  if (!draft.trim()) return

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
  return `
    <div class="profile">
      <button class="manage-account">
        Account
      </button>
    </div>
  `
}

function renderThumb(resource, options = {}) {
  const { cid, record } = resource
  const type = record.$type
  const { enforceTypes } = options

  // In enforceTypes mode, skip non-allowed types entirely — they won't appear in the grid
  if (enforceTypes && !enforceTypes.includes(type)) {
    return ''
  }

  if (type === 'computer.sillyz.data.image') {
    return `
      <button class="gallery-thumb" data-cid="${cid}">
        <was-image src="${record.src}"></was-image>
      </button>
    `
  }

  if (type === 'computer.sillyz.data.video') {
    return `
      <button class="gallery-thumb" data-cid="${cid}">
        <was-video src="${record.src}" nocontrols></was-video>
        <div class="thumb-play-icon">▶</div>
      </button>
    `
  }

  const preview = escapeHyperText((record.text || '').slice(0, 120))
  return `
    <button class="gallery-thumb text-thumb" data-cid="${cid}">
      <div class="thumb-text">${preview}</div>
    </button>
  `
}

function renderDetailView(resource) {
  const { cid, uri, record, author } = resource

  let mediaHTML = ''
  if (record.$type === 'computer.sillyz.data.image') {
    mediaHTML = `<was-image src="${record.src}"></was-image>`
  } else if (record.$type === 'computer.sillyz.data.video') {
    mediaHTML = `<was-video src="${record.src}" controls></was-video>`
  } else {
    mediaHTML = `<div class="detail-text">${escapeHyperText(record.text)}</div>`
  }

  return `
    <div class="detail-view" data-cid="${cid}">
      <div class="detail-header">
        <button class="back-to-gallery standard-button -clear">← Back</button>
      </div>
      <div class="detail-body">
        ${mediaHTML}
      </div>
      <div class="detail-meta">
        <span class="post-displayname">${escapeHyperText(author.moniker)}</span>
        <span class="post-group">${escapeHyperText(author.group)}</span>
        <span class="post-timestamp">${new Date(record.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="detail-footer">
        <button data-action="reply" data-cid="${cid}" data-uri="${uri}" class="footer-action">
          0 <span>💬</span>
        </button>
        <button data-action="repost" data-cid="${cid}" data-uri="${uri}" class="footer-action">
          0 <span>🔄</span>
        </button>
        <button data-action="like" data-cid="${cid}" data-uri="${uri}" class="footer-action">
          0 <span>❤️</span>
        </button>
      </div>
    </div>
  `
}

const recordRenderers = {
  'computer.sillyz.data.video': (record) => {
    return `<was-video src="${record.src}"></was-video>`
  },
  'computer.sillyz.data.image': (record) => {
    return `<was-image src="${record.src}"></was-image>`
  },
  'computer.sillyz.data.text': (record) => {
    return `<div class="post-text">${escapeHyperText(record.text)}</div>`
  },
  text: (record) => {
    return `<div class="post-text">${escapeHyperText(record.text)}</div>`
  }
}

function renderRecord(record) {
  return (recordRenderers[record.$type] || recordRenderers.text)(record)
}

$.draw(target => {
  if (target._initialized) return
  target._initialized = true

  return `
    <div data-view="auth">
      <quick-start></quick-start>
    </div>
    <div data-view="profile" class="gallery-view" hidden>
      <button class="new-post" data-tooltip="oooops">Create</button>
      <div class="scrollable-view">
        <div class="profile-container"></div>
        <div class="gallery-grid"></div>
      </div>
      <div class="thumb-slider-container">
        <input type="range" class="thumb-slider" min="32" max="1024" value="180" />
      </div>
    </div>
    <div data-view="detail" class="gallery-view" hidden>
      <div class="detail-container scrollable-view"></div>
    </div>
    <div data-view="createPost" hidden>
      <div class="overlay-background">
        <div class="form-card">
          <form action="post" method="post" class="draft-template">
            <div class="draft-header">
              <button data-cancel-draft class="standard-button -clear" style="place-self: start;" type="button">Cancel</button>
              <button class="standard-button" style="place-self: end;" type="submit">Post</button>
            </div>
            <div class="text-well">
              <textarea class="draft-content" data-input name="draft" placeholder="What's good?"></textarea>
            </div>
            <div class="draft-footer">
              <div class="draft-counter" style="place-self: end">300</div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div data-view="account" hidden>
      <button class="view-profile">Profile</button>
      <secure-persona></secure-persona>
    </div>
  `
}, {
  async beforeUpdate(target) {
    if (!target.mounted) {
      target.mounted = true

      try {
        const session = await getSession()
        if (session) $.teach({ authenticated: true })
      } catch(e) { console.error(e) }

      try {
        const timelineUR = getTimelineUR(target)
        const response = await fetchTimeline(timelineUR)
        const json = await response.text()
        const data = JSON.parse(json)
        $.teach({ timelineUR, data }, (state, payload) => ({
          ...state,
          [payload.timelineUR]: payload.data.timeline
        }))
      } catch (error) {
        console.log(error)
      }
    }
  },

  afterUpdate(target) {
    const { authenticated, currentView, draft, draftHeight, detailCid } = $.learn()

    const activeView = !authenticated ? 'auth'
      : (currentView || 'profile')

    // In picker mode, always show profile view and skip view management
    if (isPickerMode(target)) {
      target.querySelectorAll('[data-view]').forEach(el => {
        el.hidden = el.dataset.view !== 'profile'
      })
    } else {
      target.querySelectorAll('[data-view]').forEach(el => {
        el.hidden = el.dataset.view !== activeView
      })
    }

    if (!isPickerMode(target)) {
      // Draft sync
      const textarea = target.querySelector('[name="draft"]')
      if (textarea && document.activeElement !== textarea) {
        textarea.value = draft || ''
      }
      if (textarea && draftHeight) {
        textarea.style.height = draftHeight + 'px'
      }
      const counter = target.querySelector('.draft-counter')
      if (counter) counter.textContent = 300 - (draft || '').length

      // Profile
      const profileContainer = target.querySelector('.profile-container')
      if (profileContainer && !profileContainer.hasChildNodes()) {
        profileContainer.innerHTML = renderProfile(getProfile())
      }
    }

    // Gallery grid — append new thumbs, filtering by enforceTypes when in picker mode
    const timelineUR = getTimelineUR(target)
    const timeline = getTimeline(timelineUR)
    const enforceTypes = isPickerMode(target) ? getEnforceTypes(target) : null
    const grid = target.querySelector('.gallery-grid')
    if (grid) {
      const existingCids = new Set(
        [...grid.querySelectorAll('.gallery-thumb')].map(el => el.dataset.cid)
      )
      timeline.forEach(resource => {
        if (!existingCids.has(resource.cid)) {
          const html = renderThumb(resource, { enforceTypes })
          if (html) grid.insertAdjacentHTML('beforeend', html)
        }
      })
    }

    {
      const { thumbSize } = $.learn()
      const slider = target.querySelector('.thumb-slider')
      if (slider && document.activeElement !== slider) {
        slider.value = thumbSize
      }
      if (grid) {
        grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${thumbSize}px, 1fr))`
      }
    }

    if (!isPickerMode(target)) {
      // Detail view
      const detailContainer = target.querySelector('.detail-container')
      if (activeView === 'detail' && detailCid && detailContainer) {
        const current = detailContainer.querySelector(`.detail-view[data-cid="${detailCid}"]`)
        if (!current) {
          const resource = timeline.find(r => r.cid === detailCid)
          if (resource) {
            detailContainer.innerHTML = renderDetailView(resource)
          }
        }
      }
    }

    if (isPickerMode(target)) {
      const { selected } = $.learn()
      const limit = getLimit(target)
      const count = Object.keys(selected).length

      // Sync selected highlight state on thumbs
      const thumbs = target.querySelectorAll('.gallery-thumb')
      thumbs.forEach(thumb => {
        thumb.classList.toggle('selected', !!selected[thumb.dataset.cid])
      })

      // Dim unselectable thumbs when at capacity (only meaningful for multi-select)
      if (limit > 1 && limit !== Infinity) {
        const atLimit = count >= limit
        thumbs.forEach(thumb => {
          const isSelected = !!selected[thumb.dataset.cid]
          thumb.classList.toggle('at-limit', atLimit && !isSelected)
        })
      }

      // Confirm button — always present in picker mode, disabled until something is selected
      let confirmBtn = target.querySelector('[data-share-selected]')
      if (!confirmBtn) {
        const btn = document.createElement('button')
        btn.setAttribute('data-share-selected', '')
        btn.setAttribute('type', 'button')
        btn.className = 'share-selected-btn'
        target.querySelector('.gallery-view:not([hidden])')?.appendChild(btn)
        confirmBtn = btn
      }

      if (count > 0) {
        const countLabel = limit !== Infinity ? `${count}/${limit} ` : `${count} `
        confirmBtn.textContent = `Confirm ${countLabel}selection`
        confirmBtn.disabled = false
      } else {
        confirmBtn.textContent = limit === 1
          ? 'Select an image to continue'
          : limit !== Infinity
            ? `Select up to ${limit} items`
            : 'Select items to continue'
        confirmBtn.disabled = true
      }

      confirmBtn.style.display = 'block'
    }
  }
})

$.when('input', '.thumb-slider', (event) => {
  $.teach({ thumbSize: parseInt(event.target.value) })
})

$.style(`
  & {
    position: relative;
    display: block;
    overflow: hidden;
    height: 100%;
  }

  & .gallery-view {
    height: 100%;
  }

  & .scrollable-view {
    overflow: auto;
    height: 100%;
  }

  & .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1px;
  }

  & .thumb-slider-container {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: .5rem;
  }

  & .thumb-slider {
    width: 120px;
    cursor: pointer;
    accent-color: var(--root-theme, mediumseagreen);
  }

  & .gallery-thumb {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    background: rgba(0,0,0,.05);
    transition: opacity .15s ease;
  }

  & .gallery-thumb.at-limit {
    opacity: .35;
    cursor: not-allowed;
  }

  & .gallery-thumb img,
  & .gallery-thumb video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  & .gallery-thumb.text-thumb {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    display: grid;
    place-content: center;
    padding: .5rem;
  }

  & .thumb-text {
    font-size: .75rem;
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    text-align: center;
    word-break: break-word;
  }

  & .thumb-play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: white;
    text-shadow: 0 1px 4px rgba(0,0,0,.5);
    pointer-events: none;
  }

  & .detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  & .detail-view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  & .detail-header {
    padding: .5rem;
  }

  & .detail-body {
    flex: 1;
    display: grid;
    place-content: center;
    background: black;
    overflow: hidden;
    min-height: 0;
  }

  & .detail-media {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  & .detail-text {
    padding: 2rem;
    color: rgba(255,255,255,.85);
    font-size: 1.25rem;
    white-space: pre-wrap;
    text-align: center;
  }

  & .detail-meta {
    padding: .75rem 1rem;
    display: flex;
    gap: .5rem;
    align-items: baseline;
  }

  & .detail-footer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: .5rem;
    border-top: 1px solid rgba(0,0,0,.1);
  }

  & .empty-timeline {
    text-align: center;
    padding: 2rem;
    color: rgba(0,0,0,.5);
    grid-column: 1 / -1;
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

  & .footer-action {
    display: inline-grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    justify-self: center;
    gap: .5rem;
    background: linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    border: none;
    color: rgba(0,0,0,.65);
    opacity: .5;
    cursor: pointer;
  }

  & .footer-action:hover,
  & .footer-action:focus {
    opacity: 1;
  }

  & .footer-action span {
    font-size: .75em;
  }

  & .profile {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  & .new-post {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    padding: .5rem 1rem;
    border: 2px solid var(--root-theme, mediumseagreen);
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
    position: fixed;
    right: .5rem;
    top: .5rem;
    padding: .5rem 1rem;
    border: 2px solid var(--root-theme, mediumseagreen);
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
    padding: 0;
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .form-card {
    display: grid;
    background: white;
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

  & [data-view] {
    height: 100%;
  }

  & .gallery-thumb.selected {
    outline: 3px solid var(--root-theme, mediumseagreen);
    outline-offset: -3px;
    opacity: .85;
  }

  & .gallery-thumb.selected::after {
    content: '✓';
    position: absolute;
    top: .25rem;
    right: .25rem;
    width: 1.5rem;
    height: 1.5rem;
    background: var(--root-theme, mediumseagreen);
    color: white;
    border-radius: 50%;
    display: grid;
    place-content: center;
    font-size: .75rem;
    font-weight: bold;
  }

  & .share-selected-btn {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    padding: .5rem 1.5rem;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), var(--root-theme, mediumseagreen);
    color: white;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
    white-space: nowrap;
    transition: background .15s ease, opacity .15s ease;
  }

  & .share-selected-btn:disabled {
    opacity: .4;
    cursor: default;
    box-shadow: none;
  }

  & .share-selected-btn:not(:disabled):hover {
    background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.5)), var(--root-theme, mediumseagreen);
  }
`)

export default $

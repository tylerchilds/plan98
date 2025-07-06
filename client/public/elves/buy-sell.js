import elf from '@silly/elf'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'
import { saveProduct, eventTypes, newDraft } from './time-machine.js'
import { innerHTML } from 'diffhtml'

const views = {
  welcome: 'welcome',
  create: 'create',
  sell: 'sell',
  buy: 'buy',
  admin: 'admin',
  edge: 'edge'
}

const viewRenderers = {
  [views.welcome]: (state) => {
    return `
      <div class="app-title">
        Store
      </div>
      <button data-view="${views.buy}">Buy</button>
      <button data-view="${views.admin}">Sell</button>
    `
  },
  [views.buy]: (state) => {
    return `
      <div class="view-title">
        Buy
      </div>
      <button data-view="${views.buy}">Buy</button>
      <button data-view="${views.admin}">Sell</button>
    `
  },
  [views.sell]: (state) => {
    return `
      <buy-sell-wizard></buy-sell-wizard>
    `
  },
  [views.admin]: (state) => {
    return `
      <div>
        My Sales
      </div>
      <div>
        My Products
        <button data-view="${views.sell}">Sell</button>
      </div>

      <div>
        My Purchases
      </div>
    `
  },
  [views.create]: (state) => {
    const { draft, viewMetadata, context } = state
    const form = renderCreationFormByType.call(context, draft)
    const studio = renderStudioByType.call(context, draft)
    return `
      <div class="draft-template">
        <div class="draft-header">
          <button data-cancel-draft class="standard-button bias-generic -small -outlined" style="place-self: start;" type="reset">
            Cancel
          </button>
          <button data-action="post" class="standard-button bias-positive -small" style="place-self: start end;" type="submit">
            Save
          </button>
        </div>
        <div class="draft-body text-well">
          ${studio}
        </div>
        <div class="draft-footer">
          <div class="standard-button bias-generic -small" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
            <sl-icon name="gear-fill"></sl-icon>
          </div>
          <input class="standard-input -small" data-bind="draft"  name="title" value="${escapeHyperText(draft.title)}" type="text"/>
        </div>
        <div class="draft-metadata ${viewMetadata ? 'show-metadata':''}">
          <div class="time-form">
            <div class="time-form-section">
              ${typeSelector(draft.type)}
            </div>
            <div class="time-form-section" style="margin-left: auto;">
              ${yearSelector(parseInt(draft.year))}
              /
              ${monthSelector(parseInt(draft.month))}
              /
              ${daySelector(parseInt(draft.day), parseInt(draft.month), parseInt(draft.year))}
            </div>
            <div class="time-form-section">
              @
              ${hourSelector(parseInt(draft.hour))}
              <span>:</span>
              ${minuteSelector(parseInt(draft.minute))}
            </div>
          </div>

          ${form}
        </div>
      </div>
    `
  },
}


const $ = elf('buy-sell', {
  grabbing: false,
  sidebar: false,
  draft: {},
  view: views.welcome,
  categoryIds: ['001','003'],
  '001': {
    label: 'Movies',
    collectionIds: []
  },
  '003': {
    label: 'Music',
    collectionIds: []
  }
})

export default $

function query(target) {
  if(target.queried) return
  target.queried = true
}

$.draw((target)=> {
  query(target)
  if(target.innerHTML) return

  return `
    <div class="creation-container">
      <button data-dom="create-button" class="create-item standard-button" data-new>
        <sl-icon name="plus-lg"></sl-icon>
      </button>
      <div class="menu-item">
        <button class="more-item standard-button">
          <sl-icon name="list"></sl-icon>
        </button>
      </div>
    </div>
    <div data-dom="realm" class="chat-realm">
      <div class="now">
        <button data-back>Back</button>
        <div></div>
        <button data-view="${views.buy}">Buy</button>
        <button data-view="${views.admin}">Sell</button>
      </div>

      <div class="chat-sidebar">
        <div data-resize-sidebar></div>
        <div class="chat-sidebar-inner">
          ${sidebar()}
        </div>
        <div class="chat-footer">
          <div class="search-and-filter">
            <button class="standard-button">
              <sl-icon name="funnel"></sl-icon>
            </button>
            <input class="standard-input" placeholder="?" type="text">
          </div>
        </div>
      </div>
      <div data-dom="content" class="content-area"></div>
      <div class="fallback">
        <world-map></world-map>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    const src = target.getAttribute('src') || '/app/plan98-wallet'
    const view = target.getAttribute('view')
    if(!target.initialized) {
      target.initialized = true
      if(view) {
        $.teach({ view, src })
      }
    }
  },
  afterUpdate(target) {
    {
      requestAnimationFrame(() => {
        patch(target)
        //recoverElves(target, 'sl-icon')
      })
    }

    {
      afterUpdateTheme($paperPocket, target)
    }
  }
})

function patch(target) {
  const { view, draft, grabbing, sidebar } = $.learn()

  {
    const realm = target.querySelector('[data-dom="realm"]')
    if(realm.dataset.grabbing !== grabbing.toString()) {
      realm.dataset.grabbing = grabbing
    }
    if(realm.dataset.sidebar !== sidebar.toString()) {
      realm.dataset.sidebar = sidebar
    }
  }

  {
    const content = target.querySelector('[data-dom="content"]')
    if(target.view !== view) {
      target.view = view

      if(content) {
        const html = viewRenderers[view] ? `
          <buy-sell-child-${view}>
            ${viewRenderers[view](target)}
          </buy-sell-child-${view}>
        ` : ''
        innerHTML(content, html)
        //content.innerHTML = html
      }
    }
  }
}

function sidebar() {
  const { categoryIds } = $.learn()
  const categories = categoryIds.map(id => {
    const category = $.learn()[id] || {}

    return category
  })

  return `
    <div class="time-feed-nom-nom-nom-nom">
      ${categories.map(category => {
        const collection = category.collectionIds.map(id => {
          const category = $.learn()[id] || {}

          return category
        })

        return `
          <div class="era">
            <div class="era-header">
              <div class="era-label">
                ${category.label}
              </div>
            </div>
            <div class="era-events">
              ${collection.map(renderSidebar).join('')}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function renderSidebar(item) {
  return `
    <div class="event">
      ${item.title}
    </div>
  `
}

$.when('click', '.more-item', (event) => {
  event.preventDefault()
  const { sidebar } = $.learn()
  $.teach({ sidebar: !sidebar })
  event.stopImmediatePropagation()
})

$.when('click', '[data-view]', (event) => {
  event.preventDefault()
  const { view } = event.target.dataset
  $.teach({ view })
})

$.when('click', '[data-new]', (event) => {
  const { draft } = $.learn()
  const type = event.target.dataset.new || draft.type

  if(eventTypes[type]) {
    $.teach({
      name: 'type',
      value: type
    }, bound('draft'))
  }

  $.teach({ view: views.sell, draft: newDraft(eventTypes.product), sidebar: false })
})



$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
    animation: &-fade-in 1000ms ease-in-out forwards;
    background: black;
    opacity: 0;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      background: black;
    }
    100% {
      opacity: 1;
      background: white;
    }
  }

  & .time-feed-nom-nom-nom-nom {
    height: 100%;
    overflow: auto;
  }

  & .edit-banner {
    background: black;
    color: rgba(255,255,255,.65);
    text-align: right;
    padding: .5rem;
    grid-template-columns: auto 1fr;
    display: grid;
    gap: .5rem;
    overflow: hidden;
  }

  & .edit-label {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .edit-banner:empty {
    display: none;
  }

  & .era {
  }

  & .creation-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    display: inline-grid;
    grid-template-columns: auto auto;
    z-index: 1000;
  }

  & .create-item {
    font-size: 2rem;
    border-radius: 3px;
    padding: .5rem;
    font-weight: bold;
    border-radius: 100%;
    display: grid;
    place-content: center;
    z-index: 27;
    position: relative;
    left: 1.25rem;
  }

  & .more-item {
    padding: .5rem .5rem .5rem 1.5rem;
    font-weight: bold;
    border-radius: 0 .5rem .5rem 0;;
    display: grid;
    place-content: center;
    z-index: 26;
  }

  & .era-header {
    position: sticky;
    background: white;
    top: 0;
    z-index: 21;
    border-bottom: 1px solid rgba(0, 0, 0,.2);
  }

  & .era-label {
    color: rgba(0,0,0,.85);
    text-transform: uppercase;
    font-weight: 100;
    margin-bottom: 1rem;
    margin: 0 auto;
    padding: .5rem;
    font-size: .8rem;
    display: inline-block;
  }

  & .era-events {
    margin: auto;
    display: flex;
    flex-direction: column;
  }

  & .identity-selector {
    position: relative;
  }

  & [name="keycard"] {
    position: absolute;
    inset: 0;
    max-width: 320px;
  }

  & .logo-area {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 100%;
  }

  & .now {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: .5rem;
    padding: .5rem;
    background: white;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0,.2);
    position: relative;
    z-index: 30; 
    grid-column: -1 / 1;
  }

  & [data-sidebar="false"] .now {
    display: none;
  }

  & .content-area:empty {
    display: none;
  }

  & .fallback {
    display: none;
  }

  & .content-area:empty + .fallback {
    display: block;
  }

  & [data-sidebar="false"] .chat-sidebar {
    display: none;
  }

  & [data-sidebar="false"] .fallback,
  & [data-sidebar="false"] .content-area,
  & [data-sidebar="false"] .chat-sidebar {
    grid-row: -1 / 1;
  }

  & [data-sidebar="false"] .fallback,
  & [data-sidebar="false"] .content-area {
    grid-column: -1 / 1;
  }

  & .now-date {
    color: rgba(0,0,0,.65);
    place-self: start;
  }


  & .now-time {
    font-weight: bold;
    color: rgba(0,0,0,.45);
    place-self: start end;
  }

  & .the-past.visible {
    display: block;
  }

  & .the-past.hidden {
    display: none;
  }

  & .link-button {
    background: transparent;
    color: dodgerblue;
    text-decoration: underline;
    border: none;
    cursor: pointer;
    padding: .5rem 1rem;
  }

  & .overlay-background {
    height: 100%;
    background: rgba(0,0,0,.15);
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .wallet-body {
    padding: .5rem;
    overflow: auto;
  }

  & .form-card {
    display: grid;
    background: white;

    box-shadow:
      0 0 6px 6px rgba(0,0,0,.05),
      0 0 3px 3px rgba(0,0,0,.10),
      0 0 1px 1px rgba(0,0,0,.15);

    height: 100%;
    overflow: hidden;
  }

  & .draft-template {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    max-height: 100%;
    grid-template-areas: "footer header" "body body";
    grid-template-columns: 1fr auto;
  }

  & .raw-json {
    white-space: preserve;
    padding: .5rem;
  }

  & .image-well {
    overflow: hidden;
    text-align: center;
    background: black;
    position: relative;
  }

  & .text-well {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  & .text-well .textarea {
    padding: .5rem;
    white-space: preserve;
    overflow: auto;
    line-height: 1;
  }

  & .text-well textarea {
    padding: .5rem;
    resize: none;
    border: none;
    width: 100%;
    height: 100%;
    overflow: auto;
    line-height: 1;
  }

  & .text-well .edit-banner:empty + textarea {
    grid-row: -1 / 1;
  }

  & .draft-header {
    display: grid;
    grid-template-columns: auto auto;
    grid-area: header;
    background: rgba(0,0,0,.1);
    padding: .5rem;
    gap: .5rem;
  }

  & .draft-body {
    grid-area: body;
  }

  & .draft-metadata {
    display: none;
    grid-area: body;
    z-index: 1;
    background: white;
  }

  & .view-metadata {
    display: none;
    padding: .5rem;
    height: 100%;
    z-index: 1;
    background: linear-gradient(rgba(0,0,0,.05), rgba(0,0,0,.05)), white;
    grid-area: body;
  }


  & .view-metadata {
    display: none;
  }

  & .show-metadata {
    display: block;
  }


  & .draft-footer {
    display: grid;
    grid-area: footer;
    padding: .5rem;
    background: rgba(0,0,0,.1);
    color: rgba(0,0,0,.65);
    display: flex;
    gap: .5rem;
  }

  & .draft-content {
    grid-area: body;
    width: 100%;
    resize: none;
    border: 1px solid rgba(0,0,0,.15);
    padding: .5rem;
  }

  & .draft-title {
    color: rgba(0,0,0,.65);
    padding: .25rem .5rem;
    line-height: 1.3;
  }

  & .time-form {
    display: flex;
    gap: .5rem;
    padding: .5rem;
    flex-wrap: wrap;
    place-content: end;
    background: black;
    color: rgba(255,255,255,.65);
  }

  & .time-form-section {
    display: flex;
    gap: .25rem;
  }

  & .event {
  }

  & .view-event {
    border: none;
    background: white;
    border-radius: 0;
    padding: .5rem;
    color: rgba(0,0,0,.65);
    display: block;
    text-align: left;
    transition: transform ease-in-out 100ms;
    width: 100%;
  }

  & .view-event img,
  & .view-event video {
    max-width: 300px;
    max-height: 300px;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  & .view-event:hover,
  & .view-event:focus {
    color: rgba(0,0,0,.85);
    background: rgba(0,0,0,.2);
  }

  & .note-preview-1 {
    color: rgba(0,0,0,.65);
  }

  & .note-preview-2 {
    color: rgba(0,0,0,.35);
  }

  & .tommi {
    padding: .5rem;
  }

  & .tommi .tommi-title {
    font-size: 2rem;
    font-weight: 1000;
  }

  & .tommi .tommi-description {
    color: rgba(0,0,0,.65);
    font-size: 1.5rem;
  }

  & .gallery-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .archive-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .image-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .tommi-form {
    padding: .5rem;
    overflow: auto;
    height: 100%;
  }

  & .tychi-form {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .dwebcamp-form {
    height: 100%;
    padding: .5rem;
    overflow: auto;
  }

  & .menu-item {
    position: relative;
    display: grid;
    place-items: center;
  }

  & .dropdown-items {
    display: none;
    background: rgba(0,0,0,1);
    position: absolute;
    bottom: 0px;
    left: 0;
    max-height: calc(100vh);
    max-width: calc(100vw - 40px);
    overflow: auto;
    transform: translate(calc(-100% + 1.25rem), 1rem);
    z-index: 30;
  }

  & [data-os-target].active + .dropdown-items {
    display: block;
  }



  & .dropdown-items button > * {
    pointer-events: none;
  }

  & .dropdown-items button:focus,
  & .dropdown-items button.active,
  & .dropdown-items button:hover {
    background: rgba(255,255,255,.35);
  }


  & .dropdown-items  button {
    background: transparent;
    border: none;
    color: rgba(255,255,255,.85);
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    padding: .5rem;
    gap: .5rem;
    text-align: left;
    display: block;
    font-size: 1rem;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
  }

  & hr {
    border-top: 1px solid rgba(255,255,255, .15);
    margin: .25rem 0;
  }

  & .chat-realm {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    z-index: 10;
    height: 100%;
  }

  & .chat-realm[data-grabbing="true"] {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  & .chat-sidebar-inner {
    position: relative;
    overflow: auto;
    height: 100%;
  }

  & .chat-sidebar {
    border-right: 1px solid rgba(0, 0, 0,.2);
    background: white;
    position: relative;
    display: none;
    z-index: 21;
    grid-template-rows: 1fr auto;
    overflow-x: hidden;
  }

  & [data-sidebar="true"] .chat-sidebar-inner {
    display: block;
  }

  & .chat-footer {
    padding: .5rem;
  }

  & .chat-footer .action-button {
    display: none;
    width: 100%;
  }
  & [data-sidebar="true"] .chat-footer .action-button {
    display: block;
  }

  & [data-sidebar="true"] .chat-footer .action-icon {
    display: none;
  }

  & .chat-footer .action-icon {
    display: block;
  }



  & [data-sidebar="true"] .chat-footer {
    position: relative;
  }

  & [data-resize-sidebar] {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: clamp(240px, var(--sidebar-width, 320px), 100%);
    transform: translateX(-10px);
    width: 10px;
    background: rgba(255,255,255,.05);
    z-index: 10;
    cursor: col-resize;
  }
  & [data-sidebar="true"] [data-resize-sidebar] {
    display: block;
  }

    & .chat-realm[data-sidebar="true"] .profile-actions {
    padding: .5rem .5rem .5rem calc(34px + 1.5rem);
    flex-direction: row;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
  }

  & [data-sidebar="true"] .chat-sidebar {
    left: 0;
    display: block;
    width: clamp(240px, var(--sidebar-width, 320px), 100%);
    max-width: 100vw;
    position: absolute;
    top: calc(2.5rem + 1px);
    bottom: 0;
    z-index: 25;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  @media (min-width: 48rem) {
    &  [data-resize-sidebar] {
      display: block !important;
    }

    & .chat-realm {
      grid-template-columns: clamp(240px, var(--sidebar-width, 320px), 100%) 1fr;
    }

    & .chat-sidebar {
      position: static !important;
      display: grid;
    }
  }

  & .search-and-filter {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
  }

  & .search-and-filter input {
    width: 100%;
  }
  & [data-toggle-metadata="on"] {
    filter: invert(1);
  }

  & .app-title {
    font-size: 3rem;
    font-weight: bold;
  }

  & .view-title {
    font-size: 2rem;
    font-weight: 600;
  }

`)

export function updateDraft(data) {
  $.teach(data, bound('draft'))
}

$.when('input', '[data-bind]', (event) => {
  const { bind } = event.target.dataset
  $.teach({
    [event.target.name]: event.target.value
  }, bound(bind))
})

function bound(bind) {
  return (state, payload) => {
    return {
      ...state,
      [bind]: {
        ...state[bind],
        ...payload
      }
    }
  }
}

function escapeHyperText(text = '') {
  if(!text) return ''
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

export function wizardSuccess(node, params) {
  node.dispatchEvent(new CustomEvent('json-rpc', {
    detail: {
      jsonrpc: "2.0",
      method: 'success',
      params
    }
  }))
}

export function wizardError(node, params) {
  node.dispatchEvent(new CustomEvent('json-rpc', {
    detail: {
      jsonrpc: "2.0",
      method: 'error',
      params
    }
  }))
}

$.when('json-rpc', 'buy-sell-wizard', (event) => {
  if(event.detail.method === 'success') {
    const { draft } = $.learn()
    saveProduct(draft)
    $.teach({ view: views.admin })
  }

  if(event.detail.method === 'error') {
    toast("Error submitting the sell wizard.", { type: 'error' })
  }
})



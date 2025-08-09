import elf from '@silly/elf'
import $paperPocket, { afterUpdateTheme, replaceElves } from './paper-pocket.js'
import { saveProduct, eventTypes, newDraft, getSearchResults } from './time-machine.js'
import { get } from './plan98-wallet.js'
import { launch } from './plan98-synthia.js'
import { innerHTML } from 'diffhtml'
import JSZip from 'jszip'

const views = {
  welcome: 'welcome',
  wizard: 'wizard',
  sell: 'sell',
  checkout: 'checkout',
  buy: 'buy',
  product: 'product',
}

const historyTypes = {
  view: 'view',
  create: 'create',
}

const $ = elf('buy-sell', {
  grabbing: false,
  sidebar: false,
  draft: {},
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

const viewRenderers = {
  [views.welcome]: (target) => {
    return `
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div class="app-title">
        Shop
      </div>
      <div class="button-container">
        <button data-swap="${views.buy}" class="standard-button -large bias-link">Buy</button>
        <button data-swap="${views.sell}" class="standard-button -large bias-positive">Sell</button>
      </div>
      `
  },
  [views.buy]: (target) => {
    return `
      All Products
    `
  },
  [views.wizard]: (target) => {
    return `
      <buy-sell-wizard></buy-sell-wizard>
    `
  },
  [views.product]: (target) => {
    const { product } = $.learn()
    if(!product) {
      return `
        Product not found...
      `
    }
    const { id, title, attachments } = product.data

    return `
      <div class="product-id">
        ${id}
      </div>
      <div class="product-title">
        ${title}
      </div>
      ${attachments ? attachments.map(x => {
        return `
          <div class="table">
            <div class="table-row">
              <div class="table-cell">
                ${x.name}
              </div>
              <div class="table-cell">
                ${formatBytes(x.size)}
              </div>
            </div>
          </div>
        `
      }).join('') : ''}

      <button data-download-attachments="${id}">
        Download
      </button>
    `
  },

  [views.sell]: (target) => {
    const { products } = $.learn()
    return `
      <div class="section">
        <button data-swap="${views.wizard}" class="standard-button bias-positive" style="float: right;">New Product</button>
        <div class="admin-title">
          My Products
        </div>
        <div class="horizontal-scroll-container">
          <div class="table">
            <div class="table-row">
              <div class="table-id">
                <div>
                  ID
                </div>
              </div>
              <div class="table-title">
                Title
              </div>
            </div>
            ${products.map(x => {
              const { id, title } = x.data
              return `
                <div class="table-row">
                  <div class="table-id">
                    <div style="display: inline-grid; place-content: center;">
                      <button class="standard-button -smol bias-link" data-swap="${views.product}" data-id="${id}">
                        ${id ? id.split('-')[0] : '????'}
                      </button>
                    </div>
                  </div>
                  <div class="table-title">
                    ${title}
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="admin-title">
          My Sales
        </div>
        <div class="horizontal-scroll-container">
          <div class="table">
          </div>
        </div>
      </div>
      <div class="section">
        <div class="admin-title">
          My Purchases
        </div>
        <div class="horizontal-scroll-container">
          <div class="table">
          </div>
        </div>
      </div>
    `
  },
}

async function query(target) {
  if(target.queried) return
  target.queried = true

  const products = await getSearchResults(eventTypes.product)
  $.teach({ products, ready: true })
}

$.draw((target)=> {
  const { ready } = $.learn()
  query(target)
  if(!ready) return
  if(target.innerHTML) return

  return `
    <div class="creation-container" data-dom="nav">
      <div data-dom="primary-action"></div>
      <div class="menu-item">
        <button class="more-item standard-button">
          <sl-icon name="list"></sl-icon>
        </button>
      </div>
    </div>
    <div data-dom="realm" class="chat-realm">
      <div class="now">
        <button class="logo-area" data-assistant>
          <plan98-icon style="height: 1.5rem; width: 1.5rem;"></plan98-icon>
        </button>
        <div></div>
        <button data-swap="${views.buy}" class="standard-button -smol bias-link">Buy</button>
        <button data-swap="${views.wizard}" class="standard-button -smol bias-positive">Sell</button>
      </div>

      <div class="chat-sidebar">
        <div data-resize-sidebar></div>
        <div class="chat-sidebar-inner">
          ${renderSidebar()}
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
      let data = { view: views.wizard }
      if(view) {
        data = { view, src }
      }

      replaceHistory({ type: historyTypes.view, [historyTypes.view]: data })
      $.teach(data)
    }
  },
  afterUpdate(target) {
    {
      if(target.innerHTML) {
        requestAnimationFrame(() => {
          patch(target)
          //recoverElves(target, 'sl-icon')
        })
      }
    }

    {
      afterUpdateTheme($paperPocket, target)
    }
  }
})

const LOCKED_VIEWS = [views.welcome, views.wizard, views.checkout]
const BUYER_VIEWS = [views.buy]
const SELLER_VIEWS = [views.sell]

function patch(target) {
  const { view, draft, grabbing, sidebar } = $.learn()
  const locked = LOCKED_VIEWS.includes(view)

  {
    const primary = target.querySelector('[data-dom="primary-action"]')
    const isSeller = SELLER_VIEWS.includes(view)
    const isBuyer = BUYER_VIEWS.includes(view)
    if(target.lastAction !== 'seller' && isSeller) {
      target.lastAction = 'seller'
      primary.innerHTML = `
        <button class="action-item standard-button" data-new>
          <sl-icon name="plus-circle"></sl-icon>
        </button>
      `
    } else if(target.lastAction !== 'buyer' && isBuyer) {
      target.lastAction = 'buyer'
      primary.innerHTML = `
        <button class="action-item standard-button" data-cart>
          <sl-icon name="basket2"></sl-icon>
        </button>
      `
    } else if(target.lastAction !== 'back' && !(isBuyer || isSeller)) {
      target.lastAction = 'back'
      primary.innerHTML = `
        <button class="action-item standard-button" data-back>
          <sl-icon name="arrow-left-circle"></sl-icon>
        </button>
      `
    }
  }

  {
    const nav = target.querySelector('[data-dom="nav"]')

    if(locked) {
      nav.dataset.locked = true
    } else {
      nav.dataset.locked = false
    }
  }

  {
    const realm = target.querySelector('[data-dom="realm"]')
    if(realm.dataset.grabbing !== grabbing.toString()) {
      realm.dataset.grabbing = grabbing
    }
    if(realm.dataset.sidebar !== sidebar.toString() || target.locked !== locked) {
      target.locked = locked
      realm.dataset.sidebar = locked ? false : sidebar
    }
  }

  {
    const content = target.querySelector('[data-dom="content"]')
    if(target.dataset.view !== view) {
      target.dataset.view = view

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

function renderSidebar() {
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
              ${collection.map((item) => {
                return `
                  <div class="event">
                    ${item.title}
                  </div>
                `
              }).join('')}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

$.when('click', '.more-item', (event) => {
  event.preventDefault()
  const { sidebar } = $.learn()
  const newSidebar = { sidebar: !sidebar }
  if(history.state) {
    const newPatch = {
      ...history.state.patch,
      [history.state.patch.type]: {
        ...history.state.patch[history.state.patch.type],
        ...newSidebar
      }
    }
    replaceHistory(newPatch)
  }
  $.teach(newSidebar)
  event.stopImmediatePropagation()
})

$.when('click', '[data-swap]', (event) => {
  event.preventDefault()
  const { sidebar } = $.learn()
  const { swap } = event.target.dataset
  const view = swap

  let data = { sidebar, view }

  if(view === views.wizard) {
    data = {
      ...data,
      draft: newDraft(eventTypes.product)
    }
  } else if(view === views.product) {
    const { products } = $.learn()
    const { id } = event.target.dataset
    const product = products.find(x => x.data.id === id)

    data = {
      ...data,
      product
    }
  }

  $.teach(data)
  saveHistory({ type: historyTypes.view, [historyTypes.view]: data })
})

$.when('click', '[data-new]', (event) => {
  const { sidebar } = $.learn()
  const historyData = { sidebar, view: views.wizard }

  saveHistory({ type: historyTypes.create, [historyTypes.create]: historyData })
  $.teach({ draft: newDraft(eventTypes.product), ...historyData })
})

$.when('click', '[data-cart]', (event) => {
  const { sidebar } = $.learn()
  const historyData = { sidebar, view: views.wizard }

  saveHistory({ type: historyTypes.create, [historyTypes.create]: historyData })
  $.teach({ draft: newDraft(eventTypes.product), ...historyData })
})



$.when('click', '[data-assistant]', (event) => {
  launch()
})

$.when('pointerdown', '[data-resize-sidebar]', event => {
  $.teach({ grabbing: true })
  document.addEventListener("pointermove", resizeSidebar, false);
  document.addEventListener("pointerup", () => {
    $.teach({ grabbing: false })
    document.removeEventListener("pointermove", resizeSidebar, false);
  }, false);
})

function resizeSidebar(event) {
  let width
  if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
    width = event.touches[0].clientX
  } else {
    width = event.clientX
  }

  const size = `${width}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}



$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    position: relative;
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

  & .action-item {
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
    display: none;
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
    padding: 4px;
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
    padding: 4px;
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

  &[data-swap="${views.welcome}"] [data-dom="nav"] {
    display: none;
  }

  & [data-dom="nav"][data-locked="true"] .more-item {
    visibility: hidden;
  }

  & .horizontal-scroll-container {
    width: 100%;
    max-width: 100vw;
    overflow-x: auto;
  }

  & .table {
    display: table;
    width: 100%;
  }

  & .section {
    margin-bottom: 2rem;
  }

  & .table-row {
    display: table-row;
  }

  & .table-row > * {
    display: table-cell;
    padding: 2px;
  }

  & .table-row:nth-child(2n) {
    background: rgba(0,0,0,.1);
  }

  & buy-sell-child-sell {
    display: block;
    padding: .5rem;
  }

  & .admin-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(0,0,0,.65);
  }

  & buy-sell-child-wizard,
  & buy-sell-child-welcome {
    display: block;
    max-width: 50ch;
    margin: 0 auto;
    padding: 1rem;
  }

  & buy-sell-child-welcome {
    display: grid;
    gap: 1rem;
    place-content: center;
    height: 100%;
    text-align: center;
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

$.when('json-rpc', 'buy-sell-wizard', async (event) => {
  if(event.detail.method === 'success') {
    const { draft } = $.learn()
    await saveProduct(draft)
    const products = await getSearchResults(eventTypes.product)
    $.teach({ view: views.sell, products })
  }

  if(event.detail.method === 'error') {
    toast("Error submitting the sell wizard.", { type: 'error' })
  }
})

function saveHistory(patch) {
  self.history.pushState({
    type: `${$.link}-navigation`,
    patch
  }, "");
}

function replaceHistory(patch) {
  self.history.replaceState({
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
  [historyTypes.view]: navigateHistory,
  [historyTypes.create]: navigateHistory,
}

function navigateHistory(data) {
  $.teach(data)
}

addEventListener("popstate", async (event) => {
  const { type, patch } = event.state || {}
  if(type === `${$.link}-navigation`) {
    restoreHistory(patch)
  }
});

$.when('click', '[data-back]', (event) => {
  history.back()
})

$.when('click', '[data-download-attachments]', async (event) => {
  event.preventDefault()

  const { products } = $.learn()
  const id = event.target.dataset.downloadAttachments
  const { data } = products.find(x => x.data.id === id)
  if(data.attachments) {

    const zip = new JSZip();
    const collection = await Promise.all(data.attachments.map(async file => {
      const blob = await get(file.url).catch(console.error)

      if(blob) {
        zip.file(file.name, blob);
        return {
          name: file.name,
          url: file.url,
          blob
        }
      }
    }))

    zip.generateAsync({type:"blob"})
      .then(function(content) {
        const name = "example.zip"
        const downloadURL = (data) => {
          const a = document.createElement('a')
          a.href = data
          document.body.appendChild(a)
          a.style.display = 'none'
          a.download = name
          a.click()
          a.remove()
        }

        const blob = new Blob([content])

        const url = window.URL.createObjectURL(blob)

        downloadURL(url)
      });

    console.log(collection)
  } else {
    toast('No attachments to download', { type: 'error' })
  }
})

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

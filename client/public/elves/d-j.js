import elf from '@plan98/elf'
import { render } from "@sillonious/saga"
import { actionScript } from './action-script.js'
import { hideModal } from '@plan98/modal'
import lunr from 'lunr'
import natsort from 'natsort'
import { state } from 'statebus'

let bookmark = ''

state['ls/mp3'] ||= {
  length: 0,
  current: 0,
  list: []
}

const Types = {
  File: {
    type: 'File',
  },
  Directory: {
    type: 'Directory',
  },
}

export let idx
export const documents = [];

(async function buildIndex() {
  try {
    const { plan98 } = await fetch(`/plan98/mp3s`)
      .then(res => res.json())

    idx = lunr(function () {
      this.ref('path')
      this.field('path')
      this.field('keywords')
      this.field('type')
      this.field('name')
      this.field('extension')

      nest(this, { tree: plan98, pathParts: [], subtree: plan98 })
    })
    $.teach({ ready: true })
  } catch (e) {
    console.info('Build: Failed')
    console.error(e)
    return
  }
})()

function nest(idx, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.File.type) {
      const node = {
        path: currentPath,
        keywords: currentPath.split(/\/|-|_|\+/).join(' '),
        name,
        type,
        extension
      }
      idx.add(node)
      documents.push(node)
    }

    if(type === Types.Directory.type) {
      nest(idx, { tree, pathParts: currentPathParts, subtree: child })
    }

    return '-'
  }).join('')
}

const initial = {
  authenticated: false,
  bookmarks: [],
  alias: '',
  pass: '',
  href: '',
  text: '',
  menu: true,
  suggestIndex: null,
  suggestions: [],
  suggesttionsLength: 0,
  musicFilter: '',
  contextActions: null

}


const $ = elf('d-j', initial)

export default $

// idk, if you so choose to want to do this
// $.teach({ authenticated: true })

const processedTimestamps = new Set();
function observe(bookmark, timestamp) {
  if(!timestamp) return
  if(!bookmark) return
  if(!bookmark.text) return
  if (!processedTimestamps.has(timestamp)) {
    processedTimestamps.add(timestamp);
    $.teach({ [timestamp]: bookmark }, add(timestamp))
  }
}

function add(timestamp) {
  return (state, payload) => {
    return {
      ...state,
      ...payload,
      bookmarks: [...state.bookmarks, timestamp]
    }
  }
}

$.when('click', '#factory-reset', (event) => {
  event.preventDefault()
})

function obliterate(node) {
  node.map().once((child, key) => {
    if (child) {
      obliterate(node.get(key));
    }
  });

  node.put(null);
}

$.when('input', '.keyable', (event) => {
  event.preventDefault()
  const { name, value } = event.target
  $.teach({[name]: value, message: ''})
})

$.draw((target) => {
  const { current, list } = state['ls/mp3']
  const { hypermedia, audioPlaying, currentTrack, contextActions, menu, playlistVisible } = $.learn()
  const contextMenu = contextActions ? createContext(contextActions) : ''

  return `
    <div class="marquee-container">
      <span class="marquee">
        ${list[current] ? list[current] : 'Sum 41 - In Too Deep - All Killer No Filler'}
      </span>
    </div>
    ${library()}
    <div class="context-menu">${contextMenu}</div>
    <div class="player ${!contextMenu ? 'active': ''}">
      <audio name="walkman" src="${currentTrack}" controls="true"></audio>
      <div class="current-grid">
        <div class="current-media">
          <div class="transport">
            <button data-back-track class="system-button -large">
              <sl-icon name="skip-backward-circle"></sl-icon>
            </button>
            <button data-media class="system-button -large">
              <sl-icon name="${audioPlaying ? 'pause-circle' : 'play-circle'}"></sl-icon>
            </button>
            <button data-next-track class="system-button -large">
              <sl-icon name="skip-forward-circle"></sl-icon>
            </button>
          </div>
        </div>
        <div class="upcoming">
          <div class="playlist">
            ${playlist()}
          </div>
        </div>
      </div>
    </div>
`
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  { // action script block
    const { authenticated } = $.learn()
    const { action, script } = target.dataset
    if(authenticated && action && script) {
      actionScript(target, action, script)
    }
  }

  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(!list) return
    target.dataset.scrollpos = list.scrollTop
  }
}

function afterUpdate(target) {
  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(list) {
      list.scrollTop = target.dataset.scrollpos
    }
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }

  { // recover icons from the virtual dom
    recoverElves(target, 'sl-icon')
  }

  { // cleanup when contextActions exist and playlist is visible
    const { contextActions, playlistVisible } = $.learn()

    if(contextActions && playlistVisible) {
      $.teach({ playlistVisible: false })
    }
  }
}

function playlist() {
  const { list, current } = state['ls/mp3']
  return list.map((url, i) => {
    const [piece, album, artist] = url.split('/').reverse()
    return `
      <button class="track ${current === i ? 'active' : ''}" data-id="${i}">
        <span class="id">${i}</span> <span class="piece">${piece}</span> <span class="album">${album}</span> <span class="artist">${artist}</span>
      </button>
    `
  }).join('')
}

function library() {
  const { musicFilter, suggestIndex, suggestions, showSuggestions } = $.learn()

  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)
  return`
    <div class="search">
      <input placeholder="Search..." type="text" value="${musicFilter}" name="search" autocomplete="off" />
      <div class="suggestions">
        ${showSuggestions ? suggestions.slice(start, end).map((x, i) => {
          const item = documents.find(y => {
            return x.ref === y.path
          })

          return `
            <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
              <div class="name">
                ${item.name}
              </div>
            </button>
          `
        }).join('') : ''}
      </div>
    </div>
  `
}

$.when('click', '[data-action="new"]', (event) => {
  const visibility = 'private' // 'public'
  window.location.href = `/app/bulletin-board?src=/${visibility}/${$.link}/${self.crypto.randomUUID()}.json&group=${self.crypto.randomUUID()}`
})

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const target = document.createElement('a')
      target.href = item.path
      const contextActions = rules(target)

      $.teach({ contextActions })
      document.activeElement.blur()
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()

  const target = document.createElement('a')
  target.href = event.target.dataset.path
  const contextActions = rules(target)
  //
  let { suggestIndex } = $.learn()
  const index = parseInt(event.target.dataset.index)
  const start = Math.max(suggestIndex - 5, 0)
  suggestIndex = start + index
  $.teach({ contextActions, suggestIndex })
})



$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = value ? idx.search(value).sort((a,b) => sort(a.ref, b.ref)) : []
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, musicFilter: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ showSuggestions: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    //$.teach({ showSuggestions: false })
    //document.activeElement.blur()
  }, 250)
})


$.when('click', '[data-media]', (event) => {
  const { audioPlaying } = $.learn()
  const { current, list } = state['ls/mp3']
  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')

  if(audioPlaying) {
    walkman.pause()
    $.teach({ audioPlaying: !audioPlaying })
  } else {
    if(walkman.src !== list[current]) {
      walkman.src = list[current]
    }
    walkman.play()
    $.teach({ audioPlaying: !audioPlaying, currentTrack: list[current] })
  }
})

$.when('click', '[data-create]', (event) => {
  const { create } = event.target.dataset
  $.teach({ activeWorkspace: create, [create]: '/app/new-save' })
})


$.when('click', 'a[href^="#"]', (event) => {
  event.preventDefault()
  const [_,name] = event.target.href.split('#')
  const tile = event.target.closest($.link).querySelector(`[name="${name}"]`)
  tile.scrollIntoView({block: "end", inline: "end", behavior: 'smooth'})
})

$.when('click', '.action-script', actionScript)

function makeButton(data) {
  const attributes = Object.keys(data).map(key => {
    return `data-${key}="${data[key]}"`
  }).join(' ')
  return `
    <button class="action-script" ${attributes}>
      ${data.text}
    </button>
  `
}

function createContext(actions) {
  const list = actions.map((data) => {
    return `
      <div>
        ${makeButton(data)}
      </div>
    `
  }).join('')

  return `
    <div>
      <button data-close-context> 
        back
      </button>
    </div>
    ${list}
  `
}

$.when('click', '[data-close-context]', (event) => {
  $.teach({ contextActions: null })
})

$.when('click','[data-system]', (event) => {
  const { contextActions } = $.learn()
  $.teach({
    contextActions: contextActions ? null : [
      {
        text: 'account',
        action: 'escape',
        script: import.meta.url
      },
      {
        text: 'wallets',
        action: 'identity',
        script: import.meta.url
      },
      {
        text: 'escape',
        action: 'escape',
        script: import.meta.url
      },
      {
        text: 'factory reset',
        action: 'escape',
        script: import.meta.url
      },
    ]
  })
})

export function identity(event) {
  const { contextActions } = $.learn()
  hideModal() // todo: find the root cause of this
  showModal(`
    <plan98-upsert></plan98-upsert>
    <plan98-wallet></plan98-wallet>
  `, { onHide: restoreContext(contextActions) })
}

function restoreContext(contextActions) {
  return function thunk() {
    const wallet = document.querySelector('plan98-modal plan98-wallet')

    if(wallet) wallet.remove()
    $.teach({ contextActions })
  }
}

export function escape() {
  $.teach({ contextActions: null })
  window.dispatchEvent(new KeyboardEvent("keydown",{'key': 'Escape'}));
}


$.when('click','[data-playlist]', (event) => {
  $.teach({ playlistVisible: !$.learn().playlistVisible, contextActions: null })
})


function createExternalLinkAction(href) {
  return {
    text: 'launch externally',
    action: 'openExternal',
    script: import.meta.url,
    href
  }
}

export function openExternal(event) {
  const { href } = event.target.dataset
  self.open(href, '_blank')
  $.teach({ contextActions: null })
}

function createPlayAction(href) {
  return {
    text: 'play now',
    action: 'playNow',
    script: import.meta.url,
    href
  }
}

export function playNow(event) {
  const { href } = event.target.dataset

  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href, contextActions: null })
}

function createPlaylistAction(href) {
  return {
    text: 'to playlist',
    action: 'toPlaylist',
    script: import.meta.url,
    href
  }
}

export function toPlaylist(event) {
  const { audioPlaying } = $.learn()
  const { href } = event.target.dataset
  state['ls/mp3'].length += 1
  state['ls/mp3'].list.push(href)

  if(!audioPlaying) {
    const walkman = event.target.closest($.link).querySelector('[name="walkman"]')
    walkman.src = href
    walkman.play()
  }

  $.teach({ contextActions: null, playlistVisible: true, audioPlaying: true })
}

const thirdPartyRules = []

export function requestThirdPartyRules(filter, options) {
  thirdPartyRules.push(filter)
}


export function requestActionMenu(actions) {
  $.teach({ contextActions: actions })
}


function thirdPartyActions(anchor) {
  return thirdPartyRules.flatMap(filter => filter(anchor))
}

function rules(anchor) {
  const actions = []

  if(anchor.matches('[href$=".mp3"], [href$=".wav"]')) {
    actions.push(createPlayAction(anchor.href));
    actions.push(createPlaylistAction(anchor.href));
  }
  // window manager related
  if(anchor.matches('[href^="steam://"]')) {
    actions.push(createExternalLinkAction(anchor.href));
  }

  return [...actions, ...thirdPartyActions(anchor)]
}

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.style(`
  & {
    position: relative;
    width: 100%;
    overflow: auto;
    display: block;
    min-height: 100%;
    background: black;
    color: white;
  }

  & .menu {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 100%;
    max-width: 100%;
    width: 320px;
    max-height: 480px;
  }

  & .control-toggle {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 4;
  }

  & [data-toggle] {
    background: var(--color);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    display: grid;
    place-content: center;
    font-weight: 800;
    font-size: 24px;
  }

  & .logo-mark {
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 800;
    --v-font-slnt: 0;
    --v-font-crsv: 1;
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    font-family: 'Recursive';
    font-size: 72px;
    position: relative;
    display: inline-block;
  }

  & .frame {
    max-width: 100%;
  }
  & .wall {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 2;
    pointer-events: all;
    background: white;
  }

  & .wall.broken {
    z-index: 1;
    pointer-events: none;
    opacity: 0;
  }

  & .break-fourth-wall:hover,
  & .break-fourth-wall:focus {
    background-image: linear-gradient(rgba(0,0,0, .15), rgba(0,0,0,.4));
  }

  & .fourth {
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    height: 0;
    background: var(--color, mediumpurple);
  }

  & .fourth > * {
    display: none;
  }
  & .fourth .active {
    display: block;
    grid-area: all;
  }

  & .broken + .show-all > * {
    grid-area: initial;
  }

  & .hidden + .fourth {
    display: none;
  }
  & .broken + .fourth {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 2rem 0 3rem;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "all all" "all all";
  }

  & .menu {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
  }

  & .search {
    overflow: hidden;
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    color: rgba(255,255,255,.65);
    border-radius: 0;
    border: none;
  }

  & .search input:focus {
    color: rgba(255,255,255,.85);
  }

  & .suggestions .auto-item,
  & .search .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .search .auto-item:focus,
  & .search .auto-item:hover {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .suggestions {
    display: flex;
    text-align: left;
    flex-direction: column;
    background: rgba(0,0,0,.85);
    backdrop-filter: blur(4px);
  }

  & .suggestions .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestions .auto-item:focus,
  & .suggestions .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestions .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }


  & [data-suggestion] {
    display: block;
  }

  & .input-grid {
    display: grid;
    grid-template-columns: 3rem 1fr auto;
    grid-template-rows: 3rem;
    max-width: 480px;
    min-width: 320px;
    text-align: left;
  }

  & .input-grid *:focus {
    outline: 3px solid var(--underline-color, mediumseagreen);
  }

  & .input-grid .logo-wrapper {
    aspect-ratio: 1;
    position: sticky;
    left: 0;
  }

  & .input-grid [type="submit"] {
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 480px;
  }

  & .input-grid [type="submit"] {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, dodgerblue);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .input-grid [type="submit"]:hover,
  & .input-grid [type="submit"]:focus {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }


  & [data-suggestion] {
    position: relative;
  }

  & .name {
    position: relative;
    z-index: 2;
  }

  & .nav-wrapper {
    transform: rotateX(180deg);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 4;
    z-index: 2;
    overflow: auto;
    height: calc(3rem+10px);
    padding-bottom: 10px;
  }
  & .nav {
    transform: rotateX(-180deg);
    background: var(--color);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    display: flex;
    height: 3rem;
  }

  & .workspaces {
    display: flex;
    width: 100%;
  }

  & [data-all-workspaces],
  & .show-workspace {
    border: 1px solid var(--button-color, dodgerblue);
    background: var(--color, mediumpurple);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    aspect-ratio: 1;
    padding: 0;
    height: 100%;
    opacity: .25;
  }

  & [data-all-workspaces]:hover,
  & .show-workspace:hover,
  & [data-all-workspaces]:focus,
  & .show-workspace:focus,
  & [data-all-workspaces].active,
  & .show-workspace.active {
    opacity: 1;
  }

  & .now {
    white-space: nowrap;
    background: var(--color, transparent);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: white;
    height: 100%;
    font-size: 12px;
    border-color: transparent;
    padding: 0 12px;
    margin-left: auto;
  }

  & .context-menu button {
    font-weight: 100;
    color: rgba(255,255,255,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .context-menu button:hover,
  & .context-menu button:focus {
    color: rgba(255,255,255,1);
  }

  & .system-button {
    font-weight: 400;
    border: none;
    font-size: 1rem;
    background: transparent;
    color: rgba(255,255,255,.85);
    padding: 0 9px;
  }

  & .system-button.-large {
    font-size: 2rem;
    padding: 1rem;
  }

  & .system-button.-nested {
    position: absolute;
    right: 0;
    height: 2rem;
    line-height: 2rem;
    padding: 0 .5rem;
    background: black;
  }

  & .system-button:hover,
  & .system-button:focus {
    color: rgba(255,255,255,1);
  }

  & [data-system] {
    font-weight: 1000;
    margin-right: 1rem;
  }

  & [data-playlist] {
    margin-left: auto;
    position: relative;
    background: black;
    border: none;
    overflow: hidden;
    color: rgba(255,255,255,.65);
    display: grid;
    grid-template-columns: 1fr 2rem;
    opacity: .65;
  }


  & [data-playlist]:hover,
  & [data-playlist]:focus {
    opacity: 1;
  }

  & .marquee-container {
    background: black;
    color: white;
    overflow: hidden;
  }

  & .marquee {
    pointer-events: none;
    animation: &-marquee-track 30000ms linear infinite alternate;
    white-space: nowrap;
    display: inline-block;
    line-height: 2rem;
  }

  @keyframes &-marquee-track {
    0% {
      transform: translateX(20px);
    }

    100% {
      transform: translateX(calc(-50%));
    }
  }

  & .player {
    overflow: auto;
    width: 100%;
    transition: all 175ms ease-out;
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    backdrop-filter: blur(150px);
  }


  & .context-menu {
    position: fixed;
    pointer-events: none;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    z-index: 9000;
    opacity: 0;
  }

  & .context-menu:not(:empty) {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
    transition: opacity 175ms ease-out;
    opacity: 1;
    pointer-events: all;
  }

  & [data-create] {
    background: lemonchiffon;
    border: none;
    border-radius: none;
    box-shadow: var(--shadow);
    padding: 2rem;
  }

  & [data-create]::before{
    content: '';
    display: block;
    width: 6rem;
    height: 6rem;
    background-color: #E83FB8;
    border-radius: 100%;
  }

  & .empty-pane {
    place-items: center;
    display: none;
  }

  & .show-all > .empty-pane {
    display: grid;
  }

  & .show-all > iframe {
    display: block;
  }

  & [data-back-track] {
  }

  & .transport {
    font-size: 2rem;
    text-align: center;
  }

  & .current-grid {
  }

  & .current-media {
    display: grid;
    place-items: end center;
  }

  & details {
  }

  & summary {
    padding: 1rem;
    color: rgba(255,255,255,.65);
    font-weight: 600;
  }

  & .hidden {
    display: none;
  }

  & .context-menu button {
    font-weight: 100;
    color: rgba(255,255,255,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .context-menu button:hover,
  & .context-menu button:focus {
    color: rgba(255,255,255,1);
  }
}
  & .context-menu {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .context-menu:not(:empty) {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
  }

  & audio {
    margin: 0 auto 2rem;
    display: block;
    width: 100%;
    display: none;
  }

  & .track {
    text-align: left;
    color: rgba(255,255,255,.65);
    background: transparent;
    padding: .5rem;
    border-radius: none;
    border: none;
    width: 100%;
  }

  & .track.active {
    background-color: var(--green, mediumseagreen);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
  }

  & .upcoming {
    overflow: auto;
    height: 100%;
    padding: 0 0 3rem;
  }

  & .playlist {
    overflow-x: hidden;
    overflow-y: auto;
  }

  & .id {
    color: rgba(255,255,255,.25);
  }
  & .piece {
    color: rgba(255,255,255,.85);
  }
  & .artist {
    color: rgba(255,255,255,.5);
  }
  & .album {
    color: rgba(255,255,255,.65);
  }
  & .keyable {
    border: none;
    border-radius: 0;
    padding: .5rem;
    width: 100%;
    background: transparent;
    color: rgba(255,255,255,.65);
    height: 2rem;
    padding: 0 .5rem;
  }

  & .keyable:focus {
    outline: 2px solid var(--underline-color, mediumseagreen);
    outline-offset: 2px;
  }


`)
const nextEvent = new CustomEvent("next", {
  detail: {
    type: "next",
  },
});

$.when('click', '[data-next-track]', (event) => {
  event.target.closest($.link).querySelector('audio').dispatchEvent(nextEvent)
})

const backEvent = new CustomEvent("back", {
  detail: {
    type: "back",
  },
});

$.when('click', '[data-back-track]', (event) => {
    event.target.closest($.link).querySelector('audio').dispatchEvent(backEvent)
})

$.when('next', 'audio', (event) => {
  const walkman = event.target
  const { current, length, list } = state['ls/mp3']
  const next = mod(current + 1, length)
  state['ls/mp3'].current = next
  const href = list[next]
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href })
})

$.when('ended', 'audio', (event) => {

  event.target.dispatchEvent(nextEvent)
})

$.when('back', 'audio', (event) => {
  const walkman = event.target
  const { current, length, list } = state['ls/mp3']
  const back = mod(current - 1, length)
  state['ls/mp3'].current = back
  const href = list[back]
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href })
})

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.when('contextmenu', '.track', (event) => {
  alert('ha')
})

$.when('click', '.track', (event) => {
  const walkman = event.target.closest($.link).querySelector('audio')
  const { list } = state['ls/mp3']
  const { id } = event.target.dataset
  const next = parseInt(id)
  state['ls/mp3'].current = next
  const href = list[next]
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href })
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



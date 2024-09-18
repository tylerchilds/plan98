import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { actionScript } from './action-script.js'
import lunr from 'lunr'
import natsort from 'natsort'

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
        keywords: currentPath.split('/').join(' '),
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

const $ = elf('plan9-zune', {
  menu: true,
  suggestIndex: null,
  suggestions: [],
  suggesttionsLength: 0,
  musicFilter: ''
})

export default $

$.when('click', '.zune .app-action', (event) => {
  event.preventDefault()
  const actions = rules(event.target)

  if(actions.length > 0) {
    $.teach({ contextActions: actions })
  } else {
    $.teach({ hypermedia: event.target.href })
  }
})


export function requestFullZune() {
  $.teach({ contextActions: null, menu: false })
}

export function requestScreen(hypermedia) {
  hideModal()

  if(document.querySelector($.link)) {
    $.teach({ hypermedia, contextActions: null, menu: true })
    return true
  }

  window.location.href = hypermedia
  return false
}



$.draw((target) => {
  const { hypermedia, audioPlaying, currentTrack, contextActions, menu, playlistVisible } = $.learn()
  const contextMenu = contextActions ? createContext(contextActions) : ''

  return `
    <div class="zune-bar">
      <button data-system class="system-button">
        9
      </button>
      <audio name="walkman" src="${currentTrack}"></audio>
      <button data-playlist>
        <span class="marquee">
          Sum 41 - In Too Deep - All Killer No Filler
        </span>
        <span class="system-button -nested">
          <sl-icon name="cassette"></sl-icon>
        </span>
      </button>
    </div>
    <div class="siri">${contextMenu}</div>
    <div class="cortana ${!contextMenu && playlistVisible ? 'active': ''}">
      <img src="" />
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
      ${playlist()}
      ${library()}
    </div>
    <div class="wall ${!menu ? 'broken':''} ${contextActions ? 'hidden' : ''}">
      ${zune(target)}
    </div>
`
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
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
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    const { hypermedia } = $.learn()
    if(target.hypermedia !== hypermedia) {
      target.hypermedia = hypermedia
      const zune = target.querySelector('.zune')

      if(zune) {
        zune.scrollTop = 0
      }
    }
  }

  { // cleanup when contextActions exist and playlist is visible
    const { contextActions, playlistVisible } = $.learn()

    if(contextActions && playlistVisible) {
      $.teach({ playlistVisible: false })
    }
  }
}

function alphabetical(xmlHTML) {
  var sorter = natsort();
  const page = new DOMParser().parseFromString(xmlHTML, "text/html");
  const node = page.querySelector('xml-html')
  const children = [...node.children]
  const usedLetters = {}

  children.sort(function(a, b) {
    return sorter(a.innerText, b.innerText);
  }).map((x) => {
    const tile = document.createElement('div')
    tile.classList.add('tile')
    if(!x.innerText) return
    const lowerFirst = x.innerText[0].toLowerCase()
    if(!usedLetters[lowerFirst]) {
      usedLetters[lowerFirst] = true
      tile.innerHTML = `<a class="category" href="#back-to-top">${lowerFirst}</a><a name="${$.link}-${lowerFirst}" class=""></a>`
    }

    x.classList.add('app-action')
    tile.appendChild(x)
    node.appendChild(tile)
  });
  return `
    <div class="categories">
      ${
        Object
          .keys(usedLetters)
          .sort(natsort())
          .map(x => `<a href="#${$.link}-${x}" class="category">${x}</a>`)
          .join('')
      }
    </div>
    <a name="back-to-top"></a>
    ${node.outerHTML}
  `
}

function playlist() {
  return`
    <details open="true">
      <summary>Next</summary>
    </details>
  `
}

function library() {
  const { musicFilter, suggestIndex, suggestions } = $.learn()

  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)
  return`
    <details open="true">
      <summary>Library</summary>
      <div class="search">
        <input placeholder="Search..." type="text" value="${musicFilter}" name="search" autocomplete="off" />
        <div class="suggestions">
            ${suggestions.slice(start, end).map((x, i) => {
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
            }).join('')}
        </div>
      </div>
    </details>
  `
}
function zune(target) {
  const { hypermedia } = $.learn()
  const src = hypermedia || target.getAttribute('src')
  const bookmarks = render(`
<a
href: /app/interdimensional-cable
text: Interdimensional Cable

<a
href: /app/hello-bluesky
text: Hello Bluesky

<a
href: /app/owncast-surfer
text: Owncast Surfer

<a
href: steam://rungameid/413150
text: Stardew Valley

<a
href: /app/sonic-knuckles
text: Sonic and Knuckles

<a
href: steam://rungameid/584400
text: Sonic Mania

<a
href: /private/tychi.1998.social/Music/Ohm-N-I_-_Vaporwave/Ohm-N-I_-_Vaporwave_-_07_Whats_Going_On.mp3
text: what's going on

<a
href: /app/story-board
text: Story Board

<a
href: /app/dial-tone
text: Dial Tone

<a
href: /app/hyper-script
text: Hyper Script

<a
href: /app/middle-earth
text: Middle Earth

<a
href: /app/startup-wizard
text: Startup Wizard

<a
href: /app/draw-term
text: Draw Term


`)

  return `
    <div class="zune">
      ${src ? `<iframe src="${src}"></iframe>`:''}
      ${alphabetical(bookmarks)}
    </div>
  `
}

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
      const iframe = event.target.closest($.link).querySelector('[name="plan98-window"]')
      const url = '/app/media-plexer?src=' +item.path
      updateActiveWorkspace(url)
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
  //updateActiveWorkspace(url)
  //
  let { suggestIndex } = $.learn()
  const index = parseInt(event.target.dataset.index)
  const start = Math.max(suggestIndex - 5, 0)
  suggestIndex += start + index
  $.teach({ contextActions, suggestIndex })
})



$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, musicFilter: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ focused: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ focused: false })
    document.activeElement.blur()
  }, 250)
})


$.when('click', '[data-media]', (event) => {
  const { audioPlaying } = $.learn()
  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')

  audioPlaying ? walkman.pause() : walkman.play()

  $.teach({ audioPlaying: !audioPlaying })
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

function createContext(actions) {
  const list = actions.map((data) => {
    const attributes = Object.keys(data).map(key => {
      return `data-${key}="${data[key]}"`
    }).join(' ')
    return `
      <div>
        <button class="action-script" ${attributes}>
          ${data.text}
        </button>
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
  $.teach({ contextActions: null, menu: true })
})

$.when('click','[data-system]', (event) => {
  const { contextActions } = $.learn()
  $.teach({
    contextActions: contextActions ? null : [
      {
        text: 'identity',
        action: 'identity',
        script: import.meta.url
      },
      {
        text: 'escape',
        action: 'escape',
        script: import.meta.url
      }
    ]
  })
})

export function identity(event) {
  const { contextActions } = $.learn()
  hideModal() // todo: find the root cause of this
  showModal(`
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
  const { href } = event.target.dataset
  alert(href)
}


function createPlayQueueAction(href) {
  return {
    text: 'to queue',
    action: 'queuePlay',
    script: import.meta.url,
    href
  }
}

export function queuePlay(event) {
  const { href } = event.target.dataset
  alert(href)
}

const thirdPartyRules = []

export function requestThirdPartyRules(filter, options) {
  thirdPartyRules.push(filter)
}

function thirdPartyActions(anchor) {
  return thirdPartyRules.flatMap(filter => filter(anchor))
}

function rules(anchor) {
  const actions = []

  if(anchor.matches('[href$=".mp3"], [href$=".wav"]')) {
    actions.push(createPlayAction(anchor.href));
    actions.push(createPlaylistAction(anchor.href));
    actions.push(createPlayQueueAction(anchor.href));
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
    max-height: 100%;
    display: block;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  & .zune-bar,
  & .cortana {
    pointer-events: all;
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
    text-align: center;
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    border: 1px solid var(--button-color, dodgerblue);
    font-size: 1.2rem;
    padding: .5rem 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 480px;
    border-radius: 0;
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
    display: block;
    text-align: left;
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

  & .siri button {
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

  & .siri button:hover,
  & .siri button:focus {
    color: rgba(255,255,255,1);
  }
  & .zune {
    font-weight: 100;
    font-size: 2rem;
    line-height: 1;
    background: black;
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.95)), linear-gradient(var(--color), var(--accent-color-0));
    color: rgba(255,255,255,.65);
    height: 100%;
    overflow-y: auto;
    display: block;
    padding: 2rem 0 3rem;
    gap: 2rem;
  }

  & .zune xml-html {
    overflow: hidden auto;
    padding: 1rem;
  }

  & .zune .tile {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  & .app-action {
    margin: 1rem 0;
    display: block;
  }

  & .category {
    text-decoration: none;
  }

  & .app-action {
    text-decoration: none;
    white-space: pre-wrap;
    line-height: 1.1;
  }

  & .zune a:link,
  & .zune a:visited {
    color: rgba(255,255,255,.65);
  }

  & .zune a:hover,
  & .zune a:focus {
    color: rgba(255,255,255,1);
  }

  & .zune a:active {
  }

  & .categories {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  }
  & .zune-bar {
    background: black;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 2rem;
    z-index: 9001;
  }

  & .zune xml-html {
    columns: 320px;
  }

  & .category {
    margin: 1rem 0 0;
    display: inline-block;
    padding: 0;
    border: 1px solid rgba(255,255,255,.65);
    line-height: 1;
    aspect-ratio: 1;
    opacity: .65;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: end end;
  }

  & .category:hover,
  & .category:focus {
    opacity: 1;
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
    max-width: 220px;
    color: rgba(255,255,255,.65);
    display: grid;
    grid-template-columns: 1fr 2rem;
  }

  & .marquee {
    pointer-events: none;
    animation: &-marquee-track 15000ms linear infinite alternate;
    white-space: nowrap;
    display: inline-block;
    line-height: 2rem;
  }

  @keyframes &-marquee-track {
    0% {
      transform: translateX(20px);
    }

    100% {
      transform: translateX(calc(-100% + 200px));
    }
  }

  & .cortana {
    overflow: auto;
    position: absolute;
    top: 2rem;
    left: 0;
    right: 0;
    padding-bottom: 3rem;
    bottom: 0;
    width: 100%;
    z-index: 8999;
    transform-origin: top center;
    transform: scale(1.1);
    transition: all 175ms ease-out;
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    backdrop-filter: blur(150px);
    opacity: 0;
    pointer-events: none;
  }


  & .cortana.active {
    transform: scale(1);
    opacity: 1;
    pointer-events: all;
  }
  & .siri {
    position: absolute;
    pointer-events: none;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    z-index: 9000;
    opacity: 0;
  }

  & .siri:not(:empty) {
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

  & details {
    padding:
  }

  & summary {
    padding: 1rem;
    color: rgba(255,255,255,.65);
    font-weight: 600;
  }

  & .hidden {
    display: none;
  }

  & .siri button {
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

  & .siri button:hover,
  & .siri button:focus {
    color: rgba(255,255,255,1);
  }
}
  & .siri {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .siri:not(:empty) {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
  }


`)

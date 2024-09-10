import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { idx, documents } from './giggle-search.js'
import { actionScript } from './action-script.js'
import { showModal, hideModal } from '@plan98/modal'
import natsort from 'natsort'

const palette = [
  'firebrick', // accent 1
  'darkorange', // accent 2
  'gold', // accent 3
  'mediumseagreen', // underline
  'dodgerblue', // action
  'mediumpurple' // background
]

const buttons = {
  firebrick: ['mediumpurple'],
  darkorange: ['firebrick'],
  gold: ['darkorange'],
  mediumseagreen: ['gold'],
  dodgerblue: ['mediumseagreen'],
  mediumpurple: ['dodgerblue'],
}

const underlines = {
  firebrick: ['dodgerblue'],
  darkorange: ['mediumpurple'],
  gold: ['firebrick'],
  mediumseagreen: ['darkorange'],
  dodgerblue: ['gold'],
  mediumpurple: ['mediumseagreen'],
}

const friends = {
  firebrick: ['darkorange', 'gold', 'mediumseagreen'],
  darkorange: ['gold', 'mediumseagreen', 'dodgerblue'],
  gold: ['mediumseagreen', 'dodgerblue', 'mediumpurple'],
  mediumseagreen: ['dodgerblue', 'mediumpurple', 'firebrick'],
  dodgerblue: ['mediumpurple', 'firebrick', 'darkorange'],
  mediumpurple: ['firebrick', 'darkorange', 'gold'],
}

const $ = elf('plan98-intro', {
  accents: ['firebrick', 'darkorange', 'gold'],
  query: "",
  suggestIndex: null,
  suggestions: [],
  suggestionsLength: 0,
  menu: true,
  now: new Date().toLocaleString(),
  activeWorkspace: 'first',
  first: '/app/startup-wizard',
  second: null,
  third: null,
  fourth: null,
  allActive: false
})

$.when('click', '.action-script', actionScript)

function zune() {
  const { audioPlaying, currentTrack } = $.learn()
  const playlist = render(`
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
`)

  return `
    <div class="zune">
      ${alphabetical(playlist)}
    </div>
  `
}

$.when('click', '[data-media]', (event) => {
  const { audioPlaying } = $.learn()
  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')

  audioPlaying ? walkman.pause() : walkman.play()

  $.teach({ audioPlaying: !audioPlaying })
})

$.when('click', 'a[href^="#"]', (event) => {
  event.preventDefault()
  const [_,name] = event.target.href.split('#')
  const tile = event.target.closest($.link).querySelector(`[name="${name}"]`)
  tile.scrollIntoView()
})

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
      tile.innerHTML = `<a name="${$.link}-${lowerFirst}"></a><a class="category" href="#back-to-top">${lowerFirst}</a>`
    }

    x.classList.add('app-action')
    tile.appendChild(x)
    node.appendChild(tile)
  });
  return `
    <a name="back-to-top"></a>
    <div class="categories">
      ${
        Object
          .keys(usedLetters)
          .sort(natsort())
          .map(x => `<a href="#${$.link}-${x}" class="category">${x}</a>`)
          .join('')
      }
    </div>
    ${node.outerHTML}
  `
}

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
  $.teach({ contextActions: null })
})

$.draw((target) => {
  const { audioPlaying, currentTrack, suggestions, contextActions, first, second, third, fourth, allActive, activeWorkspace, menu, started, query, suggestIndex, focused, now } = $.learn()

  const contextMenu = contextActions ? createContext(contextActions) : ''

  return `
    <div class="zune-bar">
      <button data-system>
        9
      </button>
      <button data-media>
        <sl-icon name="${audioPlaying ? 'pause-circle' : 'play-circle'}"></sl-icon>
      </button>
      <audio name="walkman" src="${currentTrack}"></audio>
    </div>
    <div class="siri">${contextMenu}</div>
    <div class="wall ${!menu ? 'broken':''}">
      ${started ? zune() : `
      <div class="hero">
        <div class="frame">
          <div style="text-align: center">
            <div class="logo-mark">
              <div class="plan98-letters">
                Plan98
              </div>
              <div class="plan98-slants">
                <div class="slant-1"></div>
                <div class="slant-2"></div>
                <div class="slant-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div class="body">

          <div class="screenplay">
            ${render(`# about

@ synthia
> Plan98 is an operating system of the historical fiction variety. It did not release in the year 1998. Or did it? If it did, connect. If not, you will be unable to take part in the spoils after ending the time loop of 2038.

<button
class: break-fourth-wall
text: Connect
`)}
          </div>
        </div>
      `}
    </div>
    <div class="fourth ${allActive ? 'show-all' : ''}">
      ${renderWorkspaceView('first')}
      ${renderWorkspaceView('second')}
      ${renderWorkspaceView('third')}
      ${renderWorkspaceView('fourth')}
    </div>
    <div class="suggestions ${focused ? 'focused' : ''}">
      <div class="suggestion-box">
        ${suggestions.map((x, i) => {
          const item = documents.find(y => {
            return x.ref === y.path
          })

          return `
            <button type="button" class="auto-item ${suggestIndex === i ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
              <div class="name">
                ${item.name}
              </div>
            </button>
          `
        }).join('')}
      </div>
    </div>

    <div class="nav">
      <form class="search" method="get">
        <div class="input-grid">
          <div class="logo-wrapper">
            <plan98-logo></plan98-logo>
          </div>
          <input placeholder="Imagine..." type="text" value="${query}" name="search" autocomplete="off" />
          <button tab-index="1" type="submit">
            <sl-icon name="search"></sl-icon>
          </button>
        </div>
      </form>
      <div class="workspaces">
        ${renderWorkspaceToggle('first', '1')}
        ${renderWorkspaceToggle('second', '2')}
        ${renderWorkspaceToggle('third', '3')}
        ${renderWorkspaceToggle('fourth', '4')}
        <button class="now">
          ${now}
        </button>
        <button data-all-workspaces ${allActive ? 'class="active"' : ''}>
          <sl-icon name="grid"></sl-icon>
        </button>
      </div>
    </div>
  `
}, {
  beforeUpdate,
  afterUpdate
})

function renderWorkspaceView(key) {
  const data = $.learn()
  if(!data[key]) return `<div class="empty-pane"><button data-create="${key}" data-tooltip="create" aria-label="create"></button></div>`

  return `
      <iframe src="${data[key]}" class="${data.activeWorkspace === key ? 'active' :''} "name="${key}"></iframe>
  `
}

function renderWorkspaceToggle(key, label) {
  const data = $.learn()
  if(!data[key]) return ''

  return `
    <button class="show-workspace ${data.activeWorkspace === key ? 'active' :''} " data-workspace="${key}">
      ${label}
    </button>
  `
}


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
    if(!list) return
    list.scrollTop = target.dataset.scrollpos
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

  { // recover logo from the virtual dom
    const ogLogo = target.querySelector('plan98-logo')
    const logoParent = ogLogo.parentNode

    const logo = document.createElement('plan98-logo')
    logo.name = ogLogo.name
    ogLogo.remove()
    logoParent.appendChild(logo)
  }
}

$.when('click','[data-system]', (event) => {
  const { contextActions } = $.learn()
  $.teach({
    contextActions: contextActions ? null : [
      {
        text: 'escape',
        action: 'escape',
        script: import.meta.url
      }
    ]
  })
})

export function escape() {
  $.teach({ contextActions: null })
  hideModal()
  window.dispatchEvent(new KeyboardEvent("keydown",{'key': 'Escape'}));
}

$.when('click','.now', (event) => {
  return
  showModal(`
    <div class="card">
      <calendar-range months="2">
        <div class="grid">
          <calendar-month></calendar-month>
          <calendar-month offset="1"></calendar-month>
        </div>
      </calendar-range>
    </div>
  `)
})

$.when('click','.show-workspace', (event) => {
  event.preventDefault()
  $.teach({ allActive: false, menu: false, activeWorkspace: event.target.dataset.workspace })
})

$.when('click','[data-all-workspaces]', (event) => {
  event.preventDefault()
  $.teach({ menu: false, allActive: !$.learn().allActive })
})

$.when('submit', '.search', (event) => {
  event.preventDefault()
  const search = event.target.closest($.link).querySelector('[name="search"]')
  const url = '/app/giggle-search?query=' +search.value
  updateActiveWorkspace(url)
})

function updateActiveWorkspace(url) {
  const { activeWorkspace } = $.learn()
  const workspace = activeWorkspace || 'first'
  const iframe = event.target.closest($.link).querySelector(`[name="${workspace}"]`)
  iframe.src = url
  document.activeElement.blur()
  $.teach({ menu: false, [activeWorkspace]: url, activeWorkspace: workspace  })
}

const settingsInterval = setInterval(() => {
  const index = Math.floor(Math.random() * palette.length)
  const color = palette[index];
  [...document.querySelectorAll($.link)].map(target => {
    target.style.setProperty('--color', color);
    target.style.setProperty('--button-color', buttons[color]);
    target.style.setProperty('--underline-color', underlines[color]);
    const accents = [...target.querySelectorAll('[class^="slant-"]')].map((node, i) => {
      const currentC = friends[color][i]
      target.style.setProperty('--accent-color-'+i, currentC);
      return currentC
    })
    $.teach({accents})
  })
}, 2500)


const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 1: suggestIndex - 1
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
  $.teach({ contextActions, suggestIndex: parseInt(event.target.dataset.index) })
})

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const suggestions = idx.search(value)
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, query: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ started: true, focused: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ focused: false })
    document.activeElement.blur()
  }, 250)
})

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.when('click', '.break-fourth-wall', (event) => {
  $.teach({ started: true })
  clearInterval(settingsInterval)
})

let once = false
export function superKey() {
  if(once) return
  once = true

  function handleEvent (event) {
    if (event.metaKey) {
      handleSuperKey(event)
    }
  }
  self.addEventListener('keydown', handleEvent);

  self.addEventListener('message', function handleMessage(event) {
    if(event.data.whisper === 'metaKey') {
      handleSuperKey()
    } else { console.log(event) }
  });
}

export function handleSuperKey(event) {
  if(document.querySelector('plan98-intro')) {
    const { menu, started } = $.learn()
    if(!started) {
      $.teach({ started: true })
      return
    }
    $.teach({ menu: !menu, started: true })
    return
  }

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    const node = document.body.querySelector('sillonious-brand')|| document.body
    node.insertAdjacentHTML("beforeend", '<plan98-intro></plan98-intro>')
  }
}

$.when('click', '.zune .app-action', (event) => {
  event.preventDefault()

  const actions = rules(event.target)

  $.teach({ contextActions: actions })
})

function createWorkspaceAction(href, workspace) {
  return {
    text: 'replace ' + workspace + ' window pane',
    action: 'setWorkspace',
    script: import.meta.url,
    href,
    workspace
  }
}

export function setWorkspace(event) {
  if(!event.target.dataset) return
  const { workspace, href } = event.target.dataset
  const customApp = href.endsWith('.saga') ? `/app/hyper-script?src=${href}`: href
  $.teach({ menu: false, activeWorkspace: workspace, [workspace]: customApp, contextActions: null })
}


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

function createPreviewAction(href) {
  return {
    text: 'preview',
    action: 'preview',
    script: import.meta.url,
    href
  }
}

export function preview(event) {
  const { href } = event.target.dataset

  const url = '/app/media-plexer?src=' + href

  showModal(`
    <iframe src="${url}" style="width: 100%;border: none; height: 100%;"></iframe>
  `)
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
  } else {
    actions.push(createWorkspaceAction(anchor.href, 'first'));
    actions.push(createWorkspaceAction(anchor.href, 'second'));
    actions.push(createWorkspaceAction(anchor.href, 'third'));
    actions.push(createWorkspaceAction(anchor.href, 'fourth'));
  }

  actions.push(createPreviewAction(anchor.href, 'fourth'));

  return actions
}

$.style(`
  & {
    --red: firebrick;
    --orange: darkorange;
    --yellow: gold;
    --green: mediumseagreen;
    --blue: dodgerblue;
    --purple: mediumpurple;
    position: relative;
    width: 100%;
    max-height: 100%;
    display: block;
    height: 100%;
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

  & .break-fourth-wall {
    width: 100%;
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

  & .hero {
    background-color: var(--color, mediumpurple);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    padding-top: 100px;
    display: grid;
    place-items: end center;
  }

  & .about {
    margin-bottom: 2rem;
  }

  & .plan98-slants {
    display: grid;
    grid-template-columns: 1ch 1ch 1ch;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: skew(-25deg) translateX(-1rem);
    opacity: .75;
  }

  & .slant-1 {
    background: var(--accent-color-0, var(--red));
  }
  & .slant-2 {
    background: var(--accent-color-1, var(--orange));
  }
  & .slant-3 {
    background: var(--accent-color-2, var(--yellow));
  }

  & .plan98-letters {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,1);
    text-shadow: 1px 1px rgba(0,0,0,1);
    border-bottom: 1rem solid var(--underline-color, mediumseagreen);
    padding: 0 2rem;
  }

  & .wall {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 2;
  }

  & .break-fourth-wall {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    color: white;
    border: none;
    padding: 1rem;
    max-width: 320px;;
    margin: auto;
    display: block;
  }

  & .wall.broken {
    z-index: 1;
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
    display: none;
    position: relative;
    max-height: 300px;
    max-width: 480px;
    text-align: left;
    bottom: 3rem;
  }

  & .suggestions.focused {
    display: block;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    overflow: auto;
    z-index: 10;
    transform: translateY(-100%);
    max-height: calc(100vh - 3rem);
  }

  & .suggestion-box .auto-item {
    background: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, dodgerblue);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestion-box .auto-item:focus,
  & .suggestion-box .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .auto-item.active {
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

  & .nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 4;
    background: var(--color);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    display: grid;
    grid-template-columns: auto 1fr;
    overflow: auto;
    height: 3rem;
  }

  & .workspaces {
    display: flex;
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

  & .zune a:link,
  & .zune a:visited {
    color: rgba(255,255,255,.65);
    text-decoration: none;
    white-space: nowrap;
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
  }
  & .zune-bar {
    background: black;
    border-bottom: 1px solid rgba(255,255,255,.25);
    position: absolute;
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
    margin: 1rem 1rem 0 0;
    display: inline-block;
    padding: 1rem 1rem 0 .25rem;
    border: 1px solid rgba(255,255,255,.65);
    line-height: 1;
    aspect-ratio: 1;
    opacity: .65;
  }

  & .category:hover,
  & .category:focus {
    opacity: 1;
  }

  & [data-media],
  & [data-system] {
    font-weight: 1000;
    border: none;
    font-size: 1rem;
    background: black;
    color: rgba(255,255,255,.85);
    padding: 9px;
  }

  & [data-media]:hover,
  & [data-media]:focus,
  & [data-system]:hover,
  & [data-system]:focus {
    color: rgba(255,255,255,1);
  }

  & [data-system] {
    font-weight: 1000;
  }

  & [data-media] {
    margin-left: auto;
    font-weight: 400;
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

  & .show-all .empty-pane {
    display: grid;
  }
`)

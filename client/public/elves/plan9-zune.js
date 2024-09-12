import elf from '@silly/tag'
import { render } from "@sillonious/saga"
import { actionScript } from './action-script.js'
import natsort from 'natsort'

const $ = elf('plan9-zune', {
  menu: true
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


$.draw((target) => {
  const { hypermedia, audioPlaying, currentTrack, contextActions, menu, started, playlistVisible } = $.learn()
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
    <div class="cortana ${playlistVisible ? 'active': ''}">
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
    </div>
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
`
}, {
  afterUpdate
})


function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
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

function playlist() {
  return`
  play
  `
}
function zune() {
  const { hypermedia } = $.learn()
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
`)

  return `
    <div class="zune">
      ${hypermedia ? `<iframe src="${hypermedia}"></iframe>`:''}
      ${alphabetical(bookmarks)}
    </div>
  `
}

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
  tile.scrollIntoView()
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
  $.teach({ contextActions: null })
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

$.when('click', '.break-fourth-wall', (event) => {
  $.teach({ started: true })
})

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
    overflow-x: hidden;
    pointer-events: none;
  }

  & a,
  & button {
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
    pointer-events: all;
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
    display: none;
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
    position: absolute;
    top: 2rem;
    right: 0;
    bottom: 0;
    max-width: 320px;
    width: 100%;
    z-index: 8999;
    transform: translateX(100%);
    transition: transform 100ms ease-out;
    background-image: linear-gradient(-25deg, rgba(0,0,0,1), rgba(0,0,0,.85));
    backdrop-filter: blur(150px);
  }


  & .cortana.active {
    transform: translateX(0);
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
`)

import module from '@silly/tag'
import { currentBusiness } from './sillonious-brand.js'
import { render } from "@sillonious/saga"
import natsort from 'natsort'
import { getSession, logout } from './bayun-wizard.js'

let bookmark = ''
const initial = {
  authenticated: false,
  bookmarks: [],
  tab: 'bookmarks',
  alias: '',
  pass: '',
  href: '',
  text: ''
}

const $ = module('my-journal', initial)

$.when('click', '[data-logout]', logout)

export function alias() {
  return $.learn().alias
}

export function subscribe($, target, callback=()=>null) {
  if(!target.subscribed) {
    target.subscribed = true
    load($, target.id, callback)
  }
}

export function bookmarks() {

}

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

const tabs = {
  bookmarks: (target) => {
    return `
      <div class="book">${zune(target)}</div>
    `
  },
  notes: (target) => {
    return `
      <iframe src="/app/private-notes?id=${$.link}"></iframe>
    `
  },
  account: (target) => {
    const { alias } = $.learn()
    return `
      <div class="page">
        ${alias}
        <button class="button" id="signout" type="submit">
          Sign Out
        </button>
        <button class="button --small" id="factory-reset" type="submit">
          Factory Reset
        </button>
      </div>
    `
  },
}

$.when('click', '[data-escape]', function escape() {
  self.dispatchEvent(new KeyboardEvent("keydown",{'key': 'Escape'}));
})

$.draw(target => {
  const {tab, message,bookmarks, authenticated, authorized, alias, pass, href, text} = $.learn()
const { sessionId } = getSession()

  if(!sessionId && target.dataset.mode !== 'auth') {
    target.dataset.mode = 'auth'
    return `
      <secure-authentication></secure-authentication>
    `
  }

  if(sessionId && target.dataset.mode !== 'admin') {
    target.dataset.mode = 'admin'
  }

  if(target.dataset.mode === 'auth') {
    return
  }


  const empty = `
    <button data-escape>
      Escape
    </button>
    <div class="block">
      <button data-logout>Sign Off</button>
      <a href="/app/sillyz-computer">
        <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
      </a>
      For those that would dare to giggle, speak the magic word and follow the nose wherever it goes
      <hr>
      <a href="/app/secure-mail?src=/app/link-list?src=/app/play-wheel">
        Play as Root
      </a>
      <a href="/app/path-finder?id=${new Date().toJSON()}">
        Play as Guest
      </a>
      <a href="#">
        (coming soon) watch how it was made
      </a>
    </div>
  `

  const regular = `
    <div class="tabs">
      <button ${tabMetadata('bookmarks', tab)}>
        Bookmarks
      </button>
      <button ${tabMetadata('notes', tab)}>
        Notes
      </button>
      <button ${tabMetadata('account', tab)}>
        Account
      </button>
    </div>
    <div class="active-tab">
      ${tabs[tab](target)}
    </div>
  `

  const { image, color } = currentBusiness(plan98.host)
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

  return `
    <div class="inner">
      ${authenticated
        ? regular
        : empty
      }
    </div>
  `
}, { beforeUpdate, afterUpdate })

function tabMetadata(label, active) {
  return `data-tab="${label}" ${active === label ? 'class="active"':''}`
}

$.when('click', '[data-tab]', (event) => {
  const { tab } = event.target.dataset
  $.teach({ tab })
})

function zune(target) {
  const { safeMode, bookmarks, text, href } = $.learn()
  const myBookmarks = bookmarks.map((timestamp) => elvish($.learn()[timestamp])).join('')
  console.log(myBookmarks)
  const saga = render(`
${safeMode ? '' : myBookmarks}

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
href: /app/generic-park
text: Generic Park

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

<a
href: /app/bulletin-board
text: Bulletin Board

<a
href: /app/my-journal
text: My Journal

`)

  return `
    <div class="zune">
      <form id="post" class="new-bookmark" method="post">
        <input class="keyable" placeholder="label" name="text" value="${text}">

        <input class="keyable" placeholder="https://" name="href" value="${href}">
        <button type="submit" class="button square" aria-label="bookmark">
          <sl-icon name="journal-bookmark"></sl-icon>
        </button>
      </form>


      ${alphabetical(saga)}
    </div>
  `
}

function alphabetical(xmlHTML) {
  var sorter = natsort();
  const page = new DOMParser().parseFromString(xmlHTML, "text/html");
  const node = page.querySelector('xml-html')

  if(!node) {
    const { safeMode } = $.learn()
    if(!safeMode) {
      requestIdleCallback(() => {
        $.teach({ safeMode: true })
      })
    }
    return 'error'
  }
  const children = [...node.children]
  const usedLetters = {}

  children.sort(function(a, b) {
    return sorter(a.innerText.toLowerCase(), b.innerText.toLowerCase());
  }).map((x) => {
    const tile = document.createElement('div')
    tile.classList.add('tile')
    if(!x.innerText) return
    const lowerFirst = x.innerText[0].toLowerCase()
    if(!usedLetters[lowerFirst]) {
      usedLetters[lowerFirst] = true
      tile.innerHTML = `<a name="${$.link}-${lowerFirst}" class=""></a><a class="category" href="#back-to-top">${lowerFirst}</a>`
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

async function actionScript(target, action, script) {
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      self.history.pushState({ action, script }, "");
      await dispatch(event, target)
    }
  }
}

function beforeUpdate(target) {
  {
    const { authenticated } = $.learn()
    const { action, script } = target.dataset
    if(authenticated && action && script) {
      actionScript(target, action, script)
    }
  }
}

function pages() {

}

function afterUpdate(target) {
  { // menu items
    const { activeMenu } = $.learn()
    const currentlyActive = target.querySelector('[data-menu-target].active')
    if(currentlyActive) {
      currentlyActive.classList.remove('active')
    }
    const activeItem = target.querySelector(`[data-menu-target="${activeMenu}"]`)
    if(activeItem) {
      activeItem.classList.add('active')
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
}

function elvish(bookmark) {
  const { href, text } = bookmark
  if(!href) return ''
  // temporary workaround; also me: forever
  const link = href.split('?')[0]
  return `
<a
href: ${link}
text: ${text || link}
`
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

let clearWorkspaceTimer
$.when('touchstart', '.zune .app-action', startClearWatch)
$.when('touchend', '.zune .app-action', endClearWatch)

$.when('mousedown', '.zune .app-action', startClearWatch)
$.when('mouseup', '.zune .app-action', endClearWatch)

function startClearWatch(event) {
  if(clearWorkspaceTimer) {
    clearTimeout(clearWorkspaceTimer)
  }
  clearWorkspaceTimer = setTimeout(() => {
    event.target.dispatchEvent(new Event('contextmenu'))
    $.teach({longpress: true})
  }, 1000)
}

function endClearWatch(_event) {
  if(clearWorkspaceTimer) {
    clearTimeout(clearWorkspaceTimer)
  }
}

$.when('click', '.zune .app-action', async (event) => {
  event.preventDefault()
  const { longpress } = $.learn()
  if(!longpress) {
    const actions = rules(event.target)
    if(actions.length > 0) {
      const { script, action } = actions[0]
      const dispatch = (await import(script))[action]
      await dispatch({
        target: {
          dataset: {
            ...actions[0]
          }
        }
      })
    } else {
      window.location.href = event.target.href
    }
  } else {
    $.teach({ longpress: false })
  }
})

$.when('click', '[data-href]', (event) => {
  const { href } = event.target.dataset
  if(!href) return
  window.location.href = href
})
$.when('click', '[data-menu-target]', (event) => {
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

$.when('input', '.keyable', (event) => {
  event.preventDefault()
  const { name, value } = event.target
  $.teach({[name]: value, message: ''})
})

$.style(`

  & {
    display: grid;
    place-items: start;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  & .actions {
    background: white;
  }

  & .actions button {
    background: white;
    color: dodgerblue;
  }

  & .actions button:hover,
  & .actions button:focus, {
    background: dodgerblue;
    color: white;
  }

  &::before {
    content: '';
    position: absolute;
    background: var(--color, transparent);
    background-blend-mode: multiply;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    inset: 0;
    overflow: hidden;
  }

  & .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0;
    border: none;
    background: #54796d;
    boarder-radius: 0;
    display: flex;
    aspect-ratio: 1 / 1;
  }

  & .fake-iframe {
    height: 100%;
  }

  & .card iframe{
    height: 100%;
    width: 100%;
    border: 0;
  }

  & .card .text {
    margin-top: auto;
    display: inline-block;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
    text-align: left;
    z-index: 1;
    padding: .5rem;
  }

  & .inner {
    z-index: 1;
    overflow: auto;
    width: 100%;
    max-height: 100%;
    margin: auto;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .block {
    color: rgba(0,0,0,.85);
    background: rgba(255,255,255,.85);
    padding: 1rem;
    margin: auto;
    display: flex;
    gap: .5rem;
    flex-direction: column;
    max-width: 320px;
  }

  & .field {
    margin-bottom: .5rem;
  }

  & .message {
    background: gold;
    padding: 1rem;
    opacity: 0;
  }

  & .message:empty { display: none; }

  & .message:not(:empty) {
    animation: &-fade-in 500ms ease-in-out forwards;
  }

  & .keyable {
    border: none;
    border-radius: 0;
    padding: .5rem;
    width: 100%;
    background: transparent;
    color: rgba(0,0,0,.65);
    border: 1px solid rgba(0,0,0,.1);
    height: 2rem;
    padding: 0 .5rem;
  }

  & .keyable:focus {
    outline: 2px solid var(--underline-color, mediumseagreen);
    outline-offset: 2px;
  }

  @keyframes &-fade-in {
    0 % {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  & .new-bookmark {
    display: grid;
    grid-template-columns: 1fr 1fr 2rem;
    margin-bottom: 1rem;
    background: white;
    font-size: 1rem;
  }

  & .square {
    aspect-ratio: 1;
    padding: 0;
  }

  & .zune {
    font-weight: 100;
    font-size: 2rem;
    line-height: 1;
    background: white;
    color: rgba(0,0,0,.65);
    height: 100%;
    overflow-y: auto;
    display: block;
    padding: 2rem 0 3rem;
    gap: 2rem;
  }

  & .zune xml-html {
    overflow: hidden auto;
    padding: 1rem;
    display: block;
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
    color: dodgerblue;
  }

  & .zune a:hover,
  & .zune a:focus {
    color: navy;
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
  & .zune xml-html {
    columns: 320px;
  }

  & .category {
    margin: 1rem 0 0;
    display: inline-block;
    padding: 0;
    border: 1px solid rgba(0,0,0,.25);
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

  & .tabs {
    background: black;
    display: flex;
    gap: .5rem;
    padding: .5rem .5rem 0;
  }

  & [data-tab] {
    background: lemonchiffon;
    border: none;
    padding: .5rem 1rem;
    border-radius: .5rem .5rem 0 0;
  }
  & [data-tab].active {
    background: white;
  }

  & .page {
    background: white;
  }
`)

$.when('click', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

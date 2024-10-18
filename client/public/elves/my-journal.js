import module from '@silly/tag'
import { currentBusiness } from './sillonious-brand.js'
import { render } from "@sillonious/saga"
import 'gun'
import 'gun/sea'
import natsort from 'natsort'

const Gun = window.Gun

let bookmark = ''
const gun = Gun(['https://gun.1998.social/gun']);
const user = gun.user().recall({ sessionStorage: true })
const initial = {
  authenticated: false,
  bookmarks: [],
  alias: '',
  pass: '',
  href: '',
  text: ''
}

const $ = module('my-journal', initial)

export function bookmarks() {

}

gun.on('auth', () => {
  $.teach({ authenticated: true })
  user.get('journal').map().on(observe);

  [...document.querySelectorAll($.link)].map((x) => {
    x.dispatchEvent(new Event('connected'))
  })
})

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

$.draw(target => {
  const data = $.learn()
  const {message,bookmarks, authenticated, authorized, alias, pass, href, text} = data

  const empty = `
    <form class="block">
      <img src="/cdn/thelanding.page/giggle.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
      <label class="field">
        <span class="label">Player</span>
        <input class="keyable" name="alias" value="${alias}" placeholder="handle">
      </label>
      <label class="field">
        <span class="label">Password</span>
        <input class="keyable" name="pass" value="${pass}" type="password" placeholder="passphrase">
      </label>
      <div class="message">${message||''}</div>
      <button class="button" id="sign-a-panda-in" type="submit">
        Sign a Panda in
      </button>
    </form>
  `

  const halfway = `
    hi
  `

  const regular = `
    <div class="actions">
      <div class="menu-item">
        <button data-menu-target="me">
          me
        </button>
        <div class="menu-actions" data-menu="me">
          <button class="button" id="signout" type="submit">
            Sign Out
          </button>
          <button class="button --small" id="factory-reset" type="submit">
            Factory Reset
          </button>
        </div>
      </div>
    </div>
    <div class="book">${zune(target)}</div>
  `

  const { image, color } = currentBusiness(plan98.host)
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

  return `
    <div class="inner">
      ${authenticated
        ? authorized
          ? regular
          : halfway
        : empty
      }
    </div>
  `
}, { beforeUpdate, afterUpdate })

function zune(target) {
  const { hypermedia, safeMode, bookmarks, text, href } = $.learn()
  const src = hypermedia || target.getAttribute('src')
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
      ${src ? `<iframe src="${src}"></iframe>`:''}
      <form id="post" class="new-bookmark" method="post">
        <input class="keyable" placeholder="bookmark" name="text" value="${text}">

        <input class="keyable" placeholder="link" name="href" value="${href}">
        <button type="submit" class="button square" aria-label="bookmark">
          <sl-icon name="journal-bookmark"></sl-icon>
        </button>
        <button class="nonce" aria-label="new" data-action="new"></button>
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

  saveCursor(target) // first things first
}

function pages() {

}

function afterUpdate(target) {
  replaceCursor(target) // first things first

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

  {
    if(!target.observer) {
      const options = {
        root: target,
        rootMargin: "0px",
        threshold: 0,
      };

      target.observer = new IntersectionObserver(intersectionCallback, options);
    }

    [...target.querySelectorAll('.fake-iframe')].map((node) => {
      target.observer.observe(node);
    })
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

}

function intersectionCallback(entries, options) {
  entries.forEach((entry) => {
    if(entry.isIntersecting) {
      const { src,title } = entry.target.dataset

      entry.target.innerHTML = `
        <iframe src="${src}" title="${title}"></iframe>
      `
    } else {
      entry.target.innerHTML = ''
    }
  });
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

$.when('contextmenu','.zune .app-action', promptContext)

function promptContext(event) {
  event.preventDefault()
  const actions = rules(event.target)

  if(actions.length > 0) {
    $.teach({ contextActions: actions })
  }
}

export function clearWorkspace(event) {
  const { workspace } = event.target.dataset
  $.teach({  [workspace]: null, contextActions: null })
  requestActionMenu(null)
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
      $.teach({ hypermedia: event.target.href })
    }
  } else {
    $.teach({ longpress: false })
  }
})

$.when('click', '[data-action="new"]', (event) => {
  const visibility = 'private' // 'public'
  window.location.href = `/app/bulletin-board?src=/${visibility}/${$.link}/${self.crypto.randomUUID()}.json&group=${self.crypto.randomUUID()}`
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

$.when('click', '#signout', disconnect)

export function disconnect (event) {
  event.preventDefault()
  user.leave()
  $.teach({ authenticated: false });

  [...document.querySelectorAll($.link)].map((x) => {
    x.dispatchEvent(new Event('disconnected'))
  })
}

export function getUser() {
  const { authenticated } = $.learn()
  return authenticated ? user : ''
}

$.when('click', '#sign-a-panda-in', (event) => {
  event.preventDefault()
  const { alias, pass } = $.learn()
  user.create(alias, pass, function createdCallback(ack) {
    if(ack.err) {
      $.teach({ message: ack.err })
    }

    user.auth(alias, pass, function authenticatedCallback(ack) {

      if(ack.err) {
        $.teach({ message: ack.err })
      } else {
        $.teach({ pass: '', message: '' })
      }
    })
  })
})

$.when('click', '#factory-reset', (event) => {
  event.preventDefault()
  obliterate(user.get('journal'))
  $.teach(initial)
  disconnect()
})

function obliterate(node) {
  node.map().once((child, key) => {
    if (child) {
      obliterate(node.get(key));
    }
  });

  node.put(null);
}

$.when('submit', '#post', (event) => {
  event.preventDefault()
  const { href, text } = $.learn()
  bookmark = { href, text }
  $.teach({ href: '', text: '' })
  user.get('journal').get(new Date().toISOString()).put(bookmark)
})

const tags = ['TEXTAREA', 'INPUT']
let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  } else {
    target.dataset.paused = null
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
  }
}

$.style(`

  & {
    display: grid;
    place-items: start;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  &::before {
    content: '';
    position: absolute;
    background: var(--image), var(--color, transparent);
    background-blend-mode: multiply;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    inset: 0;
    overflow: hidden;
  }

  & .book {
    height: 100%;
    position: absolute;
    inset: 0;
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
    padding: 2rem 0;
    height: 100%;
    display: grid;
  }

  & form {
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,85);
    padding: 1rem;
    margin: auto;
    display: flex;
    gap: .5rem;
  }

  & form.block {
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
    color: rgba(255,255,255,.65);
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
    grid-template-columns: 1fr 1fr 2rem 2rem;
    margin-bottom: 1rem;
    background: rgba(0,0,0,.85);
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


`)

$.when('click', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

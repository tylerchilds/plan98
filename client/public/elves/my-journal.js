import module from '@silly/tag'
import { currentBusiness } from './sillonious-brand.js'
import 'gun'
import 'gun/sea'

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
  user.get('journal').map().on(observe)
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

let bookCache = ''
$.draw(target => {
  const data = $.learn()
  const {message,bookmarks, authenticated, alias, pass, href, text} = data

  const fakie = `
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

    <form id="post" method="post">
      <input class="keyable" placeholder="text" name="text" value="${text}">

      <input class="keyable" placeholder="link" name="href" value="${href}">
      <button type="submit" class="button" aria-label="bookmark">
        <sl-icon name="journal-bookmark"></sl-icon>
      </button>
    </form>

    <div class="book">${bookCache}</div>
  `

  const { image, color } = currentBusiness(plan98.host)
  target.style.setProperty("--image", `url(${image})`);
  target.style.setProperty("--color", color);

  return `
    <div class="inner">
      ${authenticated ? regular : fakie}
    </div>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  saveCursor(target) // first things first

  {
    const book = target.querySelector('.book')
    if(book) {
      bookCache = book.innerHTML
    }
  }
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
    const data = $.learn()
    const book = target.querySelector('.book')
    data.bookmarks
      .map(x => card(data[x]))
      .filter(x => {
        return !book.querySelector(`[data-href="${x.href}"]`)
      })
      .forEach(x => {
        book.insertAdjacentHTML('afterbegin', x.html)
      })
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


function card(bookmark) {
  const { href, text } = bookmark

  const html = `
    <button class="card" data-href="${href}">
      <div class="fake-iframe" data-src="${href}" data-kitle="${text}">
      </div>
      <div class="text">
        ${text}
      </div>
    </button>
  `

  return {
    html,
    href,
    text
  }
}

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

$.when('click', '#signout', (event) => {
  event.preventDefault()
  user.leave()
  $.teach({ authenticated: false })
})

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
  user.leave()
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
    display: grid;
    gap: .25rem;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  & .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0;
    border: none;
    boarder-radius: 0;
    display: flex;
    aspect-ratio: 2 / 3;
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
    background: rgba(255,255,255,.85);
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
  }

  @keyframes &-fade-in {
    0 % {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
`)

$.when('click', '*', (event) => {
  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

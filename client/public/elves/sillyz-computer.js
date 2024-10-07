import tag from '@silly/tag'
import $intro from './plan98-intro.js'
import $zune from './plan9-zune.js'
import { actionScript } from './action-script.js'

// synthia is eval and must be stopped
const synthia = eval
// welcome to the every letter formation
const nonce = `<div class="nonce"></div>`

$zune.teach({ menu: false })

const $ = tag('sillyz-computer', {
  bookmarks: [],
  bookmarkIndex: null,
  code: ''
})

function newComputerActions(src) {
  return [
    {
      text: 'window',
      action: 'low',
      script: import.meta.url,
      src
    },
    {
      text: 'mobile',
      action: 'medium',
      script: import.meta.url,
      src
    },
    {
      text: 'desktop',
      action: 'ultra',
      script: import.meta.url,
      src
    },
    {
      text: 'gaming',
      action: 'elfworld',
      script: import.meta.url,
      src
    },
    {
      text: 'office',
      action: 'coop',
      script: import.meta.url,
      src
    },

  ]
}

const actionsCatalog = {
  silly: newComputerActions
}

export const lookup = {
  '004': {
    title: "Charmander's",
    subtitle: "Ember",
    tag: 'sillyz-ocarina',
    latitude: '37.769100',
    longitude: '-122.454583',
  },
  '007': {
    title: "Squirtle's",
    subtitle: "Bubble",
    tag: 'sillyz-ocarina',
    latitude: '37.771336',
    longitude: '-122.460065',
  },
  '035': {
    title: "Clefairy's",
    subtitle: "Metronome",
    tag: 'sillyz-ocarina',
    latitude: '37.772006',
    longitude: '-122.462220',
  },
  '097': {
    title: "Hypno's",
    subtitle: "Future Sight",
    tag: 'sillyz-ocarina',
    latitude: '37.772322',
    longitude:  '-122.465443',
  },
  '134': {
    title: "Vaporeon's",
    subtitle: "Aurora Beam",
    tag: 'sillyz-ocarina',
    latitude: '37.772366',
    longitude: '-122.467315',
  },
  '147': {
    title: "Dratini's",
    subtitle: "Dragon Dance",
    tag: 'sillyz-ocarina',
    latitude: '37.771326',
    longitude: '-122.470304',
  },
}

$.when('click', '[data-ok]', (event) => {
  event.target.closest($.link).removeAttribute('error')
  $.teach({ error: null })
})

$.when('click', '.synthia-clear', (event) => {
  $.teach({ code: '' })
})

$.draw(target => {
  const error = $.learn().error || target.getAttribute('error')
  const src = target.getAttribute('src') || '/404'
  mount(target, src)
  const { resourceLevel, resourceActions } = $.learn()

  if(error) {
    return `
      <a ${resourceActions ? `style="display:none;"`: `class="about-out"`} href="/app/saga-about">
        <span><sl-icon name="info-circle"></sl-icon></span> About
      </a>
      <div class="resource">
        <div style="text-align: center;">
          <div class="error">
            ${error}
          </div>
          <button data-ok data-create="${src}" aria-label="create"></button>
        </div>
      </div>
    `
  }

  if(!resourceLevel) {
    return `
      <a ${resourceActions ? `style="display:none;"`: `class="about-out"`} href="/app/saga-about">
        <span><sl-icon name="info-circle"></sl-icon></span> About
      </a>
      <div class="resource">
        ${ resourceActions ? resourceMenu(resourceActions) : `<button data-create="${src}" aria-label="create"></button>` }
      </div>
    `
  }

  if(lookup[target.id]) {
    return `<middle-earth id="${target.id}"></middle-earth>`
  }

  return `
    <div class="bottom">
      <plan98-intro src="${src}"></plan98-intro>
    </div>
    <div class="top">
      <plan9-zune></plan9-zune>
    </div>
  `
}, { afterUpdate })

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



function mount(target, src) {
  if(target.mounted) return
  target.mounted = true
  const page = actionsCatalog[target.getAttribute('page')]
  if(page) {
    requestIdleCallback(() => {
      $.teach({ resourceActions: page(src) })
    })
  }

  const code = target.getAttribute('code')
  if(code) {
    requestIdleCallback(() => {
      $.teach({ code, resourceActions: [] })
    })
  }
}

function resourceMenu(actions) {
  const { bookmarks, code, calculation, bookmarkIndex, promptHeight } = $.learn()
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

  const view = (code && calculation) || (code && bookmarks)
   ? `
      <div class="suggestion-box">${results(calculation)}${bookmarks.map((x, i) => {
          return `
            <button type="button" class="auto-item ${bookmarkIndex === i ? 'active': ''}" data-url="${x.url}" data-index="${i}">
              <div class="icon">
                ${x.image?`<img src="${x.image}" />`:`${nonce}`}
              </div>
              <div class="name">
                ${x.name}
              </div>
            </button>
          `
        }).join('')}</div>
      <div class="instructions">
        <p>Nothing to see... yet.</p>

        <p>Perform a calculation in the box above by clicking the calculator icon to the left of it.</p>

        <p>Alternatively, change the query to find one of your bookmarks.</p>

        <p>Select the microphone icon to use voice to search</p>
        
        <p>Select the camera to search visually</p>
      </div>
    `:`
      <div class="resource-actions">
        <div>
          <button data-no-actions> 
            back
          </button>
        </div>
        ${list}
      </div>
    </div>
  `

  return `
    <div class="synthia">
      <div class="title-bar">
        <button data-calculate class="synthia-action">
          <sl-icon name="calculator"></sl-icon>
        </button>
        <div class="prompt">
          <textarea ${ promptHeight ? `style="--prompt-height: ${promptHeight}px;"`:''} name="synthia" autocomplete="off">${code}</textarea>
          <button data-voice class="synthia-action synthia-clear">
            <sl-icon name="x-lg"></sl-icon>
          </button>
        </div>
        <button data-voice class="synthia-action">
          <sl-icon name="mic"></sl-icon>
        </button>
        <button data-camera class="synthia-action">
          <sl-icon name="camera"></sl-icon>
        </button>
      </div>
      ${view}
    `
}

function results(x) {
  if(!x) return ''
  return `
    <button type="button" class="auto-item" data-url="${x.url}">
      <div class="icon">
        ${x.image?`<img src="${x.image}" />`:`${nonce}`}
      </div>
      <div class="name">
        ${x.name}
      </div>
    </button>
  `
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="synthia"]', event => {
  const { bookmarksLength, bookmarkIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (bookmarkIndex === null) ? 0 : bookmarkIndex + 1
    if(nextIndex >= bookmarksLength -1) return
    $.teach({ bookmarkIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (bookmarkIndex === null) ? bookmarksLength - 2 : bookmarkIndex - 1
    if(nextIndex < 0) return
    $.teach({ bookmarkIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && bookmarkIndex !== null) {
    event.preventDefault()
    const { bookmarks, bookmarkIndex } = $.learn()
    const item = documents.find(y => {
      return bookmarks[bookmarkIndex].ref === y.path
    })

    if(item) {
      const { tray } = event.target.dataset
      const url = '/app/media-plexer?src=' +item.path
      document.activeElement.blur()
      setState(tray, { url, focused: false })
      return
    }
  }
})

$.when('keyup', '[name="synthia"]', event => {
  const code = event.target.value

  if(code) {
  $.teach({ code, bookmarks: [] })
  } else {
    $.teach({ code, bookmarks: [] })
  }
})


$.when('click', '[data-no-actions]', (event) => {
  $.teach({ resourceActions: null })
})

$.when('click', '[data-url]', (event) => {
  const { url } = event.target.dataset

  open(url)
})


$.when('click', '[data-calculate]', (event) => {
  const { code } = $.learn()
  const response = synthia(code)

  if(!response) {
    $.teach({ calculation: null })
    return
  }

  const calculation = { name: response, url: '/app/sillyz-computer?src=/app/sillyz-computer&code=' + encode(code) }
  $.teach({ calculation })
})

$.when('click', '[data-create]', (event) => {
  const src = event.target.dataset.create
  $.teach({
    resourceActions: newComputerActions(src)
  })
})

$.when('click', '.action-script', actionScript)
export function low(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = src
}

export function medium(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = '/9' + src
}

export function ultra(event) {
  if(event.type === 'popstate') {
    $.teach({ resourceLevel: null, resourceActions: null })
  } else {
    const to = 'ultra'
    self.history.pushState({ type: 'resourceLevel', from: null, to }, "");
    $.teach({ resourceLevel: to })
  }
}

export function elfworld(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = '/x/elf' + src
}

export function coop(event) {
  const src = event.target.dataset.src || '/404'
  window.location.href = '/app/bulletin-board?src=' + src
}


$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    background: #54796d;
    animation: &-fade-in ease-in-out 1000ms forwards;
  }

  & .about-out {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    background: black;
    padding: 1rem;
    color: white;
    text-decoration: none;
    display: inline-grid;
    font-size: 1rem;
    padding: .5rem;
    grid-template-columns: auto 1fr auto;
    gap: .5rem;
    line-height: 1;
    animation: &-about-out 1000ms ease-in-out forwards 7777ms;
  }

  @keyframes &-about-out {
    0% {
      opacity: 1;
      pointer-events: all;
    }
    100% {
      opacity: 0;
      pointer-events: none;
    }
  }

  & .error {
    color: black;
    background: white;
    padding: 2rem;
    font-size: 2rem;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  & .top {
    position: absolute;
    inset: 0 0 3rem 0;
    grid-area: midship;
    z-index: 2;
    pointer-events: none;
  }

  & .bottom {
    position: absolute;
    inset: 2rem 0 0 0;
    grid-area: midship;
  }

  & .nonce,
  & [data-create] {
    background: lemonchiffon;
    border: none;
    border-radius: none;
    box-shadow: var(--shadow);
    max-width: 10rem;
    aspect-ratio: 1;
    width: 100%;
    position: relative;
    min-height: 1rem;
    min-width: 1rem;
  }

  & .auto-item .icon {
    padding: 3px 0;
    display: grid;
    place-items: center;
  }

  & .nonce::before,
  & [data-create]::before{
    position: absolute;
    inset: 0%;
    content: '';
    display: block;
    width: 60%;
    aspect-ratio: 1;
    background-color: #E83FB8;
    border-radius: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }

  & .nonce {
    box-shadow: none;
  }

  & .resource {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    position: relative;
  }

  & .synthia .resource-actions button {
    font-weight: 100;
    color: rgba(0,0,0,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .synthia .resource-actions button:hover,
  & .synthia .resource-actions button:focus {
    color: rgba(0,0,0,1);
  }
}
  & .synthia {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .synthia:not(:empty) {
    display: flex;
    flex-direction: column;
    overflow: auto;
    width: 100%;
    height: 100%;
    background: white;
    padding: 1rem 0;
  }

  & .resource-actions {
    padding: 1rem;
  }

  & .suggestion-box {
    position: absolute;
    inset: 4rem 0 0;
    overflow: auto;
    z-index: 10;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  & .suggestion-box .auto-item {
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
    pointer-events: all;
    border: none;
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


  & .title-bar {
    padding: 2px 5px;
    font-size: 1rem;
    height: 2rem;
    min-height: 2rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    color: rgba(0,0,0,.85);
    background: rgba(255,255,255,.85);
    gap: 5px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
  }


  & .title-bar .prompt {
    position: relative;
    z-index: 1000;
  }

  & .synthia-clear {
    position: absolute;
    z-index: 1000;
    right: 0;
    top: 3px;
  }

  & .title-bar textarea {
    border: 1px solid rgba(0,0,0,.85);
    border-radius: 0;
    background: transparent;
    color: rgba(0,0,0,.85);
    width: 100%;
    padding: 0 4px 0;
    height: 100%;
    resize: none;
    line-height: 1.5;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    background: white;
  }


  & .title-bar textarea:focus {
    height: var(--prompt-height);
  }
  & .synthia-action {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 3px 5px;
    opacity: .65;
    transition: opacity 100ms;
    border-radius: 100%;
    display: grid;
    place-items: center;
  }

  & .synthia-action:hover,
  & .synthia-action:focus {
    opacity: 1;
  }

  & .suggestion-box:empty + .instructions {
    display: block;
  }

  & .instructions {
    display: none;
    padding: 1rem;
  }
`)


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

function handleSuperKey(event) {
  const { menu } = $zune.learn()
  $zune.teach({ menu: !menu })

  const { broken } = $intro.learn()
  $intro.teach({ broken: !broken })

  if(document.querySelector('plan9-zune')) return

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    const isSilly = !!document.body.querySelector('sillyz-computer')
    if(!isSilly) {
      const today = new Date().toJSON().slice(0, 10)
      const node = document.body.querySelector('sillonious-brand') || document.body
      node.insertAdjacentHTML("beforeend", `<sillyz-computer src="/app/hyper-script?src=/public/sagas/my/${today}.saga"></sillyz-computer>`)
    }
  }
}

function encode(url) {
  return encodeURIComponent(url).replace(/%20/g, '+');
}

function decode(encodedUrl) {
  return decodeURIComponent(encodedUrl.replace(/\+/g, '%20'));
}

$.when('input', 'textarea', (event) => {
  $.teach({ promptHeight: event.target.scrollHeight })
});

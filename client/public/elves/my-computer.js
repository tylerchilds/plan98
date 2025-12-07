import Self from '@plan98/elf'
import { toast } from './plan98-toast.js'
import { showPanel, hidePanel } from './plan98-panel.js'
import $paperPocket from './paper-pocket.js'
import Cache from '@silly/cache'
const elf = 'my-computer'

const modes = {
  welcome: 'welcome',
}

const PAGES = {
  HOME: 'home',
  ART: 'art',
  MUSIC: 'music',
  CODING: 'coding',
  CHAT: 'chat',
  THEME: 'theme',
  SHARE: 'share',
  TUTORIAL: 'tutorial',
}

const config = {
  [PAGES.HOME]: {
    label: 'Home',
    path: '/',
    icon: '<sl-icon name="house"></sl-icon>',
  },
  [PAGES.ART]: {
    label: 'Art',
    path: '/art',
    icon: '<sl-icon name="newspaper"></sl-icon>',
  },
  [PAGES.MUSIC]: {
    label: 'Music',
    path: '/music',
    icon: '<sl-icon name="info-circle"></sl-icon>',
  },
  [PAGES.CODING]: {
    label: 'Coding',
    path: '/coding',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
  [PAGES.THEME]: {
    label: 'Theme',
    path: '/theme',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
  [PAGES.SHARE]: {
    label: 'Share',
    path: '/share',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
  [PAGES.TUTORIAL]: {
    label: 'Tutorial',
    path: '/tutorial',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
  [PAGES.CHAT]: {
    label: 'Chat',
    path: '/chat',
    icon: '<sl-icon name="globe2"></sl-icon>',
  },
}

function createPathMap() {
  return Object
    .keys(config)
    .reduce((paths, key) => {
      const page = config[key]
      paths[page.path] = {
        page: key,
        label: page.label
      }

      return paths
    }, {})
}

const paths = createPathMap()

function router(route) {
  return paths[route] ? paths[route] : {
    page: Object.keys(config)[0]
  }
}

const initialState = {
  ...router(self.location.pathname),
  route: paths[self.location.pathname] ? self.location.pathname : '/',
  mode: modes.welcome,
}

const $ = Self(elf, initialState)

export default $

addEventListener("popstate", (event) => {
  $.teach(router(self.location.pathname))
});

$.when('click', '[data-nav]', (event) => {
  event.preventDefault()
  const { nav } = event.target.dataset
  $.teach({ route: nav  })
  self.history.pushState(null, '', `${nav}` + window.location.search)
  hidePanel()
})

$.head(target => {
  if(target.innerHTML) return

  target.innerHTML = `
    <header>
      <button data-nav="/" class="title">
        C<span class="sublogo -hide-small">ute Strap</span><span class="sublogo -show-small">s</span>
      </button>
      <nav>
        <button data-nav="/art">
          Art
        </button>
        <button data-nav="/music">
          Music
        </button>
        <button data-nav="/coding">
          Coding
        </button>
        <button data-panel style="">
          RoW
        </button>
      </nav>
    </header>
    <div class="pages">
      <div class="page page-${PAGES.HOME}">
        <home-page></home-page>
      </div>
      <div class="page page-${PAGES.MUSIC}">
        <dial-tone></dial-tone>
      </div>
      <div class="page page-${PAGES.ART}">
        <photo-journal></photo-journal>
      </div>
      <div class="page page-${PAGES.CODING}">
        <plan98-ide src="/public/plan98.js"></plan98-ide>
      </div>
      <div class="page page-${PAGES.THEME}">
        <plan98-palette></plan98-palette>
      </div>
      <div class="page page-${PAGES.CHAT}">
        <cool-chat></cool-chat>
      </div>
      <div class="page page-${PAGES.TUTORIAL}">
        ${tutorial(target)}
      </div>
      <div class="page page-${PAGES.SHARE}">
        ${share(target)}
      </div>
    </div>
  `
}, {
  onCreate(target) {
    const maybeId = new URLSearchParams(window.location.search).get('id')
    if(maybeId) {
      target.id = maybeId
    }
  },
  afterUpdate(target) {
    {
      const { route } = $.ear()
      if(target.dataset.route !== route) {
        target.dataset.route = route
      }
    }
  }
})

$.when('click', '[data-panel]', (event) => {
  showPanel(`
    <my-computer class="passthrough">
      <button data-nav="/share">
        Share
      </button>
      <button data-nav="/theme">
        Set Theme
      </button>
      <button data-nav="/tutorial">
        Learn More
      </button>
    </my-computer>
  `)
})

$.hand('click', '[data-close]', function  (event) {
  event.preventDefault()
  $.mouth({
    page: PAGES.HOME,
  })
})


function tutorial(target) {
  const label = target.getAttribute('label') || 'Pluto'

  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="frame-header">
            <div style="display: grid; place-content: start">
            </div>
            <div style="display: grid; place-content: end">
            </div>
          </div>
          <div class="frame-body">
            <div style="padding: 1rem; max-width: 55ch; margin: 0 auto; height: 100%; display: flex; gap: 1rem; flex-direction: column;">
              <div>
                <plan98-icon></plan98-icon>
              </div>
              <p>
                <center>
                  <strong>The imagination:</strong> <strike>Space!</strike> <u>Time!</u> <sup>Sight!</sup> <sub>Sound!</sub> <em>Mind!</em>
                </center>
              </p>
                <qr-code src="${window.location.origin + window.location.pathname}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
              <div>
                <strong>${label}</strong><br/>
                <em>Quadrant:</em> ${window.location.origin} <code>/app/</code><br/>
                <em>Sector:</em> ${$.link} <code>?id=</code><br/>
                <em>Planet:</em> ${target.closest($.link).id} <code>&label=${label}</code><br/>
              </div>
              <hr>
              <img src="/public/cdn/sillyz.computer/reality-somehow.jpeg">
              <p>
                A creative suite for kids at heart. Explore and absorb the ability to create art by learning from it.
              </p>

              <ul>
                <li>Art</li>
                <li>Music</li>
                <li>Coding</li>
              </ul>

              <div>
                <plan98-palette style="height: 50vh"></plan98-palette>
              </div>

              <div>
                <div style="display: grid; height: 100vh; place-content: center;">
                  <a href="/app/hello-elvish?elf=js-repl">Tunnel Practice</a>
                </div>
              </div>
            </div>
          </div>
          <div class="frame-footer">
            <div style="text-align: right;">
              <button data-share class="standard-button bias-generic -small" type="submit">
                Share
              </button>
              <button data-start class="standard-button bias-positive -small" type="submit">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function share(target) {
  const { viewMetadata } = $.ear()
  const shareLink = `${window.location.origin + window.location.pathname}?id=${target.closest($.link).id}`
  const copyId = self.crypto.randomUUID()
  const label = target.getAttribute('label') || 'Pluto'

  const actionArea = `
    <div class="action-area">
      <div class="action-bar">
        <button data-copy="${copyId}" class="standard-button -round -large">
          <sl-icon name="copy"></sl-icon>
        </button>
      </div>
      <div id="${copyId}" class="share-link-copyable-url standard-input -small">${shareLink}</div>
    </div>
  `

  return `
    <div class="overlay-background">
      <div class="form-card">
        <div class="draft-template">
          <div class="draft-header">
            <div style="display: grid; place-content: start">
              <button class="standard-button bias-generic -small -round" data-toggle-metadata="${viewMetadata ? 'on':'off'}">
                <sl-icon name="gear-fill"></sl-icon>
              </button>
            </div>
            ${actionArea}
            <div style="display: grid; place-content: end">
            </div>
          </div>

          <div class="memex-body draft-body">
            <div class="overlay-background">
              <div style="padding: 51px; height: 100%; display: flex; flex-direction: column;">
                <qr-code src="${window.location.origin + window.location.pathname}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
              </div>
            </div>
          </div>
          <div class="draft-footer">
            <p>
              Hey, listen! Copy this link and share it online or let someone in person scan it to link up and <button class="standard-button -smol" data-help>"Sketch"</button> together!
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

$.hand('click', '[data-copy]', async (event) => {
  const { copy } = event.target.dataset
  const target = event.target.closest($.link).querySelector(`[id="${copy}"]`)

  try {
    // Modern approach using Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(target.textContent)
      toast("Copied to clipboard")
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = target.textContent
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        toast("Copied to clipboard")
      } catch (err) {
        console.error('Fallback: Failed to copy', err)
        toast("Failed to copy")
      }

      document.body.removeChild(textArea)
    }
  } catch (err) {
    console.error('Failed to copy text: ', err)
    toast("Failed to copy")
  }
})

$.hand('click', '[data-share]', ({ target }) => share(target))

$.eye(`
  & {
    border-top: 5px solid var(--root-theme, #E83FB8);
    display: block;
    height: 100%;
    position: relative;
    z-index: 1;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    background: white;
    color: black;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  &.passthrough {
    display: block;
    height: auto;
    border-top: none;
  }

  & .pages {
    pointer-events: none;
    height: 100%;
    overflow: hidden;
  }

  & .pages > * {
    display: none;
  }

  & .page {
    height: 100%;
    overflow: auto;
  }

  ${Object.keys(PAGES).map(key => {
    const lookup = PAGES[key]
    const { path } = config[lookup]
    return `
      &[data-route="${path}"] .page-${lookup} {
        display: block;
        pointer-events: all;
        background: white;
        height: 100%;
      }

      &[data-route="${path}"] [data-nav="${path}"] {
      border-color: var(--root-theme, #E83FB8);
    }
    `
  }).join('')}

  & .overlay-background {
    display: block;
    height: 100%;
    background: white;
    backdrop-filter: blur(2px);
    overflow: hidden;
  }

  & .title {
    color: var(--root-theme, #E83FB8);
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    --v-font-casl: 1;
    --v-font-mono: 1;
    font-size: 2rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
  }

  @media (max-width: 35rem) {
    & .sublogo.-hide-small {
      display: none;
    }
  }

  & .sublogo.-show-small {
    display: none;
  }

  @media (max-width: 35rem) {
    & .sublogo.-show-small {
      display: inline;
    }
  }

  & header {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: .25rem .5rem;
  }

  & header button {
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  & nav {
    display: inline-flex;
    gap: .5rem;
    align-self: end;
    place-content: end;
  }

  & nav button {
    font-size: 1rem;
    line-height: 1;
    display: inline-grid;
    place-content: center;
    padding: .25rem;
    border-bottom: 2px solid rgba(0,0,0, .2);
  }

`)

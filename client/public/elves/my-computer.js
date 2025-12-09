import Self from '@plan98/elf'
import './plan98-palette.js'
import { toast } from './plan98-toast.js'
import { showPanel, hidePanel } from './plan98-panel.js'
import { showModal, hideModal } from './plan98-modal.js'
import $paperPocket from './paper-pocket.js'
import Cache from '@silly/cache'

const elf = 'my-computer'

const cache = Cache(elf)
const version = 'infinite-1.0.0-rc15'

const lazyLoaders = [
  './home-page.js',
  './photo-journal.js',
  './dial-tone.js',
  './plan98-ide.js',
  './cool-chat.js',
  './live-help.js',
  './time-machine.js',
  './multi-task.js',
  './brain-storm.js',
  './short-link.js',
  './period-tracker.js',
  './blue-sky.js',
  './secure-mail.js',
  './hyper-script.js',
]

lazyLoaders.map(x => import(x))

const modes = {
  welcome: 'welcome',
}

const HOME = 'home'
const ART = 'art'
const MUSIC = 'music'
const CODING = 'coding'
const CHAT = 'chat'
const HELP = 'help' 
const THEME = 'theme'
const SHARE = 'share'
const TUTORIAL = 'tutorial'

const TIME_MACHINE = 'time-machine'
const MULTI_TASK = 'multi-task'
const BRAIN_STORM = 'brain-storm'
const SHORT_LINK = 'short-link'
const PERIOD_TRACKER = 'period-tracker'
const BLUE_SKY = 'blue-sky'
const E_MAIL = 'e-mail'
const HYPER_SCRIPT = 'hyper-script'

const config = {
  [HOME]: {
    label: 'Home',
    path: '/',
    icon: '<sl-icon name="house"></sl-icon>',
    body: (target) => `
      <home-page></home-page>
    `
  },
  [ART]: {
    label: 'Art',
    path: '/art',
    icon: '<sl-icon name="newspaper"></sl-icon>',
    body: (target) => `
      <photo-journal></photo-journal>
    `
  },
  [MUSIC]: {
    label: 'Music',
    path: '/music',
    icon: '<sl-icon name="info-circle"></sl-icon>',
    body: (target) => `
      <dial-tone></dial-tone>
    `
  },
  [CODING]: {
    label: 'Coding',
    path: '/coding',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <plan98-ide src="/public/plan98.js"></plan98-ide>
    `
  },
  [HELP]: {
    label: 'Help',
    path: '/help',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <iframe src="/app/live-help?room="${target.id}"></live-help>
    `
  },
  [THEME]: {
    label: 'Theme',
    path: '/theme',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
        <plan98-palette></plan98-palette>
    `
  },
  [SHARE]: {
    label: 'Share',
    path: '/share',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => share(target)
  },
  [TUTORIAL]: {
    label: 'Tutorial',
    path: '/tutorial',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => tutorial(target)
  },
  [CHAT]: {
    label: 'Chat',
    path: '/chat',
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <cool-chat></cool-chat>
    `
  },
  [TIME_MACHINE]: {
    label: 'Time Machine',
    path: `/${TIME_MACHINE}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <iframe src=/app/time-machine?id="${target.id}"></iframe>
    `
  },
  [MULTI_TASK]: {
    label: 'Multi Task',
    path: `/${MULTI_TASK}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <iframe src=/app/${MULTI_TASK}?id="${target.id}"></iframe>
    `
  },
  [BRAIN_STORM]: {
    label: 'Brain Storm',
    path: `/${BRAIN_STORM}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <iframe src=/app/${BRAIN_STORM}?id="${target.id}"></iframe>
    `
  },
  [SHORT_LINK]: {
    label: 'Short Link',
    path: `/${SHORT_LINK}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <short-link id="${target.id}"></short-link>
    `
  },
  [PERIOD_TRACKER]: {
    label: 'Period Tracker',
    path: `/${PERIOD_TRACKER}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <period-tracker id="${target.id}"></period-tracker>
    `
  },
  [BLUE_SKY]: {
    label: 'Blue Sky',
    path: `/${BLUE_SKY}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <blue-sky id="${target.id}"></blue-sky>
    `
  },
  [E_MAIL]: {
    label: 'E-Mail',
    path: `/${E_MAIL}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <e-mail></e-mail>
    `
  },
  [HYPER_SCRIPT]: {
    label: 'Hyper Script',
    path: `/${HYPER_SCRIPT}`,
    icon: '<sl-icon name="globe2"></sl-icon>',
    body: (target) => `
      <hyper-script></hyper-script>
    `
  },

}

function createPathMap() {
  return Object
    .keys(config)
    .reduce((paths, key) => {
      const page = config[key]
      paths[page.path] = {
        page: key,
        label: page.label,
        body: page.body
      }

      return paths
    }, {})
}

const paths = createPathMap()

function router(route) {
  const defaultKey = Object.keys(config)[0]

  return paths[route] ? paths[route] : {
    page: defaultKey,
    label: config[defaultKey].label,
    body: config[defaultKey].body,
  }
}

const initialState = {
  ...router(self.location.pathname),
  route: paths[self.location.pathname] ? self.location.pathname : '/',
  mode: modes.welcome,
}

const $ = Self(elf, initialState)

export default $

cache.get(elf).then(record => {
  if(!record || version !== record.data) {
    showModal(`
    <div style="height: 100%; background: rgba(128,128,128,1); overflow: auto; width: 100%;">
      <patch-notes lang="en-US"></patch-notes>
    </div>
    `, {
      transparent: true,
      blockExit: false,
      onHide: () => $.teach({ popped: false })
    })
  }

  cache.put(elf, version)
})

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
      <button style="display: inline-grid; grid-template-columns: auto 1fr; gap: .5rem; place-items: end;" data-nav="/" class="title">
        <plan98-icon></plan98-icon>
        <div>
          C<span class="sublogo -hide-small">uteStrap</span><span class="sublogo -show-small">s</span>
        </div>
      </button>
      <nav class="horizontal">
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
      <div class="page">
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
        const page = target.querySelector('.page')

        if(page) {
          page.innerHTML = router(route).body(target)
        }
      }
    }
  }
})

$.when('click', '[data-panel]', (event) => {
  showPanel(`
    <my-computer class="passthrough">
      <nav class="vertical">
        <button data-nav="/tutorial">
          Learn More
        </button>

        <button data-nav="/share">
          Share
        </button>

        <button data-nav="/theme">
          Theme Picker
        </button>

        <button data-nav="/chat">
          Chat
        </button>

        <button data-nav="/help">
          Help
        </button>

        <button data-nav="/time-machine">
          Time Machine
        </button>

        <button data-nav="/${MULTI_TASK}">
          Multi Task
        </button>
        <button data-nav="/${BRAIN_STORM}">
          Brain Storm
        </button>
        <button data-nav="/${SHORT_LINK}">
          Short Link
        </button>
        <button data-nav="/${PERIOD_TRACKER}">
          Period Tracker
        </button>
        <button data-nav="/${BLUE_SKY}">
          Blue Sky
        </button>
        <button data-nav="/${E_MAIL}">
          E-Mail
        </button>
        <button data-nav="/${HYPER_SCRIPT}">
          Hyper Script
        </button>
      </nav>
    </my-computer>
  `)
})

function tutorial(target) {
  const label = target.getAttribute('label') || 'Pluto'

  return `
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
              <patch-notes lang="${target.getAttribute('lang') || 'en-US'}"></patch-notes>
            </div>

            <div>
              <div style="display: grid; height: 100vh; place-content: center;">
                <a href="/app/hello-elvish?elf=js-repl">Tunnel Practice</a>
              </div>
            </div>
            <hr>
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

          </div>
        </div>
        <div class="frame-footer">
          <div style="transform: rotateZ(-540deg); padding: 1rem; color: white; background: black;">
            Thanks for playing. -Ty
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

  const copyArea = `
    <div class="copy-area">
      <div id="${copyId}" class="share-link-copyable-url standard-input">${shareLink}</div>
      <div>
        <button data-share="${copyId}" class="standard-button -round">
          <sl-icon name="copy"></sl-icon>
        </button>
      </div>
    </div>
  `

  return `
    <div class="share-view">
      <div class="form-card">
        <div class="draft-template">
          <div class="draft-header">
            <div style="display: grid; place-content: start">
            </div>
            ${copyArea}
            <div style="display: grid; place-content: end">
            </div>
          </div>

          <div class="memex-body draft-body">
            <div style="padding: 51px; height: 100%; display: flex; flex-direction: column;">
              <qr-code src="${window.location.origin + window.location.pathname}?id=${target.closest($.link).id}&label=${label}" style="width: 50vmin; height: 50vmin;" target="_top"></qr-code>
            </div>
          </div>
          <div class="draft-footer">
            <p>
              Hey, listen! Copy this link and share it online or let someone in person scan it to link up!
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

$.hand('click', '[data-share]', async (event) => {
  const { share } = event.target.dataset
  const target = event.target.closest($.link).querySelector(`[id="${share}"]`)

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
    height: 100%;
    overflow: hidden;
  }

  & .page {
    height: 100%;
    overflow: auto;
    background: white;
  }

  ${Object.keys(config).map(key => {
    const { path } = config[key]
    return `
      &[data-route="${path}"] [data-nav="${path}"] {
        border-color: var(--root-theme, #E83FB8);
      }

      &[data-route="${path}"] nav [data-nav="${path}"] {
        background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), linear-gradient(135deg, rgba(255,255,255,.35), rgba(0,0,0,.35), rgba(0,0,0,.25), rgba(0,0,0,.65), rgba(0,0,0,.5)), var(--root-theme, #E83FB8);
        color: white;
      }
    `
  }).join('')}

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
    position: relative;
    z-index: 1;
    box-shadow: 0 1px 2px 0px rgba(0,0,0,.1);
  }

  & header button,
  & nav button {
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  & nav button {
    color: rgba(0,0,0,.5);
  }

  & nav.horizontal {
    display: inline-flex;
    gap: .5rem;
    align-self: end;
    place-content: end;
  }

  & nav.horizontal button {
    font-size: 1rem;
    line-height: 1;
    display: inline-grid;
    place-content: center;
    padding: .5rem;
    border-bottom: 2px solid rgba(0,0,0, .2);
  }

  & nav.vertical {
    display: flex;
    align-self: end;
    flex-direction: column;
  }

  & nav.vertical button {
    font-size: 1rem;
    line-height: 1;
    display: inline-grid;
    place-content: start;
    padding: .5rem;
    border-bottom: 2px solid rgba(0,0,0, .2);
  }

  & .copy-area {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
  }

  & .share-view {
    padding: .5rem;
  }

  & .share-link-copyable-url {
    white-space: nowrap;
    overflow-x: auto;
    margin: 0 auto;
    display: block;
  }

`)

// the jester is inevitable, the bard started the song long ago

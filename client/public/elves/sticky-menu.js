import { Self } from '@plan98/types'

// miss u kevin, rip
const lazy = async resource => {
  return await import(resource).catch(console.error)
}

[
  '/public/elves/elf-boot.js',
  '/public/elves/saga-repl.js',
  '/public/elves/plan98-camera.js',
  '/public/elves/plan98-gallery.js',
  '/public/elves/v-log.js',
  '/public/elves/shirt-flicks.js',
  '/public/elves/ur-shell.js',
  '/public/elves/dream-team.js',
  '/public/elves/source-code.js'
].map(lazy)

const $ = Self('sticky-menu', {
  route: null,
})

$.skin(`
  & {
    display: grid;
    height: 100%;
    overflow: hidden;
    place-items: center;
    grid-template-areas: 'zone';
  }

  & a {
    color: var(--root-theme, #E83FB8);
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    --v-font-casl: 1;
    --v-font-mono: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
  }

  & div > a:first-of-type {
    display: inline-block;
    font-size: 2rem;
    line-height: 1;
    margin: 2rem 0 1rem;
  }

  & a:link,
  & a:visited {
    color: dodgerblue;
  }

  & a:hover,
  & a:focus {
    color: mediumseagreen;
  }

  & a:active {
    color: firebrick;
  }

  & .sticky,
  & .menu {
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: opacity 1000ms ease-in-out;
    grid-area: zone;
  }

  & .sticky {
    pointer-events: none;
    display: none;
    opacity: 0;
  }

  & .sticky iframe {
    height: 100%;
    width: 100%;
  }

  & .menu {
    padding: calc(0.382rem * 4) calc(0.618rem * 4);
    background: lemonchiffon;
  }

  & .menu > div {
    margin: 1rem 0;
  }

  & .menu div > a {
    display: inline-block;
  }

  &[data-route] .sticky {
    opacity: 1;
    pointer-events: all;
    display: block;
  }

  &[data-route] .menu {
    pointer-events: none;
    opacity: 0;
  }
`)

$.when('click', 'a', (event) => {
  event.preventDefault()
  const data = {
    route: event.target.href
  }
  $.controller(data)
  saveHistory({ type: historyTypes.navigate, [historyTypes.navigate]: data }, event.target.href)
})

$.view((target) => {
  if(target.innerHTML) return
  return `
    <div class="sticky" data-dom="iframe">
    </div>
    <div class="menu">
      <div style="max-width: 70ch; margin: 0 auto; ">
        <div style="display: grid; text-align: center; place-content: center; gap: 1rem;">
          <qr-code style="max-width: 180px;" data-fg="dodgerblue" data-bg="transparent" src="/app/multi-task?id=${target.id}"></qr-code>
        </div>

        <div>
          <a href="/app/lore-baby">
            Saga
          </a>
        </div>
        <div>
          <a href="/app/plan98-camera">
            Camera
          </a>
        </div>

        <div>
          <a href="/app/plan98-gallery">
            Gallery
          </a>
        </div>

        <div>
          <a href="/app/v-log">
            Studio
          </a>
        </div>

        <div>
          <a href="/app/shirt-flicks">
            Console
          </a>
        </div>

        <div>
          <a href="/app/ur-shell">
            Shell
          </a>
        </div>

        <div>
          <a href="/app/dream-team?id=newbies">
            Elf Team
          </a>
        </div>

        <div>
          <a href="/app/source-code">
            Code
          </a>
        </div>

        <div>
          <a href="/app/paper-pocket?rom=typo-hero">
            Typo Hero
          </a>
        </div>

        <div>
          <a href="/app/saga-crawler">
            Quest
          </a>
        </div>
        <div>
          <a href="/app/was-code?src=/public/elves/sticky-menu.js">
            (Remix)
          </a>
        </div>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    const { route } = $.model()

    if(!target.mounted) {
      target.mounted = true
      $.controller({ route: target.getAttribute('src') })
    }

    {
      if(target.dataset.route && !route) {
        delete target.dataset.route
      }

      if(route && route !== target.dataset.route) {
        target.dataset.route = route
      }
    }
  },
  afterUpdate(target) {
    const { route, name } = $.model()
    {
      const iframe = target.querySelector('[data-dom="iframe"]')
      if(iframe && target.route !== route) {
        target.route = route

        iframe.innerHTML = `
          <iframe src="${route}"></iframe>
        `
      }

    }
  }
})

function saveHistory(patch, url) {
  self.top.history.pushState({
    type: `${$.link}-navigation`,
    patch
  }, "", url);
}

const historyTypes = {
  navigate: 'navigate',
}

const patchHandlers = {
  [historyTypes.navigate]: navigateHistory,
}

function restoreHistory(patch) {
  patchHandlers[patch.type]
    ? patchHandlers[patch.type](patch[patch.type])
    : ''
}

function navigateHistory(data) {
  $.controller(data)
}

self.top.addEventListener("popstate", async (event) => {
  const { type, patch } = event.state || {}
  if(type === `${$.link}-navigation`) {
    restoreHistory(patch)
  }
});

// initialize so we can come back to here
if(self.location.pathname === '/') {
  saveHistory({ type: historyTypes.navigate, [historyTypes.navigate]: {
    route: null
  }}, self.location.href)
}

import { Self } from '@plan98/types'

const $ = Self('sticky-menu', {
  route: null
})

$.skin(`
  & {
    display: grid;
    height: 100%;
    overflow: hidden;
    place-items: center;
    grid-template-areas: 'zone';
    background: black;
  }

  & a {
    color: var(--root-theme, #E83FB8);
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    --v-font-casl: 1;
    --v-font-mono: 1;
    font-size: 2rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
    font-size: 2rem;
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
    display: grid;
    place-content: center;
    background: lemonchiffon;
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


$.view(() => {
  const { route } = $.model()
  return `
    <div class="sticky">
      <iframe src="${route}"></iframe>
    </div>
    <div class="menu">
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
        <a href="/app/paper-pocket">
          Prototype
        </a>
      </div>

      <div>
        <a href="/app/ur-shell">
          Shell
        </a>
      </div>
    </div>
  `
}, {
  beforeUpdate(target) {
    const { route } = $.model()

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
    {
      //
    }
  }
})

function saveHistory(patch, url) {
  self.history.pushState({
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

addEventListener("popstate", async (event) => {
  const { type, patch } = event.state || {}
  if(type === `${$.link}-navigation`) {
    restoreHistory(patch)
  }
});

// initialize so we can come back to here
saveHistory({ type: historyTypes.navigate, [historyTypes.navigate]: {
  route: null
}}, self.location.href)

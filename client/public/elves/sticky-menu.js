import { Self } from '@plan98/types'

// miss u kevin, rip
const lazy = async resource => {
  return await import(resource).catch(console.error)
}

[
  '/public/elves/plan98-camera.js',
  '/public/elves/plan98-gallery.js',
  '/public/elves/v-log.js',
  '/public/elves/shirt-flicks.js',
  '/public/elves/ur-shell.js',
  '/public/elves/dream-team.js',
  '/public/elves/source-code.js'
].map(lazy).map(console.log)

const $ = Self('sticky-menu', {
  route: null
})

const elves = {
  silly: {
    prop: '--orange',
    fallback: 'darkorange'
  },
  sally: {
    prop: '--blue',
    fallback: 'dodgerblue'
  },
  shelly: {
    prop: '--purple',
    fallback: 'mediumpurple'
  },
  wally: {
    prop: '--green',
    fallback: 'mediumseagreen'
  },
  sully: {
    prop: '--red',
    fallback: 'firebrick'
  },
  sonny: {
    prop: '--yellow',
    fallback: 'gold'
  },
  eon: {
    prop: '--brown',
    fallback: 'sienna'
  },
}

function elfCursor({ fallback }={fallback: 'lightgray' }) {
  const mainPoints = '0,0 68,26 80,30 90,38 95,50 97,62 95,74 90,84 82,90 72,95 60,97 48,95 38,90 30,82 25,72 23,60 25,48 30,38 26,68'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100">
    <polygon points="${mainPoints}" fill="${fallback}"/>

    <line x1="0" y1="0" x2="68" y2="26" stroke="rgba(255,255,255,0.25)" stroke-width="12"/>
    <line x1="0" y1="0" x2="60" y2="32" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
    <line x1="0" y1="0" x2="50" y2="40" stroke="rgba(255,255,255,0.01)" stroke-width="12"/>

    <line x1="0" y1="0" x2="26" y2="68" stroke="rgba(0,0,0,0.25)" stroke-width="12"/>
    <line x1="0" y1="0" x2="32" y2="60" stroke="rgba(0,0,0,0.1)" stroke-width="12"/>
    <line x1="0" y1="0" x2="40" y2="50" stroke="rgba(0,0,0,0.01)" stroke-width="12"/>
  </svg>`

  return `url('data:image/svg+xml,${encodeURIComponent(svg)}') 0 0, auto`
}

function bindElf(name) {
  return () => {
    $.teach({ name })
    document.body.style.cursor = elfCursor(elves[name])
    localStorage.setItem($.link + '://character', name)
  }
}

bindElf(localStorage.getItem($.link + '://character'))()

export function character() {
  return $.learn().name
}

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
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
    font-size: 2rem;
    line-height: 1;
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

  & .menu > div > span {
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    --v-font-casl: 0;
    --v-font-mono: 0;
    font-size: 1rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
    color: rgba(0,0,0,.75);
    display: block;
    margin-bottom: 0.618rem;
    margin-left: 0.382rem;
  }

  & .menu > div > span > em {
    --v-font-wght: 100;
    --v-font-slnt: -15;
    --v-font-crsv: 0;
    --v-font-casl: 0;
    --v-font-mono: 0;
    font-size: 1rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
    color: rgba(0,0,0,.5);
    margin-bottom: 0.618rem;
    margin-left: 0.382rem;
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

  & .sally::before,
  & .sully::before,
  & .sonny::before,
  & .shelly::before,
  & .wally::before,
  & .eon::before,
  & .silly::before {
    content: '';
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    clip-path: polygon(
      /* hat point */
      0% 0%,
      /* right tangent point on circle */
      68% 26%,
      /* trace circle clockwise */
      80% 30%,
      90% 38%,
      95% 50%,
      97% 62%,
      95% 74%,
      90% 84%,
      82% 90%,
      72% 95%,
      60% 97%,
      48% 95%,
      38% 90%,
      30% 82%,
      25% 72%,
      23% 60%,
      25% 48%,
      30% 38%,
      /* left tangent point on circle */
      26% 68%,
      /* back to hat point */
      0% 0%
    );
    vertical-align: middle;
    margin-inline: 0.5em;
  }

  & .wally::before {
    background-color: var(--green);
  }

  & .sully::before {
    background-color: var(--red);
  }

  & .sonny::before {
    background-color: var(--yellow);
  }

  & .shelly::before {
    background-color: var(--purple);
  }

  & .sally::before {
    background-color: var(--blue);
  }

  & .silly::before {
    background-color: var(--orange);
  }

  & .eon::before {
    background-color: var(--brown);
  }
`)

$.when('pointerenter', '.sonny', bindElf('sonny'))
$.when('pointerenter', '.sally', bindElf('sally'))
$.when('pointerenter', '.shelly', bindElf('shelly'))
$.when('pointerenter', '.sully', bindElf('sully'))
$.when('pointerenter', '.silly', bindElf('silly'))
$.when('pointerenter', '.wally', bindElf('wally'))
$.when('pointerenter', '.eon', bindElf('eon'))

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
        <span>Your Phone <em class="sonny">(Sonny)</em></span>
      </div>

      <div>
        <a href="/app/plan98-gallery">
          Gallery
        </a>
        <span>My Phone <em class="sally">(Sally)</em></span>
      </div>

      <div>
        <a href="/app/v-log">
          Studio
        </a>
        <span>My Bag <em class="shelly">(Shelly)</em></span>
      </div>

      <div>
        <a href="/app/shirt-flicks">
          Console
        </a>
        <span>My Box <em class="sully">(Sully)</em></span>
      </div>

      <div>
        <a href="/app/ur-shell">
          Shell
        </a>
        <span>My Mind <em class="silly">(Silly)</em></span>
      </div>

      <div>
        <a href="/app/dream-team?id=newbies">
          Elves
        </a>
        <span>Our Mind <em class="wally">(Wally)</em></span>
      </div>

      <div>
        <a href="/app/source-code">
          Machines
        </a>
        <span>Self-Transformers <em class="eon">(Eon)</em></span>
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
if(self.location.pathname === '/') {
  saveHistory({ type: historyTypes.navigate, [historyTypes.navigate]: {
    route: null
  }}, self.location.href)
}

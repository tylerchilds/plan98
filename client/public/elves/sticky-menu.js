import { Self } from '@plan98/types'
import { getCharacter, setCharacter, elves } from './paper-pocket.js'

// miss u kevin, rip
const lazy = async resource => {
  return await import(resource).catch(console.error)
}

[
  '/public/elves/saga-repl.js',
  '/public/elves/plan98-camera.js',
  '/public/elves/plan98-gallery.js',
  '/public/elves/v-log.js',
  '/public/elves/shirt-flicks.js',
  '/public/elves/ur-shell.js',
  '/public/elves/dream-team.js',
  '/public/elves/source-code.js'
].map(lazy).map(console.log)

const $ = Self('sticky-menu', {
  route: null,
  name: getCharacter() || Object.keys(elves[0])
})

function bindElf(name) {
  return (event) => {
    $.teach({ name })
    setCharacter(name)
  }
}

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
  }

  & div > a:first-child {
    font-size: 2rem;
    line-height: 1;
    margin: 1rem 0;
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

  & .menu > div > a {
    display: inline-block;
  }

  & .menu > div > span {
    --v-font-wght: 500;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    --v-font-casl: 0;
    --v-font-mono: 0;
    font-size: 1rem;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive" !important;
    text-decoration: none;
    color: rgba(0,0,0,.5);
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

  & .menu > div > span + p {
    color: rgba(0,0,0,.65);
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

  & .gh057::before,
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

  & .gh057::before {
    background-color: var(--white, white);
  }

  & .eon::before {
    background-color: var(--gray);
  }
`)

$.when('pointerenter', '.gh057', bindElf('gh057'))
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
  const { route, name } = $.model()
  return `
    <div class="sticky">
      <iframe src="${route}"></iframe>
    </div>
    <div class="menu">
      <div style="display: grid; height: 200px; text-align: center; place-content: center;">
        <a href="/app/saga-repl?src=/public/cdn/sillyz.computer/en-us/on-software-authorship.saga">
          Saga
        </a>
        <p style="text-transform: uppercase;">
          A story with no end in sight
        </p>
      </div>

      <div>
        <a href="/app/plan98-camera">
          Camera
        </a>
        <span>Your Phone <em class="sonny" data-tooltip="Hey. I'm Sonny. I'm new around here. Things always turn out okay with the right team.">(Sonny)</em></span>
        <p>
          A simple point and shoot camera and camcorder.
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/plan98-gallery">
          Gallery
        </a>
        <span>My Phone <em class="sally" data-tooltip="Sally, here... I'm direct. With rapid reinforcement, we attune in new realities faster.">(Sally)</em></span>
        <p>
          A personal collection of hyper media
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/v-log">
          Studio
        </a>
        <span>My Bag <em class="shelly" data-tooltip="If you need something cracked, I'm Shelly. If you need someone resposible, call Sally.">(Shelly)</em></span>
        <p>
          A real-time production platform
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/shirt-flicks">
          Console
        </a>
        <span>My Box <em class="sully" data-tooltip="Good game. I'm competetive. I'm good. I'm proud of it. If you win, you're the best. Good luck.">(Sully)</em></span>
        <p>
          A portable home media entertainment system
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/ur-shell">
          Shell
        </a>
        <span>My Mind <em class="silly" data-tooltip="An autobiography of a mime in training. The War on Clowns or-- why do comics get typecast to frown upon the other mediums.">(Silly)</em></span>
        <p>
          A terminal for precision human-computer augmentation
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/dream-team?id=newbies">
          Elf Team
        </a>
        <span>Our Mind <em class="wally" data-tooltip="This whole thing is clout-chasing my fault's fault. I'm done time traveling. For good. After that one final show.">(Wally)</em></span>
        <p>
          A real-time end to end encrypted social chat
        </p>
      </div>

      <hr>

      <div>
        <a href="/app/source-code">
          Code
        </a>
        <span>Our Machines <em class="eon" data-tooltip="What'll I be-- who'll I see-- as one of the ones-- at the moooooovies.">(Eon)</em></span>
        <p>
          The source code
        </p>
      </div>

      <hr>

      <div>
        <p>
          ${(elves[name] || {}).description}
        </p>
        <span>About You<em class="${name}">(${(elves[name] || {}).label})</em></span>
      </div>

      <img class="gh057" src="/public/cdn/sillyz.computer/self-portrait.jpeg" alt="an elephant eared elf clown jester slings a sticky scope with silly starting an elemental event." data-tooltip="Formless puppet.">

      <div>
        When you're ready, try the
        <a href="/app/saga-crawler">
          Quest
        </a>
        .

        <a href="/app/was-code?src=/public/elves/sticky-menu.js">
          (Remix)
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
if(self.location.pathname === '/') {
  saveHistory({ type: historyTypes.navigate, [historyTypes.navigate]: {
    route: null
  }}, self.location.href)
}

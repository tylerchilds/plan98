import elf from '@silly/tag'

const palette = [
  'firebrick',
  'darkorange',
  'gold',
  'mediumseagreen',
  'dodgerblue',
  'mediumpurple'
]

const friends = {
  firebrick: ['darkorange', 'gold', 'mediumseagreen'],
  darkorange: ['gold', 'mediumseagreen', 'dodgerblue'],
  gold: ['mediumseagreen', 'dodgerblue', 'mediumpurple'],
  mediumseagreen: ['dodgerblue', 'mediumpurple', 'firebrick'],
  dodgerblue: ['mediumpurple', 'firebrick', 'darkorange'],
  mediumpurple: ['firebrick', 'darkorange', 'gold'],
}

const $ = elf('plan98-intro')

$.draw((target) => {
  const { menu, started } = $.learn()
  const src = target.getAttribute('src')
  return `
    <div class="wall ${started && !menu ? 'broken':''}">
      <div>
      <div class="frame">
        <div class="logo-mark">
          <div class="plan98-letters">
            Plan98
          </div>
          <div class="plan98-slants">
            <div class="slant-1"></div>
            <div class="slant-2"></div>
            <div class="slant-3"></div>
          </div>
        </div>
        <div class="about">
          Plan98 is an operating system of the historical fiction variety. It did not release in the year 1998. Or did it? If it did, connect. If not, you will be unable to take part in the spoils after ending the time loop of 2038.
        </div>
        <button class="break-fourth-wall" ${started ? 'style="visibility: hidden;"' : ''}>
          Connect
        </button>
      </div>
      </div>
    </div>
    <div class="fourth">
      <iframe src="${src}" name="plan98-window"></iframe>
    </div>
    <div class="menu ${menu ? 'show-menu': ''} ${started ? '':'hide-menu'}" aria-live="assertive">
      <div class="control-toggle">
        <button data-toggle>
          #
        </button>
      </div>
      <div class="menu-items">
        <a href="/app/hello-world" target="plan98-window">
          Hello World
        </a>
      </div>
    </div>
  `
})

const settingsInterval = setInterval(() => {
  const color = palette[Math.floor(Math.random() * palette.length)];
  [...document.querySelectorAll($.link)].map(target => {
    target.style.setProperty('--color', color);
    [...target.querySelectorAll('[class^="slant-"]')].map((node, i) => {
      node.style.setProperty('--color', friends[color][i]);
    })
  })
}, 5000)

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.when('click', '.menu-items a', () => {
  $.teach({ menu: false })
})

$.when('click', '.break-fourth-wall', (event) => {
  $.teach({ started: true })
  clearInterval(settingsInterval)
})

$.style(`
  & {
    --red: firebrick;
    --orange: darkorange;
    --yellow: gold;
    --green: mediumseagreen;
    --blue: dodgerblue;
    --purple: mediumpurple;
    position: relative;
    height: 100%;
    width: 100%;
    display: block;
  }
  & .menu {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 100%;
    max-width: 100%;
    width: 320px;
    max-height: 480px;
  }

  & .break-fourth-wall {
    width: 100%;
  }
  & .control-toggle {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 4;
  }

  & [data-toggle] {
    background: var(--color);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    display: grid;
    place-content: center;
  }

  & .menu-items {
    display: none;
  }
  & .show-menu .menu-items {
    gap: .5rem;
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    gap: .5rem;
    padding: 1rem 1rem calc(50px + 1rem);
    overflow: auto;
    background: rgba(255,255,255,1);
    position: relative;
    z-index: 3;
    overflow-x: hidden;
  }

  & .hide-menu {
    display: none;
  }

  & .logo-mark {
    --v-font-mono: 0;
    --v-font-casl: 0;
    --v-font-wght: 800;
    --v-font-slnt: 0;
    --v-font-crsv: 1;
    font-variation-settings:
      "MONO" var(--v-font-mono),
      "CASL" var(--v-font-casl),
      "wght" var(--v-font-wght),
      "slnt" var(--v-font-slnt),
      "CRSV" var(--v-font-crsv);
    font-family: 'Recursive';
    font-size: 72px;
    position: relative;
    margin: 2rem;
  }

  & .frame {
    max-width: 100%;
    width: 320px;
  }

  & .about {
    background: rgba(0,0,0,1);
    color: white;
    text-shadow: 1px 1px 5px var(--color);
    padding: 1rem;
    margin-bottom: 2rem;
  }

  & .plan98-slants {
    display: grid;
    grid-template-columns: 1ch 1ch 1ch;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: skew(-25deg);
  }

  & .slant-1 {
    background: var(--color, var(--red));
  }
  & .slant-2 {
    background: var(--color, var(--orange));
  }
  & .slant-3 {
    background: var(--color, var(--yellow));
  }

  & .plan98-letters {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,1);
    text-shadow: 1px 1px rgba(0,0,0,1);
  }

  & .wall {
    background-color: var(--color);
    background-image: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    display: grid;
    place-content: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
    opacity: .85;
    position: fixed;
    z-index: 2;
  }

  & .wall button {
    background-color: var(--color);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    color: white;
    border: none;
    padding: 1rem;
  }

  & .wall.broken {
    z-index: 1;
  }

  & .wall button:hover,
  & .wall button:focus {
    background-image: linear-gradient(rgba(0,0,0, .15), rgba(0,0,0,.4));
  }

  & .fourth {
    opacity: 0;
    transition: opacity 250ms ease-in-out;
    height: 0;
  }



  & .broken + .fourth {
    height: 100%;
    opacity: 1;
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  & .menu {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 3;
  }
`)

import elf from '@silly/tag'

const palette = [
  'firebrick', // accent 1
  'darkorange', // accent 2
  'gold', // accent 3
  'mediumseagreen', // underline
  'dodgerblue', // action
  'mediumpurple' // background
]

const buttons = {
  firebrick: ['mediumpurple'],
  darkorange: ['firebrick'],
  gold: ['darkorange'],
  mediumseagreen: ['gold'],
  dodgerblue: ['mediumseagreen'],
  mediumpurple: ['dodgerblue'],
}

const underlines = {
  firebrick: ['dodgerblue'],
  darkorange: ['mediumpurple'],
  gold: ['firebrick'],
  mediumseagreen: ['darkorange'],
  dodgerblue: ['gold'],
  mediumpurple: ['mediumseagreen'],
}

const friends = {
  firebrick: ['darkorange', 'gold', 'mediumseagreen'],
  darkorange: ['gold', 'mediumseagreen', 'dodgerblue'],
  gold: ['mediumseagreen', 'dodgerblue', 'mediumpurple'],
  mediumseagreen: ['dodgerblue', 'mediumpurple', 'firebrick'],
  dodgerblue: ['mediumpurple', 'firebrick', 'darkorange'],
  mediumpurple: ['firebrick', 'darkorange', 'gold'],
}

const $ = elf('plan98-intro', {
  accents: ['firebrick', 'darkorange', 'gold']
})

$.draw((target) => {
  const { menu, started, accents } = $.learn()
  const src = target.getAttribute('src')
  return `
    <div class="wall ${started && !menu ? 'broken':''}">
      <div>
      <div class="frame">
        <div style="text-align: center">
          <div class="logo-mark">
            <div class="plan98-letters">
              Plan98
            </div>
            <div class="plan98-slants">
              <div class="slant-1" style="--color: ${accents[0]}"></div>
              <div class="slant-2" style="--color: ${accents[1]}"></div>
              <div class="slant-3" style="--color: ${accents[2]}"></div>
            </div>
          </div>
        </div>
        <div  ${started ? 'style="visibility: hidden;"' : ''}>
          <div class="about">
            Plan98 is an operating system of the historical fiction variety. It did not release in the year 1998. Or did it? If it did, connect. If not, you will be unable to take part in the spoils after ending the time loop of 2038.
          </div>
          <button class="break-fourth-wall">
            Connect
          </button>
        </div>
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
  const index = Math.floor(Math.random() * palette.length)
  const color = palette[index];
  [...document.querySelectorAll($.link)].map(target => {
    target.style.setProperty('--color', color);
    target.style.setProperty('--button-color', buttons[color]);
    target.style.setProperty('--underline-color', underlines[color]);
    const accents = [...target.querySelectorAll('[class^="slant-"]')].map((node, i) => {
      const currentC = friends[color][i]
      node.style.setProperty('--color', currentC);
      return currentC
    })
  })
}, 2500)

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

let once = false
export function superKey() {
  if(once) return
  once = true

  function handleEvent (event) {
    if (event.metaKey) {
      handleMetaKey()
    }
  }
  self.addEventListener('keydown', handleEvent);

  self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'metaKey') {
    handleMetaKey()
  } else { console.log(event) }

  });
}

function handleMetaKey() {
  if(document.querySelector('plan98-intro')) {
    const { menu } = $.learn()
    $.teach({ menu: !menu })
    return
  }

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    document.body.insertAdjacentHTML("beforeend", '<plan98-intro></plan98-intro>')
  }
}

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
    font-weight: 800;
    font-size: 24px;
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
    margin: 1rem 0;
    display: inline-block;
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
    border-bottom: 1rem solid var(--underline-color, mediumseagreen);
    padding: 0 1rem;
  }

  & .wall {
    background-color: var(--color, mediumpurple);
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
    background-color: var(--button-color, dodgerblue);
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

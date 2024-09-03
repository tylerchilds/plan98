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

  return `
    <div class="wall">
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
      <button class="break-fourth-wall">
        Connect
      </button>
    </div>
    <div class="fourth">
      ${target.innerHTML}
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

$.when('click', '.break-fourth-wall', (event) => {
  event.target.parentNode.remove()
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

  & .plan98-slants {
    display: grid;
    grid-template-columns: 1ch 1ch 1ch;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    transform: skew(-25deg) translateX(.5ch);
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
  }

  & .wall button {
    background-color: var(--color);
    background-image: linear-gradient(rgba(0,0,0, .25), rgba(0,0,0,.5));
    color: white;
    border: none;
    padding: 1rem;
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



  & .fourth:first-child {
    height: 100%;
    opacity: 1;
    overflow: auto;
  }
`)

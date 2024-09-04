import module from '@silly/tag'
import Color from "colorjs.io";
import { doingBusinessAs as dba } from '@sillonious/brand'
import { showPanel } from './plan98-panel.js'
import { showModal } from './plan98-modal.js'

export const doingBusinessAs = dba

const $ = module('sillonious-brand', {
  instances: {},
  host: window.location.host,
  council: '6174',
  seat: '0',
  rootActive: false
})

const standard = window.plan98 || { host: window.location.host }
export function currentBusiness(host = standard) {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const { instances } = $.learn()
  seed(target)
  if(!instances[target.id]) return
  const { host, council, seat, rootActive } = instances[target.id]

  const stars = getStars(target)
  const {
    mascot,
    contact,
    tagline,
    saga
  } = currentBusiness(host)
  const sagaDemo = saga.split('/public')[1]
  const { colors, fg, bg } = generateTheme(target, host)

  const wheel = colors.map((lightness, i) => {
    const steps = lightness.map((x) => `
      <button
        class="step"
        data-block="${x.block}"
        data-inline="${x.inline}"
        style="background: var(${x.name})">
      </button>
    `).join('')
    return `
      <div class="group" style="transform: rotate(${i * 45}deg)">
        ${steps}
      </div>
    `
  }).join('')

  if(target.innerHTML) {
    rootActive ? target.classList.add('flip') : target.classList.remove('flip')
    return
  }

  if(target.getAttribute('innerHTML')) {
    return target.getAttribute('innerHTML')
  }

  return `
  <plan98-intro src="/app/plan98-dashboard"></plan98-intro>
  `
})

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  let { host, council, seat, rootActive } = $.learn() || {}

  council = target.getAttribute('council') || council
  seat = target.getAttribute('seat') || seat
  host = target.getAttribute('host') || host

  schedule(() => {
    const id = target.id
    updateInstance({ id }, { id, host, council, seat, rootActive })
  })
}


export function generateTheme(target, host, {reverse} = {}) {
  if(target.dataset.themed === 'true') {
    return $.learn()[host]
  }

  const {
    brandHue,
    brandRange,
  } = currentBusiness(host)

  const lightnessStops = [
    [5, 30],
    [20, 45],
    [35, 60],
    [50, 75],
    [65, 90],
    [80, 105],
    [95, 120]
  ]

  const colors = [...Array(16)].map((_, hueIndex) => {
    const step = ((brandRange / 16) * hueIndex)
    const hue = reverse
      ? brandHue - step
      : brandHue + step

    return lightnessStops.map(([l, c], i) => {
      const name = `--wheel-${hueIndex}-${i}`
      const value = new Color('lch', [l, c, hue])
        .display()
        .toString()

      return {
        name,
        value,
        block: hueIndex,
        inline: i
      }
    })
  })

  target.style = print(colors)
  target.dataset.themed = 'true'

  const fg = colors[0][2].value
  const bg = colors[0][6].value

  const data = { colors, bg, fg }

  $.teach({ [host]: data })
  return data
}

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

$.when('click', '[data-help]', (event) => {
  showPanel(`
    <gun-clipboard id="demo" safeword="demo"></gun-clipboard>
  `)
})

$.when('click', '[data-switcher]', function switcher({ target }) {
  const { rootActive, id } = instance(target)
  updateInstance({ id }, { rootActive: !rootActive })
})

$.when('click', '.sticky .sillonious-brand', function switcher({ target }) {
  const host = target.closest('[host]').getAttribute('host')

  if(host) {
    window.location.href = `/?world=${host}`
  }
})

$.when('mousemove', '.backside-paper', gh057)
$.when('mousemove', '.frontside-paper', gh057)

function gh057(event){
  const root = event.target.closest($.link)
  const box = root.getBoundingClientRect()
  const [x, y] = [event.clientX, event.clientY]
  const limit = 20;
  const calcX = -(y - box.y - (box.height / 2)) / limit;
  const calcY = (x - box.x - (box.width / 2)) / limit;

  root.style.setProperty('--rotate-x',`${calcX}deg`)
  root.style.setProperty('--rotate-y',`${calcY}deg`)
  root.style.setProperty('--shadow',`
    ${-1 * calcY - 2}px ${1 * calcX - 2}px 4px 4px rgba(0,0,0,.10),
    ${-1 * calcY - 6}px ${1 * calcX - 6}px 12px 12px rgba(0,0,0,.5),
    ${-1 * calcY - 18}px ${1 * calcX - 18}px 36px 36px rgba(0,0,0,.25)
  `)
}

$.style(`
  & {
    position: relative;
    height: 100%;
    width: 100%;
    aspect-ratio: 1;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    display: block;
    cursor: url('/public/icons/gh057.svg') 0 0, auto;
    overflow: auto;
    background-color: var(--theme, white);
  }

  & .frontside-paper,
  & .backside-paper {
    height: 100%;
    width: 100%;
  }

  & .sticky .virtual-paper {
    display: grid;
    place-content: center;
  }

  & .tagline {
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    text-align: center;
    color: dodgerblue;
  }

  @media screen {
    & .sticky {
      padding: 16px 9px;
      width: 3.25in;
      height: 3.12in;
      max-height: 100%;
      max-width: 100%;
      background: lemonchiffon;
      transform: perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
      box-shadow: var(--shadow);
      position: relative;
      z-index: 4;
      overflow: auto;
    }

    & .sticky .virtual-paper {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 100;
      padding: 30%;
      width: 100%;
      height: 100%;
      background: lemonchiffon;
      opacity: 1;
      pointer-events: none;
      overflow-x: hidden;
    }

    & .sticky .actual-paper {
      opacity: 0;
    }

    &.flip .virtual-paper {
      animation: &-sticky-fade-out 250ms ease-in-out 100ms forwards;
    }

    &.flip .actual-paper {
      animation: &-sticky-fade-in 250ms ease-in-out 250ms forwards;
    }

    @keyframes &-sticky-fade-out {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(.5);
      }
    }

    @keyframes &-sticky-fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }


    & .sticky sillonious-brand {
      height: 2rem;
      background: lemonchiffon;
    }

    & .sticky button {
      background: transparent;
      border: none;
    }

    .sillonious-brand {
      --v-font-mono: 1;
      --v-font-casl: 1;
      --v-font-wght: 800;
      --v-font-slnt: -15;
      --v-font-crsv: 1;
      font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
      font-family: "Recursive";
      color: rgba(255,255,255,.85);
      text-shadow:
        0 0px 3px var(--wheel-0-0),
        -2px -2px 3px var(--wheel-0-2),
        2px -2px 3px var(--wheel-0-3),
        4px 4px 5px var(--wheel-0-4),
        -4px 4px 5px var(--wheel-0-5),
        0 9px 15px var(--wheel-0-6);
    }

    & [name="join-code"] {
      display: inline-block;
      max-width: 120px;
      height: 100%;
      background: white;
      border: none;
      border-radius: 0;
      padding: 0;
      max-height: 120px;
    }

    & [data-switcher] {
      background: transparent;
      border: none;
    }

    & [data-share] {
      border: none;
      background: lemonchiffon;
      color: dodgerblue;
      padding-left: .5rem;
      line-height: 2rem;
      position: fixed;
      box-shadow:
        0px 0px 4px 4px rgba(0,0,0,.10),
        0px 0px 12px 12px rgba(0,0,0,.5),

      top: 0;
      right: 0;
      z-index: 10;
    }

    & [data-help] {
      border: none;
      background: transparent;
      color: rgba(255,255,255,.85);
      text-shadow:
        0 0px 3px var(--wheel-0-0),
        -2px -2px 3px var(--wheel-0-2),
        2px -2px 3px var(--wheel-0-3),
        4px 4px 5px var(--wheel-0-4),
        -4px 4px 5px var(--wheel-0-5),
        0 9px 15px var(--wheel-0-6);
      text-overflow: ellipsis;
      padding-left: .5rem;
      line-height: 2rem;
    }

    & iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }

    & .frontside-paper,
    & .backside-paper {
      position: relative;
      max-width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      overflow-x: auto;
      backface-visibility: hidden;
      transform: rotateX(0deg);
      opacity: .9999;
      transition: transform 200ms ease-in-out;
    }

    & .frontside-paper {
      border-top: 3px solid var(--wheel-0-3);
      background: black;
      padding: 5px;
    }

    & .backside-paper {
      border-top: 3px solid var(--wheel-0-6);
      transform: rotateX(180deg);
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
    }

    &.flip > .output > .frontside-paper {
      transform: rotateX(180deg);
      pointer-events: none;
    }

    &.flip > .output > .backside-paper {
      transform: rotateX(0deg);
    }

    & .input {
      pointer-events: none;
      position: absolute;
      padding: .5rem;
      bottom: 0;
      z-index: 4;
      left: 0;
      right: 0;
    }

    & .output {
      position: absolute;
      background: white;
      inset: 0;
      z-index: 1;
      display: grid;
      grid-template-rows: 1fr;
      place-items: center;
      padding-top: 2rem;
      height: 100%;
    }

    & .to {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: grid;
      place-content: start;
      z-index: 2;
      pointer-events: none;
    }

    & .to button {
      background: lemonchiffon;
      padding: 5px .5rem;
      pointer-events: all;
    }

    & .from {
      text-align: center;
      position: absolute;
      top: 2rem;
      left: 0;
      margin: auto;
      z-index: 3;
    }

    & .logo {
      background: var(--wheel-0-0);
      border-radius: 4px 4px 0 0;
      position: relative;
    }

    & .logo::after {
      animation: &-pulse ease-in-out 2500ms alternate infinite;
      content: '';
      width: 2px;
      height: 2px;
      background: var(--wheel-0-6);
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-100%);
      border-radius: 100%;
      box-shadow:
        0 0 1px 1px var(--wheel-0-6),
        0 0 2px 2px var(--wheel-0-5),
        0 0 3px 3px var(--wheel-0-4),
        0 0 5px 5px var(--wheel-0-3),
        0 0 8px 8px var(--wheel-0-2),
        0 0 12px 12px var(--wheel-0-1);
    }

    @keyframes &-pulse {
      0% {
        opacity: .95;
      }
      100% {
        opacity: .75;
      }
    }


    & nav {
      align-self: end;
    }
    & .address {
      padding: 2mm;
      border: 1mm solid var(--wheel-4-6);
      border-left: 0;
      border-bottom: 0;
      color: var(--wheel-4-0);
      display: inline-grid;
      border-radius: 0 4px 0 0;
    }

    & .invite {
      grid-column: 1 / -1;
      padding: 1mm 2mm;
      background: var(--wheel-0-0);
      color: var(--wheel-0-2);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    & .canvas {
      position: absolute;
      inset: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
    }

    & .wheel {
      z-index: 1;
      display: grid;
      grid-template-areas: "slot";
      grid-template-rows: 50%;
      grid-template-columns: 79%;
      place-content: start center;
      position: absolute;
    }
    & .group {
      grid-area: slot;
      transform-origin: bottom;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: repeat(7, 1fr);
      clip-path: polygon(10% 0%, 50% 100%, 90% 0%);
      gap: 5px;
    }

    & .step {
      border: none;
      width: 100%;
      height: auto;
    }
  }

  @media print {
    nav,header,footer,
    .backside-paper {
      display: none;
    }

    & .sticky .actual-paper {
      display: none;
    }
  }
`)

$.when('click', '[data-share]', (event) => {
  const { host } = instance(event.target)
  const {
    mascot,
    contact,
    tagline,
    image,
    imageDescription,
    color
  } = currentBusiness(host)

  const stars = getStars(event.target.closest($.link))

  sticky(`
    <main class="output" style="background-image: ${stars}">
      <img src="${image}" alt="${imageDescription}" />
      <div>
        ty@TheLanding.Page<br>
        ${host}
      </div>
    </main>
  `)
})

function sticky(content) {
  const style = document.querySelector('style[data-link="sillonious-brand"]').innerHTML
  const preview = window.open('', 'PRINT');
  preview.document.write(`
    <html>
      <head>
        <title>${document.title}</title>
        <link href="/styles/system.css" rel="stylesheet">
        <style type="text/css">
          @media print {
            html, body {
              margin: 0;
              padding: 0;
              font-size: 6pt;
              -webkit-print-color-adjust: exact !important;
            }

            button { display: none; }
            img {
              max-width: 100%;
            }

            iframe {
              display: none !important;
            }
          }

          @page {
            size: 3.25in 3.12in;
            margin: 6mm 7mm;
          }
          @media screen {
            body {
              display: grid;
              place-content: center;
            }
          }
          .print-banner {
            background: rgba(0,0,0,.85);
            padding: 1rem;
            text-align: right;
            color: white;
            position: fixed;
            left: 0;
            right: 0;
            z-index: 100;
          }

          .print-banner button {
            background: lemonchiffon;
            color: saddlebrown;
            border: none;
            padding: 1rem;
          }

          .print-banner button:hover,
          .print-banner button:focus {
            background: dodgerblue;
            color: white;
          }
          @media print {
            .print-banner {
              display: none;
            }
          }

          img {
            max-width: 50%;
          }
          ${style}
          sillonious-brand {
            width: 3.25in;
            height: 3.12in;
          }
        </style>
      </head>
      <body>
        <div class="print-banner">
          Looks good! <button onclick="(()=>{window.print();window.close()})()">Print</button>
        </div>
        <sillonious-brand>
          ${content}
        </sillonious-brand>
      </body>
    </html>
  `)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/
}

function getStars(target) {
  const color = target.style.getPropertyValue("--wheel-0-4");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = color;
  ctx.fillRect(rhythm / 2, rhythm / 2, 1, 1);

  return `url(${canvas.toDataURL()}`;
}

function menuFor(host) {
  // use host later
  return `
    <sillonious-brand host="${host}">
      <sillonious-about host="${host}"></sillonious-about>
    </sillonious-brand>
  `
}

function instance(target) {
  const root = target.closest($.link)
  return $.learn().instances[root.id]
}

function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function schedule(x, delay=1) { setTimeout(x, delay) }

/*

# November 14th, 2022
@ musings.tychi.me/on-exploring-personas

I have my online only space.
I have my blended online and in person space.
I have my in person space.

I have way too many chat apps and will add another one to the pile shortly.

Also I am my own business for legal protection in America.
I am fighting to have that protection extended globally.

All interactions are funelled through my Limited Liability Corporation for obvious reasons.

The body that wields me is covered under the LLC, you are never interacting with me as a person, just me as a brand.

The real me lives rent free in my head and takes no responsibility for any seriousness that may ensue from how I this meatsack is carried for business purposes.
*/

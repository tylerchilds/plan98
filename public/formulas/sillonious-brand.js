import Color from "https://esm.sh/colorjs.io@0.4.0";

const reverseProxyLookup = `
  969 G Edgewater Blvd<br/>
  #123<br/>
  Foster City, CA 94404
`

const emeraldOfTime
  = `/sagas/time.saga`
const emeraldOfSpace
  = `/sagas/space.saga`
const emeraldOfTrust
  = `/sagas/trust.saga`
const emeraldOfTruth
  = `/sagas/truth.saga`
const emeraldOfSelf
  = `/sagas/self.saga`
const emeraldOfSecurity
  = `/sagas/security.saga`
const emeraldOfNow
  = `/sagas/index.saga`

export const doingBusinessAs = {
  'sillyz.computer': {
    tagline: 'The Notorious One Will See You Now',
    mascot: 'Silly Sillonious',
    saga: emeraldOfTime,
    contact: reverseProxyLookup,
    brandHue: 55,
    brandRange: 45,
  },
  '1998.social': {
    tagline: '1998 (ice-cream) social',
    mascot: 'Wally the Incredible Hype',
    saga: emeraldOfSpace,
    contact: reverseProxyLookup,
    brandHue: 110,
    brandRange: 45,
  },
  'yourlovedones.online': {
    tagline: 'Your Loved Ones are On the Line',
    mascot: 'Sally Sillonious',
    saga: emeraldOfTrust,
    contact: reverseProxyLookup,
    brandHue: 220,
    brandRange: 45,
  },
  'ncity.executiontime.pub': {
    tagline: 'Pleasures of Night City',
    mascot: 'Sully Sillonious',
    saga: emeraldOfTruth,
    contact: reverseProxyLookup,
    brandHue: 15,
    brandRange: 45,
  },
  'css.ceo': {
    tagline: 'Custom Handmade Skins, Chainsaw Free',
    mascot: 'Sol Sillonious',
    saga: emeraldOfSelf,
    contact: reverseProxyLookup,
    brandHue: 165,
    brandRange: 45,
  },
  'y2k38.info': {
    tagline: 'Break the Time Loop',
    mascot: 'Shelly Sillonious',
    saga: emeraldOfSecurity,
    contact: reverseProxyLookup,
    brandHue: 300,
    brandRange: 45,
  },
  'thelanding.page': {
    tagline: 'Ship your next idea from a full stop',
    mascot: 'Greggory McGreggory',
    saga: emeraldOfNow,
    contact: reverseProxyLookup,
    brandHue: 350,
    brandRange: 45,
  },
  //'bustblocker.com': emeraldOfTime
  //'fantasysports.social': emeraldOfTime
  //'tychi.me': emeraldOfTime
  //'executiontime.pub': emeraldOfTime
  //'tylerchilds.com': emeraldOfTime
  //'webdesigninfinity.com': emeraldOfTime
  //'actuality.network': emeraldOfTime
  //'bytesize.dev': emeraldOfTime
  //'bamzap.pw': emeraldOfTime
  //'cutestrap.com': emeraldOfTime
  //'markdownthemes.com': emeraldOfTime
  //'bhs.network': emeraldOfTime
  //'ccsdesperados.com': emeraldOfTime
  //'56k.info': emeraldOfTime
  //'themountainterrace.review': emeraldOfTime
  //'sanmateogov.org': emeraldOfTime
  //'wherespodcast.org': emeraldOfTime
}

const $ = module('sillonious-brand')

function currentBusiness(host) {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  const host = target.getAttribute('host') || window.location.host
  const preview = target.getAttribute('preview')

  const stars = getStars(target)
  const {
    mascot,
    contact,
    tagline,
  } = currentBusiness(host)
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

  if(target.innerHTML) return

  if(target.getAttribute('innerHTML')) {
    return target.getAttribute('innerHTML')
  }

  return `
    <div class="post-it">
      <main class="canvas" style="background-image: ${stars}">
        ${preview ? `<iframe src="?world=${host}" name="${host}"></iframe>` : ''}
      </main>
      <header class="logo">
        <qr-code
          text="https://${host}"
          ${fg ? `data-fg="${fg}"`: ''}
          ${bg ? `data-bg="${bg}"`: ''}
        ></qr-code>
        <button data-download>Get</button>
      </header>
      <nav>
        <div class="address">
          ${mascot}<br/>
          ${contact}
        </div>
      </nav>
      <footer class="invite">
        ${host}: ${tagline}
      </footer>
    </div>
  `
})

function generateTheme(target, host, {reverse} = {}) {
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

  const colors = [...Array(8)].map((_, hueIndex) => {
    const step = ((brandRange / 8) * hueIndex)
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

$.when('click', '[data-download]', (event) => {
  const brand = event.target.closest($.link).outerHTML
  sticky(brand)
})

$.style(`
  & {
    display: block;
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
  & .post-it {
    background: white;
    display: grid;
    grid-template-columns: 1in auto;
    grid-template-rows: 1fr auto auto;
    width: 50ch;
    max-width: 100%;
    padding: 1rem;
    margin: 0 auto;
    box-sizing: border-box;
    overflow-x: auto;
  }
  & .logo {
    padding: 2mm 2mm 0;
    background: var(--wheel-0-6);
    border-radius: 4px 4px 0 0;
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
    background: var(--wheel-0-6);
    border-radius: 0 4px 4px 4px;
    color: var(--wheel-0-2);
  }

  & .canvas {
    grid-column: -1 / 1;
    background: white;
    max-width: 100%;
    aspect-ratio: 16 / 9;
    margin-bottom: 2mm;
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
`)

function sticky(brand) {
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
            }

            button { display: none; }
            img {
              max-width: 100%;
            }

            iframe {
              display: none !important;
            }

            .post-it {
              padding: 0 !important;
            }
          }

          @page {
            size: 3.25in 3.12in;
            margin: 6mm 7mm;
          }
          ${style}
        </style>
      </head>
      <body>
        ${brand}
      </body>
    </html>
  `)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/

  setTimeout(() => {
    preview.print();
    preview.close();
  }, 1000)
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

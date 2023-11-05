const reverseProxyLookup = `
  c/o notorious@sillyz.computer<br/>
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
  = `/sagas/now.saga`

export const doingBusinessAs = {
  'sillyz.computer': {
    tagline: 'The Notorious One Will See You Now',
    saga: emeraldOfTime,
    contact: reverseProxyLookup
  },
  '1998.social': {
    tagline: '1998 (ice-cream) social',
    saga: emeraldOfSpace,
    contact: reverseProxyLookup
  },
  'yourlovedones.online': {
    tagline: 'Your Loved Ones are On the Line',
    saga: emeraldOfTrust,
    contact: reverseProxyLookup
  },
  'ncity.executiontime.pub': {
    tagline: 'Pleasures of Night City',
    saga: emeraldOfTruth,
    contact: reverseProxyLookup
  },
  'css.ceo': {
    tagline: 'Custom Handmade Skins, Chainsaw Free',
    saga: emeraldOfSelf,
    contact: reverseProxyLookup
  },
  'y2k38.info': {
    tagline: 'Break the Time Loop',
    saga: emeraldOfSecurity,
    contact: reverseProxyLookup
  },
  'thelanding.page': {
    tagline: 'Computer Scientific Journal',
    saga: emeraldOfNow,
    contact: reverseProxyLookup
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

$.draw((target) => {
  const character = target.getAttribute('host') || window.location.host
  const {
    tagline,
    contact
  } = doingBusinessAs[character] || doingBusinessAs['sillyz.computer']

  const stars = getStars(true)

  return `
    <div>
      ${character}<br/>
      ${contact}<br/>
      ${tagline}<br/>
    </div>
    <div>
      <qr-code secret="https://${character}"></qr-code>
      <button data-download>Get</button>
    </div>
    <div class="canvas" style="background-image: ${stars}"></div>
  `
})

$.when('click', '[data-download]', (event) => {
  const brand = event.target.closest($.link).innerHTML
  sticky(brand)
})

$.when('input', 'textarea', (event) => {
  const src = source(event.target)
  const { value } = event.target
  state[src].file = value
  const html = hyperSanitizer(value)
  state[src].html = html
})

$.style(`
  & {
    display: grid;
    grid-template-columns: auto 1in;
    grid-template-rows: auto 1fr;
    gap: 1rem;
    max-width: 3.12in;
    margin: 0 auto;
  }

  & .canvas {
    grid-column: -1 / 1;
    background-color: black;
    max-width: 100%;
    aspect-ratio: 16 / 9;
  }
`)

function sticky(brand) {
  const style = document.querySelector('style[data-link="sillonious-brand"]').innerHTML
  const preview = window.open('', 'PRINT');
  preview.document.write(`
    <html>
      <head>
        <title>${document.title}</title>
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
          }

          @page {
            size: 3.25in 3.12in;
            margin: 6mm 7mm;
          }
          ${style}
        </style>
      </head>
      <body>
        <sillonious-brand>
          ${brand}
        </sillonious-brand>
      </body>
    </html>
  `)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/

  preview.print();
  preview.close();

  return true;
}

function getStars() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(rhythm - 1, rhythm - 1, 1, 1);

  return `url(${canvas.toDataURL()}`;
}

function random(max) {
  return Math.floor(Math.random() * max);
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

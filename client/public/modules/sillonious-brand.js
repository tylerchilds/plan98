import module from '@sillonious/module'
import Color from "https://esm.sh/colorjs.io@0.4.0";

const reverseProxyLookup = `
  969 G Edgewater Blvd<br/>
  #123<br/>
  Foster City, CA 94404
`

const emeraldOfTime
  = `/public/sagas/time.saga`
const emeraldOfSpace
  = `/public/sagas/space.saga`
const emeraldOfTrust
  = `/public/sagas/trust.saga`
const emeraldOfTruth
  = `/public/sagas/truth.saga`
const emeraldOfSelf
  = `/public/sagas/self.saga`
const emeraldOfSecurity
  = `/public/sagas/security.saga`
const emeraldOfNow
  = `/public/sagas/index.saga`

export const doingBusinessAs = {
  'sillyz.computer': {
    emote: ';)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '37.769100',
    longitude: '-122.454583',
    zoom: 10,
    tagline: 'A top half video, bottom half game to',
    mascot: 'Silly Sillonious',
    saga: emeraldOfTime,
    contact: reverseProxyLookup,
    brandHue: 55,
    brandRange: 45,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  '1998.social': {
    emote: ':D',
    image: '/cdn/tychi.me/photos/aurora.JPG',
    latitude: '37.771336',
    longitude: '-122.460065',
    zoom: 11,
    tagline: 'go Back To 1998 and',
    mascot: 'Wally the Incredible Hype',
    saga: emeraldOfSpace,
    contact: reverseProxyLookup,
    brandHue: 110,
    brandRange: 45,
    color: new Color('lch', [50, 75, 110])
      .display()
      .toString({format: 'hex'}),
  },
  'yourlovedones.online': {
    emote: ':(',
    image: '/cdn/tychi.me/photos/banyan.JPG',
    latitude: '37.772006',
    longitude: '-122.462220',
    zoom: 12,
    tagline: 'remember forever all the',
    mascot: 'Sally Sillonious',
    saga: emeraldOfTrust,
    contact: reverseProxyLookup,
    brandHue: 220,
    brandRange: 45,
    color: new Color('lch', [50, 75, 220])
      .display()
      .toString({format: 'hex'}),
  },
  'ncity.executiontime.pub': {
    emote: ':o',
    image: '/cdn/tychi.me/photos/denali.JPG',
    latitude: '37.772322',
    longitude:  '-122.465443',
    zoom: 14,
    tagline: 'Pleasures of Night City',
    mascot: 'Sully Sillonious',
    saga: emeraldOfTruth,
    contact: reverseProxyLookup,
    brandHue: 15,
    brandRange: 45,
    color: new Color('lch', [50, 75, 15])
      .display()
      .toString({format: 'hex'}),
  },
  'css.ceo': {
    emote: ':p',
    image: '/cdn/tychi.me/photos/pacifica.JPG',
    latitude: '37.772366',
    longitude: '-122.467315',
    zoom: 15,
    tagline: 'as anyone, anywhere once you',
    mascot: 'Sol Sillonious',
    saga: emeraldOfSelf,
    contact: reverseProxyLookup,
    brandHue: 165,
    brandRange: 45,
    color: new Color('lch', [50, 75, 165])
      .display()
      .toString({format: 'hex'}),
  },
  'y2k38.info': {
    emote: ':*',
    image: '/cdn/tychi.me/photos/giza.JPG',
    latitude: '37.771326',
    longitude: '-122.470304',
    zoom: 16,
    tagline: 'break the time loop.',
    mascot: 'Shelly Sillonious',
    saga: emeraldOfSecurity,
    contact: reverseProxyLookup,
    brandHue: 300,
    brandRange: 45,
    color: new Color('lch', [50, 75, 300])
      .display()
      .toString({format: 'hex'}),
  },
  'thelanding.page': {
    emote: ':)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '37.770613',
    longitude: '-122.479310',
    zoom: 17,
    tagline: 'The Master Sword Awaits!',
    mascot: 'Greggory McGreggory',
    saga: emeraldOfNow,
    contact: reverseProxyLookup,
    brandHue: 350,
    brandRange: 45,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'tychi.me': {
    emote: ':)',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'Join the Circus',
    mascot: 'AN0051610',
    saga: '/public/sagas/1998.social/tychi.saga',
    contact: 'Golden Gate Bifrost',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'abc.xyz': {
    emote: ':)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Alphabet Soup',
    saga: '/public/sagas/abc.xyz/lmnop.saga',
    mascot: 'Crayons',
    contact: 'Letterer',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'w3c.org': {
    emote: ':)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '47.6422547',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'World Wide Web Consortium',
    saga: '/public/cdn/w3c.org/index.saga',
    mascot: 'Chairman',
    contact: 'Email',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'myspace.com': {
    emote: ':)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '32.8246976',
    longitude: '-117.4386328',
    zoom: 17,
    tagline: 'Recompose Yourself',
    saga: '/public/cdn/myspace.com/index.saga',
    mascot: 'Tom',
    contact: 'OnHere',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'braid.org': {
    emote: ':)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Braid',
    saga: '/public/cdn/braid.org/index.saga',
    mascot: 'Mike',
    contact: 'Braid',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
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
  let { host } = $.learn()
  host = host || target.getAttribute('host') || window.location.host
  const council = target.getAttribute('council') || '42'
  const seat = target.getAttribute('seat') || '0'
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

  const joinCode = `
    <button name="join-code">
      <qr-code
        text="https://${host}&council=${council}&seat=${seat}"
        ${fg ? `data-fg="${fg}"`: ''}
        ${bg ? `data-bg="${bg}"`: ''}
      ></qr-code>
    </button>
  `
  return `
    <div class="post-it">
      <main class="canvas" style="background-image: ${stars}">
        ${preview ? `<iframe src="?world=${host}" name="${host}"></iframe>` : joinCode}
      </main>
      <header class="logo">
        <button data-download>PaperPocket: ${mascot}</button>
      </header>
      <nav>
        <sillonious-joypro seat="${seat}"></sillonious-joypro>
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

$.when('click', '[name="join-code"]', (event) => {
  $.teach({ host: 'abc.xyz' })
})
$.when('click', '[data-download]', (event) => {
  const brand = event.target.closest($.link).outerHTML
  sticky(brand)
})

$.style(`
  & {
    display: block;
    overflow: hidden;
  }

  & [name="join-code"] {
    display: block;
    width: 100%;
    height: 100%;
    background: white;
    border: none;
    border-radius: 0;
    padding: 0;
  }

  & [data-download] {
    border: none;
    background: transparent;
    color: var(--wheel-0-4);
    text-shadow: 0 0 5px var(--wheel-0-6);
    text-overflow: ellipsis;
    overflow: hidden;
    padding-left: .5rem;
    line-height: 2rem;
  }

  & iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
  & .post-it {
    border: 1rem solid var(--wheel-0-0);
    background: var(--wheel-0-1);
    display: grid;
    grid-template-rows: 1fr 2rem auto 2rem;
    max-width: 100%;
    padding: 0;
    margin: 0 auto;
    box-sizing: border-box;
    overflow-x: auto;
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
              
              border: none !important;
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

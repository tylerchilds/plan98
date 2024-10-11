import Color from "colorjs.io";

const reverseProxyLookup = `
  969 G Edgewater Blvd<br/>
  #123<br/>
  Foster City, CA 94404
`

const language = `en-us`
const emeraldOfTime
  = `/public/sagas/sillyz.computer/${language}/time.saga`
const emeraldOfSpace
  = `/public/sagas/sillyz.computer/${language}/space.saga`
const emeraldOfTrust
  = `/public/sagas/sillyz.computer/${language}/trust.saga`
const emeraldOfTruth
  = `/public/sagas/sillyz.computer/${language}/truth.saga`
const emeraldOfSelf
  = `/public/sagas/sillyz.computer/${language}/self.saga`
const emeraldOfSecurity
  = `/public/sagas/sillyz.computer/${language}/security.saga`
const emeraldOfNow
  = `/public/cdn/sillyz.computer/index.saga`

export const doingBusinessAs = {
  'tylerchilds.com': {
    emote: ';)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'A wired collection of silly musical equipment',
    latitude: '37.769100',
    longitude: '-122.454583',
    zoom: 10,
    tagline: 'A computer for rewiring devices by transfixing scribbled notes.',
    mascot: 'Silly Sillonious',
    page: '/public/cdn/tylerchilds.com/index.html',
    saga: '/public/sagas/tylerchilds.com/memex.saga',
    contact: reverseProxyLookup,
    brandHue: 0,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'living-impaired.thelanding.page': {
    emote: ';)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'A wired collection of silly musical equipment',
    latitude: '37.769100',
    longitude: '-122.454583',
    zoom: 10,
    tagline: 'A computer for rewiring devices by transfixing scribbled notes.',
    mascot: 'Silly Sillonious',
    saga: '/public/sagas/living-impaired.thelanding.page/en-us/weird-variety.saga',
    contact: reverseProxyLookup,
    brandHue: 60,
    brandRange: 30,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },

  'dwebcamp.org': {
    emote: ';)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'A wired collection of silly musical equipment',
    latitude: '37.769100',
    longitude: '-122.454583',
    zoom: 10,
    tagline: 'A computer for rewiring devices by transfixing scribbled notes.',
    mascot: 'Silly Sillonious',
    saga:`/public/sagas/dwebcamp.org/welcome.saga`,
    contact: reverseProxyLookup,
    brandHue: 60,
    brandRange: 30,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'sillyz.computer': {
    emote: ';)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'A wired collection of silly musical equipment',
    latitude: '37.769100',
    longitude: '-122.454583',
    zoom: 10,
    tagline: 'A computer for rewiring devices by transfixing scribbled notes.',
    mascot: 'Silly Sillonious',
    saga: emeraldOfTime,
    contact: reverseProxyLookup,
    brandHue: 0,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  '1998.social': {
    emote: ':D',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/aurora.JPG',
    imageDescription: 'An aurora borealis in iceland',
    latitude: '37.771336',
    longitude: '-122.460065',
    zoom: 11,
    tagline: 'An operating system so reminiscent of the past, it feels like the future.',
    mascot: 'Wally Wollaston',
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
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/banyan.JPG',
    imageDescription: 'The Banyan Tree in Lahaina',
    latitude: '37.772006',
    longitude: '-122.462220',
    zoom: 12,
    tagline: 'A social network of only the ugly faces you want to see.',
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
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/denali.JPG',
    imageDescription: 'Some mountain in Alaska',
    latitude: '37.772322',
    longitude:  '-122.465443',
    zoom: 14,
    tagline: 'An easter bunny egg in an easter egg in an egg in a...',
    mascot: 'Sully Sillonious',
    saga: emeraldOfTruth,
    contact: reverseProxyLookup,
    brandHue: 15,
    brandRange: 45,
    color: new Color('lch', [50, 75, 15])
      .display()
      .toString({format: 'hex'}),
    endOfHead: `
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/index.global.min.js'></script>
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/web-component@6.1.15/index.global.min.js'></script>
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.15/index.global.min.js'></script>
      <script src="https://widget.clym-sdk.net/blocking.js"></script>
      <script>
      (function(d,s,i,w,o){
      var js,cjs=d.getElementsByTagName(s)[0];
      if(d.getElementById(i))return;
      js=d.createElement('script');
      js.id=i;
      js.src="https://widget.clym-sdk.net/clym.js";
      js.onload=function(){Clym&&Clym.load(i,w,o);};
      cjs.parentNode.insertBefore(js, cjs);
      }(document,'script','clym-privacy','a6ccc06b25bd4dc1abfa91e04btycg0p',{}));
      </script>
      <script type="module">
        import Plausible from 'plausible-tracker'
        const plausible = Plausible({
          domain: 'thelanding.page'
        })
        const { trackPageview } = Plausible()
        // Track a page view
        trackPageview()
      </script>
    `

  },
  'css.ceo': {
    emote: ':p',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/pacifica.JPG',
    imageDescription: 'Where Taco Bell on the ocean serves frozen margaritas.',
    latitude: '37.772366',
    longitude: '-122.467315',
    zoom: 15,
    tagline: 'The floating office of the chief executive officer of cascading style sheets',
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
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/giza.JPG',
    imageDescription: 'Where the Pyramids are the desert',
    latitude: '37.771326',
    longitude: '-122.470304',
    zoom: 16,
    tagline: 'A strategic initiative to set the year 2077 up for success.',
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
    logo: '/cdn/thelanding.page/giggle.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'The Master Sword',
    latitude: '37.770613',
    longitude: '-122.479310',
    zoom: 17,
    tagline: 'The Landing Page is a magical sheet of paper that when unfolded becomes a deeper mystery-- as something razor thin, shields an entire reality',
    mascot: 'Greggory McGreggory',
    saga: '/public/cdn/thelanding.page/memex.saga',
    contact: reverseProxyLookup,
    brandHue: 350,
    brandRange: 45,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
    links: [
      {
        title: 'About',
        tag: 'mission-statement'
      },
      {
        title: 'Subscribe',
        tag: 'stay-tuned'
      },
    ],
    endOfHead: `
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/index.global.min.js'></script>
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/web-component@6.1.15/index.global.min.js'></script>
      <script src='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.15/index.global.min.js'></script>
    `
  },
  'tychi.me': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'A pop-up book.',
    mascot: 'AN0051610',
    saga: emeraldOfNow,
    contact: 'Golden Gate Bifrost',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'bayunsystems.com': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'A pop-up book.',
    mascot: 'AN0051610',
    saga: '/public/sagas/bayunsystems.com/index.saga',
    contact: 'Tommi',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'tommi.space': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'A pop-up book.',
    mascot: 'AN0051610',
    saga: '/public/cdn/tommi.space/index.saga',
    contact: 'Tommi',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'cutestrap.com': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'One whole clown.',
    mascot: 'Ty',
    saga: '/public/cdn/cutestrap.com/index.saga',
    contact: 'Golden Gate Bifrost',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'abc.xyz': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
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
  'archive.org': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '37.7826629',
    longitude: '-122.4763459',
    zoom: 17,
    tagline: 'Universal access to all knowledge',
    saga: '/public/cdn/archive.org/index.saga',
    mascot: 'Brewster',
    contact: 'Dweb Mail',
    brandHue: 280,
    brandRange: 360,
    color: new Color('lch', [0, 0, 280])
      .display()
      .toString({format: 'hex'}),
  },
  'pathbuilder2e.com': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '37.7826629',
    longitude: '-122.4763459',
    zoom: 17,
    tagline: 'Universal access to all knowledge',
    saga: '/public/cdn/pathbuilder2e.com/index.saga',
    mascot: 'Origin Wildcloak',
    contact: 'Origin Wildcloak',
    brandHue: 280,
    brandRange: 360,
    color: new Color('lch', [0, 0, 280])
      .display()
      .toString({format: 'hex'}),
  },
  'w3c.org': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
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
    logo: '/cdn/thelanding.page/logo.svg',
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
    logo: '/cdn/thelanding.page/logo.svg',
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
  'fantasysports.social': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Fantasy Sports Online',
    saga: '/public/cdn/fantasysports.social/index.saga',
    mascot: 'Shawn Childs',
    contact: 'Shawn Childs',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'docs.flipper.net': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Fantasy Sports Online',
    saga: '/public/cdn/docs.flipper.net/index.saga',
    mascot: 'Shawn Childs',
    contact: 'Shawn Childs',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'websynths.com': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Web Synths Groove',
    saga: '/public/cdn/websynths.com/index.saga',
    mascot: 'Web Synths Grooves',
    contact: 'Web Synths Grooves',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  },
  'owncast.online': {
    emote: ':)',
    logo: '/cdn/thelanding.page/logo.svg',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    latitude: '64.1478144',
    longitude: '-21.943671',
    zoom: 17,
    tagline: 'Owncast.Online',
    saga: '/public/cdn/owncast.online/index.saga',
    mascot: 'Web Synths Grooves',
    contact: 'Web Synths Grooves',
    brandHue: 350,
    brandRange: 360,
    color: new Color('lch', [50, 75, 350])
      .display()
      .toString({format: 'hex'}),
  }

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

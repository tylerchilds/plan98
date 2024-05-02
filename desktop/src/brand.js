import Color from "colorjs.io";

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
  = `/public/cdn/sillyz.computer/index.saga`

export const doingBusinessAs = {
  'sillyz.computer': {
    emote: ';)',
    image: '/cdn/tychi.me/photos/sillyz.JPG',
    imageDescription: 'A wired collection of silly musical equipment',
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
    imageDescription: 'An aurora borealis in iceland',
    latitude: '37.771336',
    longitude: '-122.460065',
    zoom: 11,
    tagline: 'go Back To 1998 and',
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
    image: '/cdn/tychi.me/photos/banyan.JPG',
    imageDescription: 'The Banyan Tree in Lahaina',
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
    imageDescription: 'Some mountain in Alaska',
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
    imageDescription: 'Where Taco Bell on the ocean serves frozen margaritas.',
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
    imageDescription: 'Where the Pyramids are the desert',
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
    imageDescription: 'The Master Sword',
    latitude: '37.770613',
    longitude: '-122.479310',
    zoom: 17,
    tagline: 'The Master Sword Awaits!',
    mascot: 'Greggory McGreggory',
    saga: '/public/cdn/thelanding.page/memex.saga',
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
    saga: emeraldOfNow,
    contact: 'Golden Gate Bifrost',
    brandHue: 55,
    brandRange: 360,
    color: new Color('lch', [50, 75, 55])
      .display()
      .toString({format: 'hex'}),
  },
  'cutestrap.com': {
    emote: ':)',
    latitude: '37.782562',
    longitude: '-122.471554',
    zoom: 13,
    tagline: 'Pull your page, site, app, or system up by your Cutestraps.',
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
  'fantasysports.social': {
    emote: ':)',
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

import tag from '@silly/tag'

const $ = tag('sillyz-computer')

export const lookup = {
  '004': {
    title: "Charmander's",
    subtitle: "Ember",
    tag: 'sillyz-ocarina',
    latitude: '37.769100',
    longitude: '-122.454583',
  },
  '007': {
    title: "Squirtle's",
    subtitle: "Bubble",
    tag: 'sillyz-ocarina',
    latitude: '37.771336',
    longitude: '-122.460065',
  },
  '035': {
    title: "Clefairy's",
    subtitle: "Metronome",
    tag: 'sillyz-ocarina',
    latitude: '37.772006',
    longitude: '-122.462220',
  },
  '097': {
    title: "Hypno's",
    subtitle: "Future Sight",
    tag: 'sillyz-ocarina',
    latitude: '37.772322',
    longitude:  '-122.465443',
  },

  '134': {
    title: "Vaporeon's",
    subtitle: "Aurora Beam",
    tag: 'sillyz-ocarina',
    latitude: '37.772366',
    longitude: '-122.467315',
  },
  '147': {
    title: "Dratini's",
    subtitle: "Dragon Dance",
    tag: 'sillyz-ocarina',
    latitude: '37.771326',
    longitude: '-122.470304',
  },
}

$.draw(target => {
  if(lookup[target.id]) {
    return `<middle-earth id="${target.id}"></middle-earth>`
  }

  return `<plan98-welcome></plan98-welcome>`
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
  }
`)

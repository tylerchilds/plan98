import tag from '@silly/tag'

const $ = tag('sillyz-computer')

const lookup = {
  '004': {
    title: "Charmander's",
    subtitle: "Ember",
    tag: 'sillyz-ocarina'
  },
  '007': {
    title: "Squirtle's",
    subtitle: "Bubble",
    tag: 'sillyz-ocarina'
  },
  '035': {
    title: "Clefairy's",
    subtitle: "Metronome",
    tag: 'sillyz-ocarina'
  },
  '097': {
    title: "Hypno's",
    subtitle: "Future Sight",
    tag: 'sillyz-ocarina'
  },

  '134': {
    title: "Vaporeon's",
    subtitle: "Aurora Beam",
    tag: 'sillyz-ocarina'
  },
  '147': {
    title: "Dratini's",
    subtitle: "Dragon Dance",
    tag: 'sillyz-ocarina'
  },
}

$.draw(target => {
  if(lookup[target.id]) {
    const { title, subtitle, tag } = lookup[target.id]
    return `<plan98-welcome title="${title}" subtitle="${subtitle}" tag="${tag}"></plan98-welcome>`
  }

  return `<plan98-welcome></plan98-welcome>`
})

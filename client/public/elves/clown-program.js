import app from '@plan98/app'

function Patron() {
  return {
    friend: false,
    primaryInterest: null,
    minor: true,
    spectacle: null
  }
}

export const interests = {
  robots: 'robots',
  juggling: 'juggling',
  joking: 'joking',
  magic: 'magic',
  shows: 'shows',
  lore: 'lore',
}

export const characters = {
  engineer: {
    label: 'engineer',
  },
  narrator: {
    label: 'narrator',
  },
  jester: {
    label: 'jester',
  },
  magician: {
    label: 'magician',
  },
  comic: {
    label: 'comic',
  },
  mime: {
    label: 'mime',
  },
  trickster: {
    label: 'trickster',
  },
  bard: {
    label: 'bard',
  },
  fool: {
    label: 'fool',
  },
  clown: {
    label: 'clown',
    tlm: clown
  },
}

function clown(patron) {
  if(patron.spectacle) {
    return 'whoa'
  } else {
    return 'wow'
  }
}

export const masks = {
  [interests.robots]: characters.engineer,
  [interests.lore]: characters.narrator,
  [interests.juggling]: characters.jester,
  [interests.joking]: characters.jester,
  [interests.magic]: characters.magician,
  [interests.shows]: characters.comic,
}

const $ = app('clown-program')

export function clownProgram(patron) {
  if(patron.minor) {
    return characters.clown
  }

  if(!patron.friend) {
    return characters.musician
  }

  if(masks[patron.primaryInterest]) {
    return masks[patron.primaryInterest]
  }

  return characters.clown
}

export function dialogue(patron, fallback) {
  const mask = clownProgram(patron)

  if(mask.tlm) {
    return mask.tlm(patron)
  }
}

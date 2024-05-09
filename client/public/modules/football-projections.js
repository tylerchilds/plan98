import module from '@silly/tag'

import { footballTeams } from '@sillonious/sports'

const $ = module('football-projections')

$.draw(() => {
  return `
    Projections
    ${footballTeams.map(x => `<div>${x}</div>`).join('')}
  `
})

$.style(`
  & {
    display: block;
  }
`)

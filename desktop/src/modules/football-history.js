import module from '@sillonious/module'

import { footballTeams } from '@sillonious/sports'

const $ = module('football-history')

$.draw(() => {
  return `
    History
    ${footballTeams.map(x => `<div>${x}</div>`).join('')}
  `
})

$.style(`
  & {
    display: block;
  }
`)

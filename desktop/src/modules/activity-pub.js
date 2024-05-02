import module from '@sillonious/module'

import "activitypub-actor-tester"

const $ = module('activity-pub')

$.draw(() => {
  return `<activitypub-actor-tester></activitypub-actor-tester>`
})

$.style(`
  & {
    display: block;
  }
`)

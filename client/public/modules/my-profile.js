import module from '@sillonious/module'

const $ = module('my-profile')

$.draw(() => {
  return `
    photo
    flags
    age
    region
    lastonline
  `
})

import module from '@sillonious/module'

const $ = module('my-profile')

$.draw(() => {
  return `
    <resize-image id="profile-picture"></resize-image>
    flags
    age
    region
    lastonline
  `
})

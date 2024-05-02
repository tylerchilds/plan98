import module from '@sillonious/module'

const $ = module('music-studio')

$.draw(() => {
  return `
    <sillyz-ocarina></sillyz-ocarina>
    <sillyz-piano></sillyz-piano>
  `
})

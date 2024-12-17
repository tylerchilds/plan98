import module from '@silly/tag'

const $ = module('music-studio')

$.draw(() => {
  return `
    <sillyz-ocarina></sillyz-ocarina>
    <sillyz-piano></sillyz-piano>
  `
})

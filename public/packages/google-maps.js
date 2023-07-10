import module from '../module.js'

const $ = module('google-maps')

$.draw(() => {
  return `
    google map
  `
})

$.flair(`
  & { display: block }
`)

import module from '../module.js'

const $ = module('google-maps')

$.draw(() => {
  return `
    google map
  `
})

$.style(`
  & { display: block }
`)

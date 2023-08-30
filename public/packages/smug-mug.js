import module from '../module.js'

const $ = module('smug-mug')

$.draw(() => {
  return `
    smug mug
  `
})

$.style(`
  & { display: block }
`)

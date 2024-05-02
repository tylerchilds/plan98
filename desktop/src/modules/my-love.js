import module from '@sillonious/module'

const $ = module('my-love')

$.draw(() => {
  return `
    lovers only
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

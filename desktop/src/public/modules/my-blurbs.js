import module from '@sillonious/module'

const $ = module('my-blurbs')

$.draw(() => {
  return `
    would you rather?

    i would rather not.
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

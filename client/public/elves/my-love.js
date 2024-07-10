import module from '@silly/tag'

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

import module from '@silly/tag'

const $ = module('my-thoughts')

$.draw(() => {
  return `
    rss blog stuffs
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

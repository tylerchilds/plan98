import module from '@silly/tag'

const $ = module('my-friendliness')

$.draw(() => {
  return `
    this person is a stranger
    this person is in your extended network
    i know this person
    i like this person
    i do not like this person
    i am in like with this person
    i love this person
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

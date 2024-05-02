import module from '@sillonious/module'

const $ = module('my-contact')

$.draw(() => {
  return `
    send message
    forward
    add friend
    add favorite
    message
    block
    group
    rank
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

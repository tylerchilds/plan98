import module from '@sillonious/module'

const $ = module('my-top')

$.draw(() => {
  return `
    top anything really
    friends
    songs
    movies
    games
    who or what are you promoting
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

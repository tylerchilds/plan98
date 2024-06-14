import module from '@silly/tag'

const $ = module('hypertext-puppet')

$.draw((target) => {
  return `
    ${target.innerText}
  `
})

$.style(`
  & {
    display: block;
    text-align: center;
    text-transform: uppercase;
    margin: 1rem 0 0;
    place-self: end start;
    overflow: hidden;
  }
`)

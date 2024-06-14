import module from '@silly/tag'

const $ = module('hypertext-address')

$.draw((target) => {
  return `
    ${target.innerText}
  `
})

$.style(`
  & {
    display: block;
    text-transform: uppercase;
    margin: 1rem 0;
    place-self: start end;
    overflow: hidden;
  }
`)

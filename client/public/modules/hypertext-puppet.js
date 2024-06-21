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
    margin: 1rem auto 0;
    padding: 0 1rem;
    place-self: end start;
    overflow: hidden;
  }
`)

import module from '@silly/tag'

const $ = module('hypertext-parenthetical')

$.draw((target) => {
  return `
    ${target.innerText}
  `
})


$.style(`
  & {
    display: block;
    text-align: center;
    place-self: center;
    overflow: hidden;
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

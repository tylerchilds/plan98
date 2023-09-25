const $ = module('hypertext-parenthetical')

$.style(`
  & {
    display: block;
    text-align: center;
    place-self: center;
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

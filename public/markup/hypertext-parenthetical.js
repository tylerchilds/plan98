const $ = module('hypertext-parenthetical')

$.style(`
  & {
    display: block;
    text-align: center;
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

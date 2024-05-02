import module from '@sillonious/module'

const $ = module('hypertext-parenthetical')

$.draw((target) => {
  return `
    <hypertext-highlighter color="dodgerblue">
      ${target.innerText}
    </hypertext-highlighter>
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

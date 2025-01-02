import elf from '@silly/elf'

const $ = elf('hypertext-parenthetical')

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
    padding: 0 1rem;
    white-space: nowrap;
  }

  &::before {
    content: '(';
    display: inline;
  }

  &::after {
    content: ')';
    display: inline;
  }
`)

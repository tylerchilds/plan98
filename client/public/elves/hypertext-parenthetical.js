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
    margin: -1rem auto;
    max-width: 6in;
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

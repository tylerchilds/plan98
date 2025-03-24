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
    margin: 0 auto;
    max-width: 6in;
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

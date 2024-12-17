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
  }

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`)

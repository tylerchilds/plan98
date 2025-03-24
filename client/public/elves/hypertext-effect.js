import elf from '@silly/elf'

const $ = elf('hypertext-effect')

$.draw((target) => {
  return `
    ${target.innerText}
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem auto;
    text-align: right;
    place-self: end;
    overflow: hidden;
    padding: 0 1rem;
    max-width: 6in;
  }
`)

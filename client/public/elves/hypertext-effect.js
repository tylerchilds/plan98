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
    margin: 1rem 0;
    text-align: right;
    place-self: end;
    overflow: hidden;
    padding: 0 1rem;
  }
`)

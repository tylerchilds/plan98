import elf from '@silly/elf'

const $ = elf('hypertext-address')

$.draw((target) => {
  return `
    ${target.innerText}
  `
})

$.style(`
  & {
    display: block;
    text-transform: uppercase;
    margin: 1rem auto;
    max-width: 6in;
    place-self: start end;
    position: relative;
  }
`)

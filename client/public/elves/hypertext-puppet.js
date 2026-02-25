import elf from '@silly/elf'

const $ = elf('hypertext-puppet')

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
    place-self: end start;
    text-align: center;
    max-width: 6in;
    position: relative;
  }
`)

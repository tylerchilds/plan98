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
    padding: 0 1rem;
    place-self: end start;
    text-align: center;
  }
`)

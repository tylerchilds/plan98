import elf from '@silly/elf'

const $ = elf('iiw-40', {
  // schema goes here
})

$.draw(() => {
  return `
    IIW 40
  `
})

$.style(`
  & {
    display:block;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
  }
`)

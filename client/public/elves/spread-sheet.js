import elf from '@silly/elf'

const $ = elf('spread-sheet')

$.draw((target) => {
  return target.getAttribute('src')
})

$.style(`
  & {
    background: white;
    color: black;
    width: 100%;
    height: 100%;
    display: block;
    overflow: auto;
  }
`)

import module from '@silly/tag'

const $ = module('hypertext-address')

$.draw((target) => {
  return `
    <hypertext-highlighter color="lime">
      ${target.innerText}
    </hypertext-highlighter>
  `
})

$.style(`
  & {
    display: block;
    text-transform: uppercase;
    margin: 1rem 0;
    place-self: start end;
    overflow: hidden;
  }
`)

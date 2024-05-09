import module from '@silly/tag'

const $ = module('hypertext-effect')

$.draw((target) => {
  return `
    <hypertext-highlighter color="orange">
      ${target.innerText}
    </hypertext-highlighter>
  `
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
    text-align: right;
    place-self: end;
    overflow: hidden;
  }
`)

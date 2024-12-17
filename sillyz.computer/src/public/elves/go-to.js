import module from '@silly/tag'

const $ = module('go-to')

$.draw((target) => {
  const link = target.getAttribute('link')
  return `
    <a href="${link}">
      ${target.innerText}
    </a>
  `
})

$.style(`
  & {
    display: block;
    text-align: right;
    margin: 1rem;
  }

  & [href] {
    border: 2px solid dodgerblue;
    color: dodgerblue;
    border-radius: 2rem;
    transition: all 100ms ease-in-out;
    background: rgba(255,255,255,.85);
    padding: .5rem;
    text-decoration: none;
    display: inline-block;
  }

  & [href]:focus,
  & [href]:hover {
    background: dodgerblue;
    color: white
  }
`)

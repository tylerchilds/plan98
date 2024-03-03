import module from '@sillonious/module'

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
    background: transparent;
    border: 2px solid dodgerblue;
    color: dodgerblue;
    border-radius: 2rem;
    transition: all 100ms ease-in-out;
    padding: .5rem;
  }

  & [href]:focus,
  & [href]:hover {
    background: dodgerblue;
    color: white
  }
`)

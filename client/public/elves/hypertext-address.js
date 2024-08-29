import module from '@silly/tag'

const $ = module('hypertext-address')

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
    place-self: start end;
    position: relative;
  }

  &::before {
    content: '#';
    right: 1rem;
    position: absolute;
    color: rgba(0,0,0,.5);
    line-height: 1.4;
    font-size: 1.25rem;
  }

  @media (min-width: 768px) {
    &::before {
      content: none;
    }
  }
`)

import module from '@silly/tag'

const $ = module('hypertext-puppet')

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
    position: relative;
  }

  &::before {
    content: '@';
    top: -1rem;
    left: 0;
    position: absolute;
    color: rgba(0,0,0,.5);
    line-height: 1.4;
    font-size: 1.25rem;
  }

  @media (min-width: 768px) {
    & {
      text-align: center;
    }

    &::before {
      content: none;
    }
  }
`)

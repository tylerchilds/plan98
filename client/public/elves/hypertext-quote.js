import module from '@silly/tag'

const $ = module('hypertext-quote')

$.style(`
  & {
    display: block;
    place-self: end center;
    padding: 0 1rem;
    margin: 1rem 0;
  }
  @media (min-width: 768px) {
    & {
      margin: 1rem 1in;
      width: 4in;
    }
  }
`)

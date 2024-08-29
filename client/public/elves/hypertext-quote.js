import module from '@silly/tag'

const $ = module('hypertext-quote')

$.style(`
  & {
    display: block;
    place-self: end center;
    padding: 0 1rem;
    position: relative;
    margin: 1rem 0;
  }

  &::before {
    content: '>';
    right: 1rem;
    position: absolute;
    color: rgba(0,0,0,.5);
    line-height: 1.4;
    font-size: 1.25rem;
  }

  @media (min-width: 768px) {
    & {
      margin: 1rem 1in;
      width: 4in;
    }

    &::before {
      content: none;
    }
  }
`)

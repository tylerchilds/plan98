import module from '@silly/tag'

const $ = module('hypertext-quote')

$.style(`
  & {
    display: block;
    place-self: end center;
    padding: 0 1rem;
    margin: 1rem 0;
  }

  @media screen {
    &::before {
      content: '>';
      background: gold;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      position: absolute;
      left: 0;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 100%;
      display: grid;
      place-items: center;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
    }
  }

  @media (min-width: 768px) {
    & {
      margin: 1rem 1in;
      width: 4in;
    }
  }
`)

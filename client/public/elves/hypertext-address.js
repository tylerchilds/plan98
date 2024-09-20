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
  }

  @media screen {
    &::before {
      content: '#';
      background: mediumseagreen;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      left: 0;
      position: absolute;
      border-radius: 100%;
      width: 1.5rem;
      height: 1.5rem;
      display: grid;
      place-items: center;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
    }
  }
`)

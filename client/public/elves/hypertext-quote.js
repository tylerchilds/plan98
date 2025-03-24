import elf from '@silly/elf'

const $ = elf('hypertext-quote')

$.style(`
  & {
    display: block;
    place-self: end center;
    padding: 0 4rem;
    margin: 1rem auto;
    max-width: calc(4in + 8rem);
  }

  @media print {
    & {
      margin: 1rem auto;
      width: 4in;
    }

  }
`)

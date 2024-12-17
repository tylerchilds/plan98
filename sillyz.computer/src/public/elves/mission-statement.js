import module from '@silly/tag'

const $ = module('mission-statement')

$.draw(() => {
  return `
    Sillyz.Computer was created to bridge the gap between toy computers and luxury computers.
  `
})

$.style(`
  & {
    background: white;
    padding: 1rem;
    max-width: 55ch;
  }
`)

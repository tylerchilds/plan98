import module from '@sillonious/module'

const $ = module('braid-debugger')

$.draw(() => {
  return `plan98 debug info here`
})

$.style(`
  & {
    display: block;
  }
`)

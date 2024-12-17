import module from '@silly/tag'

const $ = module('hyper-link')

$.draw(( target ) => {
  const src = target.getAttribute('src')
  const label = target.getAttribute('label')
  return `
    <a href="${src}" target="_top">${label}</a>
  `
})

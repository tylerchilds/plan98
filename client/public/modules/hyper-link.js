import module from '@sillonious/module'

const $ = module('hyper-link')

$.draw(( target ) => {
  const src = target.getAttribute('src')
  const label = target.getAttribute('label')
  return `
    <a href="${src}" target="_top">${label}</a>
  `
})

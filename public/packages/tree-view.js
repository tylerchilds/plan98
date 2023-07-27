import module from '../module.js'

const $ = module('tree-view')

$.draw(target => {
  const key = target.getAttribute('key')
  const list = state[key] || []

  return `
    <details>
      <summary>Cool</summary>
       Uncool
    </details>
  `
})


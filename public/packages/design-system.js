import module from '../module.js'

const $ = module('design-system')

$.draw(() => {
  const { palette } = $.learn()

  if(!palette) {
    fetch('/design-system')
      .then(res => res.json())
      .then(({ palette }) => $.teach({ palette }))
    return
  }

  return `
    <style>
      :root {
        "${palette}"
      }
    </style>
  `
})

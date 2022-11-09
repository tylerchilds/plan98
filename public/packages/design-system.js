import module from '../module.js'

const $ = module('design-system')

$.render(() => {
  const { palette } = $.read()

  if(!palette) {
    fetch('/design-system')
      .then(res => res.json())
      .then(({ palette }) => $.write({ palette }))
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

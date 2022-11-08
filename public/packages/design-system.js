import module from '../module.js'

const $ = module('design-system')

$.render(() => {
  return `
    <style>
      :root {
        "${colorVariables}"
      }
    </style>
  `
})

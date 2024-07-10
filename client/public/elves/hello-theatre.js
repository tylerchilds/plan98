import * as THREE from 'three'
import module from '@silly/tag'

import core from '@theatre/core'
import studio from '@theatre/studio'

const $ = module('hello-theatre')

$.draw((target) => {
  const { opacity, transform } = $.learn()
  target.style.transform = transform
  target.style.opacity = opacity
})

/**
 * Theatre.js
 */
studio.initialize()

/* ... */

const project = core.getProject('HTML Animation Tutorial')
const sheet = project.sheet('Sheet 1')
const obj = sheet.object('Heading 1', {
  y: 0, // you can use just a simple default value
  opacity: core.types.number(1, { range: [0, 1] }), // or use a type constructor to customize
})

obj.onValuesChange((obj) => {
  const transform = `translateY(${obj.y}px)`
  const opacity = obj.opacity
  $.teach({ transform, opacity })
})

$.style(`
  & {
    background: orange;
    min-height: 200px;
  }
`)

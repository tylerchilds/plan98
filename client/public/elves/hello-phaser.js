import module from '@silly/tag'
import 'phaser'

const $ = module('hello-phaser')

$.draw((target) => {
  return `
      didn't crash lol
  `
})

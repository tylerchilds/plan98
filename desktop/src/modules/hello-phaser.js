import module from '@sillonious/module'
import 'phaser'

const $ = module('hello-phaser')

$.draw((target) => {
  return `
      didn't crash lol
  `
})

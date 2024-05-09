import module from '@silly/tag'
import katex from 'katex'

const $ = module('katex-demo')

$.draw(target => {
  katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, target, {
    throwOnError: false
  });
})


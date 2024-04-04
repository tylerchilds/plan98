import module from '@sillonious/module'
import { hyperSanitizer } from './hyper-script.js'

const $ = module('hypertext-paradox')

$.draw((target) => {
  init(target)
  const { a, b } = $.learn()
  return `
    <div class="reality-a">
      ${ hyperSanitizer(a) }
    </div>
    <div class="reality-b">
      ${ hyperSanitizer(b) }
    </div>
  `
})

function init(target) {
  if(!target.init) {
    target.init = true
    read('a', target.getAttribute('a'))
    read('b', target.getAttribute('b'))
  }
}

$.style(`
  & {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`)

function read(key, url) {
  fetch(url)
    .then(async response => {
      if(response.status === 404) {
        target.innerHTML = ``
        return
      }
      const saga = await response.text()
      $.teach({ [key]: saga })
    })
    .catch(e => {
      console.error(e)
    })
}


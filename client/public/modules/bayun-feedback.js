import module from '@silly/tag'
import { getFeedback } from './bayun-wizard.js'

const $ = module('bayun-feedback')

$.draw(() => {
  return getFeedback().map(({ message, type }) => {
    return `
      <div class="feedback ${type}">
        ${message}
      </div>
    `
  }).join('<br>')
})

$.style(`
  & .feedback {
    border: 1px solid dodgerblue;
  }

  & .error {
    border-color: orange;
  }
`)

import module from '../module.js'

const $ = module('field-text')

$.draw(target => {
  const label = target.getAttribute('label')
  const key = target.getAttribute('key')
  const value = state[key] || ''

  return `
    <label class="field">
      <input type="text" name="${key}" value="${value}" />
      <span class="label">${label}</span>
    </label>
  `
})


$.when('keyup', 'input', event => {
  const value = event.target.value;
  const key = event.target.name;
  state[key] = value
})

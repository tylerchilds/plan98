import module from '../module.js'

const $ = module('connected-service')

$.draw(target => {
  const label = target.getAttribute('label')
  const key = target.getAttribute('key')
  const value = state[key] || {}
  return Object.keys(value).map(key => `${key}: ${value[key]}`).join('<br/>')
})


$.when('keyup', 'input', event => {
  const value = event.target.value;
  const key = event.target.name;
  state[key] = value
})

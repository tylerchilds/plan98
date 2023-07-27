import module from '../module.js'

const $ = module('field-select')

$.draw(target => {
  const label = target.getAttribute('label')
  const key = target.getAttribute('key')
  const value = state[key] || ''

  return `
    <label class="field">
			<select name="${key}" value="${value}" >
				<option disabled="disabled">
					Flavors
				</option>
				<option>Chocolate</option>
				<option>Vanilla</option>
			</select>
      <span class="label">${label}</span>
    </label>
  `
})


$.when('keyup', 'input', event => {
  const value = event.target.value;
  const key = event.target.name;
  state[key] = value
})

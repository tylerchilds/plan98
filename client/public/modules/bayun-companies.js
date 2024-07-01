import module from '@silly/tag'
import { getCompanies, setCompanyName } from './bayun-wizard.js'

const $ = module('bayun-companies')

$.draw(() => {
  const companies = getCompanies().map((company) => {
    return `
      <option value="${company}">
        ${company}
      </option>
    `
  }).join('')

  return `
    <label class="field">
      <span class="label">Company</span>
      <select>
        ${companies}
      </select>
    </label>
  `
})

$.when('change', 'select', (event) => {
  setCompanyName(event.target.value)
})



$.style(`
  & {
    display: block;
    padding: 0 1rem;
    margin: 1rem auto;
  }

  & select {
    
  }
`)

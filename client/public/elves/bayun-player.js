import module from '@silly/tag'
import { setEmployeeId } from './bayun-wizard.js'

const $ = module('bayun-player')

$.draw(() => {
  return `
    <label class="field">
      <span class="label">Callsign</span>
      <input data-bind type="text" name="companyEmployeeId" required/>
    </label>
  `
})

$.when('input', 'input', (event) => {
  setEmployeeId(event.target.value)
})

$.style(`
  & {
    display: block;
    padding: 0 1rem;
    margin: 1rem auto;
  }
`)

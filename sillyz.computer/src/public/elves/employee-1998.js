import module from '@silly/tag'
import { setEmail } from './wallet-1998.js'

const $ = module('employee-1998')

$.draw(() => {
  return `
    <label class="field">
      <span class="label">Email</span>
      <input data-bind type="text" name="email" required/>
    </label>
  `
})

$.when('input', 'input', (event) => {
  setEmail(event.target.value)
})

$.style(`
  & {
    display: block;
    padding: 0 1rem;
    margin: 1rem auto;
  }
`)

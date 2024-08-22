import tag from '@silly/tag'
import { getCompanies } from './bayun-wizard.js'

const $ = tag('goober-selector')

const companies = getCompanies().map((company) => {
  return `
    <option value="${company}">
      ${company}
    </option>
  `
}).join('')

$.draw((target) => {
  const l = target.getAttribute('language')
  const go = target.getAttribute('go')

  state['ls/companyName'] = 'sillyz.computer'

  return `
    <label class="field">
      <span class="label">
        ${l}
      </span>
      <select>
        ${companies}
      </select>
    </label>
    <button data-action>
      ${go}
    </button>
  `
})

$.when('change', 'select', (event) => {
  const { value } = event.target
  state['ls/companyName'] = value
})

$.when('click', '[data-action]', async (event) => {
  const root = event.target.closest($.link)
  const { action, script } = root.dataset
  if(script) {
    const dispatch = (await import(script))[action]
    if(dispatch) {
      self.history.pushState({ action, script }, "");
      await dispatch(event, root)
    }
  }
})

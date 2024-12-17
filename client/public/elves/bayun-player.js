import elf from '@silly/elf'
import { setEmployeeId } from './bayun-wizard.js'

const $ = elf('bayun-player')

function t(target, label, fallback) {
  return target.getAttribute('i18n-'+label) || fallback
}

$.draw((target) => {
  return `
    <label class="field">
      <span class="label">Account Identifier</span>
      <input data-bind type="text" name="companyEmployeeId" required/>
    </label>
    <div class="button-row">
      <action-script data-action="register" data-script="/public/elves/bayun-wizard.js">${t(target, 'register', 'Register')}</button>
      <action-script data-action="login" data-script="/public/elves/bayun-wizard.js">${t(target, 'login', 'Login')}</button>
    </div>
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

  & .button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
  }

  & action-script {
    width: 100%;
    padding: 0;
    margin: 0;
  }
`)

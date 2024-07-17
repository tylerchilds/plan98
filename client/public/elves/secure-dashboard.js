import tag from '@silly/tag'
import { clearSession, getSession } from './bayun-wizard.js'

const $ = tag('secure-dashboard')

$.draw(() => {
  const {
    companyName,
    companyEmployeeId,
    sessionId
  } = getSession()
  return sessionId ? `
    Congratulations. Secure, trustless.
    <br>
    domain: ${companyName}
    <br>
    user: ${companyEmployeeId}
    <br>
    session: ${sessionId}

    <button data-disconnect>
      Disconnect
    </button>
  ` : `
    You're not logged in... 
    <a href="/app/bayun-wizard">
      Go on an adventure...
    </a>
  `
})

$.when('click', '[data-disconnect]', () => {
  clearSession()
})

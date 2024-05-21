import module, { state } from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import supabase from '@sillonious/database'
import { getSession } from './comedy-notebook.js'
import { hideModal } from '@plan98/modal'

const $ = module('comedy-blast')


$.draw((target) => {
  const { error } = $.learn()
  const { sessionId } = getSession()

  if(!sessionId) {
    return `
      <comedy-notebook></comedy-notebook>
    `
  }

    return `
      <div name="new-joke">
        <div class="error">
          ${error ? error : ''}
        </div>
        <form method="POST" action="loginWithPassword">
          <label class="field">
            <span class="label">Setup</span>
            <input data-bind type="text" name="setup" required/>
          </label>
          <label class="field">
            <span class="label">Punchline</span>
            <input data-bind type="password" name="punchline" required/>
          </label>
          <rainbow-action>
            <button type="submit">
              Crack Joke
            </button>
          </rainbow-action>
        </form>
      </div>
    `
})
 
$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  const setup = event.target.setup.value;
  const punchline = await bayunCore.lockText(sessionId, event.target.punchline.value);

  const { data, error } = await supabase
  .from('plan98_solo_text')
  .insert([
    { companyName, companyEmployeeId, setup, punchline },
  ])
  .select()

  if(error) {
    $.teach({ error })
  }

  hideModal()
})



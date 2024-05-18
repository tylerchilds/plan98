import module, { state } from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import supabase from '@sillonious/database'
import { render } from '@sillonious/saga'
import { showModal } from '@plan98/modal'

const $ = module('comedy-notebook', {
  sessionId: '',
  companyName: 'sillyz.computer',
  companyEmployeeId: '',
  password: '',
  autoCreateEmployee: true,
  jokes: {}
})

$.draw((target) => {
  const { error, jokes } = $.learn()
  const { sessionId } = getSession()

  if(!sessionId) {
    return `
      <div name="login">
        <hypertext-variable monospace="0" casual="1" weight="400" slant="0" cursive="1">
          Comedy Notebook
        </hypertext-variable>
        <div class="error">
          ${error ? error : ''}
        </div>
        <form method="POST" action="loginWithPassword">
          <label class="field">
            <span class="label">Identity</span>
            <input data-bind type="text" name="companyEmployeeId" required/>
          </label>
          <label class="field">
            <span class="label">Password</span>
            <input data-bind type="password" name="password" required/>
          </label>
          <rainbow-action>
            <button type="submit">
              Log In
            </button>
          </rainbow-action>
        </form>
      </div>
    `
  }

  const lines = getLines(target)
  return `
    <div class="page" style="background-image: ${lines}">
      <div class="actions">
        <button data-new>
          New Joke
        </button>
        <button data-clear>
          Clear Jokes
        </button>
        <button data-logout>
          Logout
        </button>

      </div>
      <div class="setlist">
        ${Object.keys(jokes).map((id) => {
          return `
            <button data-id="${id}">
              <hypertext-variable monospace="0" slant="-15" casual="1" cursive="1" weight="200">
                ${jokes[id].setup}
              </hypertext-variable>
            </button>
          `
        }).join('')}
      </div>
    </div>
  `
})

$.when('click', '[data-back]', () => {
  $.teach({ activeSetup: null })
})

$.when('click', '[data-id]', (event) => {
  const { id } = event.target.dataset
  const { jokes } = $.learn()
  const { punchline } = jokes[id]
  showModal(`
    <div style="height: 100%; background: lemonchiffon; width: 8.5in; padding: 1in 1in 1in 1.5in; margin: 0 auto;">
      ${render(punchline)}
    </div>
  `)
})

$.when('click', '[data-logout]', async () => {
  clearSession()
})

$.when('click', '[data-new]', async () => {
  showModal(`
    <comedy-blast></comedy-blast>
  `)
})

$.when('click', '[data-clear]', async () => {
  const {
    companyName,
    companyEmployeeId
  } = getSession()

  const { error } = await supabase
  .from('plan98_solo_text')
  .delete()
  .eq('companyName', companyName)
  .eq('companyEmployeeId', companyEmployeeId)

  if(error) {
    $.teach({ error })
  }
})

$.when('keyup', '[data-bind]', event => {
  const { name, value } = event.target;
  console.log(name, value)
  $.teach({ [name]: value })
})

export function getSession() {
  return state['ls/bayun'] || {}
}

export function clearSession() {
  state['ls/bayun'] = {}
}

function setSession({ sessionId, companyName, companyEmployeeId }) {
  state['ls/bayun'] = {
    sessionId,
    companyName,
    companyEmployeeId
  }
}

async function laugh(premise) {
  const {
    sessionId,
  } = getSession()

  return await bayunCore.unlockText(sessionId, premise);
}

const successCallback = async data => {
  const {
    companyName,
    companyEmployeeId,
  } = $.learn()

  const {
    sessionId,
    authenticationResponse,
    employeeAlreadyExists,
    securityQuestions
  } = data
  var lockedText = await bayunCore.lockText(sessionId, "Hello, Future World.");

  var unlockedText = await bayunCore.unlockText(sessionId, lockedText);
  $.teach({ authenticationResponse, employeeAlreadyExists, securityQuestions, lockedText, unlockedText })

  setSession({ sessionId, companyName, companyEmployeeId })

  connect()
};

connect()

function comedyPath() {
  const {
    companyName,
    companyEmployeeId
  } = getSession()

  return ['', companyName, companyEmployeeId, 'Comedy'].join('/')
}

async function connect() {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  if(!sessionId) return
  
  let { data: plan98_solo_text, error } = await supabase
  .from('plan98_solo_text')
  .select("*")
  // Filters
  .eq('companyName', companyName)
  .eq('companyEmployeeId', companyEmployeeId)
  .range(0, 25)

  plan98_solo_text.map(async (row) => {
    const setup = await bayunCore.unlockText(sessionId, row.setup)
    const punchline = await bayunCore.unlockText(sessionId, row.punchline)

    $.teach({ id: row.id, setup, punchline }, mergeJoke)
  })

  supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'plan98_solo_text' },
    async (payload) => {
      if (
        payload.new.companyName === companyName &&
        payload.new.companyEmployeeId === companyEmployeeId
      ) {
        const setup = await bayunCore.unlockText(sessionId, payload.new.setup)
        const punchline = await bayunCore.unlockText(sessionId, payload.new.punchline)
        console.log('Change detected:', payload)

        $.teach({ id: payload.new.id, setup, punchline }, mergeJoke)
      }

      if(payload.eventType === 'DELETE') {
        $.teach({ id: payload.old.id }, deleteJoke)
      }
    }
  )
  .subscribe()
}

function mergeJoke(state, payload) {
  return {
    ...state,
    jokes: {
      ...state.jokes,
      [payload.id]: { 
        punchline: payload.punchline,
        setup: payload.setup
      }
    }
  }
}

function deleteJoke(state, payload) {
  const newState = {
    ...state,
  }

  delete newState.jokes[payload.id]

  return newState
}


const failureCallback = error => {
  $.teach({ error: `${error}` })
};

$.when('submit', 'form', (event) => {
  event.preventDefault()
})

$.when('click', '[type="submit"]', (event) => {
  $.teach({ error: null })

  const {
    sessionId,
    companyName,
    companyEmployeeId,
    password,
    autoCreateEmployee
  } = $.learn()

  bayunCore.loginWithPassword(
      sessionId,
      companyName,
      companyEmployeeId,
      password,
      autoCreateEmployee,
      null, // TODO: @bayun, what is?
      noop.bind('securityQuestionsCallback'),
      noop.bind('passphraseCallback'),
      successCallback,
      failureCallback
  );
})

function noop(){}

function getLines(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(target).getPropertyValue('line-height'));
  canvas.height = rhythm;
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - (rhythm * .1), rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}

$.style(`
  & {
    display: block;
    height: 100%;
    width: 100%;
    background: lemonchiffon;
    color: saddlebrown;
    line-height: 3rem;
    position: relative;
  }

  & .page {
    background: rgba(255,255,255,.85);
    height: 100%;
  }

  & .actions button {
    background: saddlebrown;
    color: lemonchiffon;
    border-radius: 1rem;
    height: 2rem;
    line-height: 2rem;
    padding: 0 1rem;
    border: none;
  }

  & .setlist button {
    font-size: 2rem;
    line-height: 3rem;
    color: saddlebrown;
    border: none;
    padding: 0 1rem;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
  }

  & [name="login"] {
    max-width: 320px;
    margin: auto;
    inset: 0;
    position: absolute;
    aspect-ratio: 1;
  }
`)

import module, { state } from '@silly/tag'
import 'gun'
import { BayunCore } from '@sillonious/vault'
const gun = window.Gun(['https://gun.1998.social/gun']);

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const $ = module('comedy-notebook', {
  sessionId: '',
  companyName: 'sillyz.computer',
  companyEmployeeId: '',
  password: '',
  autoCreateEmployee: true,
  jokes: {}
})

$.draw((target) => {
  const { error, activePunchline, jokes } = $.learn()
  const { sessionId } = getSession()

  if(!sessionId) {
    return `
      <hypertext-variable monospace="0" casual="1" weight="400" slant="0" cursive="1">
        Comedy Notebook
      </hypertext-variable>
      <div class="error">
        ${error ? error : ''}
      </div>
      <form method="POST" action="loginWithPassword">
        <label class="field">
          <span class="label">Identity</span>
          <input data-bind type="email" name="companyEmployeeId" required/>
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
    `
  }

  if(activePunchline) {
    return `
      <div class="">
        ${activePunchline}
      </div>
      <button data-back>
        Back to all jokes
      </button>
    `
  }

  return `
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
      ${Object.keys(jokes).map((setup) => {
        return `
          <button data-setup="${setup}">
            <hypertext-variable monospace="0" slant="-15" casual="1" cursive="1" weight="200">
              ${setup}
            </hypertext-variable>
          </button>
        `
      }).join('')}
    </div>
  `
})

$.when('click', '[data-back]', () => {
  $.teach({ activeSetup: null })
})

$.when('click', '[data-setup]', async (event) => {
  const { setup } = event.target.dataset
  const { jokes } = $.learn()
  const joke = jokes[setup]
  $.teach({ activePunchline: await getPunchline(joke) })
})

$.when('click', '[data-logout]', async () => {
  clearSession()
})

$.when('click', '[data-new]', async () => {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()
  const setup = "have you ever been in line at self checkout?"
  const punchline = "like what, i have to do all the work myself?"

  const joke = await bayunCore.lockText(sessionId, punchline);
  gun.get(companyName).get(companyEmployeeId).get('Comedy').get(setup).put(joke)
})

$.when('click', '[data-clear]', async () => {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  const setup = "have you ever been in line at self checkout?"
  const punchline = "like what, i have to do all the work myself?"

  const joke = await bayunCore.lockText(sessionId, punchline);

  const comedy = gun.get(companyName).get(companyEmployeeId).get('Comedy')
  comedy.once((data) => {
    Object.keys(data).forEach((itemKey) => {
      // Delete each item from GunDB
      comedy.get(itemKey).put(null);
    });
    console.log('List cleared.');
  });
})

$.when('keyup', '[data-bind]', event => {
  const { name, value } = event.target;
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

async function getPunchline(setup) {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  const joke = gun.get(companyName).get(companyEmployeeId).get('Comedy').get(setup)
  return await bayunCore.unlockText(sessionId, joke);
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

function connect() {
  const {
    sessionId,
    companyName,
    companyEmployeeId
  } = getSession()

  if(!sessionId) return

  const comedy = gun.get(companyName).get(companyEmployeeId).get('Comedy')
  comedy.map().on((joke, setup) => {
    $.teach({ setup, joke }, mergeJoke)
  })
}

function mergeJoke(state, payload) {
  return {
    ...state,
    jokes: {
      ...state.jokes,
      [payload.setup]: payload.joke
    }
  }
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
      noop.bind('securityQuestionsCallback'),
      noop.bind('passphraseCallback'),
      successCallback,
      failureCallback
  );
})

function noop(){}

$.style(`
  & {
    display: block;
    height: 100%;
    background: lemonchiffon;
    color: saddlebrown;
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
    color: saddlebrown;
    border: none;
    padding: 1rem;
    background: none;
  }
`)

import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'
import { link as feedbackChannelLink } from './feedback-channel.js';
import { actionScript } from './action-script.js'
import { getUser } from './plan98-reconnect.js'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = 'wallet.saga'

const $ = module('plan98-wallet', {
  cache: {}
})
$.when('click', '.action-script', actionScript)

const accountKey = `ls/${$.link}/account`

const hashFunctions = {
  '#challenge': challenge
}

export function getList() {
  return state['ls/wallet-1998/list'] || []
}

export function challenge() {
  return 'provisioned.saga'
}

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || document.querySelector($.link) || target.closest('xml-html') || document.body
  const activeDialect = state['ls/xx-yy'] || 'en-us'
  const identifier = currentWorkingDirectory + '1998.social/' + activeDialect + '/'+nextSaga

  root.dataset.lastHtml = target.innerHTML
  fetch(raw+identifier)
    .then(async response => {
      if(response.status === 404) {
        target.innerHTML = target.dataset.lastHtml
        return
      }
      if(!root) window.location.href = identifier + window.location.search
      const saga = await response.text()

      $.teach(
        { [identifier]: saga },
        (state, payload) => {
          return {
            ...state,
            identifier,
            cache: {
              ...state.cache,
              ...payload
            }
          }
        }
      )
      showSaga(root, saga)
    })
    .catch(e => {
      console.error(e)
    })
}

function showSaga(root, saga) {
  schedule(() => {
    root.innerHTML = `
      <div class="siri">
        <div>
          <button data-history-back>
            back
          </button>
        </div>
        ${render(saga)}
      </div>
    `
  })
}

function createContext(actions) {
  const list = actions.map((data) => {
    const attributes = Object.keys(data).map(key => {
      return `data-${key}="${data[key]}"`
    }).join(' ')
    return `
      <div>
        <button class="action-script" ${attributes}>
          ${data.text}
        </button>
      </div>
    `
  }).join('')

  return `
    <div>
      <button data-close-context> 
        back
      </button>
    </div>
    ${list}
  `
}


$.when('click', '[data-history-back]', (event) => {
  if(event.target.closest('plan98-modal')) {
    hideModal()
  } else {
    history.back()
  }
})

async function mount(target) {
  if(target.mounted) return
  target.mounted = true
  const user = await getUser().catch(e => console.error(e))
  if(!user) {
    window.location.href = '/?world=sillyz.computer'
  }

  if(!user.error) {
    $.teach({ ...user })
  }
}

$.draw((target) => {
  mount(target)
  const { identifier, cache } = $.learn()

  const content = cache[identifier]

  let start = tutorial
  const hash = target.getAttribute('hash') || window.location.hash
  if(hashFunctions[hash]) {
    const result = hashFunctions[hash]()
    start = result ? result : start
  }
  if(!content) {
    setupSaga(start, target)
  }

  showSaga(target, content)
})

$.style(`
  & {
    display: block;
    background: black;
    color: rgba(255,255,255,.65);
    margin: auto;
    overflow: auto;
    position: relative;
    height: 100%;
    width: 100%;
  }

  & [data-back] {
    padding: 1rem;
    display: inline-block;
    text-decoration: none;
  }

  @media print {
    & [data-back] {
      display: none;
    }
  }

  & .paper {
    width: 100%;
    height: 100%;
  }

  & textarea {
    resize: none;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  &.active {
  }

  & .siri {
    display: flex;
    flex-direction: column;
    padding: 3rem 1rem;
    overflow: auto;
  }

  & .siri button {
    font-weight: 100;
    color: rgba(255,255,255,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    text-align: left;
  }

  & .siri button:hover,
  & .siri button:focus {
    color: rgba(255,255,255,1);
  }

  & .zune .tile {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  & .app-action {
    margin: 1rem 0;
    display: block;
  }

  & .siri [data-logout],
  & .siri [data-disconnect] {
    font-size: 1.5rem;
  }

`)

function schedule(x) { setTimeout(x, 1) }

/*
 * Bayun State Machine
 *
 * a saga is a view at a particular moment in time
 *
 * when determining the state of a patron's patronage, considerations:
 *
 */
export function getSession() {
  return state[accountKey] || {}
}

export function setActiveAccount(email) {
  state['ls/bayun'] = getSession()
}

export function clearSession() {
  state[accountKey] = {}
}

export function getFeedback() {
  return state[accountKey].feedback || []
}

export function softReset() {
  if(!state[accountKey]) {
    state[accountKey] = {}
  }
  state[accountKey].feedback = []
}

export function setError(error) {
  state[feedbackChannelLink].feedback = [
    { message: `${error}`, type: 'error'}
  ]
}

export function setErrors(errors) {
  state[feedbackChannelLink].feedback = errors.map((error) => {
    return { message: `${error}`, type: 'error'}
  })
}

/*
 *
 * companyName: the party to which they subscribe
 * <bayun-companies
 * */

export function identify(event) {
  if(!getCompanyName()) {
    setError('Select a company')
    return
  }
  setupSaga('identity.saga', event.target)
}

export function register(event) {
  if(!getEmployeeId()) {
    setError('enter an employee id')
    return
  }
  setupSaga('register.saga', event.target)
}

export function login(event) {
  if(!getEmployeeId()) {
    setError('Enter an employee Id')
    return
  }
  setupSaga('login.saga', event.target)
}

export function connected(event) {
  setupSaga('welcome.saga', event.target)
}

export function setSession({ sessionId, companyName, companyEmployeeId }) {
  state[accountKey] = {
    sessionId,
    companyName,
    companyEmployeeId
  }
}

export function setSessionId(x) {
  state[accountKey].sessionId = x
}
export function getSessionId() {
  return state[accountKey].sessionId
}

export function getCompanies() {
  return Object.keys(doingBusinessAs)
}

export function setEmail(x) {
  state[accountKey].email = x
}
export function getEmail() {
  return state[accountKey].email
}

export function setAuthenticatedAt(x) {
  state[accountKey].authenticatedAt = x.toISOString()
}
export function getAuthenticatedAt() {
  return state[accountKey].authenticatedAt
}

export function setCompanyName(x) {
  state[accountKey].companyName = x
}
export function getCompanyName() {
  return state[accountKey].companyName
}

export function setEmployeeId(x) {
  state[accountKey].companyEmployeeId = x
}
export function getEmployeeId() {
  return state[accountKey].companyEmployeeId
}


/*
 *
 * when unknown, the patron will accept the challenge question challenge.
 *
 * in turn, the system will say "Ask yourself a question that you will answer immediately following and also from now until eternity." five times, awaiting the question entry and answers
 *
 * after, they will be asked if they would like to authenticate again or skip for now
 *
 * if they skip, they will be admitted access to the rooms of the party as invited
 *
 * if they
 *
 *
 *
 * */

export function actuallySecure(event) {
  setupSaga('hard-start.saga', event.target)
}

export function begin(event) {
  setupSaga('hard-question0.saga', event.target)
}

export function save0(event) {
  setupSaga('hard-question1.saga', event.target)
}

export function kickTheTires(event) {
  setupSaga('soft-start.saga', event.target)
}

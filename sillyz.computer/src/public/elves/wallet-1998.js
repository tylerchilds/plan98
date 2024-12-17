import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'
import { link as feedbackChannelLink } from './feedback-channel.js';
import { getUser } from './plan98-reconnect.js'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = '000-000.saga'

const $ = module('wallet-1998', {
  cache: {}
})

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
  const key = currentWorkingDirectory + '1998.social/' + activeDialect + '/'+nextSaga

  root.dataset.lastHtml = target.innerHTML
  fetch(raw+key)
    .then(async response => {
      if(response.status === 404) {
        target.innerHTML = target.dataset.lastHtml
        return
      }
      if(!root) window.location.href = key + window.location.search
      const saga = await response.text()

      $.teach(
        { [key]: saga },
        (state, payload) => {
          return {
            ...state,
            key,
            cache: {
              ...state.cache,
              ...payload
            }
          }
        }
      )
      schedule(() => {
        root.innerHTML = `
          <div class="paper">
            <div class="wrapper screenplay">
              <a href="javascript:;" data-history-back>Back</a>
              ${render(saga)}
            </div>
          </div>
        `
      })
    })
    .catch(e => {
      console.error(e)
    })
}

$.when('click', '[data-history-back]', () => {
  history.back()
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
  const { key, cache } = $.learn()

  const content = cache[key]
  
  let start = tutorial
  if(hashFunctions[window.location.hash]) {
    const result = hashFunctions[window.location.hash]()
    start = result ? result : start
  }
  if(!content) {
    setupSaga(start, target)
  }
})

$.style(`
  & {
    display: grid;
    margin: auto;
    overflow: auto;
    position: relative;
    height: 100%;
    place-items: center;
    background: rgba(128,128,128,1);
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
    background: rgba(255,255,255,.85);
    width: 100%;
    height: 100%;
  }

  & textarea {
    resize: none;
  }

  & .wrapper {
    height: 100%;
    width: 100%;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.85);
    overflow: auto;
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

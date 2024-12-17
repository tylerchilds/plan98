import elf from '@silly/elf'
import { bayunCore } from '@sillonious/vault'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'
import * as focusTrap from 'focus-trap'
import { state } from 'statebus'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'

state['ls/bayun'] ||= {}
setCompanyName('sillyz.computer')
const tutorial = 'identity.saga'

const $ = elf('bayun-wizard', {
  activeDialect: '/en-us/',
  cache: {}
})

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || target.closest('main') || target.closest('body')
  const { activeDialect } = $.learn()
  const key = currentWorkingDirectory + 'bayunsystems.com' + activeDialect + nextSaga

  root.dataset.lastHtml = target.innerHTML
  root.innerHTML = `<a href="${key}">Loading...</a>`
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
        if(!root.trap) {
          root.trap = focusTrap.createFocusTrap(target, {
            onActivate: onActivate($, target),
            onDeactivate: onDeactivate($, target),
            clickOutsideDeactivates: false
          });
        }
        if(root.trap) {
          root.trap.activate()
          root.innerHTML = `
            <div class="wrapper">
              <div class="head">
                <div class="nonce" style="margin: 1rem auto;"></div>
              </div>
              <div class="body">
                ${render(saga)}
              </div>
            </div>
          `
        }
      })
    })
    .catch(e => {
      console.error(e)
    })
}

$.draw((target) => {
  const { key, cache } = $.learn()

  const content = cache[key]

  if(!content || !target.mounted) {
    target.mounted = true
    setupSaga(tutorial, target)
  }
})

$.style(`
  & {
    display: block;
    margin: auto;
    color: white;
    padding: .5rem;
    overflow: auto;
    position: relative;
    height: 100%;
  }

  & .head {
    text-align: center;
  }

  & .body {
    width: 960px;
    max-width: 100%;
  }

  & textarea {
    resize: none;
  }

  & .wrapper {
    width: 100%;
    margin: 1rem 0;
    margin: 1rem auto;
    max-width: 480px;
    background: rgba(255,255,255,1);
    color: rgba(0,0,0,.85);
    overflow: auto;
    border-radius: 0;
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

  & action-script button,
  & button {
    border-radius: 0;
  }

  & .progress {
    margin: 1rem auto;
    color: rgba(0,0,0,.5);
    text-align: right;
    position: relative;
    padding-bottom: 1rem;
  }

  & .progress::before {
    content: '';
    display: block;
    width: 100%;
    height: 1rem;
    background: rgba(0,0,0,.15);
    min-width: 1rem;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  & .progress::after {
    content: '';
    display: block;
    width: var(--progress, 0%);
    height: 1rem;
    background: gold;
    min-width: 1rem;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  & .button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
  }

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 0;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    width: 100%;
  }

  & button:focus,
  & button:hover {
    background-color: rebeccapurple;
  }



  & .field {
    border: 1px solid rgb(0,0,0,.15);
  }

  & .field input {
    border: none;
    border-radius: 0;
    background: white;
  }

  & .system-prompt {
    border: 1px solid gold;
    color: rgba(0,0,0,.85);
    margin: 0 0 1rem;
    padding: 1rem;
  }

  & .action-area {
    padding: 1rem 0;
  }
`)

function trapUntil($, target, terminator) {
  $.teach({ trapped: true })
  function loop(time) {
    let { trapped } = $.learn()
    try {
      if(terminator(party)) {
        trapped = false
        target.trap.deactivate()
      }
    } catch(reason) {
      const flavor = `the ${time} terminator failed`
      const source = `for ${terminator.toString()}`

      console.error(`${flavor} ${source} because`, reason)
    }
    if(trapped) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

function onActivate($, target){
  return () => {
    target.classList.add('active')
    //trapUntil($, target, anybodyPressesReset)
  }
}

function onDeactivate($, target) {
  return () => {
    $.teach({ trapped: false })
    target.classList.remove('active')
    target.remove()
  }
}

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
  return state['ls/bayun'] || {}
}

export function clearSession() {
  state['ls/bayun'] = {}
}

export function logout() {
  const sessionId = getSessionId()
  bayunCore.logout(sessionId)
  state['ls/bayun'] = {}
}


export function getFeedback() {
  return state['ls/bayun'].feedback || []
}

export function softReset() {
  if(!state['ls/bayun']) {
    state['ls/bayun'] = {}
  }
  state['ls/bayun'].feedback = []
}

export function setError(error) {
  state['ls/bayun'].feedback = [
    { message: `${error}`, type: 'error'}
  ]
}

export function setErrors(errors) {
  state['ls/bayun'].feedback = errors.map((error) => {
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
    seterror('enter an employee id')
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
  console.log('logged in good')
}

export function setSession({ sessionId, companyName, companyEmployeeId }) {
  state['ls/bayun'] = {
    sessionId,
    companyName,
    companyEmployeeId
  }
}

export function setSessionId(x) {
  state['ls/bayun'].sessionId = x
}
export function getSessionId() {
  return state['ls/bayun'].sessionId || {}
}

export function setEmail(x) {
  state['ls/bayun'].email = x
}

export function getEmail() {
  const fallback = getCompanyName() && getEmployeeId()
    ? getCompanyName() + '@'  +  getEmployeeId()
    : null
  return state['ls/bayun'].email || fallback
}
export function setCompanyName(x) {
  state['ls/bayun'].companyName = x
}
export function getCompanyName() {
  return state['ls/bayun'].companyName
}
export function getCompanies() {
  return Object.keys(doingBusinessAs)
}

export function setEmployeeId(x) {
  state['ls/bayun'].companyEmployeeId = x
}
export function getEmployeeId() {
  return state['ls/bayun'].companyEmployeeId
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
  setupSaga('identity.saga', event.target)
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

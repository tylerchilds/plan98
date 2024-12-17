import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = '000-000.saga'

const $ = module('potluck-wizard', {
  activeDialect: '/en-us/',
  cache: {}
})

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || target.closest('main') || target.closest('body')
  const { activeDialect } = $.learn()
  const key = currentWorkingDirectory + 'potluck.org' + activeDialect + nextSaga

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
        root.innerHTML = `
          <div class="wrapper">
            <img src="/cdn/potluck.org/potluck.svg" style="max-height: 8rem; margin: auto; display: block;" alt="" />
            ${render(saga)}
          </div>
        `
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
    display: grid;
    margin: auto;
    background: white;
    color: white;
    padding: .5rem;
    overflow: visible;
    position: relative;
    height: 100%;
    place-items: center;
  }

  & .wrapper {
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: auto;
    margin: 1rem auto;
    max-width: 480px;
    max-height: 100%;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.85);
    overflow: auto;
    border-radius: 1rem;
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

export function synthia(event) {
  if(!getEmployeeId()) {
    seterror('enter an employee id')
    return
  }
  setupSaga('synthia.saga', event.target)
}



/*
 *
 * companyEmployeeId: for storing secure documents
 * employee-pick.saga
 *
 * with these, a determination: to register or to log in?
 *
 * to log in, we'd first need to know if the patron exists
 */

const failureCallback = error => {
  setError(error)
};

/*
 *
 * when known, the patron will be prompted with five questions they declared at registration
 *
 * with knowledge, they with be admitted access to the rooms of the party as invited
 */

export function setSessionId(x) {
  state['ls/bayun'].sessionId = x
}
export function getSessionId() {
  return state['ls/bayun'].sessionId
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

export function welcome(event) {
  setupSaga('authenticate.saga', event.target)
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

import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'
import * as focusTrap from 'focus-trap'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = '000-000.saga'

const $ = module('camp-wizard', {
  cache: {}
})

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || target.closest('main') || target.closest('body')
  const dialect = plan98.parameters.get('dialect') || 'en-us'
  const key = `${currentWorkingDirectory}dwebcamp.org/${dialect}/${nextSaga}`
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
        root.innerHTML = `
          <div class="wrapper">
            ${render(saga)}
          </div>
        `
        root.trap.activate()
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
    padding: .5rem;
    overflow: visible;
    position: relative;
    height: 100%;
    place-items: center;
  }

  & textarea {
    resize: none;
  }

  & .wrapper > xml-html {
    height: 100%;
  }

  & .wrapper {
    height: 100%;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
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

export function connected(event) {
  setupSaga('welcome.saga', event.target)
}

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

export function start(event) {
  setupSaga('000-001.saga', event.target)
}

export function goToMap(event) {
  const dialect = plan98.parameters.get('dialect') || 'en-us'
  window.location.href = `/app/camp-map?dialect=${dialect}`
}

export function initiation(event) {
  setupSaga('initiation.saga', event.target)
}

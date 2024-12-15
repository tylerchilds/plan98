import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = 'origin-story.saga'

export function currentSave(event) {
  if(!state['ls/save-file']) blankSave(event)
  return state['ls/save-file']
}

export function quest(event) {
  setupSaga('000-000.saga', event.target)
}

export function learn(event) {
  setupSaga('learn.saga', event.target)
}

export function chaseEggs(event) {
  currentSave(event).chaosEmerald[0] = true
  setupSaga('000-001.saga', event.target)
}

export function fleeTentacles(event) {
  currentSave(event).chaosEmerald[1] = true
  setupSaga('001-001.saga', event.target)
}

export function yonderToTheDesert(event) {
  currentSave(event).chaosEmerald[2] = true
  setupSaga('002-001.saga', event.target)
}

export function hitherToTheMeadow(event) {
  currentSave(event).chaosEmerald[3] = true
  setupSaga('003-001.saga', event.target)
}

export function blueKazoo(event) {
  currentSave(event).chaosEmerald[4] = true
  setupSaga('004-001.saga', event.target)
}

export function indigoUmbrella(event) {
  currentSave(event).chaosEmerald[5] = true
  setupSaga('005-001.saga', event.target)
}

export function throneRoom(event) {
  setupSaga('999-999.saga', event.target)
}

export function takePaper(event) {
  currentSave(event).chaosEmerald[6] = true
  setupSaga('006-001.saga', event.target)
}

export function rewindTime(event) {
  setupSaga('000-000.saga', event.target)
}


export function blankSave(event) {
  state['ls/save-file'] = {
    chaosEmerald: [],
  }
}

if(plan98.parameters.get('dialect')) {
  localStorage.setItem('dialect', plan98.parameters.get('dialect'))
}

const dialect = localStorage.getItem('dialect') || 'en-us'

const $ = module('silly-wizard', {
  activeDialect: dialect,
  cache: {}
})

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || target.closest('xml-html') || document.body

  if(!root) return
  const { activeDialect } = $.learn()
  const key = currentWorkingDirectory + 'sillyz.computer' + '/' + activeDialect + '/' + nextSaga
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
    padding: .5rem;
    overflow: visible;
    position: relative;
    height: 100%;
    place-items: center;
  }

  & textarea {
    resize: none;
  }

  & .wrapper {
    height: 100%;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 1rem auto;
    padding: 0 1rem;
    max-width: 55ch;
    background: rgba(255,255,255,.85);
    color: rgba(0,0,0,.85);
    overflow: auto;
    border-radius: 1rem;
    position: relative;
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

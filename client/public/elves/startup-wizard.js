import module from '@silly/tag'
import { render } from '@sillonious/saga'
import { doingBusinessAs } from '@sillonious/brand'

const raw = '/public'
const currentWorkingDirectory = '/sagas/'
const tutorial = 'index.saga'

export function openMemex(event) {
  setupSaga('memex.saga', event.target)
}

export function skipClass(event) {
  window.location.href = '/app/silly-wizard'
}


export function goToCodeSpace(event) {
  setupSaga('code-space.saga', event.target)
}

export function goSomeWhereElse(event) {
  window.location.href = '/?world=' + state['ls/companyName']
}

export function start(event) {
  setupSaga('000-000.saga', event.target)
}

export function go_000_001(event) {
  setupSaga('000-001.saga', event.target)
}

export function go_000_002(event) {
  setupSaga('000-002.saga', event.target)
}

export function go_000_003(event) {
  setupSaga('000-003.saga', event.target)
}

export function go_000_004(event) {
  setupSaga('000-004.saga', event.target)
}

export function go_000_005(event) {
  setupSaga('000-005.saga', event.target)
}

export function go_000_006(event) {
  setupSaga('000-006.saga', event.target)
}

export function go_000_007(event) {
  setupSaga('000-007.saga', event.target)
}

export function go_000_008(event) {
  setupSaga('000-008.saga', event.target)
}

export function go_000_009(event) {
  setupSaga('000-009.saga', event.target)
}

export function go_001_000(event) {
  window.location.href = '/app/my-journal'
}


export function blankSave(event) {
  state['ls/save-file'] = {
    chaosEmerald: [],
  }
}

const $ = module('startup-wizard', {
  cache: {}
})

export function setupSaga(nextSaga, target, options={}) {
  softReset()
  const root = target === self
    ? document.querySelector($.link)
    : target.closest($.link) || document.querySelector($.link) || target.closest('xml-html') || document.body

  if(!root) return
  const activeDialect = state['ls/xx-yy'] || 'en-us'
  const key = currentWorkingDirectory + 'y2k38.info/' + activeDialect +'/'+ nextSaga
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
          <div class="desktop">
            <div class="paper screenplay">
              <a href="javascript:history.back();" data-back>Back</a>
              <a href="/app/hyper-script?src=${raw+key}">Edit</a>
              <plan98-hero></plan98-hero>
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

$.when('click', '[data-back]', () => {
  history.back()
})

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
    overflow: auto;
    position: relative;
    height: 100%;
    place-items: center;
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

  & .desktop {
    background: #54796d;
    width: 100%;
    height: 100%;
  }

  & textarea {
    resize: none;
  }

  & .paper {
    height: 100%;
    width: 100%;
    background: white;
    color: black);
    overflow: auto;
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

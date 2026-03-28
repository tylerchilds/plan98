import '/public/cdn/bayunsystems.com/BayunCoreSDK/lib/bayun-sandbox.js'
import '/public/cdn/bayunsystems.com/BayunCoreSDK/lib/vishwam-lib.js'

import { Self } from '@plan98/types'
import { state } from 'statebus'
import { popover } from './data-popover.js'
import {
  provisionActiveKeycard,
  getKeycard,
  listKeycards,
  getStorage,
  getSigner,
  get,
  del,
  put,
  touch,
  KEYCARD_TYPES,
  requestKeycardInsertion,
  requestKeycardDeletion,
  requestKeycardPaste
} from './plan98-wallet.js'

state['ls/bayun'] ||= {}

export const BayunCore = window.BayunCore

const bayunAppId = plan98.env.PLAN98_APP_ID; // provided on admin panel
const bayunAppSecret = plan98.env.PLAN98_APP_SECRET; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.PLAN98_BASE_URL; // provided on admin panel
const bayunServerPublicKey = plan98.env.PLAN98_PUBLIC_KEY; // provided on admin panel

const requirementsMet = bayunAppId && bayunAppSecret && baseURL && bayunServerPublicKey

export const bayunCore = initBayunCore()

function initBayunCore() {
  if(requirementsMet) {
    const bayunCore = BayunCore.init({
      bayunAppId,
      bayunAppSecret,
      localDataEncryptionMode: localStorageMode,
      baseURL,
      bayunServerPublicKey,
      enableFaceRecognition
    });

    console.log("Instantiated BayunCore object", { bayunCore });

    return bayunCore
  } else {
    console.log("Missing Bayun Dependencies");
    return null
  }
}

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
  clearSession()
  return 'Disconnected successfully.'
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

export function setSessionId(x) {
  state['ls/bayun'].sessionId = x
}
export function getSessionId() {
  return state['ls/bayun'].sessionId || null
}

export function setOrgName(x) {
  state['ls/bayun'].org = x
}
export function getOrgName() {
  return state['ls/bayun'].org
}

export function setMemberId(x) {
  state['ls/bayun'].memberId = x
}
export function getMemberId() {
  return state['ls/bayun'].memberId
}



const organization = 'sillyz.computer'

const baseQandA = {
  question1: 'pass hint 1',
  question2: 'pass hint 2',
  question3: 'pass hint 3',
  question4: 'pass hint 4',
  question5: 'pass hint 5',
  answer1: '',
  answer2: '',
  answer3: '',
  answer4: '',
  answer5: '',
}

export const $ = Self('cyber-security', {
  ...baseQandA,
  persona: {},
  step: 0,
  user: {}
})

export function whoami() {
  const { sessionId } = getSession()
  if(sessionId) {
    return `${getMemberId()}@${getOrgName()}`
  } else {
    return null
  }
}

export async function friends(data, wishbacks) {
  await __ready()
  const { persona } = $.learn()
  if(persona) {
    return persona.followers.map(x => {
      return `${x.moniker}@${x.organization}`
    }).join('<br>')
  } else {
    return 'Login with me'
  }
}

const MAX_ATTEMPTS = 3
const authSingleton = {
  attempts: 0,
  mode: 'moniker',
  questionIndex: 0,
  questions: [],
  answers: [],
  setupQA: [],
  sessionId: null,
  isNewUser: false
}

function resetAuthSingleton() {
  authSingleton.attempts = 0
  authSingleton.mode = 'moniker'
  authSingleton.questionIndex = 0
  authSingleton.questions = []
  authSingleton.answers = []
  authSingleton.setupQA = []
  authSingleton.sessionId = null
  authSingleton.isNewUser = false
}

function completeAuth(sessionId, wishbacks, message = 'You are now authenticated.') {
  setSessionId(sessionId)
  authSingleton.mode = 'done'
  wishbacks.normalMode()
  return message
}

function failAuth(wishbacks, message = 'Too many failed attempts. Please try again later.') {
  resetAuthSingleton()
  wishbacks.normalMode()
  return message
}

function retryAuth(error) {
  authSingleton.mode = 'moniker'
  return `${error}. Let's start over. What is your moniker?`
}

export async function auth(data, wishbacks) {
  if (!data) {
    resetAuthSingleton()
    return 'What is your moniker?'
  }

  if (authSingleton.mode === 'moniker') {
    setOrgName(organization)
    setMemberId(data)
    authSingleton.mode = 'checking'

    return new Promise((resolve) => {
      bayunCore.loginWithoutPassword(
        '',
        organization,
        data,
        (callbackData) => {
          if (callbackData.sessionId &&
              callbackData.authenticationResponse === BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS) {
            authSingleton.sessionId = callbackData.sessionId
            authSingleton.isNewUser = false
            authSingleton.questions = callbackData.securityQuestions
            authSingleton.mode = 'answer-question'
            authSingleton.questionIndex = 0
            wishbacks.enableSecureMode()
            resolve(`${authSingleton.questions[0].questionText}?`)
          }
        },
        null,
        (successData) => {
          if (successData.sessionId) {
            resolve(completeAuth(successData.sessionId, wishbacks, 'Welcome back! You are now authenticated.'))
          }
        },
        (error) => {
          if (error === "BayunErrorEmployeeDoesNotExist") {
            authSingleton.isNewUser = true
            authSingleton.mode = 'setup-question'
            authSingleton.questionIndex = 0
            resolve("Enter security question 1:")
          } else {
            resolve(retryAuth(`Error: ${error}`))
          }
        }
      )
    })
  }

  if (authSingleton.mode === 'setup-question') {
    authSingleton.setupQA[authSingleton.questionIndex] = { question: data, answer: '' }
    authSingleton.mode = 'setup-answer'
    wishbacks.enableSecureMode()
    return `${data}?`
  }

  if (authSingleton.mode === 'setup-answer') {
    authSingleton.setupQA[authSingleton.questionIndex].answer = data
    authSingleton.questionIndex++
    wishbacks.disableSecureMode()

    if (authSingleton.questionIndex < 5) {
      authSingleton.mode = 'setup-question'
      return `Enter security question ${authSingleton.questionIndex + 1}:`
    }

    authSingleton.mode = 'registering'
    return new Promise((resolve) => {
      const handleSuccess = (sessionId) => resolve(completeAuth(sessionId, wishbacks, 'Account created successfully! You are now authenticated.'))
      const handleValidation = (sqData) => {
        authSingleton.sessionId = sqData.sessionId
        bayunCore.validateSecurityQuestions(
          sqData.sessionId,
          authSingleton.setupQA.map((qa, i) => ({ questionId: String(i + 1), answer: qa.answer })),
          () => {},
          (successData) => handleSuccess(successData.sessionId),
          (error) => resolve(`Validation failed: ${error}`)
        )
      }

      bayunCore.registerEmployeeWithoutPassword(
        '',
        organization,
        getMemberId(),
        `${getMemberId()}@${organization}`,
        true,
        (authData) => {
          if (authData.authenticationResponse === BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING) {
            resolve('Authorization pending. Please contact your admin.')
          }
        },
        (credData) => {
          if (credData.sessionId) {
            authSingleton.sessionId = credData.sessionId
            bayunCore.setNewUserCredentials(
              credData.sessionId,
              authSingleton.setupQA,
              null,
              false,
              () => {},
              (successData) => handleSuccess(successData.sessionId),
              (error) => resolve(retryAuth(`Setup failed: ${error}`))
            )
          }
        },
        (sqData) => {
          if (sqData.authenticationResponse === BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS) {
            handleValidation(sqData)
          }
        },
        null,
        (successData) => {
          if (successData.sessionId) handleSuccess(successData.sessionId)
        },
        (error) => resolve(retryAuth(`Registration failed: ${error}`))
      )
    })
  }

  if (authSingleton.mode === 'answer-question') {
    authSingleton.answers.push({
      questionId: authSingleton.questions[authSingleton.questionIndex].questionId,
      answer: data
    })
    authSingleton.questionIndex++

    if (authSingleton.questionIndex < authSingleton.questions.length) {
      const nextQuestion = authSingleton.questions[authSingleton.questionIndex]
      return `${nextQuestion.questionText}?`
    }

    authSingleton.mode = 'validating'
    wishbacks.disableSecureMode()

    await new Promise(resolve => setTimeout(resolve, 100))

    return new Promise((resolve) => {
      bayunCore.validateSecurityQuestions(
        authSingleton.sessionId,
        authSingleton.answers,
        null,
        (successData) => {
          if (successData.sessionId) {
            resolve(completeAuth(successData.sessionId, wishbacks, 'Welcome back! You are now authenticated.'))
          }
        },
        (error) => {
          authSingleton.attempts++
          if (authSingleton.attempts >= MAX_ATTEMPTS) {
            return resolve(failAuth(wishbacks))
          }
          authSingleton.answers = []
          authSingleton.questionIndex = 0
          authSingleton.mode = 'answer-question'
          wishbacks.enableSecureMode()
          resolve(`Incorrect answers. Let's try again.\n\n${authSingleton.questions[0].questionText}?`)
        }
      )
    })
  }

  if (authSingleton.mode === 'done') {
    wishbacks.normalMode()
    return 'You are already authenticated.'
  }

  return data
}

export async function provisionPersonaKeycard(options={}) {
  const { sessionId, companyEmployeeId, companyName } = getSession()

  if(!sessionId) {
    throw new Error('No active session. Please authenticate first.')
  }

  try {
    await provisionActiveKeycard({
      title: 'Persona',
      logoUrl: '/public/cdn/sillyz.computer/default-picture.png',
      description: 'Secure social graph',
      ...options,
      companyEmployeeId,
      companyName,
      type: KEYCARD_TYPES.PERSONA,
    })
  } catch(e) {
    throw new Error(`Failed to create local keycard: ${e.message || e}`)
  }

  let group
  try {
    const groupType = BayunCore.GroupType.PRIVATE;
    group = await bayunCore.createGroup(sessionId, `${companyEmployeeId}@${companyName}:friends`, groupType)
  } catch(e) {
    throw new Error(`Failed to create secure group: ${e.message || e}`)
  }

  try {
    await putPersona({
      profileURL: null,
      bannerURL: null,
      moniker: companyEmployeeId,
      organization: companyName,
      groupId: group.groupId,
      groupKey: group.groupKey,
      followers: [],
      following: []
    })
  } catch(e) {
    throw new Error(`Failed to save persona: ${e.message || e}`)
  }
}

export function persona() {
  return $.learn().persona
}

async function updatePersona(payload, mergeHandler=(s,p) => ({...s,...p})) {
  const persona = await getPersona()
  const data = mergeHandler(persona, payload)
  $.teach({ persona: data })
  return await putPersona(data)
}

export async function putPersona(persona) {
  const { companyEmployeeId, companyName } = getSession()
  const personaKeycard = listKeycards().find(x => {

    return x.companyName === companyName && x.companyEmployeeId === companyEmployeeId
  })

  if(!personaKeycard) return

  const keycard = getKeycard(personaKeycard.id)

  const signer = await getSigner(keycard)
  const storage = getStorage(keycard)

  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })

  const config = space.resource('/.plan98/persona.json')
  const blobForConfig = new Blob([JSON.stringify(persona)], { type: 'application/json' })
  return await config.put(blobForConfig, { signer })
    .then(res => {
      console.debug({ res })
      return res
    })
}

export async function getPersona() {
  const { companyEmployeeId, companyName } = getSession()
  const personaKeycard = listKeycards().find(x => {

    return x.companyName === companyName && x.companyEmployeeId === companyEmployeeId
  })

  if(!personaKeycard) return

  const keycard = getKeycard(personaKeycard.id)

  const signer = await getSigner(keycard)
  const storage = getStorage(keycard)

  const space = storage.space({
    signer,
    id: `urn:uuid:${keycard.id}`
  })


  const config = space.resource('/.plan98/persona.json')

  return await config.get({ signer })
    .then(async res => {
      if(res.status === 404) {
        throw new Error('Persona Not Found')
      }
      return await res.json()
    })
}

export async function addFollow(moniker, organization) {
  const { persona } = $.learn()

  let error = false
  if(persona.groupId) {
    const { sessionId } = getSession()
    const result = await bayunCore.addParticipantToGroup(
      sessionId,
      persona.groupId,
      moniker,
      organization
    ).catch(e => {
      error = true
      console.error(e)
    })
    if(!error) {
      await updatePersona(
        { moniker, organization },
        function (state, payload) {
          const followers = [...state.followers].map(x => {
            if(x.moniker === moniker && x.organization === organization) {
              x.approved = true
            }
            return x
          })

          const exists = followers.find(x => {
            return x.moniker === moniker && x.organization === organization
          })

          if(!exists) {
            followers.push({
              ...payload,
              approved: true
            })
          }

          return {
            ...state,
            followers
          }
        }
      )
    }
  }
}

export async function blockFollow(moniker, organization) {
  const { persona } = $.learn()

  let error = false
  if(persona.groupId) {
    const { sessionId } = getSession()
    const result = bayunCore.removeParticipantFromGroup(
      sessionId,
      persona.groupId,
      moniker,
      organization
    ).catch(e => {
      error = true
      console.error(e)
    })

    if(!error) {
      await updatePersona(
        { moniker, organization },
        function (state, payload) {
          const followers = [...state.followers].map(x => {
            if(x.moniker === moniker && x.organization === organization) {
              x.approved = false 
            }
            return x
          })

          const exists = followers.find(x => {
            return x.moniker === moniker && x.organization === organization
          })

          if(!exists) {
            followers.push({
              ...payload,
              approved: false
            })
          }

          return {
            ...state,
            followers
          }
        }
      )
    }
  }
}

const modes = {
  error: function error(target) {
    return `
      <div class="wizard">
        <div class="form-title">
          Session Error
        </div>
        <div class="form-description">
          There was an error linking your persona, press retry to try again.
        </div>

        <div>
          <button class="standard-button -bias-negative persona-deactivate" data-action="handleSessionEnd">
            <span style="display: grid; place-content: center;">
              <sl-icon name="emoji-frown"></sl-icon>
            </span>
            Retry
          </button>
        </div>
      </div>
    `
  },
  onboard: function intake(target) {
    return `
      <div class="wizard">
        <div class="persona-form">
          <div class="form-title">
            Activate Persona
          </div>

          <div class="form-description">
            Your persona is your secure callsign for encrypting data with <strong>${organization}</strong>.
          </div>
          <div>
            <bayun-feedback></bayun-feedback>
          </div>
          <form method="POST" name="insert">
            <label class="field">
              <span class="label">Persona</span>
              <input type="text" name="account" required/>
            </label>
            <button class="standard-button bias-positive" type="submit">
              Activate
            </button>
          </form>
        </div>
      </div>
    `
  },
  provision: function provisionMode(target) {
    const {
      question1,
      answer1,
      question2,
      answer2,
      question3,
      answer3,
      question4,
      answer4,
      question5,
      answer5,
    } = $.learn()

    const persona = getMemberId()
    const organization = getOrgName()
    return `
      <div class="wizard">
        <div class="persona-form">
          <div class="form-title">
            Create Credentials
          </div>

          <div class="form-description">
            To establish credentials for <strong>${persona}@${organization}</strong>, please customize the questionnaire below.
          </div>
          <div>
            <bayun-feedback></bayun-feedback>
          </div>
          <form method="POST" name="provision">
            <label class="field">
              <span class="label -as-input">
                <input class="name-pair" name="question1" value="${question1}"/>
              </span>
              <input type="password" class="name-pair" name="answer1" value="${answer1}"/>
            </label>
            <label class="field">
              <span class="label -as-input">
                <input class="name-pair" name="question2" value="${question2}"/>
              </span>
              <input type="password" class="name-pair" name="answer2" value="${answer2}"/>
            </label>
            <label class="field">
              <span class="label -as-input">
                <input class="name-pair" name="question3" value="${question3}"/>
              </span>
              <input type="password" class="name-pair" name="answer3" value="${answer3}"/>
            </label>
            <label class="field">
              <span class="label -as-input">
                <input class="name-pair" name="question4" value="${question4}"/>
              </span>
              <input type="password" class="name-pair" name="answer4" value="${answer4}"/>
            </label>
            <label class="field">
              <span class="label -as-input">
                <input class="name-pair" name="question5" value="${question5}"/>
              </span>
              <input type="password" class="name-pair" name="answer5" value="${answer5}"/>
            </label>
            <button class="standard-button bias-positive" type="submit">
              Provision
            </button>
          </form>
        </div>
      </div>
    `
  },
  challenge: function challengeMode(target) {
    const {
      questions,
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
    } = $.learn()

    const companyEmployeeId = getMemberId()
    const companyName = getOrgName()
    return `
      <div class="wizard">
        <div key="challenge" class="persona-form">
          <div class="form-title">
            Answer Challenge
          </div>

          <div class="form-description">
            Correctly provide answers for the questions below to begin the secure session for <strong>${companyEmployeeId}@${companyName}</strong>
          </div>
          <div>
            <bayun-feedback></bayun-feedback>
          </div>

          <form method="POST" name="validate">
            <label class="field">
              <span class="label">${questions[1]}</span>
              <input type="password" class="name-pair" name="answer1" value="${answer1}"/>
            </label>
            <label class="field">
              <span class="label">${questions[2]}</span>
              <input type="password" class="name-pair" name="answer2" value="${answer2}"/>
            </label>
            <label class="field">
              <span class="label">${questions[3]}</span>
              <input type="password" class="name-pair" name="answer3" value="${answer3}"/>
            </label>
            <label class="field">
              <span class="label">${questions[4]}</span>
              <input type="password" class="name-pair" name="answer4" value="${answer4}"/>
            </label>
            <label class="field">
              <span class="label">${questions[5]}</span>
              <input type="password" class="name-pair" name="answer5" value="${answer5}"/>
            </label>
            <button class="standard-button bias-positive" type="submit">
              Validate
            </button>
          </form>
        </div>
      </div>
    `
  },
  authenticated: function authenticated(target) {
    const companyEmployeeId = getMemberId()
    const companyName = getOrgName()
    const { persona } = $.learn()

    return `
      <div class="wizard">
        <div>
          ${persona.bannerURL ? `
            <button data-pick="bannerURL" class="nothing">
              <was-image class="nothing" src="${persona.bannerURL}"></was-image>
            </button>
          ` : `
            <button data-pick="bannerURL">Add Banner</button>
          `}
        </div>
        <div class="form-title">
          Connected
          <span style="display: inline-grid; place-content: center;">
            <button class="standard-button -small -round bias-generic" data-action="handleSessionEnd">
              <sl-icon name="cloud-slash"></sl-icon>
            </button>
          </span>
        </div>
        <div>
          ${persona.profileURL ? `
            <button class="nothing" data-pick="profileURL">
              <was-image src="${persona.profileURL}"></was-image>
            </button>
          ` : `
            <button data-pick="profileURL">Add Profile</button>
          `}
        </div>
        <div class="form-description">
          Persona: <strong>${companyEmployeeId}</strong><br/>
          Provider: <strong>${companyName}</strong><br/>
        </div>

        <div>
          <secure-followers></secure-followers>
        </div>
      </div>
    `
  },
  loading: function loading(target) {
    return `
      <div class="wizard">
        <div key="loader" class="persona-bar">
          <flying-disk></flying-disk>
        </div>
      </div>
    `
  },
  gallery: function gallery(target) {
    return `
      <plan98-gallery mode="picker" limit="1" enforceTypes="computer.sillyz.data.image"></plan98-gallery>
    `
  }
}

$.when('click', '[data-action="handleSessionEnd"]', (event) => {
  handleSessionEnd()
  connect()
})

export function handleSessionStart(event, root) {
  popover()
  connect()
}

export function handleSessionEnd(event, root) {
  $.teach({ data: null })
  clearSession()
  broadcastPersonaDeactivated()
}

export function handleProfileGo(event, root) {
  popover()
  self.location.href = '/app/hive-profile'
}

export function handleLogout(event, root) {
  popover()
}

$.when('submit', '[name="insert"]', async (event) => {
  event.preventDefault()

  const data = {
    persona: event.target.account.value,
    organization,
  }

  setMemberId(data.persona)
  setOrgName(data.organization)

  $.teach({ data })
  start()
})

function mount(target) {
  if(target.mounted) return
  setError('')
  target.innerHTML = ''
  target.mounted = true

  schedule(() => {
    init()
    if(getSessionId()) {
      broadcastPersonaActivated()
    }
  })
}

export function __ready() {
  return new Promise((resolve, reject) => {
    // wait 30 seconds
    const timeout = setTimeout(() => {
      reject('timeout exceeded')
    }, 1000 * 30)

    function poll() {
      const { ready } = $.learn()
      if(ready) {
        resolve()
      }
      requestAnimationFrame(poll)
    }

    poll()
  })
}

function init() {
  const sessionId = getSessionId()

  if(!sessionId) {
    connect()
    $.teach({ ready: true })
    return
  }

  $.teach({ ...baseQandA, mode: 'authenticated' })
  broadcastPersonaActivated()

  getPersona().then(persona => {
    $.teach({ persona, ready: true })
  })
}

function broadcastPersonaActivated() {
  [...document.querySelectorAll($.link)].map((x) => {
    x.dispatchEvent(new Event('activated'))
  })
}

function broadcastPersonaDeactivated() {
  [...document.querySelectorAll($.link)].map((x) => {
    x.dispatchEvent(new Event('deactivated'))
  })
}

async function connect() {
  const { data } = $.learn()
  $.teach({ mode: 'loading'  })

  if(!data) {
    $.teach({ mode: 'onboard' })
    return
  }

  setMemberId(data.persona)
  setOrgName(data.organization)

  $.teach({ data })

  const sessionId = getSessionId()

  if(!sessionId) {
    start()
    return
  }

  $.teach({ ...baseQandA, mode: 'authenticated' })
  broadcastPersonaActivated()
}

$.draw((target) => {
  mount(target)
  const { mode, user, lastUpdate } = $.learn()

  if(modes[mode]) {
    return `
      <div${mode}>
        ${modes[mode](target)}
      </div${mode}>
    `
  }
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
}

function afterUpdate(target) {
  {
    recoverElves(target, 'bayun-feedback')
    recoverElves(target, 'was-image')
    recoverElves(target, 'sl-icon')
    recoverElves(target, 'flying-disk')
    recoverElves(target, 'secure-followers')
  }
}

function schedule(x) { setTimeout(x, 1) }

$.when('input', '.name-pair', (event) => {
  const field = event.target
  $.teach({ [field.name]: field.value })
})

const securityQuestionsCallback = data => {
  if (data.sessionId) {
    if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS){
      let securityQuestionsArray = data.securityQuestions;
      //securityQuestionsArray is a list of Security Question Objects with questionId, questionText 
      // Iterate through securityQuestionsArray
      // debugger

      const questions = {}
      securityQuestionsArray.forEach(val=>{
        questions[val.questionId] = val.questionText
      });

      $.teach({
        sessionId: data.sessionId,
        questions,
        mode: 'challenge'
      })
      //Show custom UI to take user input for the answers.
      //Call validateSecurityQuestions function with the user provided answers.
    }
  }
}

$.when('submit', '[name="provision"]', (event) => {
  event.preventDefault()
  provision(event) 
})

$.when('submit', '[name="validate"]', (event) => {
  event.preventDefault()
  validate(event) 
})

function start(event) {
  const companyEmployeeId = getMemberId()
  const companyName = getOrgName()
  const prerequirements = !!companyName && !!companyEmployeeId

  if(prerequirements) {
    const successCallback = data => {
      if (data.sessionId) {
        setSessionId(data.sessionId)
        //LoggedIn Successfully
        $.teach({
          ...baseQandA,
          mode: 'authenticated'
        })
        broadcastPersonaActivated()
      }
    };

    const failureCallback = error => {
      if(error === "BayunErrorEmployeeDoesNotExist") {
        provision()
      }
    };

    $.teach({ mode: 'loading'  })

    schedule(() => {
      bayunCore.loginWithoutPassword(
        '', //sessionId,
        companyName,
        companyEmployeeId,
        securityQuestionsCallback,
        null, //passphraseCallback,
        successCallback,
        failureCallback
      );
    })
  } else {
    setError('Missing information.')
    $.teach({ mode: 'onboard'  })
  }
}

function securityQuestionsAnswersActivation() {
  const {
    answer1,
    answer2,
    answer3,
    answer4,
    answer5,
  } = $.learn()

  //Take User Input for Security Questions and Answers
  //Here securityQuestionsAnswers object is created just for reference
  const qa=[];
  qa.push({
    questionId: '1',
    answer: answer1
  });

  qa.push({
    questionId: '2',
    answer: answer2
  });

  qa.push({
    questionId: '3',
    answer: answer3
  });

  qa.push({
    questionId: '4',
    answer: answer4
  });

  qa.push({
    questionId: '5',
    answer: answer5
  });

  return qa
}

function validate(event) {
  const { sessionId } = $.learn()

  $.teach({ mode: 'loading'  })

  const successCallback = data => {
    if (data.sessionId) {
      setSessionId(data.sessionId)
      $.teach({
        ...baseQandA,
        mode: 'authenticated'
      })
      broadcastPersonaActivated()
    }
  };

  const failureCallback = error => {
    setError(error)
    $.teach({ mode: 'challenge'  })
  };

  bayunCore.validateSecurityQuestions(
    sessionId,
    securityQuestionsAnswersActivation(),
    null,
    successCallback,
    failureCallback
  );
}

function authorizeEmployee(event) {
  return function authorizeEmployeeCallback(data){
    if (data.sessionId) {
      if (data.authenticationResponse == BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING) {
        // You can get employeePublicKey in data.employeePublicKey for it's authorization
      }
    }
  };
}

function newUserCredentials(event) {
  return function newUserCredentialsCallback(data) {
    if (data.sessionId){
      const successCallback = data => {
        setSessionId(data.sessionId)
        $.teach({
          ...baseQandA,
          mode: 'authenticated'
        })
        broadcastPersonaActivated()
      };

      const failureCallback = error => {
        //setError(error)
        $.teach({ mode: 'provision'  })
      };

      // Take user Input for optional registerFaceId
      const registerFaceId=false;

      bayunCore.setNewUserCredentials(
        data.sessionId,
        securityQuestionsAnswersSetup(),
        null, //passphrase,
        registerFaceId,
        authorizeEmployee(event),
        successCallback,
        failureCallback
      );
    }
  }
}

function securityQuestionsAnswersSetup() {
  const {
    question1,
    answer1,
    question2,
    answer2,
    question3,
    answer3,
    question4,
    answer4,
    question5,
    answer5,
  } = $.learn()

  //Take User Input for Security Questions and Answers
  //Here securityQuestionsAnswers object is created just for reference
  const qa=[];
  qa.push({
    question: question1,
    answer: answer1
  });

  qa.push({
    question: question2,
    answer: answer2
  });

  qa.push({
    question: question3,
    answer: answer3
  });

  qa.push({
    question: question4,
    answer: answer4
  });

  qa.push({
    question: question5,
    answer: answer5
  });

  return qa
}

function securityQuestions(event) {
  return function securityQuestionsCallback(data) {
    if (data.sessionId) {
      if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS){

        // we can get the questions from data.securityQuestions,
        // but we already have the first pass in memory
        // data.securityQuestions;

        const successCallback = data => {
          //Security Questions' Answers validated and registered employee successfully.
          //Login to continue.
          login(event)
        };

        const failureCallback = error => {
          console.error(error)
          //setError(error)
          $.teach({ mode: 'provision'  })
        };

        bayunCore.validateSecurityQuestions(
          data.sessionId,
          securityQuestionsAnswersActivation(),
          authorizeEmployee(event),
          successCallback,
          failureCallback
        );
      }
    }
  };
}

async function provision(event) {
  $.teach({
    mode: 'provision',
  })

  const companyEmployeeId = getMemberId()
  const companyName = getOrgName()
  const prerequirements = !!companyName && !!companyEmployeeId

  if(prerequirements) {
    const successCallback = data => {
      validate(event)
    };

    const failureCallback = error => {
      //setError(error)
      $.teach({
        mode: 'provision',
      })
    };

    $.teach({ mode: 'loading'  })

    bayunCore.registerEmployeeWithoutPassword(
      '', //sessionId,
      companyName,
      companyEmployeeId,
      `${companyEmployeeId}@${companyName}`,
      true, //isCompanyOwnedEmail,
      authorizeEmployee(event),
      newUserCredentials(event),
      securityQuestions(event),
      null, //passphraseCallback,
      successCallback,
      failureCallback
    );
  } else {
    setError('Missing Information.')
    $.teach({ mode: 'challenge'  })
  }
}

$.style(`
  & {
    display: block;
    height: 100%;
    position: relative;
    z-index: 2;
    background: white;
    color: rgba(0,0,0,.85);
  }
  
  & .persona-bar {
    display: block;
    margin: 3rem 0;
  }

  & .persona-status {
    background: dodgerblue;
    color: white;
    padding: .5rem;
  }

  & .persona-form {
    max-width: 55ch;
    margin: 0 auto;
  }

  & .persona-form form {
    max-width: 320px;
    margin: 0 auto;
  }

  & .persona-form .label.-as-input {
    padding: 0;
  }

  & .persona-form .label.-as-input input {
    border: 0;
    margin-bottom: 3px;
  }

  & hr {
    border: 0;
    border-bottom: 1px solid rgba(0,0,0,.1);
  }

  & .password-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  & .button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
  }

  & .progress {
    width: var(--progress, 0%);
    height: 1rem;
    margin: 1rem auto;
    border-radius: 1rem;
    background: linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.35)), lime;
    min-width: 1rem;
  }

  & .identity-label {
    color: rgba(255,255,255,.4);
    font-weight: 800;
    margin-top: 2rem;
  }
`)

function recoverElves(target, tag) {
  [...target.querySelectorAll(tag)].map(node => {
    const newNode = document.createElement(tag)
    for (const attr of node.attributes) {
      newNode.setAttribute(attr.name, attr.value)
    }
    node.replaceWith(newNode)
  })
}

$.when('click', '[data-pick]', (event) => {
  $.teach({ mode: 'gallery', personaAttribute: event.target.dataset.pick  })
})

$.when('gallery-share', 'plan98-gallery', (event) => {
  const { items } = event.detail
  const { personaAttribute } = $.learn()

  $.teach({ mode: 'authenticated', personaAttribute: null })

  if(items[0] && personaAttribute) {
    updatePersona({
      [personaAttribute]: items[0].record.src
    })
  } else {
    $.teach({ personaAttribute: null })
  }
})


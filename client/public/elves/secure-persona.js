import elf, { subscribe } from '@silly/elf'
import supabase from '@sillonious/database'
import { bayunCore, BayunCore } from '@sillonious/vault'
import {
  getSession,
  getFeedback,
  login,
  getCompanyName,
  getEmployeeId,
  getSessionId,
  setSessionId,
  clearSession,
  setError,
  setEmployeeId,
  setCompanyName,
  getEmail
} from './bayun-wizard.js'
import { popover } from './data-popover.js'
import {
  provisionActiveKeycard,
  getKeycard,
  listKeycards,
  setKeycard,
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

export const $ = elf('secure-persona', {
  ...baseQandA,
  persona: {},
  step: 0,
  user: {}
})

let lastMode = null
subscribe((link) => {
  if(link === $.link) {
    const { mode } = $.learn()
    if(mode !== lastMode) {
      lastMode = mode

      if(mode === 'authenticated') {
        maybeProvsionPersonaKeycard()
      }
    }
  }
})

async function maybeProvsionPersonaKeycard() {
  const { sessionId, companyEmployeeId, companyName } = getSession()

  if(!sessionId) return

  const exists = listKeycards().find(x => {
    return x.companyName === companyName && x.companyEmployeeId === companyEmployeeId
  })

  if(!exists) {
    await provisionActiveKeycard({
      type: KEYCARD_TYPES.PERSONA,
      title: 'Persona',
      logoUrl: '/public/cdn/sillyz.computer/default-picture.png',
      description: 'Secure social graph',
      companyEmployeeId,
      companyName
    })

    const groupType = BayunCore.GroupType.PRIVATE;
    const group = await bayunCore.createGroup(sessionId, `${companyEmployeeId}@${companyName}:friends`, groupType)
    .catch(error => {
      console.log(error);
    });

    await updatePersona({
      moniker: companyEmployeeId,
      organization: companyName,
      groupId: group.groupId,
      groupKey: group.groupKey,
      followers: [],
      following: []
    })
  }
}

export function persona() {
  return $.learn().persona
}

async function updatePersona(payload, mergeHandler=(s,p) => ({...s,...p})) {
  const persona = await getPersona()
    .catch(e => {
      console.error(e)
      return {}
    })

  const data = mergeHandler(persona, payload)

  $.teach({ persona: data })
  return await putPersona(data).catch(console.error)
}

export async function putPersona(persona) {
  const keycard = getKeycard()

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
    .catch(e => {
      console.debug(e)
    })
}

export async function getPersona() {
  const { companyEmployeeId, companyName } = getSession()
  const personaKeycard = listKeycards().find(x => {
    return x.companyName === companyName && x.companyEmployeeId === companyEmployeeId
  })

  if(!personaKeycard) return

  setKeycard(personaKeycard.id)

  const keycard = getKeycard()

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
    const result = await bayunCore.addMemberToGroup(
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
    const result = bayunCore.removeMemberFromGroup(
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

    `
  },
  onboard: function intake(target) {
    return `
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

    const persona = getEmployeeId()
    const organization = getCompanyName()
    return `
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

    const companyEmployeeId = getEmployeeId()
    const companyName = getCompanyName()
    return `
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
    `
  },
  authenticated: function authenticated(target) {
    const companyEmployeeId = getEmployeeId()
    const companyName = getCompanyName()

    return `
      <div class="form-title">
        Connected
        <span style="display: inline-grid; place-content: center;">
          <button class="standard-button -small -round bias-generic" data-action="handleSessionEnd">
            <sl-icon name="cloud-slash"></sl-icon>
          </button>
        </span>
      </div>
      <div class="form-description">
        Persona: <strong>${companyEmployeeId}</strong><br/>
        Provider: <strong>${companyName}</strong><br/>
      </div>

      <div>
        <secure-followers></secure-followers>
      </div>
    `
  },
  loading: function loading(target) {
    return `
      <div key="loader" class="persona-bar">
        <flying-disk></flying-disk>
      </div>
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

  setEmployeeId(data.persona)
  setCompanyName(data.organization)

  $.teach({ data })
  start()
})

function mount(target) {
  if(target.mounted) return
  setError('')
  target.innerHTML = ''
  target.mounted = true
  init()
}

function init() {
  const sessionId = getSessionId()

  if(!sessionId) {
    connect()
    return
  }

  $.teach({ ...baseQandA, mode: 'authenticated' })
  broadcastPersonaActivated()

  getPersona().then(persona => $.teach({ persona }))
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

  setEmployeeId(data.persona)
  setCompanyName(data.organization)

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
      <div>
        <plan98-icon></plan98-icon>
      </div>
      <div${mode}>
        ${modes[mode](target)}
      </div${mode}>
    `
  }
}, { afterUpdate })

function afterUpdate(target) {
  {
    recoverElves(target, 'bayun-feedback')
    recoverElves(target, 'sl-icon')
    recoverElves(target, 'plan98-icon')
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
  const companyEmployeeId = getEmployeeId()
  const companyName = getCompanyName()
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

  const companyEmployeeId = getEmployeeId()
  const companyName = getCompanyName()
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
    margin: 0 auto;
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

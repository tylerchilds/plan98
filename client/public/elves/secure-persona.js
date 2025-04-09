import elf from '@silly/elf'
import supabase from '@sillonious/database'
import { bayunCore } from '@sillonious/vault'
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

const modes = {
  error: function error(target) {
    return `
      <div class="persona-title">
        Session Error
      </div>
      <div class="persona-context">
        There was an error linking your persona, press retry to try again.
      </div>

      <div>
        <button class="persona-deactivate" data-action="handleSessionEnd">
          <span>
            <sl-icon name="shield-x"></sl-icon>
          </span>
          Retry
        </button>
      </div>

    `
  },
  onboard: function intake(target) {
    return `
      <div class="persona-form">
        <div class="persona-title">
          Create Persona
        </div>

        <div class="persona-context">
          Your moniker is your unique callsign for <strong>${organization}</strong> and cannot be changed once chosen.
        </div>
        <div>
          <bayun-feedback></bayun-feedback>
        </div>
        <form method="POST" name="insert">
          <label class="field">
            <span class="label">Moniker</span>
            <input type="text" name="account" required/>
          </label>
          <button class="persona-action" type="submit">
            Create
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

    const moniker = getEmployeeId()
    const organization = getCompanyName()
    return `
      <div class="persona-form">
        <div class="persona-title">
          Create Credentials
        </div>

        <div class="persona-context">
          To establish credentials for <strong>${moniker}@${organization}</strong>, please customize the questionnaire below.
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
          <button class="persona-action" type="submit">
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
        <div class="persona-title">
          Answer Challenge
        </div>

        <div class="persona-context">
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
          <button class="persona-action" type="submit">
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
      <div class="persona-title">
        Authentication Information
      </div>
      <div class="persona-context">
        Session secured as <strong>${companyEmployeeId}@${companyName}</strong> for all friend to friend friendcryption.
      </div>

      <div style="margin: 0 0 2rem;">
        <button class="persona-deactivate" data-action="handleSessionEnd">
          <span>
            <sl-icon name="shield-x"></sl-icon>
          </span>
          Disengage
        </button>
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
    moniker: event.target.account.value,
    organization,
  }

  setEmployeeId(data.moniker)
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

  setEmployeeId(data.moniker)
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
      <div-${mode}>
        ${modes[mode](target)}
      </div-${mode}>
    `
  }
}, { afterUpdate })

function afterUpdate(target) {
  {
    recoverElves(target, 'bayun-feedback')
    recoverElves(target, 'sl-icon')
    recoverElves(target, 'flying-disk')
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
        console.error(error)
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
      setError(error)
    };

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

  & .persona-title {
    font-weight: bold;
    font-size: 1.2rem;
    color: rgba(0,0,0,.65);
    margin: 1rem 0;
  }

  & .persona-context {
    padding-bottom: 1rem;
  }

  & .persona-action {
    border: none;
    padding: 1rem;
    border-radius: 4px;
    background: dodgerblue;
    width: 100%;
    font-weight: bold;
    color: white;
    margin: 1rem 0;
  }

  & .persona-deactivate {
    background: firebrick;
    text-align: left;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    align-items: center;
    border: none;
    padding: 1rem;
    border-radius: 4px;
    font-weight: bold;
    color: white;
    margin: 1rem auto;
  }

  & hr {
    border: 0;
    border-bottom: 1px solid rgba(255,255,255,.2);
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

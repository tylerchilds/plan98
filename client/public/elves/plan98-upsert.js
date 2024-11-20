import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getUser, disconnect } from './plan98-register.js'
import { connected, getSession, getFeedback, login, getCompanyName, getEmployeeId, setSessionId, clearSession, setError, setErrors, setEmail, setAuthenticatedAt, getAuthenticatedAt, setEmployeeId, setCompanyName, getEmail, setActiveAccount } from './plan98-wallet.js'

import { requestScreen } from './plan9-zune.js'

const $ = module('plan98-upsert', {
  loading: true,
  step: 0,
  question1: 'Who?',
  question2: 'What?',
  question3: 'When?',
  question4: 'Where?',
  question5: 'Why?',
  answer1: 'Chicken poo',
  answer2: 'Chicken butt',
  answer3: 'Chicken hen',
  answer4: 'Chicken hair',
  answer5: 'Chicken thigh',
  user: {}
})

const modes = {
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

    return `
      Write these secrets down, you'll need them to access this profile.
      <div class="password-grid">
        <input class="name-pair" name="question1" value=${question1}/>
        <input class="name-pair" name="answer1" value=${answer1}/>
        <input class="name-pair" name="question2" value=${question2}/>
        <input class="name-pair" name="answer2" value=${answer2}/>
        <input class="name-pair" name="question3" value=${question3}/>
        <input class="name-pair" name="answer3" value=${answer3}/>
        <input class="name-pair" name="question4" value=${question4}/>
        <input class="name-pair" name="answer4" value=${answer4}/>
        <input class="name-pair" name="question5" value=${question5}/>
        <input class="name-pair" name="answer5" value=${answer5}/>
      </div>
      <button data-provision>
        Provision
      </button>
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

    return `
      Enter the corresponding secrets to access this profile.
      <div class="password-grid">
        <input class="name-pair" disabled name="question1" value=${questions[1]}/>
        <input class="name-pair" name="answer1" value=${answer1}/>
        <input class="name-pair" disabled name="question2" value=${questions[2]}/>
        <input class="name-pair" name="answer2" value=${answer2}/>
        <input class="name-pair" disabled name="question3" value=${questions[3]}/>
        <input class="name-pair" name="answer3" value=${answer3}/>
        <input class="name-pair" disabled name="question4" value=${questions[4]}/>
        <input class="name-pair" name="answer4" value=${answer4}/>
        <input class="name-pair" disabled name="question5" value=${questions[5]}/>
        <input class="name-pair" name="answer5" value=${answer5}/>
      </div>
      <button data-validate>
        Validate
      </button>
    `
  },
  register: function registrationMode(target) {
    return `
      <plan98-register data-script="${import.meta.url}" data-action="refresh"></plan98-register>
    `
  },
}

$.when('connected', 'plan98-register', (event) => {
  refresh()
})

$.when('disconnected', 'plan98-register', (event) => {
  refresh()
})


function mount(target) {
  if(target.mounted) return
  target.mounted = true
  refresh()
}

function refresh() {
  const user = getUser()
  if(!user) {
    $.teach({ user: null, loading: false })
  }

  if(!user.error) {
    $.teach({ user, loading: false })
  }

  $.teach({ loading: false })
}

$.draw((target) => {
  mount(target)
  const { mode, user, loading, lastUpdate } = $.learn()

  if(loading) return

  if(!user.data) {
    return modes['register'](target)
  }

  if(modes[mode]) {
    return modes[mode](target)
  }

  const email = getEmail()

  target.innerHTML = `
    <div>
      <div class="identity-label">account</div>
      <button data-account>
        ${user.data.user.email}
      </button>
      <div style="text-align: right;">
        <button data-logout>
          Logout
        </button>
      </div>
    </div>
    <hr/>
    ${getAuthenticatedAt() ? `
      <div>
        <div class="identity-label">wallet</div>
        <button data-connect="${email}">
          ${email}
        </button>
        <div style="text-align: right;">
          <button data-disconnect>
            Disconnect
          </button>
        </div>
      </div>
    ` : `
      <div>
        <button data-start>
          Add Identity
        </button>
      </div>
    `}
  `
}, { afterUpdate })

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('plan98-register')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('plan98-register')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
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

$.when('click', '[data-start]', (event) => {
  start(event)
})

$.when('click', '[data-provision]', (event) => {
  provision(event) 
})

$.when('click', '[data-validate]', (event) => {
  validate(event) 
})

$.when('click', '[data-connect]', (event) => {
  const email = event.target.dataset.connect
  setActiveAccount(email)
  requestScreen('/app/plan98-pager')
})

$.when('click', '[data-account]', (event) => {
  requestScreen('/app/plan98-register')
})

$.when('click', '[data-logout]', async (event) => {
  await disconnect()
  $.teach({ user: null })
  refresh()
})

$.when('click', '[data-disconnect]', (event) => {
  clearSession()
})


async function start(event) {
  const user = await getUser().catch(e => console.error(e))
  const { email } = user.data.user
  const [companyEmployeeId, companyName] = email.split('@')
  const prerequirements = companyName && companyEmployeeId

  setEmail(email)
  setCompanyName(companyName)
  setEmployeeId(companyEmployeeId)

  if(prerequirements) {
    const successCallback = data => {
      if (data.sessionId) {
        setSessionId(data.sessionId)
        //LoggedIn Successfully
        $.teach({
          email,
          mode: null
        })
      }
    };

    const failureCallback = error => {
      if(error === "BayunErrorEmployeeDoesNotExist") {
        const [
          answer1,
          answer2,
          answer3,
          answer4,
          answer5
        ] = crypto.randomUUID().split('-')

        $.teach({
          mode: 'provision',
          email,
          question1: 'PLAN98_PASSWORD_1',
          answer1,
          question2: 'PLAN98_PASSWORD_2',
          answer2,
          question3: 'PLAN98_PASSWORD_3',
          answer3,
          question4: 'PLAN98_PASSWORD_4',
          answer4,
          question5: 'PLAN98_PASSWORD_5',
          answer5,
        })
      }
      setError(error)
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
  const successCallback = data => {
    if (data.sessionId) {
      setSessionId(data.sessionId)
      setAuthenticatedAt(new Date())
      $.teach({
        mode: null
      })
    }};

  const failureCallback = error => {
    setError(error)
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
        validate(event)
      };

      const failureCallback = error => {
        setError(error)
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
          setError(error)
        };

        bayunCore.validateSecurityQuestions(
          data.sessionId,
          securityQuestionsAnswersSetup(),
          authorizeEmployee(event),
          successCallback,
          failureCallback
        );
      }
    }
  };
}

async function provision(event) {
  const user = await getUser().catch(e => console.error(e))
  const { email } = user.data.user
  const [companyEmployeeId, companyName] = email.split('@')
  const prerequirements = companyName && companyEmployeeId

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
      email,
      true, //isCompanyOwnedEmail,
      authorizeEmployee(event),
      newUserCredentials(event),
      securityQuestions(event),
      null, //passphraseCallback,
      successCallback,
      failureCallback
    );
  }
}

$.style(`
  & {
    display: block;
    margin: 0 auto;
    height: 100%;
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

  & [data-back] {
    background-color: rgba(99,99,99,.65);
  }

  & [data-back]:focus,
  & [data-back]:hover {
    background-color: rgba(99,99,99,.35);
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


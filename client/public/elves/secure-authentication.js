import elf from '@silly/elf'
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

const $ = elf('secure-authentication', {
  loading: true,
  step: 0,
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
  user: {}
})

const modes = {
  unknown: function intake(target) {
    return `
      <div>
        <bayun-feedback></bayun-feedback>
      </div>
      <form method="POST" name="upsert">
        <label class="field">
          <span class="label">Account</span>
          <input type="text" name="account" required/>
        </label>
        <button class="call-to-action" type="submit">
          Connect
        </button>
      </form>
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

    const companyEmployeeId = getEmployeeId()
    const companyName = getCompanyName()
    return `
      <button data-back>
        Back
      </button>
      <div>
        <bayun-feedback></bayun-feedback>
      </div>
        Save secrets for ${companyEmployeeId}@${companyName}
      <div class="password-grid">
        <input class="name-pair" name="question1" value="${question1}"/>
        <input type="password" class="name-pair" name="answer1" value="${answer1}"/>
        <input class="name-pair" name="question2" value="${question2}"/>
        <input type="password"  class="name-pair" name="answer2" value="${answer2}"/>
        <input class="name-pair" name="question3" value="${question3}"/>
        <input type="password" class="name-pair" name="answer3" value="${answer3}"/>
        <input class="name-pair" name="question4" value="${question4}"/>
        <input type="password" class="name-pair" name="answer4" value="${answer4}"/>
        <input class="name-pair" name="question5" value="${question5}"/>
        <input type="password" class="name-pair" name="answer5" value="${answer5}"/>
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

    const companyEmployeeId = getEmployeeId()
    const companyName = getCompanyName()
    return `
      <button data-back>
        Back
      </button>
      <div>
        <bayun-feedback></bayun-feedback>
      </div>
      <form>
        Enter the corresponding secrets for ${companyEmployeeId}@${companyName}
        <div class="password-grid">
          <input class="name-pair" disabled name="question1" value="${questions[1]}"/>
          <input type="password" class="name-pair" name="answer1" value="${answer1}"/>
          <input class="name-pair" disabled name="question2" value="${questions[2]}"/>
          <input type="password" class="name-pair" name="answer2" value="${answer2}"/>
          <input class="name-pair" disabled name="question3" value="${questions[3]}"/>
          <input type="password" class="name-pair" name="answer3" value="${answer3}"/>
          <input class="name-pair" disabled name="question4" value="${questions[4]}"/>
          <input type="password" class="name-pair" name="answer4" value="${answer4}"/>
          <input class="name-pair" disabled name="question5" value="${questions[5]}"/>
          <input type="password" class="name-pair" name="answer5" value="${answer5}"/>
        </div>
      </form>
      <button data-validate>
        Validate
      </button>
    `
  },
  authenticated: function authenticated(target) {
    const companyEmployeeId = getEmployeeId()
    const companyName = getCompanyName()

    return `
      <div class="hud">
        <div>
          <bayun-feedback></bayun-feedback>
        </div>
        <div>
          ${companyEmployeeId}@${companyName}
        </div>
        <div style="text-align: right;">
          <button data-disconnect>
            Disconnect
          </button>
        </div>
      </div>
      <generic-park src="/public/elves"></generic-park>
    `
  }
}

$.when('click', '[data-back]', async (event) => {
  $.teach({ mode: 'unknown' })
})

$.when('submit', '[name="upsert"]', async (event) => {
  event.preventDefault()

  setEmployeeId(event.target.account.value)
  setCompanyName('sillyz.computer')
  start()
})

function mount(target) {
  if(target.mounted) return
  setError('')
  target.mounted = true
  const sessionId = getSessionId()

  if(!sessionId) {
    $.teach({ loading: false, mode: 'unknown' })
    return
  }

  $.teach({ loading: false, mode: 'authenticated' })
}

$.draw((target) => {
  mount(target)
  const { mode, user, loading, lastUpdate } = $.learn()

  if(loading) return

  if(modes[mode]) {
    return modes[mode](target)
  }
}, { afterUpdate })

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('bayun-feedback')].map(node => {
      const wrapper = node.parentNode
      const newNode = document.createElement('bayun-feedback')
      newNode.name = node.name
      node.remove()
      wrapper.appendChild(newNode)
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

$.when('click', '[data-provision]', (event) => {
  provision(event) 
})

$.when('click', '[data-validate]', (event) => {
  validate(event) 
})

$.when('click', '[data-disconnect]', (event) => {
  clearSession()
  $.teach({ mode: 'unknown' })
})


async function start(event) {
  const companyEmployeeId = getEmployeeId()
  const companyName = getCompanyName()
  const prerequirements = !!companyName && !!companyEmployeeId

  if(prerequirements) {
    const successCallback = data => {
      if (data.sessionId) {
        setSessionId(data.sessionId)
        //LoggedIn Successfully
        $.teach({
          mode: 'authenticated'
        })
      }
    };

    const failureCallback = error => {
      if(error === "BayunErrorEmployeeDoesNotExist") {
        $.teach({
          mode: 'provision',
        })
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
  const successCallback = data => {
    if (data.sessionId) {
      setSessionId(data.sessionId)
      $.teach({
        mode: 'authenticated'
      })
    }
  };

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
        $.teach({
          mode: 'authenticated'
        })
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
  }

  & .hud {
    position: fixed;
    z-index: 9001;
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

  & [data-back] {
    border: 1px solid transparent;
    background: none;
    color: dodgerblue;
    text-decoration: underline;
    padding: .5rem 1rem;
    border-radius: 0;
  }

  & [data-back]:hover,
  & [data-back]:focus {
    border-color: dodgerblue;
    text-decoration: none;
    padding: .5rem 1rem;
  }
`)


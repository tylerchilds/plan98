import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { connected, getFeedback, login, getCompanyName, getEmployeeId, setSessionId, setError, setErrors, setEmail, getEmail } from './plan98-wallet.js'
import { getUser } from './plan98-reconnect.js'

const $ = module('plan98-upsert', {
  step: 0,
  answer1: '',
  answer2: '',
  answer3: '',
  answer4: '',
  answer5: '',
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
  }

}

$.draw((target) => {
  const { mode } = $.learn()

  if(modes[mode]) {

    return modes[mode](target)
  }

  const email = getEmail()

  return `
    ${email}
    <button data-start>
      Go
    </button>
  `
})

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

async function start(event) {
  const user = await getUser().catch(e => console.error(e))
  const { email } = user.data.user
  const [companyEmployeeId, companyName] = email.split('@')
  const prerequirements = companyName && companyEmployeeId

  if(prerequirements) {
    const successCallback = data => {
      if (data.sessionId) {
        setSessionId(data.sessionId)
        //LoggedIn Successfully
        connected(event)
        $.teach({
          email
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
      connected(event)
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
    padding: 0 1rem;
    margin: 1rem auto;
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

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    text-shadow: 1px 1px rgba(0,0,0,.85);
    border: none;
    border-radius: 1rem;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    width: 100%;
  }

  & button:focus,
  & button:hover {
    background-color: rebeccapurple;
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
`)

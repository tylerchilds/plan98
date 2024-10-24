import module from '@silly/tag'
import { BayunCore, bayunCore } from '@sillonious/vault'
import { login, getCompanyName, getEmployeeId, getEmail, setError, setErrors } from './bayun-wizard.js'

const $ = module('bayun-register', {
  step: 0,
  question1: 'What continent are you from?',
  answer1: '',
  question2: 'What language did you first learn?',
  answer2: '',
  question3: 'What game do you like to play?',
  answer3: '',
  question4: 'What color has always been your favorite?',
  answer4: '',
  question5: 'What food is the most delicious?',
  answer5: '',
})

const steps = [
  function step1() {

    return `
      <div class="progress"></div>
      Ask us to ask you questions every time you want us to make sure that you are who you claim to be.
      <div class="button-row">
        <button data-history>Previous</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step2() {
    const { question1 } = $.learn()
    return `
      <div class="progress"></div>
      <label class="field">
        <span class="label">Question 1</span>
        <textarea class="name-pair" name="question1">${question1}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step3() {
    const { question1, answer1 } = $.learn()
    return `
      <div class="progress"></div>
      ${question1}
      <label class="field">
        <span class="label">Answer 1</span>
        <textarea class="name-pair" name="answer1">${answer1}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step4() {
    const { question2 } = $.learn()

    return `
      <div class="progress"></div>
      <label class="field">
        <span class="label">Question 2</span>
        <textarea class="name-pair" name="question2">${question2}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step5() {
    const { question2, answer2 } = $.learn()
    return `
      <div class="progress"></div>
      ${question2}
      <label class="field">
        <span class="label">Answer 2</span>
        <textarea class="name-pair" name="answer2">${answer2}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step6() {
    const { question3 } = $.learn()
    return `
      <div class="progress"></div>
      <label class="field">
        <span class="label">Question 3</span>
        <textarea class="name-pair" name="question3">${question3}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step7() {
    const { question3, answer3 } = $.learn()
    return `
      <div class="progress"></div>
      ${question3}
      <label class="field">
        <span class="label">Answer 3</span>
        <textarea class="name-pair" name="answer3">${answer3}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step8() {
    const { question4 } = $.learn()
    return `
      <div class="progress"></div>
      <label class="field">
        <span class="label">Question 4</span>
        <textarea class="name-pair" name="question4">${question4}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step9() {
    const { question4, answer4 } = $.learn()
    return `
      <div class="progress"></div>
      ${question4}
      <label class="field">
        <span class="label">Answer 4</span>
        <textarea class="name-pair" name="answer4">${answer4}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step10() {
    const { question5 } = $.learn()
    return `
      <div class="progress"></div>
      <label class="field">
        <span class="label">Question 5</span>
        <textarea class="name-pair" name="question5">${question5}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-next>Next</button>
      </div>
    `
  },
  function step11() {
    const { question5 } = $.learn()
    return `
      <div class="progress"></div>
      ${question5}
      <label class="field">
        <span class="label">Answer 5</span>
        <textarea class="name-pair" name="answer5"></textarea>
      </label>

      This was the last answer, check your work by going back or finish registering now!

      <div class="button-row">
        <button data-back>Back</button>
        <button data-submit>Register</button>
      </div>
    `
  }
]

$.draw((target) => {
  if(!ready()) {
    return `Before we can secure your profile, we need to finish the basics.`
  }
  const { step } = $.learn()
  if(step !== parseInt(target.dataset.step)) {
    target.dataset.step = step
    target.dataset.steps = step
    target.style.setProperty("--progress", `${step / steps.length * 100}%`);
    target.innerHTML = steps[step](target)
  }
})

function back() {
  const { step } = $.learn()
  if(step-1 < 0) {
    $.teach({ step: 0 })
  } else {
    $.teach({ step: step - 1 })
  }
}

function next() {
  const { step } = $.learn()
  if(step+1 >= steps.length) {
    $.teach({ step: steps.length - 1 })
  } else {
    $.teach({ step: step + 1 })
  }
}

$.when('click', '[data-history]', (event) => {
  history.back()
})

$.when('click', '[data-back]', (event) => {
  back()
})

$.when('input', '.name-pair', (event) => {
  const field = event.target
  $.teach({ [field.name]: field.value })
})

$.when('click', '[data-next]', (event) => {
  const pairs = [...event.target.closest($.link).querySelectorAll('.name-pair')]

  if(pairs.length > 0) {
    pairs.map((field) => {
      $.teach({ [field.name]: field.value })
    })
  }
  next()
})

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
        //Employee Registered Successfully
        //Login to continue.
        login(event)
      };

      const failureCallback = error => {
        setError(error)
      };

      // Take user Input for optional registerFaceId
      const registerFaceId=false;

      bayunCore.setNewUserCredentials(
        data.sessionId,
        securityQuestionsAnswers(),
        null, //passphrase,
        registerFaceId,
        authorizeEmployee(event),
        successCallback,
        failureCallback
      );
    }
  }
}

function securityQuestionsAnswers() {
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
          securityQuestionsAnswers(),
          authorizeEmployee(event),
          successCallback,
          failureCallback
        );
      }
    }
  };
}

function ready() {
  const companyName = getCompanyName()
  const companyEmployeeId = getEmployeeId()
  const email = getEmail()

  return companyName && companyEmployeeId && email
}

$.when('click', '[data-submit]', (event) => {
  const companyName = getCompanyName()
  const companyEmployeeId = getEmployeeId()
  const email = getEmail()


  const successCallback = data => {
    //Employee Registered Successfully
    //Login to continue.
    login(event)
  };

  const failureCallback = error => {
    setError(error)
  };

  if(ready()) {
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
    return
  }

  const errors = []

  if(!companyName) {
    errors.push('Missing company name')
  }

  if(!companyEmployeeId) {
    errors.push('Missing employee id')
  }

  if(!email) {
    errors.push('Missing email')
  }

  if(errors.length > 0) {
    setErrors(errors)
  }
})

$.style(`
  & {
    display: block;
    padding: 0 1rem;
    margin: 1rem auto;
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

import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { connected, getFeedback, getCompanyName, getEmployeeId, setSessionId, setError, setErrors } from './bayun-wizard.js'

const $ = module('bayun-login', {
  step: 0,
  answer1: '',
  answer2: '',
  answer3: '',
  answer4: '',
  answer5: '',
})

const steps = [
  function step1() {
    const { questions, answer1 } = $.learn()
    return `
      <div class="progress"></div>
      ${questions[1]}
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
  function step2() {
    const { questions, answer2 } = $.learn()
    return `
      <div class="progress"></div>
      ${questions[2]}
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
  function step3() {
    const { questions, answer3 } = $.learn()
    return `
      <div class="progress"></div>
      ${questions[3]}
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
  function step4() {
    const { questions, answer4 } = $.learn()
    return `
      <div class="progress"></div>
      ${questions[4]}
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
  function step5() {
    const { questions, answer5 } = $.learn()
    return `
      <div class="progress"></div>
      ${questions[5]}
      <label class="field">
        <span class="label">Answer 5</span>
        <textarea class="name-pair" name="answer5">${answer5}</textarea>
      </label>

      <div class="button-row">
        <button data-back>Back</button>
        <button data-connect>Connect</button>
      </div>
    `
  },
]

$.draw((target) => {
  start(target)

  const { questions, step } = $.learn()
  if(getFeedback().length > 0 ) {
    return `
      Something's up right now...
      <button data-history>Back</button>
    `
  }
  if(!questions) {
    return 'loading...'
  }
  if(step !== parseInt(target.dataset.step)) {
    target.dataset.step = step
    target.dataset.steps = step
    target.style.setProperty("--progress", `${step / steps.length * 100}%`);
    target.innerHTML = steps[step](target)
  }
})

function schedule(x) { setTimeout(x, 1) }
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

$.when('click', '[data-back]', (event) => {
  back()
})

$.when('click', '[data-history]', (event) => {
  history.back()
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
        questions
      })
      //Show custom UI to take user input for the answers.
      //Call validateSecurityQuestions function with the user provided answers.
    }
  }
}
function start(target) {
  const companyName = getCompanyName()
  const companyEmployeeId = getEmployeeId()

  const prerequirements = companyName && companyEmployeeId

  if(prerequirements && !target.inquired) {
    target.inquired = true

    const successCallback = data => {
      if (data.sessionId) {
        setSessionId(data.sessionId)
        //LoggedIn Successfully
        connected({ target })
      }
    };

    const failureCallback = error => {
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

function securityQuestionsAnswers() {
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

$.when('click', '[data-connect]', (event) => {
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
    securityQuestionsAnswers(),
    null,
    successCallback,
    failureCallback
  );

  const errors = []

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

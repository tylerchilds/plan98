import module from '@silly/tag'
import { bayunCore } from '@sillonious/vault'
import { getCompanyName, getEmployeeId, getEmail, setErrors } from './bayun-wizard.js'

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
      Ask us to ask you questions every time you want us to make sure that you are you claim to be.
      <div class="button-row">
        <div></div>
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
    const { question4 } = $.learn()
    return `
      <div class="progress"></div>
      ${question4}
      <label class="field">
        <span class="label">Answer 4</span>
        <textarea class="name-pair" name="answer4"></textarea>
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

const sessionId = "<sessionId>";
const companyName = "bayunsystems.com"; // company portion from loginId
const companyEmployeeId = "username"; //username portion from loginId
const email = "username@bayunsystems.com"; //loginId
const isCompanyOwnedEmail = true;

const authorizeEmployeeCallback = (data) => {
  if (data.sessionId) {
    if (data.authenticationResponse == BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING) {
      // You can get employeePublicKey in data.employeePublicKey for it's authorization
    }
  }
};

const newUserCredentialsCallback = (data) =>{

  if (data.sessionId){
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

    const authorizeEmployeeCallback = (data) => {
      if (data.sessionId) {
        if (data.authenticationResponse == BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING) {
          // You can get employeePublicKey in data.employeePublicKey for it's authorization
        }
      }
    };

    const successCallback = data => {
      //Employee Registered Successfully
      //Login to continue.
    };

    const failureCallback = error => {
      console.error(error);
    };

    //Take User Input for Security Questions and Answers
    //Here securityQuestionsAnswers object is created just for reference
    const securityQuestionsAnswers=[];
    securityQuestionsAnswers.push({
      question: question1,
      answer: answer1
    });

    securityQuestionsAnswers.push({
      question: question2,
      answer: answer2
    });

    securityQuestionsAnswers.push({
      question: question3,
      answer: answer3
    });

    securityQuestionsAnswers.push({
      question: question4,
      answer: answer4
    });

    securityQuestionsAnswers.push({
      question: question5,
      answer: answer5
    });

    // Take user Input for optional registerFaceId
    const registerFaceId=false;

    bayunCore.setNewUserCredentials(
      data.sessionId,
      securityQuestionsAnswers,
      null, //passphrase,
      registerFaceId,
      authorizeEmployeeCallback,
      successCallback,
      failureCallback
    );
  }
}

const securityQuestionsCallback = data => {
  if (data.sessionId) {
    if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS){
      let securityQuestionsArray = data.securityQuestions;
      //securityQuestionsArray is a list of Security Question Objects with questionId, questionText
      // Iterate through securityQuestionsArray
      securityQuestionsArray.forEach(val=>{
        console.log(val.questionId);
        console.log(val.questionText);
      });
      //Show custom UI to take user input for the answers.
      //Call validateSecurityQuestions function with the user provided answers.

      //Here answers object is created just for reference
      var answers=[];
      answers.push({questionId: "<questionId1>", answer: "<answer1>"});
      answers.push({questionId: "<questionId2>", answer: "<answer2>"});
      answers.push({questionId: "<questionId3>", answer: "<answer3>"});
      answers.push({questionId: "<questionId4>", answer: "<answer4>"});
      answers.push({questionId: "<questionId5>", answer: "<answer5>"});

      const successCallback = data => {
        //Security Questions' Answers validated and registered employee successfully.
        //Login to continue.
      };

      const failureCallback = error => {
        console.error(error);
      };

      bayunCore.validateSecurityQuestions(data.sessionId, answers, authorizeEmployeeCallback, successCallback, failureCallback);
    }
  }
};

const passphraseCallback = data => {
  if (data.sessionId) {
    if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_PASSPHRASE){

      //Show custom UI to take user input for the passphrase.
      const passphrase="<passphrase>";

      const successCallback = data => {
        //Passphrase validated and Employee is registered successfully.
        //Login to continue.
      };

      const failureCallback = error => {
        console.error(error);
      };

      //Call validatePassphrase function with the user provided passphrase.
      bayunCore.validatePassphrase(data.sessionId, passphrase, authorizeEmployeeCallback, successCallback, failureCallback);
    }
  }
};

const successCallback = data => {
  //Employee Registered Successfully
  //Login to continue.
};

const failureCallback = error => {
  console.error(error);
};

function ready() {
  const companyName = getCompanyName()
  const companyEmployeeId = getEmployeeId()
  const email = getEmail()

  return companyName && companyEmployeeId && email
}

$.when('click', '[data-submit]', (event) => {
  if(ready()) {
    bayunCore.registerEmployeeWithoutPassword(
      '', //sessionId,
      companyName,
      companyEmployeeId,
      email,
      true, //isCompanyOwnedEmail,
      authorizeEmployeeCallback,
      newUserCredentialsCallback,
      securityQuestionsCallback,
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

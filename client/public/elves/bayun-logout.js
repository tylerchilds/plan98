import module from '@silly/tag'
import { BayunCore } from '@sillonious/vault'

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = true;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const NEVER_MODE = 'never'
const INACTIVE_MODE = 'inactive'
const ACTIVE_MODE = 'active'

const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const $ = module('bayun-logout', { mode: NEVER_MODE })

$.draw((target) => {
  const { mode } = $.learn()

  if(NEVER_MODE === mode) {
    return `
      Hey, you've never been here... totally cool! In fact, splendid! Welcome.

      <form action="registerWithPassword">
        <label class="field">
          <span class="label">Email</span>
          <input class="hotlink" type="email" name="companyEmployeeId" required/>
        </label>

        <label class="field">
          <span class="label">password</span>
          <input class="hotlink" type="password" name="password" required/>
        </label>

        <button type="submit">
          Register
        </button>
      </form>
    `
  }

  if(INACTIVE_MODE === mode) {
    return `
      <button class="login">Login</button>
    `
  }

  if(ACTIVE_MODE === mode) {
    return `
      <button class="logout">Logout</button>
    `
  }
})

$.when('keyup', '.hotlink', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

const sessionId = "<sessionId>";
const companyName = "sillyz.computer"; // company portion from loginId

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
        if (data.sessionId) {
          //Security Questions' Answers validated and LoggedIn Successfully
        }};

      const failureCallback = error => {
        console.error(error);
      };

      bayunCore.validateSecurityQuestions(data.sessionId, answers, null, successCallback, failureCallback);
    }
  }
};

const passphraseCallback = data => {
  if (data.sessionId) {
    if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_PASSPHRASE){

      //Show custom UI to take user input for the passphrase.
      //Call validatePassphrase function with the user provided passphrase.

      const successCallback = data => {
        if (data.sessionId) {
          //Passphrase validated and LoggedIn Successfully
        }};

      const failureCallback = error => {
        console.error(error);
      };

      bayunCore.validatePassphrase(data.sessionId, "<passphrase>", null, successCallback, failureCallback);
    }
  }
};

const successCallback = data => {
  if (data.sessionId) {
    //LoggedIn Successfully
  }
};

const failureCallback = error => {
  console.error(error);
};

const authorizeEmployeeCallback = (data) => {
  if (data.sessionId) {
    if (data.authenticationResponse == BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING) {
      // You can get employeePublicKey in data.employeePublicKey for it's authorization
    }
  }
};

$.when('submit', '[action="registerWithPassword"]', (event) => {
  event.preventDefault()
  const { companyEmployeeId, password } = $.learn()
  alert(`${companyEmployeeId}, ${password}`)
  bayunCore.registerEmployeeWithPassword(
    sessionId,
    companyName,
    companyEmployeeId,
    password,
    authorizeEmployeeCallback,
    successCallback,
    failureCallback
  );
})

$.when('click', '.login', () => {
  const { companyEmployeeId } = $.learn()
  bayunCore.loginWithPassword(
    sessionId,
    companyName,
    companyEmployeeId,
    securityQuestionsCallback,
    passphraseCallback,
    successCallback,
    failureCallback
  );
})

import module from '@silly/tag'
import { BayunCore } from '@sillonious/vault'

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const $ = module('hello-vault', {
  sessionId: '',
  companyName: 'sillyz.computer',
  companyEmployeeId: '',
  password: '',
  autoCreateEmployee: true
})

$.draw((target) => {
  const { sessionId, lockedText, unlockedText, error } = $.learn()

  if(!sessionId) {
    return `
      <div class="error">
        ${error ? error : ''}
      </div>
      <form action="loginWithPassword">
        <label class="field">
          <span class="label">Identity</span>
          <input data-bind type="email" name="companyEmployeeId" required/>
        </label>
        <label class="field">
          <span class="label">Password</span>
          <input data-bind type="password" name="password" required/>
        </label>
        <rainbow-action>
          <button type="submit">
            Log In
          </button>
        </rainbow-action>
      </form>
    `
  }

  return `
    ${lockedText}: locked,
    ${unlockedText}: unlocked
  `
})

$.when('keyup', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

const securityQuestionsCallback = data => {
  if (data.sessionId) {
    if(data.authenticationResponse == BayunCore.AuthenticateResponse.VERIFY_SECURITY_QUESTIONS){
      let securityQuestionsArray = data.securityQuestions;
      // securityQuestionsArray is a list of Security Question Objects with questionId, questionText 
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

const successCallback = async data => {
  const {
    sessionId,
    authenticationResponse,
    employeeAlreadyExists,
    securityQuestions
  } = data
  var lockedText = await bayunCore.lockText(sessionId, "Hello, Future World.");

  var unlockedText = await bayunCore.unlockText(sessionId, lockedText);
  $.teach({ sessionId, authenticationResponse, employeeAlreadyExists, securityQuestions, lockedText, unlockedText })
};

const failureCallback = error => {
  $.teach({ error: `${error}` })
};

$.when('click', '[type="submit"]', (event) => {
  $.teach({ error: null })

  const {
    sessionId,
    companyName,
    companyEmployeeId,
    password,
    autoCreateEmployee
  } = $.learn()

  bayunCore.loginWithPassword(
      sessionId,
      companyName,
      companyEmployeeId,
      password,
      autoCreateEmployee,
      securityQuestionsCallback,
      passphraseCallback,
      successCallback,
      failureCallback
  );
})

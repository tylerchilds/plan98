import module from '@sillonious/module'
import { BayunCore } from '@sillonious/vault'

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = true;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

debugger
const bayunCore = BayunCore.init(appId, appSecret, appSalt,
                                localStorageMode, enableFaceRecognition, baseURL);

const $ = module('hello-vault')

$.draw((target) => {
  return `
    <button class="login">Hey...</button>
  `
})

const sessionId = "<sessionId>";
const companyName = "bayunsystems.com"; // company portion from loginId
const companyEmployeeId = "username";   // username portion from loginId

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

$.when('click', '.login', () => {
  bayunCore.loginWithoutPassword(
        sessionId,
        companyName,
        companyEmployeeId,
        securityQuestionsCallback,
        passphraseCallback,
        successCallback,
        failureCallback
  );
})

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

const $ = module('bayun-register-with-password', { mode: NEVER_MODE })

$.draw((target) => {
  const { mode } = $.learn()

  if(NEVER_MODE === mode) {
    return `
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
const companyName = "bayunsystems.com"; // company portion from loginId
const companyEmployeeId = "username";  // username portion from loginId
const password = "<employeePassword>";

const successCallback = data => {
    //Employee Registered Successfully
    //Login to continue.
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

$.when('submit', '[action="RegisterWithPassword"]', (event) => {
  event.preventDefault()
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


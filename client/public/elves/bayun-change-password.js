import module from '@silly/tag'
import { BayunCore } from '@sillonious/vault'

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const PROMPT_MODE = 'prompt'
const CONFIRM_MODE = 'confirm'

const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const $ = module('bayun-change-password', { mode: PROMPT_MODE })

$.draw((target) => {
  const { mode } = $.learn()

  if(PROMPT_MODE === mode) {
    return `
      <form action="ChangePassword">
        <label class="field">
          <span class="label">Current Password</span>
          <input class="hotlink" type="password" name="currentPassword" required/>
        </label>
        <label class="field">
          <span class="label">New Password</span>
          <input class="hotlink" type="password" name="newPassword" required/>
        </label>
        <button type="submit">
          Change Password
        </button>
      </form>
    `
  }

  if(CONFIRM_MODE === mode) {
    return `
      Yay! You did it...
    `
  }
})

$.when('keyup', '.hotlink', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

const successCallback = data => {
  //Password Changed Successfully
};

const failureCallback = error => {
  console.error(error);
};

$.when('submit', '[action="ChangePassword"]', (event) => {
  event.preventDefault()
  const { currentPassword, newPassword } = $.learn()
  bayunCore.ChangePassword(
      sessionId,
      currentPassword,
      newPassword,
      successCallback,
      failureCallback
  )
})

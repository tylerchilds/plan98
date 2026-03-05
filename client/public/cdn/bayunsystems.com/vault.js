import './BayunCoreSDK/lib/bayun.js'
import './BayunCoreSDK/lib/vishwam-lib.js'

export const BayunCore = window.BayunCore

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel
const bayunServerPublicKey = plan98.env.VAULT_PUBLIC_KEY; // provided on admin panel

const requirementsMet = appId && appSecret && appSalt && baseURL && bayunServerPublicKey

export const bayunCore = requirementsMet ? BayunCore.init(
  appId,
  appSecret,
  appSalt,
  localStorageMode,
  baseURL,
  bayunServerPublicKey,
  enableFaceRecognition
) : null;

const vault = {
  bayunCore
}

export default vault

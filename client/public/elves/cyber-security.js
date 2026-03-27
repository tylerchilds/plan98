import '/public/cdn/bayunsystems.com/BayunCoreSDK/lib/bayun-sandbox.js'
import '/public/cdn/bayunsystems.com/BayunCoreSDK/lib/vishwam-lib.js'

export const BayunCore = window.BayunCore

const bayunAppId = plan98.env.PLAN98_APP_ID; // provided on admin panel
const bayunAppSecret = plan98.env.PLAN98_APP_SECRET; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.PLAN98_BASE_URL; // provided on admin panel
const bayunServerPublicKey = plan98.env.PLAN98_PUBLIC_KEY; // provided on admin panel

const requirementsMet = bayunAppId && bayunAppSecret && baseURL && bayunServerPublicKey

export const e2ee = initBayunCore()

function initBayunCore() {
  if(requirementsMet) {
    const e2ee = BayunCore.init({
      bayunAppId,
      bayunAppSecret,
      localDataEncryptionMode: localStorageMode,
      baseURL,
      bayunServerPublicKey,
      enableFaceRecognition
    });

    console.log("Instantiated BayunCore object", { e2ee });

    return e2ee
  } else {
    console.log("Missing Bayun Dependencies");
    return null
  }
}

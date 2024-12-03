import module from '@silly/tag'

import * as solidClientAuthentication from '@inrupt/solid-client-authn-browser'
import SolidFileClient from 'solid-file-client'

import { BayunCore } from '@sillonious/vault'
export { getSession, clearSession } from './bayun-wizard.js'

/*
   ^
  <@>
  !&{
   #
*/

const appId = plan98.env.VAULT_APP_ID; // provided on admin panel
const appSecret = plan98.env.VAULT_APP_SECRET; // provided on admin panel
const appSalt = plan98.env.VAULT_APP_SALT; // provided on admin panel
const localStorageMode = BayunCore.LocalDataEncryptionMode.EXPLICIT_LOGOUT_MODE;
const enableFaceRecognition = false;
const baseURL = plan98.env.VAULT_BASE_URL; // provided on admin panel

const solidURL = plan98.env.SOLID_URL; // provided on admin panel

export const bayunCore = BayunCore.init(appId, appSecret, appSalt,
  localStorageMode, enableFaceRecognition, baseURL);

const solidFileClient = new SolidFileClient(solidClientAuthentication);

solidFileClient.rdf.setPrefix('schemaorg', 'https://schema.org/');

state['ls/current/solid-user'] ||= { }

const $ = module('solid-user', {
  loading: true,
  user: null,
})

localStorage.setItem("/callback.html", window.location.href)
restoreSession().then(user => {
  state['ls/current/solid-user'] = { user, loading: false }
})

export function currentUser() {
  return state['ls/current/solid-user'] || { user: null }
}

$.when('click', '#login-button', () => {
  const loginUrl = getLoginUrl();

  if (!loginUrl)
    return;

  performLogin(loginUrl);
})

$.when('click', '#logout-button', async () => {
  await performLogout();
})

async function restoreSession() {
  try {
    await solidClientAuthentication.handleIncomingRedirect({ restorePreviousSession: true });
    const session = solidClientAuthentication.getDefaultSession();
    if (!session.info.isLoggedIn)
      return false;

    return await fetchUserProfile(session.info.webId);
  } catch (error) {
    alert(error.message);

    return false;
  }
}

async function fetchUserProfile(webId) {
  const [nameQuad] = await readSolidDocument(webId, null, { foaf: 'name' });
  const [storageQuad] = await readSolidDocument(webId, null, { space: 'storage' });

  return {
    url: webId,
    name: nameQuad?.object.value || 'Anonymous',
    storageUrl: storageQuad?.object.value || await findUserStorage(webId),
  };
}

async function readSolidDocument(url, source, predicate, object, graph) {
  try {
    // solidFileClient.rdf.query returns an array of statements with matching terms.
    // (load and cache url content)
    return await solidFileClient.rdf.query(url, source, predicate, object, graph);
  } catch (error) {
    return null;
  }
}

async function findUserStorage(url) {
  url = url.replace(/#.*$/, '');
  url = url.endsWith('/') ? url + '../' : url + '/../';
  url = new URL(url);

  const response = await solidFileClient.head(url.href);

  if (response.headers.get('Link')?.includes('<http://www.w3.org/ns/pim/space#Storage>; rel="type"'))
    return url.href;

  // Fallback for providers that don't advertise storage properly.
  if (url.pathname === '/')
    return url.href;

  return findUserStorage(url.href);
}


function getLoginUrl() {
  const url = solidURL;

  if (!url)
    return null;

  const loginUrl = new URL(url);
  loginUrl.hash = '';
  loginUrl.pathname = '';

  return loginUrl.href;
}

function performLogin(loginUrl) {
  localStorage.setItem("/callback.html", window.location.href)
  solidClientAuthentication.login({
    oidcIssuer: loginUrl,
    redirectUrl: window.location.origin + '/callback.html',
    clientName: 'Hello World',
  });
}

async function performLogout() {
  state['ls/current/solid-user'] = { user: null }
  await solidClientAuthentication.logout();
}

export default $
export const web = {
  readDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  createContainer,
  getDocumentUrl,
  escapeText
}

async function readDocument(url, source, predicate, object, graph) {
  try {
    // solidFileClient.rdf.query returns an array of statements with matching terms.
    // (load and cache url content)
    return await solidFileClient.rdf.query(url, source, predicate, object, graph);
  } catch (error) {
    console.error(error)
    return null;
  }
}

async function createDocument(url, contents) {
  const response = await solidFileClient.post(url, {
    headers: { 'Content-Type': 'text/turtle' },
    body: contents,
  });

  if (!isSuccessfulStatusCode(response.status))
    throw new Error(`Failed creating document at ${url}, returned status ${response.status}`);

  const location = response.headers.get('Location');

  return new URL(location, url).href;
}

async function updateDocument(url, update) {
  const response = await solidFileClient.patchFile(url, update, 'application/sparql-update');

  if (!isSuccessfulStatusCode(response.status))
    throw new Error(`Failed updating document at ${url}, returned status ${response.status}`);
}

async function deleteDocument(url) {
  const response = await solidFileClient.deleteFile(url);

  if (!isSuccessfulStatusCode(response.status))
    throw new Error(`Failed deleting document at ${url}, returned status ${response.status}`);
}

async function createContainer(url) {
  const response = await solidFileClient.createFolder(url);

  if (!isSuccessfulStatusCode(response.status))
    throw new Error(`Failed creating container at ${url}, returned status ${response.status}`);

  return url;
}

function isSuccessfulStatusCode(statusCode) {
  return Math.floor(statusCode / 100) === 2;
}

function getDocumentUrl(resourceUrl) {
  const url = new URL(resourceUrl);

  url.hash = '';

  return url.href;
}

function escapeText(text) {
  return text.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

$.draw(() => {
  const { user, loading } = state['ls/current/solid-user']

  if(loading) return `Loading...`

  const button = user
    ? `
      <button id="logout-button" type="button">Log out</button>
    `
    : `
      <button id="login-button" type="button">
        Log in
      </button>
    `

  return `
    ${button}
  `
})

$.style(`
  & button {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: color 100ms;
    padding: .25rem 1rem;
    z-index: 1;
  }
`)

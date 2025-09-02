import diffHTML from 'diffhtml'
import { StorageClient } from "@wallet.storage/fetch-client";
import { Ed25519Signer } from "@did.coop/did-key-ed25519"

const PLAN68_ROOT_DIR = '/root/'

export const walletDefaultHost = plan98.env.PLAN98_WAS_HOST || 'http://localhost:8080'

async function newAgent() {
  const id = self.crypto.randomUUID()
  const signer = await Ed25519Signer.generate()

  return {
    id,
    asJSON: signer.toJSON(),
  }
}

let rootAgent = localStorage.getItem('__plan68/access')
if(!rootAgent){
  rootAgent = await newAgent()
  localStorage.setItem('__plan68/access', JSON.stringify(rootAgent))
} else {
  rootAgent = JSON.parse(rootAgent)
}

let signer = await Ed25519Signer.fromJSON(JSON.stringify(rootAgent.asJSON))
const storage = new StorageClient(new URL(walletDefaultHost))

export function getSigner() {
  return signer
}

export function setSigner(s) {
  signer = s
}

const logs = {}

export function insights() {
  return logs
}

function insight(name, link) {
  if(!logs[`${name}:${link}`]) {
    logs[`${name}:${link}`] = 0
  }
  logs[`${name}:${link}`] += 1
}

const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]
const reactiveFunctions = {}


function react(link) {
  if(!reactiveFunctions[link]) return

  Object.keys(reactiveFunctions[link])
    .map(id => reactiveFunctions[link][id]())
}

const backupAgents = {}

function ensureAgentDispatcher(link) {
  if(!backupAgents[link]) {
    backupAgents[link] = []
  }
}

function addAgent(link, agent) {
  ensureAgentDispatcher(link)
  backupAgents[link].push(agent)
}

function backup(link) {
  ensureAgentDispatcher(link)

  const allAgents = backupAgents[link]

  allAgents.map(callback => callback())
}

function plan68path(target) {
  return PLAN68_ROOT_DIR + target.id
}

const notifications = {
  [react.toString()]: react,
  [backup.toString()]: backup,
}

function notify(link) {
  Object.keys(notifications)
    .map(key => notifications[key](link))
}

const store = createStore({}, notify)

function update(link, target, compositor, lifeCycle={}) {
  insight('elf:update', link)
  if(lifeCycle.beforeUpdate) {
    lifeCycle.beforeUpdate.call(this, target)
  }

  const html = compositor.call(this, target)
  if(html) diffHTML.innerHTML(target, html)

  if(lifeCycle.afterUpdate) {
    lifeCycle.afterUpdate.call(this, target)
  }
}

const middleware = [
  c2sSync
]

async function c2sSync(link, target) {
  if(target.getAttribute('offline') === 'true') return
  if(target['c2sSync']) return
  target['c2sSync'] = true

  downTheData(link, target)
  await guaranteeTheData(link, target)
  upTheData(link, target)
}

function draw(link, compositor, lifeCycle={}) {
  insight('elf:draw', link)
  if(!reactiveFunctions[link]) {
    reactiveFunctions[link] = {}
  }

  listen(CREATE_EVENT, link, (event) => {
    middleware.forEach(x => x(link, event.target))
    const draw = update.bind(this, link, event.target, compositor, lifeCycle)
    reactiveFunctions[link][event.target.id] = draw
    draw()
  })
}

function style(link, stylesheet) {
  insight('elf:style', link)
  const styles = `
    <style type="text/css" data-link="${link}">
      ${stylesheet.replaceAll('&', link)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(link) {
  insight('elf:learn', link)
  return store.get(link) || {}
}

export function teach(link, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('elf:teach', link)
  store.set(link, knowledge, nuance)
}

export function when(link, type, arg2, callback) {
  if(typeof arg2 === 'function') {
    insight('elf:when:'+type, link)
    return listen.call(this, type, link, arg2)
  } else {
    const nested = `${link} ${arg2}`
    insight('elf:when:'+type, nested)
    return listen.call(this, type, nested, callback)
  }
}

export default function elf(link, initialState = {}) {
  insight('elf', link)
  teach(link, initialState)

  return {
    link,
    learn: learn.bind(this, link),
    draw: draw.bind(this, link),
    style: style.bind(this, link),
    when: when.bind(this, link),
    teach: teach.bind(this, link),
  }
}

export function subscribe(fun) {
  notifications[fun.toString] = fun
}

export function unsubscribe(fun) {
  if(notifications[fun.toString]) {
    delete notifications[fun.toString]
  }
}

export function listen(type, link, handler = () => null) {
  const callback = (event) => {
    if(
      event.target &&
      event.target.matches &&
      event.target.matches(link)
    ) {

      insight('elf:listen:'+type, link)
      handler.call(this, event);
    }
  };

  const options = { capture: true, passive: false }
  document.addEventListener(type, callback, options);

  if(observableEvents.includes(type)) {
    observe(link);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(link);
    }

    document.removeEventListener(type, callback, options);
  }
}

let links = []

function observe(link) {
  links = [...new Set([...links, link])];
  maybeCreateReactive([...document.querySelectorAll(link)])
}

function disregard(link) {
  const index = links.indexOf(link);
  if(index >= 0) {
    links = [
      ...links.slice(0, index),
      ...links.slice(index + 1)
    ];
  }
}

function maybeCreateReactive(targets) {
  targets
    .filter(x => !x.reactive)
    .forEach(dispatchCreate)
}

function getSubscribers({ target }) {
  if(links.length > 0)
    return [...target.querySelectorAll(links.join(', '))];
  else
    return []
}

function dispatchCreate(target) {
  insight('elf:create', target.localName)
  try {
    if(!target.id) target.id = self.crypto.randomUUID()
  } catch(e) {
    if(!target.id) target.id = uuidv4()
  }
  target.dispatchEvent(new Event(CREATE_EVENT))
  target.reactive = true
}

const registry = '/public/elves'
function elves() {
  new MutationObserver((mutationsList) => {
    const targets = [...mutationsList]
      .map(getSubscribers)
      .flatMap(x => x)
    maybeCreateReactive(targets)
  }).observe(document.body, { childList: true, subtree: true });
  modules({ registry })
  new MutationObserver(() => {
    modules({ registry })
  }).observe(document.body, { childList: true, subtree: true });

}

function modules({ registry }) {
  const tags = new Set(
    [...document.querySelectorAll(':not(:defined)')]
    .map(({ tagName }) => tagName.toLowerCase())
  )

  tags.forEach(async (tag) => {
    const url = `${registry || '.'}/${tag}.js`
    const exists = (await fetch(url, { method: 'HEAD' })).ok
    if(!exists) return
    let definable = true
    await import(url).catch((e) => {
      definable = false
      console.error(e)
    })
    try {
      definable = definable && document.querySelector(tag) && document.querySelector(tag).matches(':not(:defined)')
      if(definable) {
        customElements.define(tag, class WebComponent extends HTMLElement {
          constructor() {
            super();
          }
        });
      }
    } catch(e) {
      console.log('Error defining module:', tag, e)
    }
  })
}

try {
  elves()
} catch(e) {
  setTimeout(elves,1000)
}

function createStore(initialState = {}, subscribe = () => null) {
  let state = {
    ...initialState
  };

  return {
    set: function(link, knowledge, nuance) {
      const wisdom = nuance(state[link] || {}, knowledge);

      state = {
        ...state,
        [link]: wisdom
      };

      subscribe(link);
    },

    get: function(link) {
      return state[link];
    }
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getSpace(uuid) {
  return storage.space({
    signer,
    id: `urn:uuid:${uuid}`
  })
}

export async function get(src) {
  const resource = this.space.resource(src)

  return await resource.get({ signer })
    .then(async res => {
      if(!res.ok) {
        throw new Error('Not OKAY!')
      }
      return (await res.blob())
    })
}

export async function touch(src, config={ type: 'application/json' }) {
  const resource = this.space.resource(src)

  const typedBlob = new Blob([JSON.stringify({})], config)
  return await resource.put(typedBlob, { signer })
    .then(res => {
      console.debug({ res })
      return res
    })
}

window.touch = touch

async function guaranteeTheData(link, target) {
  const space = getSpace(target.id)

  const linkset = space.resource(`linkset`)
  const spaceObject = {
    controller: signer.controller,
    link: linkset.path,
  }
  const spaceObjectBlob = new Blob(
    [JSON.stringify(spaceObject)],
    { type: 'application/json' },
  )

  // send PUT request to update the space
  const responseToPutSpace = await space.put(spaceObjectBlob)
    .then(res => {
      console.debug({ res })
      return res
    })
    .catch(e => {
      console.debug(e)
    })

  if (!responseToPutSpace.ok) throw new Error(
    `Failed to put space: ${responseToPutSpace.status} ${responseToPutSpace.statusText}`, {
    cause: {
      responseToPutSpace
    }
  })
}

function upTheData(link, target) {
  addAgent(link, function callbackLikeAnOperator() {
    const space = getSpace(target.id)

    const state = learn(link)

    put.call({ space }, plan68path(target), JSON.stringify(state), { type: 'application/json' })
      .catch(error => { console.warn(error) });
  })
}

function downTheData(link, target) {
  const space = getSpace(target.id)
  get.call({ space }, plan68path(target))
    .then(blob => {
      if(blob) {
        blob.text().then(str => JSON.parse(str)).then(data => {
          teach(link, data)
        })
      }
    })
}

export async function put(src, file, config={ type: 'text/plain' }) {
  const resource = this.space.resource(src)

  const typedBlob = new Blob([file], config)
  return await resource.put(typedBlob, { signer })
    .then(res => {
      return res
    })
}



export async function del(src) {
  const resource = this.space.resource(src)

  return await resource.delete()
    .then(res => {
      console.debug({ res })
      return res
    })
}


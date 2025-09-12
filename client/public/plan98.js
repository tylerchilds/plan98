import diffHTML from 'diffhtml'
import geckos from '@geckos.io/client'

let PLAN98_NODE_ID
try {
  PLAN98_NODE_ID = self.crypto.randomUUID()
} catch(e) {
  PLAN98_NODE_ID = uuidv4()
}

// fallback for non-secure lan parties

const logs = {}

export function insights() {
  return logs
}

function insight(name, table) {
  if(!logs[`${name}:${table}`]) {
    logs[`${name}:${table}`] = 0
  }
  logs[`${name}:${table}`] += 1
}

const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]
const reactiveFunctions = {}


function react(table) {
  if(!reactiveFunctions[table]) return

  Object.keys(reactiveFunctions[table])
    .map(id => reactiveFunctions[table][id]())
}

const notifications = {
  [react.toString()]: react
}

function notify(table) {
  Object.keys(notifications)
    .map(key => notifications[key](table))
}

const store = createStore({}, notify)

const config = plan98.env.PLAN98_REALTIME ?
  {
    url: plan98.env.PLAN98_REALTIME,
    port: 443,
  } :
  {
    port: 9208
  }

export const channel = geckos(config) // default port is 9208

let peerReady = false
const subscriptions = []

function connect(subscription) {
  if(peerReady) {
    subscription()
    return
  }

  subscriptions.push(subscription)
}

function processSubscriptionQueue() {
  subscriptions.forEach(x => x())
}

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  peerReady = true
  processSubscriptionQueue()

  channel.on('stateCache', ({ table, data }) => {
    if(data) {
      store.set(table, data, (state, payload) => {
        return {
          ...state,
          ...payload
        }
      })
    }
  })

  channel.on('stateDownload', (data) => {
    notifyDownloaders(data)
  })

  channel.on('error', (error) => {
    console.error("Geckos Error:", error);
  })
})

function linkState(table) {
  channel.emit('linkState', {
    table,
    id: this.id,
    data: learn(table)
  });
}

function udpDownload(data) {
  if(!data.table) return
  const {
    __plan98_sender_id,
    table,
    knowledge,
    serializedNuance
  } = data

  if(__plan98_sender_id === PLAN98_NODE_ID) return

  const merge = typeof serializedNuance === 'object'
    ? objectFunction(serializedNuance)
    : stringFunction(serializedNuance)
  store.set(table, knowledge, merge)
}

function udpUpload(table, knowledge, nuance) {
  const serializedNuance = typeof nuance === 'function'
    ? nuance.toString()
    : {
      mergeHandler: nuance.mergeHandler.toString(),
      parameters: nuance.parameters || []
    }

  const data = {
    __plan98_sender_id: PLAN98_NODE_ID,
    table,
    knowledge,
    serializedNuance
  }
  channel.emit('stateUpload', { id: this.id, data })
}

const uploadCallbacks = {}

export function subscribeToUpload(table, callback) {
  if(!uploadCallbacks[table]) {
    uploadCallbacks[table] = []
  }
  uploadCallbacks[table].push(callback)
}

function notifyUploaders(table, knowledge, nuance) {
  if(!uploadCallbacks[table]) {
    return
  }
  uploadCallbacks[table].forEach(callback => {
    callback(table, knowledge, nuance)
  })
}


const downloadCallbacks = {}

export function subscribeToDownload(table, callback) {
  if(!downloadCallbacks[table]) {
    downloadCallbacks[table] = []
  }
  downloadCallbacks[table].push(callback)
}

function notifyDownloaders(data) {
  if(!downloadCallbacks[data.table]) {
    return
  }
  downloadCallbacks[data.table].forEach(callback => {
    callback(data)
  })
}

function update(table, target, compositor, lifeCycle={}) {
  insight('plan98:update', table)
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
  udpSync
]

function udpSync(table, target) {
  if(target.getAttribute('offline') === 'true') return
  if(target['udpSync']) return
  target['udpSync'] = true
  
  connect(() => {
    linkState.call(target, table)
    subscribeToUpload(table, udpUpload.bind(target))
    subscribeToDownload(table, udpDownload.bind(target))
  })
} 

function objectFunction({ mergeHandler, parameters }) {
  return stringFunction(mergeHandler).apply(null, parameters)
}

function stringFunction(s) {
  return new Function('return ' + s)()
}

function draw(table, compositor, lifeCycle={}) {
  insight('plan98:draw', table)
  if(!reactiveFunctions[table]) {
    reactiveFunctions[table] = {}
  }

  listen(CREATE_EVENT, table, (event) => {
    middleware.forEach(x => x(table, event.target))
    const draw = update.bind(this, table, event.target, compositor, lifeCycle)
    reactiveFunctions[table][event.target.id] = draw
    draw()
  })
}

function style(table, stylesheet) {
  insight('plan98:style', table)
  const styles = `
    <style type="text/css" data-table="${table}">
      ${stylesheet.replaceAll('&', table)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(table) {
  insight('plan98:learn', table)
  return store.get(table) || {}
}

export function teach(table, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('plan98:teach', table)
  store.set(table, knowledge, nuance)
  notifyUploaders(table, knowledge, nuance)
}

export function when(table, type, arg2, callback) {
  if(typeof arg2 === 'function') {
    insight('plan98:when:'+type, table)
    return listen.call(this, type, table, arg2)
  } else {
    const nested = `${table} ${arg2}`
    insight('plan98:when:'+type, nested)
    return listen.call(this, type, nested, callback)
  }
}

export default function elf(table, initialState = {}) {
  insight('plan98', table)
  teach(table, initialState)

  return {
    link: table,
    learn: learn.bind(this, table),
    draw: draw.bind(this, table),
    style: style.bind(this, table),
    when: when.bind(this, table),
    teach: teach.bind(this, table),
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

export function listen(type, table, handler = () => null) {
  const callback = (event) => {
    if(
      event.target &&
      event.target.matches &&
      event.target.matches(table)
    ) {

      insight('plan98:listen:'+type, table)
      handler.call(this, event);
    }
  };

  const options = { capture: true, passive: false }
  document.addEventListener(type, callback, options);

  if(observableEvents.includes(type)) {
    observe(table);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(table);
    }

    document.removeEventListener(type, callback, options);
  }
}

let tables = []

function observe(table) {
  tables = [...new Set([...tables, table])];
  maybeCreateReactive([...document.querySelectorAll(table)])
}

function disregard(table) {
  const index = tables.indexOf(table);
  if(index >= 0) {
    tables = [
      ...tables.slice(0, index),
      ...tables.slice(index + 1)
    ];
  }
}

function maybeCreateReactive(targets) {
  targets
    .filter(x => !x.reactive)
    .forEach(dispatchCreate)
}

function getSubscribers({ target }) {
  if(tables.length > 0)
    return [...target.querySelectorAll(tables.join(', '))];
  else
    return []
}

function dispatchCreate(target) {
  insight('plan98:create', target.localName)
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
    //if(!plan98 || plan98.registry[tag]) return
    //plan98.registry[tag] = url
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
    set: function(table, knowledge, nuance) {

      const merge = typeof nuance === 'function'
        ? nuance
        : nuance.mergeHandler.apply(null, nuance.parameters)
      const wisdom = merge(state[table] || {}, knowledge);

      state = {
        ...state,
        [table]: wisdom
      };

      subscribe(table);
    },

    get: function(table) {
      return state[table];
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

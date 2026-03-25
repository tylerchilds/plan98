import diffHTML from 'diffhtml'
import geckos from '@geckos.io/client'
import { getQuickJS } from "quickjs-emscripten"

const logs = {}
const store = createStore({}, notify)

const QuickJS = await getQuickJS()

function secureEval(query, variables, options = {}) {
  const { 
    bypassSecurity=false,
    saneWasher = (x) => x
  } = options

  if(bypassSecurity) {
    try {
      // Create a function with parameters matching your variables
      const paramNames = Object.keys(variables);
      const paramValues = Object.values(variables);

      // Build a function that evaluates the query
      const fn = new Function(...paramNames, `return (${query})`);

      // Execute with the variables as arguments
      const result = fn(...paramValues);
      const washedResult = saneWasher(result);

      return {
        error: null,
        data: washedResult
      };
    } catch (error) {
      return {
        error: error.message,
        data: null
      };
    }
  }

  let res
  const vm = QuickJS.newContext()

  for (const [key, value] of Object.entries(variables)) {
    const handle = vm.newString(value)
    vm.setProp(vm.global, key, handle)
    handle.dispose()
  }

  //console.log('seval: ', query, variables)
  const evaluation = vm.evalCode(query)
  if(evaluation.error) {
    res = {
      error: vm.dump(
        evaluation.error
      ),
      data: null
    }
    evaluation.error.dispose()
  } else {
    res = {
      error: null,
      data: saneWasher(
        vm.dump(
          evaluation.value
        )
      )
    }
    evaluation.value.dispose()
  }

  vm.dispose()

  return res
}

let PLAN98_NODE_ID
try {
  PLAN98_NODE_ID = self.crypto.randomUUID()
} catch(e) {
  PLAN98_NODE_ID = uuidv4()
}


export function insights() {
  return logs
}

function insight(name, elf) {
  if(!logs[`${name}:${elf}`]) {
    logs[`${name}:${elf}`] = 0
  }
  logs[`${name}:${elf}`] += 1
}

const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]
const reactiveFunctions = {}


function react(elf) {
  if(!reactiveFunctions[elf]) return

  Object.keys(reactiveFunctions[elf])
    .map(id => reactiveFunctions[elf][id]())
}

const notifications = {
  [react.toString()]: react
}

function notify(elf) {
  Object.keys(notifications)
    .map(key => notifications[key](elf))
}


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

let isConnected = false
channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  isConnected = true
  peerReady = true
  processSubscriptionQueue()

  channel.on('stateCache', ({ elf, data }) => {
    if(data) {
      store.set(elf, data, (state, payload) => {
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

function linkState(elf) {
  if(isConnected) {
    channel.emit('linkState', {
      elf,
      id: this.id,
      data: learn(elf)
    });
  }
}

function udpDownload(data) {
  if(!data.elf) return
  const {
    __plan98_sender_id,
    elf,
    knowledge,
    serializedNuance
  } = data

  if(__plan98_sender_id === PLAN98_NODE_ID) return

  const merge = typeof serializedNuance === 'object'
    ? sandbox(serializedNuance)
    : serializedNuance

  if(merge) {
    const bypassSecurity = serializedNuance.bypassSecurity
    store.set(elf, knowledge, merge, { bypassSecurity })
  }
}


function sandbox({ mergeHandler, parameters, bypassSecurity=false }) {
  const mergeHandlerStr = mergeHandler.toString();
  const paramsStr = JSON.stringify(parameters);

  const result = secureEval(`
    // Build a self-contained function with params baked in
    '(' + ${JSON.stringify(mergeHandlerStr)} + ')' +
      '.apply(null, ' + paramStr + ')';
  `, {
    paramStr: paramsStr,
  }, {
    bypassSecurity
  });

  if (result.error) {
    console.error('Failed to create merge function:', result.error);
    console.error('Handler:', mergeHandlerStr);
    console.error('Params:', parameters);
    return false;
  }

  //console.log('Generated merge function:', result.data);
  return result.data;
}

function udpUpload(elf, knowledge, nuance) {
  const serializedNuance = typeof nuance === 'function'
    ? nuance.toString()
    : {
      mergeHandler: nuance.mergeHandler.toString(),
      parameters: nuance.parameters || []
    }

  const data = {
    __plan98_sender_id: PLAN98_NODE_ID,
    elf,
    knowledge,
    serializedNuance
  }
  channel.emit('stateUpload', { id: this.id, data })
}

const uploadCallbacks = {}

export function subscribeToUpload(elf, callback) {
  if(!uploadCallbacks[elf]) {
    uploadCallbacks[elf] = []
  }
  uploadCallbacks[elf].push(callback)
}

function notifyUploaders(elf, knowledge, nuance) {
  if(!uploadCallbacks[elf]) {
    return
  }
  uploadCallbacks[elf].forEach(callback => {
    callback(elf, knowledge, nuance)
  })
}


const downloadCallbacks = {}

export function subscribeToDownload(elf, callback) {
  if(!downloadCallbacks[elf]) {
    downloadCallbacks[elf] = []
  }
  downloadCallbacks[elf].push(callback)
}

function notifyDownloaders(data) {
  if(!downloadCallbacks[data.elf]) {
    return
  }
  downloadCallbacks[data.elf].forEach(callback => {
    callback(data)
  })
}

function update(elf, target, compositor, lifeCycle={}) {
  insight('plan98:update', elf)
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

function udpSync(elf, target) {
  if(target.getAttribute('offline') === 'true') return
  if(target['udpSync']) return
  target['udpSync'] = true

  connect(() => {
    linkState.call(target, elf)
    subscribeToUpload(elf, udpUpload.bind(target))
    subscribeToDownload(elf, udpDownload.bind(target))
  })
} 

function draw(elf, compositor, lifeCycle={}) {
  insight('plan98:draw', elf)
  if(!reactiveFunctions[elf]) {
    reactiveFunctions[elf] = {}
  }

  listen(CREATE_EVENT, elf, (event) => {
    if(lifeCycle.onCreate) {
      lifeCycle.onCreate.call(this, event.target)
    }
    middleware.forEach(x => x(elf, event.target))
    const draw = update.bind(this, elf, event.target, compositor, lifeCycle)
    reactiveFunctions[elf][event.target.id] = draw

    draw()
  })
}

function style(elf, stylesheet) {
  insight('plan98:style', elf)
  const styles = `
    <style type="text/css" data-elf="${elf}">
      ${stylesheet.replaceAll('&', elf)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(elf) {
  insight('plan98:learn', elf)
  return store.get(elf) || {}
}

export function teach(elf, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('plan98:teach', elf)
  store.set(elf, knowledge, nuance)

  if(this && this.__PLAN98_OFFLINE_ONLY) {
    return
  }

  notifyUploaders(elf, knowledge, nuance)
}

export function when(elf, type, arg2, callback) {
  if(typeof arg2 === 'function') {
    insight('plan98:when:'+type, elf)
    return listen.call(this, type, elf, arg2)
  } else {
    const nested = `${elf} ${arg2}`
    insight('plan98:when:'+type, nested)
    return listen.call(this, type, nested, callback)
  }
}

export default function Self(elf, initialState = {}) {
  insight('plan98', elf)
  teach(elf, initialState)

  return {
    // link is a human that is permitted to be an elf per order of the deku tree
    link: elf,
    elf: elf,
    table: elf,
    root: elf,
    tag: elf,
    selector: elf,
    body: elf,

    // link has an ear to listen to the peoples of zora, goron, korok, kokiri, rito, gerudo, hyrule, et al
    ear: learn.bind(this, elf),
    learn: learn.bind(this, elf),
    get: learn.bind(this, elf),
    read: learn.bind(this, elf),
    model: learn.bind(this, elf),
    object: learn.bind(this, elf),
    subject: learn.bind(this, elf),
    predicate: learn.bind(this, elf),

    // link has a head to keep all his facts straight in the current moment in time
    head: draw.bind(this, elf),
    draw: draw.bind(this, elf),
    render: draw.bind(this, elf),
    view: draw.bind(this, elf),

    // link has an eye through which to spy reality
    eye: style.bind(this, elf),
    style: style.bind(this, elf),
    flair: style.bind(this, elf),
    skin: style.bind(this, elf),
    fashion: style.bind(this, elf),

    // link has a hand to move the pieces into place at his command
    hand: when.bind(this, elf),
    when: when.bind(this, elf),
    on: when.bind(this, elf),
    listen: when.bind(this, elf),

    // link has a mouth that he lets others stuff with their hopes and dreams
    mouth: teach.bind(this, elf),
    teach: teach.bind(this, elf),
    set: teach.bind(this, elf),
    write: teach.bind(this, elf),
    update: teach.bind(this, elf),
    put: teach.bind(this, elf),
    post: teach.bind(this, elf),
    patch: teach.bind(this, elf),
    delete: teach.bind(this, elf),
    controller: teach.bind(this, elf),

    whisper: teach.bind({ __PLAN98_OFFLINE_ONLY: true }, elf)
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

export function listen(type, elf, handler = () => null) {
  const callback = (event) => {
    if(
      event.target &&
      event.target.matches &&
      event.target.matches(elf)
    ) {

      insight('plan98:listen:'+type, elf)
      handler.call(this, event);
    }
  };

  const options = { capture: true, passive: false }
  document.addEventListener(type, callback, options);

  if(observableEvents.includes(type)) {
    observe(elf);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(elf);
    }

    document.removeEventListener(type, callback, options);
  }
}

let elves = []

function observe(elf) {
  elves = [...new Set([...elves, elf])];
  maybeCreateReactive([...document.querySelectorAll(elf)])
}

function disregard(elf) {
  const index = elves.indexOf(elf);
  if(index >= 0) {
    elves = [
      ...elves.slice(0, index),
      ...elves.slice(index + 1)
    ];
  }
}

function maybeCreateReactive(targets) {
  targets
    .filter(x => !x.reactive)
    .forEach(dispatchCreate)
}

function getSubscribers({ target }) {
  if(elves.length > 0)
    return [...target.querySelectorAll(elves.join(', '))];
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
function watch() {
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

const cached = {}
function modules({ registry }) {
  const tags = new Set(
    [...document.querySelectorAll(':not(:defined)')]
    .map(({ tagName }) => tagName.toLowerCase())
  )

  tags.forEach(async (tag) => {
    const url = `${registry || '.'}/${tag}.js`
    if(cached[url]) return
    cached[url] = true
    const exists = (await fetch(url, { method: 'HEAD' })).ok
    if(!exists) return

    await import(url).catch((e) => {
      console.error(e)
    })
  })
}

try {
  watch()
} catch(e) {
  setTimeout(watch,1000)
}

function createStore(initialState = {}, broadcast = () => null) {
  let state = {
    ...initialState
  };

  return {
    set: function(elf, knowledge, nuance, options={ bypassSecurity: false }) {
      let mergeStr;

      if (typeof nuance === 'function') {
        // Local function, already safe
        mergeStr = nuance.toString();
      } else if (typeof nuance === 'string') {
        // String from network, use as-is (will be evaluated in sandbox)
        mergeStr = nuance;
      } else {
        // Object from network, sandbox it first
        const sandboxed = sandbox(nuance);
        if (!sandboxed) {
          console.error('Failed to sandbox merge function');
          return;
        }
        mergeStr = sandboxed;
      }

      const wisdom = secureEval(`
        const localState = JSON.parse(stateStr);
        const knowledge = JSON.parse(knowledgeStr);

        const merge = (0, ${mergeStr});

        const debug = {
          localState,
          knowledge,
        };

        const output = merge(localState || {}, knowledge);

        JSON.stringify({
          debug,
          output
        });
      `, {
        stateStr: JSON.stringify(state[elf] || {}),
        knowledgeStr: JSON.stringify(knowledge),
      }, {
        bypassSecurity: options.bypassSecurity
      });

      if (wisdom.error) {
        throw new Error(`Sandboxed execution failed: ${JSON.stringify(wisdom.error)}`);
      } else {
        state = {
          ...state,
          [elf]: JSON.parse(wisdom.data).output
        };

        broadcast(elf);
      }
    },

    get: function(elf) {
      return state[elf];
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

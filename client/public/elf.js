import diffHTML from 'diffhtml'
import Computer from '@sillonious/computer'

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

const notifications = {
  [react.toString()]: react
}

function notify(link) {
  Object.keys(notifications)
    .map(key => notifications[key](link))
}

const store = createStore({}, notify)


function update(link, target, compositor, lifeCycle={}) {
  insight('module:update', link)
  if(lifeCycle.beforeUpdate) {
    lifeCycle.beforeUpdate.call(this, target)
  }

  const html = compositor.call(this, target)
  if(html) diffHTML.innerHTML(target, html)

  if(lifeCycle.afterUpdate) {
    lifeCycle.afterUpdate.call(this, target)
  }
}

function draw(link, compositor, lifeCycle={}) {
  insight('module:draw', link)
  if(!reactiveFunctions[link]) {
    reactiveFunctions[link] = {}
  }

  listen(CREATE_EVENT, link, (event) => {
    const draw = update.bind(this, link, event.target, compositor, lifeCycle)
    reactiveFunctions[link][event.target.id] = draw
    draw()
  })
}

function style(link, stylesheet) {
  insight('module:style', link)
  const styles = `
    <style type="text/css" data-link="${link}">
      ${stylesheet.replaceAll('&', link)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(link) {
  insight('module:learn', link)
  return store.get(link) || {}
}

export function teach(link, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('module:teach', link)
  store.set(link, knowledge, nuance)
}

export function when(link1, type, link2, callback) {
  const link = `${link1} ${link2}`
  insight('module:when:'+type, link)
  listen.call(this, type, link, callback)
}

export default function module(link, initialState = {}) {
  insight('module', link)
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

      insight('module:listen:'+type, link)
      handler.call(this, event);
    }
  };

  document.addEventListener(type, callback, true);

  if(observableEvents.includes(type)) {
    observe(link);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(link);
    }

    document.removeEventListener(type, callback, true);
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
  insight('module:create', target.localName)
  if(!target.id) target.id = self.crypto.randomUUID()
  target.dispatchEvent(new Event(CREATE_EVENT))
  target.reactive = true
}

function elves() {
  new MutationObserver((mutationsList) => {
    const targets = [...mutationsList]
      .map(getSubscribers)
      .flatMap(x => x)
    maybeCreateReactive(targets)
  }).observe(document.body, { childList: true, subtree: true });
  new Computer(self.plan98, { registry: '/public/elves' })
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

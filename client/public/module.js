import statebus, { state as s } from 'statebus'
import { innerHTML } from 'diffhtml'
import Computer from '@sillonious/computer'

const logs = {}

export const state = s

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

function update(link, target, compositor, lifeCycle={}) {
  insight('module:update', link)
  if(lifeCycle.beforeUpdate) {
    lifeCycle.beforeUpdate(target)
  }

  const html = compositor(target)
  if(html) innerHTML(target, html)

  if(lifeCycle.afterUpdate) {
    lifeCycle.afterUpdate(target)
  }
}

function draw(link, compositor, lifeCycle={}) {
  insight('module:draw', link)
  listen(CREATE_EVENT, link, (event) => {
    statebus.reactive(
      update.bind(null, link, event.target, compositor, lifeCycle)
    )()
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
  return state[link] || {}
}

export function teach(link, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('module:teach', link)
  const current = statebus.cache[link] || {}
  state[link] = nuance(current.val || {}, knowledge);
}

export function when(link1, type, link2, callback) {
  const link = `${link1} ${link2}`
  insight('module:when:'+type, link)
  listen(type, link, callback)
}

export default function module(link, initialState = {}) {
  insight('module', link)
  teach(link, initialState)

  return {
    link,
    learn: learn.bind(null, link),
    draw: draw.bind(null, link),
    style: style.bind(null, link),
    when: when.bind(null, link),
    teach: teach.bind(null, link),
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
      handler.call(null, event);
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
  if(!target.id) target.id = sufficientlyUniqueId()
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

function sufficientlyUniqueId() {
  // https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

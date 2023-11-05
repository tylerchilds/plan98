import "./statebus/statebus.js"
import "./statebus/client-library.js"
import "./statebus/braidify-client.js"

import { innerHTML } from 'diffhtml'

// window pollution will end with typed dsl reactive state proxy
const bus = window.bus
export const state = bus.state
bus.libs.localstorage('ls/*')
bus.libs.http_out('/*', '/')
window.braid_fetch = window.fetch
window.module = module
window.state = state

const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]

function update(target, compositor) {
  const html = compositor(target)
  if(html) innerHTML(target, html)
}

function draw(link, compositor) {
  listen(CREATE_EVENT, link, (event) => {
    bus.reactive(
      update.bind(null, event.target, compositor)
    )()
  })
}

function style(link, stylesheet) {
  const styles = `
    <style type="text/css" data-tag=${link}>
      ${stylesheet.replaceAll('&', link)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(link) {
  return state[link] || {}
}

export function teach(link, knowledge, nuance = (s, p) => ({...s,...p})) {
  const current = bus.cache[link] || {}
  state[link] = nuance(current.val || {}, knowledge);
}

export function when(link1, eventName, link2, callback) {
  listen(eventName, `${link1} ${link2}`, callback)
}

export default function module(link, initialState = {}) {
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
  if(!target.id) target.id = sufficientlyUniqueId()
  target.dispatchEvent(new Event(CREATE_EVENT))
  target.reactive = true
}

new MutationObserver((mutationsList) => {
  const targets = [...mutationsList]
    .map(getSubscribers)
    .flatMap(x => x)
  maybeCreateReactive(targets)
}).observe(document.body, { childList: true, subtree: true });

function sufficientlyUniqueId() {
  // https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

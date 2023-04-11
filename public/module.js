const noop = () => null
const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]

const reactiveFunctions = {}

function react(selector) {
  (reactiveFunctions[selector] || noop)()
}

const store = createStore({}, react)

function update(target, compositor) {
  const html = compositor(target)
  if(html) target.innerHTML = html
}

function draw(selector, compositor) {
  listen(CREATE_EVENT, selector, (event) => {
    const draw = update.bind(null, event.target, compositor)
    reactiveFunctions[selector] = draw
    draw()
  })
}

function flair(selector, stylesheet) {
  const styles = `
    <style type="text/css" data-module=${selector}>
      ${stylesheet.replaceAll('&', selector)}
    </style>
  `;

  document
    .body
    .insertAdjacentHTML("beforeend", styles)
}

export function learn(selector) {
  return store.get(selector) || {}
}

export function teach(selector, payload, handler = (s, p) => ({...s,...p})) {
  store.set(selector, payload, handler)
}

export function when(selector1, eventName, selector2, callback) {
  listen(eventName, `${selector1} ${selector2}`, callback)
}

export default function module(selector, initialState = {}) {
  teach(selector, initialState)

  return {
    selector,
    learn: learn.bind(null, selector),
    draw: draw.bind(null, selector),
    flair: flair.bind(null, selector),
    when: when.bind(null, selector),
    teach: teach.bind(null, selector),
  }
}

export function listen(type, selector, handler = () => null) {
  const callback = (event) => {
    if(event.target && event.target.matches && event.target.matches(selector)) {
      handler.call(null, event);
    }
  };

  document.addEventListener(type, callback, true);

  if(observableEvents.includes(type)) {
    observe(selector);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(selector);
    }

    document.removeEventListener(type, callback, true);
  }
}

let selectors = []

function observe(selector) {
  selectors = [...new Set([...selectors, selector])];

  maybeCreateReactive([...document.querySelectorAll(selector)])
}

function disregard(selector) {
  const index = selectors.indexOf(selector);
  if(index >= 0) {
    selectors = [
      ...selectors.slice(0, index),
      ...selectors.slice(index + 1)
    ];
  }
}

function maybeCreateReactive(targets) {
  targets
    .filter(x => !x.reactive)
    .forEach(dispatchCreate)
}

function getSubscribers({ target }) {
  if(selectors.length > 0)
    return [...target.querySelectorAll(selectors.join(', '))];
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

function createStore(
  initialState = {},
  notify = () => null
) {
  let state = {
    ...initialState
  };

  const context = {
    set: function(selector, payload, mergeHandler) {
      const newResource = mergeHandler(state[selector] || {}, payload);

      state = {
        ...state,
        [selector]: newResource
      };

      notify(selector);
    },

    get: function(selector) {
      return state[selector];
    }
  }

  return context;
}

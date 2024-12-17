import module from '@silly/tag'
import { showModal } from './plan98-modal.js'

const emptyReddit = {
  children: [],
  choices: [],
  position: 0,
  after: "",
  before: ""
}

const $ = module('hello-reddit')

function redditById(id) {
  return $.learn()[id] || emptyReddit
}

$.when('click', '.reset', paginate('reset'))
$.when('click', '.more', paginate('after'))

$.when('click', '.back', step(-1))
$.when('click', '.next', step(+1))
$.when('change', '[name="subs"]', function() {
  const { value } = event.target
  $.teach({ choices: value.split('+') })
})

$.when('click', '.full', function() {
  const { id } = event.target.dataset
  showModal(`
    <div style="width: 100%; height: 100%;">
      ${document.getElementById(id).querySelector('figure').innerHTML}
    </div>
  `, { centered: true })
})

function fullscreen(target) {
  if (!document.fullscreenElement &&    // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.mozRequestFullScreen) {
      target.mozRequestFullScreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen(true);
    }
  }
}

$.draw(target => {
  const r = target.getAttribute('r') || ''
  const { choices=[r] } = $.learn()
  const { children = [], loading, position } = query(target, choices)
  const value = choices.join('+')

  return children.length > 0 ? `
    <div class="frame">
      <div class="controls">
        <input type="text" name="subs" value="${value}">
        <button class="reset" data-id="${target.id}">Reset</button>
        <button class="more" data-id="${target.id}">Go Deeper</button>
        <button class="back" data-id="${target.id}">
          Back
        </button>
        <button class="next" data-id="${target.id}">
          Next
        </button>
        <button class="full" data-id="${target.id}">
          Full
        </button>
      </div>
      <figure class="${loading ? 'loading' : ''}">
        ${renderPost(children[position].data)}
      </figure>
    </div>
  ` : `
    <div>
      <input type="text" name="subs" value="${value}">
      ... nothing... yet?
    </div>
  `
})

function renderPost(data) {
  const renderers = {
    'image': (data) => `
        <div style="position: absolute;">
          <a href="${data.url}">${data.title}</a>
          (<a href="https://old.reddit.com${data.permalink}">Permalink</a>)
        </div>
        <img src="${data.url}" />
      `,
    'hosted:video': (data) => `
        <div style="position: absolute;">
          <a href="${data.url}">${data.title}</a>
          (<a href="https://old.reddit.com${data.permalink}">Permalink</a>)
        </div>
        <video controls muted="false" autoplay>
          <source src="${data.secure_media.reddit_video.fallback_url}" type="video/mp4">
          Sorry, your browser doesn't support embedded videos.
        </video>
      `,
    'rich:video': (data) => `
        <div style="position: absolute;">
          <a href="${data.url}">${data.title}</a>
          (<a href="https://old.reddit.com${data.permalink}">Permalink</a>)
        </div>
        ${htmlDecode(data.secure_media.oembed.html)}
      `,
    'link': (data) => `
        <div style="position: absolute;">
          <a href="${data.url}">${data.title}</a>
          (<a href="https://old.reddit.com${data.permalink}">Permalink</a>)
        </div>
        <video controls muted="false" autoplay>
          <source src="${data.preview.reddit_video_preview.fallback_url}" type="video/mp4">
          Sorry, your browser doesn't support embedded videos.
        </video>
      `,

    'default': (data) => `
        <div style="position: absolute;">
          <a href="${data.url}">${data.title}</a>
          (<a href="https://old.reddit.com${data.permalink}">Permalink</a>)
        </div>
      `
  }

  return (renderers[data.post_hint] || renderers['default'])(data)
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

$.style(`
    & {
      border: 1px solid black;
      border-radius: 2px;
      display: block;
      padding: 1rem;
      inset: 0;
      background: black;
      color: white;
      height: 100%;
      max-height: 100%;
    }

    & .frame {
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100%;
    }

    & .loading {
      opacity: .5;
      pointer-events: none;
    }

    & .controls {
      z-index: 1;
    }

    & figure,
    & figure > iframe {
      position: relative !important;
      margin: 0;
      width: 100%;
      height: 100%;
    }

    & h2 {
      margin: 0 0 1rem;
    }

    & ol {
      max-height: 320px;
      overflow-y: auto;
      margin-left: -1rem;
      margin-right: -1rem;
    }

    & li {
      margin-bottom: 1rem;
    }

    & img,
    & video {
      max-width: 100%;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `)

function query(target, choices) {
  const state = redditById(target.id)

  const sort = target.getAttribute('sort') || ''
  const { paginate } = state

  const query = { r: choices.join('+'), sort, paginate }

  request(target, query)

  return state
}

async function request(target, query) {
  const lookup = JSON.stringify(query)

  const { dataset } = target

  if(lookup !== dataset.lookup) {
    target.dataset.lookup = lookup

    const { r, sort = '', paginate = '' } = query
    const url = `https://api.reddit.com/r/${r}/${sort}/.json?count=25${paginate}`

    await fetch(url)
      .then(res => res.json())
      .then(json => json.data)
      .then(response => $.teach({
        ...response,
        loading: false
      }, merge(target.id)))
  }
}

function paginate(key) {
  return ({ target }) => {
    const { id } = target.dataset
    const state = redditById(id)
    const query = key !== 'reset'
      ? `&${key}=${state[key]}`
      : ''

    $.teach({ paginate: query, loading: true }, merge(id))
    document.getElementById(id)
      .querySelector('ol').scrollTop = '0'
  }
}

function merge(id) {
  return function middleware(state, payload) {
    return {
      ...state,
      [id]: {
        ...emptyReddit,
        ...state[id],
        ...payload
      }
    }
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function step(i) {
  return event => {
    const { id } = event.target.dataset
    const { children, position } = redditById(id)

    const index = mod((position + i), children.length)

    $.teach({
      id,
      position: index
    }, merge(id))
  }
}

const eventMap = {
  37: function() { click('.back') },
  38: function() { click('.more') },
  39: function() { click('.next') },
};
function keys(event) {
  const handler = eventMap[event.keyCode] || (()=>console.log(event.keyCode)
  );
  handler();
}

function click(selector) {
  const node = document.querySelector(`${$.selector} ${selector}`)

  node.click()
}

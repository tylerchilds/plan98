import tag from '@silly/tag'
import $intro from './plan98-intro.js'
import $zune from './plan9-zune.js'
import { actionScript } from './action-script.js'

const sillyzPreferred = '/app/draw-term'

// synthia is eval and must be stopped
const synthia = eval
// welcome to the every letter formation
const nonce = `<div class="nonce"></div>`

$zune.teach({ menu: false })

const $ = tag('sillyz-computer', {
  code: '',
  start: false
})

export function start() {
  $.teach({ start: true })
}

export function stop() {
  $.teach({ start: false })
}

self.plan98.start = start
self.plan98.stop = stop

$.when('click', '[data-ok]', (event) => {
  event.target.closest($.link).removeAttribute('error')
  $.teach({ error: null })
})

$.when('click', '.synthia-clear', (event) => {
  event.target.closest($.link).querySelector('[name="synthia"]').value =''
})

$.draw(target => {
  const error = $.learn().error || target.getAttribute('error')
  const srcAttribute = target.getAttribute('src') || '/404'
  mount(target, srcAttribute)
  const { start, online, src } = $.learn()

  const app = src || srcAttribute || plan98.env.PLAN98_HOME || sillyzPreferred || '/app/draw-term'

  if(error) {
    return `
      <a ${online ? `style="display:none;"`: `class="about-out"`} href="/app/saga-about">
        <span><sl-icon name="info-circle"></sl-icon></span> About
      </a>
      <div class="resource">
        <div style="text-align: center;">
          <div class="error">
            ${error}
          </div>
          <button data-ok data-create="${app}" aria-label="create"></button>
        </div>
      </div>
      ${computer()}
    `
  }

  if(!start) {
    return `
      <a ${online ? `style="display:none;"`: `class="about-out"`} href="/app/saga-about">
        <span><sl-icon name="info-circle"></sl-icon></span> About
      </a>
      <div class="resource">
        ${ online ? `<iframe src="${app}"></iframe>` : `<button data-create="${src}" aria-label="create"></button>` }
      </div>
      ${computer()}
    `
  }

  return `
    <div class="bottom">
      <plan98-intro src="${src}"></plan98-intro>
    </div>
    <div class="top">
      <plan9-zune></plan9-zune>
    </div>
    ${computer()}
  `
}, { afterUpdate })

function afterUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }
}



function mount(target, src) {
  if(target.mounted) return
  target.mounted = true

  const code = target.getAttribute('code')
  if(code) {
    requestIdleCallback(() => {
      $.teach({ code })
    })
  }

  if(src) {
    requestIdleCallback(() => {
      $.teach({ src })
    })
  }
}

function computer() {
  const { promptHeight, calculation, code } = $.learn()
  return `
    <div class="suggestion-box">${results(calculation)}</div>

    <div class="title-bar">
      <button data-calculate class="synthia-action">
        <sl-icon name="calculator"></sl-icon>
      </button>
      <div class="prompt">
        <textarea rows="1" ${ promptHeight ? `style="--prompt-height: ${promptHeight}px;"`:''} name="synthia" autocomplete="off">${code||''}</textarea>
        ${code ? `<button data-voice class="synthia-action synthia-clear">
          <sl-icon name="x-lg"></sl-icon>
        </button>`:''}
      </div>
      <button data-voice class="synthia-action">
        <sl-icon name="mic"></sl-icon>
      </button>
      <button data-camera class="synthia-action">
        <sl-icon name="camera"></sl-icon>
      </button>
    </div>
  `
}

function results(x) {
  if(!x) return ''
  return `
    <button type="button" class="auto-item ${x.error ? 'calculation-error':'' }" data-url="${x.url}">
      <div class="icon">
        ${x.image?`<img src="${x.image}" />`:`${nonce}`}
      </div>
      <div class="name">
        ${x.name}
      </div>
    </button>
  `
}

$.when('keyup', '[name="synthia"]', event => {
  const code = event.target.value

  if(code) {
  $.teach({ code })
  } else {
    $.teach({ code })
  }
})

$.when('click', '[data-url]', (event) => {
  const { url } = event.target.dataset

  if(url) {
    window.location.href = url
  }
})


$.when('click', '[data-calculate]', (event) => {
  const { code } = $.learn()

  try {
    let response = synthia(code)

    if(!response) {
      $.teach({ calculation: null, error: false })
      return
    }

    const calculation = { name: response, url: '/app/sillyz-computer?src=/app/sillyz-computer&code=' + encode(code) }
    $.teach({ calculation, error: false })
  } catch(e) {
    $.teach({ calculation: { name: e.message, error: true } })
  }
  })

$.when('click', '[data-create]', (event) => {
  const src = event.target.dataset.create
  $.teach({
    online: true
  })
})

$.when('click', '.action-script', actionScript)

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    background: #54796d;
    animation: &-fade-in ease-in-out 1000ms forwards;
  }

  & .about-out {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    background: black;
    padding: 1rem;
    color: white;
    text-decoration: none;
    display: inline-grid;
    font-size: 1rem;
    padding: .5rem;
    grid-template-columns: auto 1fr auto;
    gap: .5rem;
    line-height: 1;
    animation: &-about-out 1000ms ease-in-out forwards 7777ms;
  }

  @keyframes &-about-out {
    0% {
      opacity: 1;
      pointer-events: all;
    }
    100% {
      opacity: 0;
      pointer-events: none;
    }
  }

  & .suggestion-box .auto-item.calculation-error {
    background: firebrick;
    color: rgba(255,255,255,.85);
  }

  & .suggestion-box .auto-item.calculation-error:hover,
  & .suggestion-box .auto-item.calculation-error:focus {
    background: firebrick;
    color: rgba(255,255,255,.85);
  }

  & .error {
    color: black;
    background: white;
    padding: 2rem;
    font-size: 2rem;
  }

  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  & .top {
    position: absolute;
    inset: 0 0 5rem 0;
    grid-area: midship;
    z-index: 2;
    pointer-events: none;
  }

  & .bottom {
    position: absolute;
    inset: 2rem 0;
    grid-area: midship;
  }

  & .nonce,
  & [data-create] {
    background: lemonchiffon;
    border: none;
    border-radius: none;
    box-shadow: var(--shadow);
    max-width: 10rem;
    aspect-ratio: 1;
    width: 100%;
    position: relative;
    min-height: 1rem;
    min-width: 1rem;
  }

  & .auto-item .icon {
    padding: 3px 0;
    display: grid;
    place-items: center;
  }

  & .nonce::before,
  & [data-create]::before{
    position: absolute;
    inset: 0%;
    content: '';
    display: block;
    width: 60%;
    aspect-ratio: 1;
    background-color: #E83FB8;
    border-radius: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }

  & .nonce {
    box-shadow: none;
  }

  & .resource {
    display: grid;
    place-items: center;
    width: 100%;
    height: calc(100% - 2rem);
    position: relative;
  }

  & .synthia .resource-actions button {
    font-weight: 100;
    color: rgba(0,0,0,.65);
    font-size: 2rem;
    background: transparent;
    border: none;
    border-radius: none;
    display: inline-block;
    margin: 1rem 0;
    padding: 0;
    text-align: left;
  }

  & .synthia .resource-actions button:hover,
  & .synthia .resource-actions button:focus {
    color: rgba(0,0,0,1);
  }
}
  & .synthia {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 1);
    backdrop-filter: blur(150px);
    z-index: 9000;
  }

  & .synthia:not(:empty) {
    display: flex;
    flex-direction: column;
    overflow: auto;
    width: 100%;
    height: 100%;
    background: white;
    padding: 1rem 0;
  }

  & .wrapper {
    padding: 0 1rem;
  }

  & .suggestion-box {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    overflow: auto;
    z-index: 10;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  & .suggestion-box .auto-item {
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: auto 1fr;
    pointer-events: all;
    border: none;
  }

  & .suggestion-box .auto-item:focus,
  & .suggestion-box .auto-item:hover {
    background-color: var(--button-color, dodgerblue);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestion-box .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, dodgerblue);
  }


  & .title-bar {
    margin-top: auto;
    padding: 2px 5px;
    font-size: 1rem;
    height: 2rem;
    min-height: 2rem;
    line-height: 1;
    color: white;
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    color: rgba(0,0,0,.85);
    background: rgba(255,255,255,1);
    gap: 5px;
    touch-action: manipulation;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
  }


  & .title-bar .prompt {
    position: relative;
    z-index: 1000;
  }

  & .synthia-clear {
    position: absolute;
    z-index: 1000;
    right: 0;
    top: 3px;
  }

  & .title-bar textarea {
    border: 1px solid rgba(0,0,0,.85);
    border-radius: 0;
    background: transparent;
    color: rgba(0,0,0,.85);
    width: 100%;
    padding: 0 4px 0;
    height: 100%;
    resize: none;
    line-height: 1.5;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    min-height: 28px;
    max-height: 50vh;
  }


  & .title-bar textarea:focus {
    height: var(--prompt-height);
  }
  & .synthia-action {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 3px 5px;
    transition: opacity 100ms;
    border-radius: 100%;
    display: grid;
    place-items: center;
    color: rgba(0,0,0,.65);
  }

  & .synthia-action:hover,
  & .synthia-action:focus {
    color: rgba(0,0,0,1);
  }
`)


function handleEvent (event) {
  if (event.metaKey) {
    handleSuperKey(event)
  }
}
self.addEventListener('keydown', handleEvent);

self.addEventListener('message', function handleMessage(event) {
  if(event.data.whisper === 'metaKey') {
    handleSuperKey()
  } else { console.log(event) }
});

function handleSuperKey(event) {
  const { menu } = $zune.learn()
  $zune.teach({ menu: !menu })

  const { broken } = $intro.learn()
  $intro.teach({ broken: !broken })

  if(document.querySelector('plan9-zune')) return

  if(self.self !== self.top) {
    self.parent.postMessage({ whisper: 'metaKey' }, "*");
  } else {
    const isSilly = !!document.body.querySelector('sillyz-computer')
    if(!isSilly) {
      const today = new Date().toJSON().slice(0, 10)
      const node = document.body.querySelector('sillonious-brand') || document.body
      node.insertAdjacentHTML("beforeend", `<sillyz-computer src="/app/hyper-script?src=/public/sagas/my/${today}.saga"></sillyz-computer>`)
    }
  }
}

function encode(url) {
  return encodeURIComponent(url).replace(/%20/g, '+');
}

function decode(encodedUrl) {
  return decodeURIComponent(encodedUrl.replace(/\+/g, '%20'));
}

$.when('input', 'textarea', (event) => {
  $.teach({ promptHeight: event.target.scrollHeight })
});

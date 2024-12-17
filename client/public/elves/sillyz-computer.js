import elf from '@silly/elf'
import $intro from './plan98-intro.js'
import $zune from './plan9-zune.js'
import { innerHTML } from 'diffhtml'
import { actionScript } from './action-script.js'

const sillyzPreferred = '/app/my-journal'

// synthia is eval and must be stopped
const synthia = eval
// welcome to the every letter formation
const nonce = `<div class="nonce"></div>`

$zune.teach({ menu: false })

const $ = elf('sillyz-computer', {
  code: ``,
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
  event.preventDefault()
  const node = event.target.closest($.link).querySelector('[name="synthia"]')

  $.teach({ calculation: null, error: false, promptActive: false })
})

$.draw(target => {
  const error = $.learn().error || target.getAttribute('error')
  const srcAttribute = target.getAttribute('src')
  mount(target, srcAttribute)
  const { start, src } = $.learn()

  const app = src || srcAttribute || plan98.env.PLAN98_HOME || sillyzPreferred || '/app/draw-term'

  if(error) {
    return `
      <div class="resource">
        <story-board></story-board>
        <div style="text-align: center;">
          <div class="error">
            ${error}
          </div>
          <button data-ok class="nonce" data-create src="${app}" aria-label="create"></button>
        </div>
      </div>
      <div class="plot-hole"></div>
    `
  }

  if(!start) {
    return `
      <div class="resource">
        <div class="story-board"><story-board></story-board></div>
        <button ${src ? `src="${src}"`:''} class="nonce" data-create aria-label="create"></button>
      </div>
      <div class="plot-hole"></div>
    `
  }

  if(target.ready) return
  target.ready = true

  return `
    <div class="bottom">
      <plan98-intro src="${src || '/app/startup-wizard'}"></plan98-intro>
    </div>
    <div class="top">
      <plan9-zune></plan9-zune>
    </div>
    <div class="plot-hole"></div>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
  saveCursor(target) // first things first
}

function afterUpdate(target) {
  {
    const plotHole = target.querySelector('.plot-hole')
    computer(plotHole)
  }

  replaceCursor(target) // first things first, but after the plot-hole

  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  { // recover story-board from the virtual dom
    [...target.querySelectorAll('story-board')].map(node => {
      const guardian = node.parentNode
      const child = document.createElement('story-board')
      node.remove()
      guardian.appendChild(child)
    })
  }

}

const tags = ['TEXTAREA', 'INPUT']
let sel = []
function saveCursor(target) {
  if(target.contains(document.activeElement)) {
    target.dataset.paused = document.activeElement.name
    if(tags.includes(document.activeElement.tagName)) {
      const textarea = document.activeElement
      sel = [textarea.selectionStart, textarea.selectionEnd];
    }
  } else {
    target.dataset.paused = null
  }
}

function replaceCursor(target) {
  const paused = target.querySelector(`[name="${target.dataset.paused}"]`)
  
  if(paused) {
    paused.focus()

    if(tags.includes(paused.tagName)) {
      paused.selectionStart = sel[0];
      paused.selectionEnd = sel[1];
    }
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
  } else {
    fetch('/elves/game-cribbage.js')
      .then(res => res.text())
      .then(file => $.teach({
        code: file + '\n' + "document.body.innerHTML = '<game-cribbage></game-cribbage>'"
      }))
  }

  if(src) {
    requestIdleCallback(() => {
      $.teach({ src })
    })
  }
}

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g,
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

function computer(node) {
  const { promptHeight, calculation, code, promptActive } = $.learn()
  innerHTML(node, `
    <div class="suggestion-box">${results(calculation)}</div>

    <div class="title-bar">
      <button data-calculate class="synthia-action">
        <sl-icon name="calculator"></sl-icon>
      </button>
      <div class="prompt ${promptActive ? 'focused' : ''}" ${ promptHeight ? `style="--prompt-height: ${promptHeight}px;"`:''}>
        <div class="code-canvas">
          <textarea rows="1" name="synthia" placeholder="prompt synthia" autocomplete="off">${escapeHyperText(code)||''}</textarea>
          ${code ? `<button class="synthia-action synthia-clear">
            <sl-icon name="x-lg"></sl-icon>
          </button>`:''}
        </div>
      </div>
      <button data-voice class="synthia-action">
        <sl-icon name="mic"></sl-icon>
      </button>
      <button data-camera class="synthia-action">
        <sl-icon name="camera"></sl-icon>
      </button>
      <button data-gaming class="synthia-action">
        <sl-icon name="joystick"></sl-icon>
      </button>
    </div>
  `)
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

$.when('input', '[name="synthia"]', event => {
  const code = event.target.value
  $.teach({
    code,
    calculation: null,
    error: false 
  })
})

$.when('click', '[data-url]', (event) => {
  const { url } = event.target.dataset

  if(url && !event.target.matches('.calculation-error')) {
    window.location.href = url
  }
})

$.when('click', '[data-voice]', (event) => {
  $.teach({ calculation: { name: 'voice to search coming soon', error: true } })
})

$.when('click', '[data-camera]', (event) => {
  showModal(`<pocket-dexterity></pocket-dexterity>`)
})

$.when('click', '[data-gaming]', (event) => {
  window.location.href = "/app/generic-park?src=/public/elves"
})


$.when('click', '[data-calculate]', (event) => {
  const { code } = $.learn()
  try {
    let response = synthia(code)

    if(!response) {
      $.teach({ calculation: null, error: false })
      return
    }

    const calculation = { name: response, url: '/app/sillyz-computer?code=' + encode(code) }
    $.teach({ calculation, error: false })
  } catch(e) {
    $.teach({ calculation: { name: e.message, error: true } })
  }
  })

$.when('click', '[data-create]', (event) => {
  const src = event.target.getAttribute('src') || `/app/secure-mail?src=/app/draw-term?src=/app/bulletin-board?src=${`/private/${$.link}/${new Date().toISOString()}`}.saga&uuid=${self.crypto.randomUUID()}`

  event.target.closest($.link).outerHTML = `<iframe src="${src}"></iframe>`
  self.history.pushState({ type: `${$.link}-navigation`, href: window.location.href }, "");
})

addEventListener("popstate", async (event) => {
  const { type, href } = event.state || {}
  console.log(tray, path, type)
  if(type === `${$.link}-navigation`) {
    window.location.href = href
  }
});


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

  & .auto-item .icon {
    padding: 3px 0;
    display: grid;
    place-items: center;
  }

  & .resource {
    display: grid;
    place-items: center;
    width: 100%;
    height: calc(100% - 2rem);
    position: relative;
  }

  & .resource .story-board {
    position: absolute;
    inset: 0;
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
    color: saddlebrown;
  }

  & .suggestion-box .auto-item.active {
    color: saddlebrown;
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
    color: saddlebrown;
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto auto auto;
    background: lemonchiffon;
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
  }

  & .title-bar .prompt.focused {
    position: static;
  }

  & .prompt .synthia-clear {
    display: none;
  }

  & .prompt .synthia-clear:hover,
  & .prompt .synthia-clear:focus {
    opacity: 1;
    background: saddlebrown;
    color: lemonchiffon;
  }

  & .focused .synthia-clear {
    position: absolute;
    z-index: 1000;
    right: .5rem;
    top: .5rem;
    background: saddlebrown;
    color: lemonchiffon;
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    opacity: .5;
    transition: opacity 100ms;
  }

  & code-canvas {
    height: 100%;
  }
  & .focused .code-canvas {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--prompt-height);
    min-height: 28px;
    max-height: 50vh;
  }


  & .title-bar textarea {
    border: 1px solid saddlebrown;
    border-radius: 0;
    background: lemonchiffon;
    color: saddlebrown;
    width: 100%;
    padding: 0 4px 0;
    height: 100%;
    resize: none;
    line-height: 1.5;
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";

  }

  & .title-bar .focused textarea {
    outline: 2px solid mediumseagreen;
    outline-offset: 2px;
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
    color: saddlebrown;
  }

  & .synthia-action:hover,
  & .synthia-action:focus {
    color: dodgerblue;
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
    // this is the top for when you want to utilize the meta key for this os
  }
}

function encode(url) {
  return encodeURIComponent(url).replace(/%20/g, '+');
}

function decode(encodedUrl) {
  return decodeURIComponent(encodedUrl.replace(/\+/g, '%20'));
}

$.when('focus', 'textarea', (event) => {
  $.teach({ promptHeight: event.target.scrollHeight, promptActive: true })
});
$.when('input', 'textarea', (event) => {
  $.teach({ promptHeight: event.target.scrollHeight })
});

$.when('blur', 'textarea', (event) => {
  $.teach({ promptActive: false })
});

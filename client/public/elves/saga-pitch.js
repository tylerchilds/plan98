import { Self, Saga } from '@plan98/types'
import { BUTTON_CODES, overrideButton, checkButton, checkAxis } from './debug-gamepads.js'

// define source code related artifacts that should not be displayed
// todo: cross browser, eliminate the :not selector cause .matches in js throws
const hiddenChildren = ['style','script','hypertext-blankline','hypertext-comment']
const notHiddenChildren = `:not(${hiddenChildren})`

function countShots(instructions) {
  const wrapper= document.createElement('div');
  wrapper.innerHTML = hyperSanitizer(instructions)
  const shotList = Array.from(wrapper.querySelector('xml-html').children).filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  return shotList.length - 1
}

// create a hyper text module
const $ = Self('saga-pitch', {
  activeShot: 0,
  shotCount: 0,
  welcome: true
})

$.when('click', '[data-close-welcome]', (event) => {
  $.teach({ welcome: false })
})

$.draw((target) => {
  const { welcome, activeShot, lastAction } = $.learn()
  const file = sourceFile(target)

  if(welcome) {
    return `
      <div style="height: 100%; background: white; color: black; padding: 1rem; display: grid; place-content: center; text-align: center; gap: 1rem;">
        You're about to enter an immersive experience.
        <div>
          <button class="standard-button -large" data-close-welcome>Cool.</button>
        </div>
      </div>
    `
  }

  const start = activeShot
  const end = activeShot + 1
  const forwards = lastAction !== 'back'
  const html = hyperSanitizer(file)
  if(!html) return ''
  const motion = getMotion(html, { active: activeShot, forwards, start, end })
  const view = `
    <div name="perform">
      <div name="theater">
        <div name="screen">
          <div name="stage">
            ${motion}
          </div>
        </div>
      </div>
    </div>
  `

  const perspective = `
    <div class="grid">
      ${view}
    </div>
  `

  const tid = document.activeElement.id
  target.innerHTML = perspective
  if(tid) document.getElementById(tid).focus()

}, { beforeUpdate, afterUpdate})

function beforeUpdate(target) {
  {
    const vid = target.querySelector('video')
    if(vid) {
      vid.pause()
    }
  }
}

function afterUpdate(target) {
  {
    const vid = target.querySelector('video')
    if(vid) {
      vid.play()
    }
  }
}

// the hyperSanitizer function turns fiction stories into non-fiction
export function hyperSanitizer(script) {
  return Saga(script) || ''
}

function source(target) {
  const head = target.closest($.link)
  const explicit = head.getAttribute('src')
  const remote = head.getAttribute('remote') || ''
  const implicit = `/public/404.saga`
  return `${remote}${explicit || implicit}`
}

function sourceFile(target) {
  const src = source(target)

  const file = $.learn()[src]
  if(target.initialized) return file
  target.initialized = true

  return file
    ? file
    : (function initialize() {
      requestIdleCallback(() => {
        const encodedData = target.getAttribute('data')

        if(encodedData) {
          const file = atob(decodeURIComponent(encodedData))
          $.teach({
            [src]: file,
            shotCount: countShots(file),
          })
        } else {
          let file = ''
          fetch(src).then(async res => {
            if(res.status === 404) {

              file = 'untitled'
            } else {
              file = await res.text()
            }
          }).catch((error) => {
            console.error(error)
          }).finally(() => {
            $.teach({
              [src]: file,
              shotCount: countShots(file),
            })
          })
        }
      })
      return file
    })()
}

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const commonActions = {
  'a': (params) => {
    toggleSpam('a', params.value, () => {
    })
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
    })
  },
  'x': (params) => {
    toggleSpam('x', params.value, () => {
    })
  },
}

const performRPC = {
  ...commonActions,
  'y': (params) => {
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', 250, () => {
        slideBack()
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      debounceSpam('down', 250, () => {
        slideNext()
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      debounceSpam('left', 250, () => {
        slideBack()
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      debounceSpam('right', 250, () => {
        slideNext()
      })
    }
  },
}


$.when('json-rpc', (event) => {
  const { method, params } = event.detail

  if(performRPC[method]) {
    performRPC[method](params)
  }
})

let debugged = false
$.when('click', '[data-debug]', (event) => {
  if(debugged) return
  debugged = true
  document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
})

function slideBack (event) {
  const { activeShot } = $.learn()
  if(activeShot === 0) return
  $.teach({ activeShot: activeShot - 1, lastAction: 'back' })
}

$.when('click', '[data-back]', slideBack)

$.when('change', '[data-shot]', (event) => {
  const { activeShot, shotCount } = $.learn()
  const { value } = event.target
  const nextShot = parseInt(value)
  if(nextShot < 0) {
    $.teach({ activeShot: 0 })
    return
  }

  if(nextShot >= shotCount){ 
    // keep existing
    $.teach({ activeShot: shotCount })
    return
  }
  $.teach({ activeShot: nextShot })
})

$.when('keydown', '[data-shot]', (event) => {
  console.log(event.keyCode)
  if (event.keyCode==37) {
    event.target.closest($.link).querySelector('[data-back]').click()
  }
  if (event.keyCode==39) {
    event.target.closest($.link).querySelector('[data-next]').click()
  }
})

function slideNext (event) {
  const { shotCount, activeShot } = $.learn()
  if(activeShot >= shotCount) return
  $.teach({ activeShot: activeShot + 1, lastAction: 'next' })
}

$.when('click', '[data-next]', slideNext)

function getMotion(html, { active = 0, forwards, start, end }) {
  const wrapper= document.createElement('div');
  wrapper.innerHTML = html;
  const children = Array.from(wrapper.querySelector('xml-html').children)
    .filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  if(children[active]) {
    children[active].dataset.active = true
  }
  const slice = children.slice(start, end).map(x => {
    x.setAttribute('name','beat')
    return x
  })
  if(slice.length === 0) return ''

  const options = { width: 1920, height: 1080, forwards }
  return toVfx(slice, options)
}

function toVfx(slice, options) {
  let beats = options.forwards ? slice : reverse(slice.reverse())
  if(beats[0].matches(':not([data-active])')) {
    beats[0].dataset.animateOut = true
  }

  if(beats[beats.length-1].matches(':not([data-active])')) {
    beats[beats.length-1].dataset.animateIn = true
  }

  return (options.forwards ? beats : slice.reverse())
    .map(x => {;return x.outerHTML}).join('')
}

function reverse(beats) {
  return beats.map(x => {x.dataset.reverse = true; return x;})
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

$.style(`
  & .actions {
    z-index: 10;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: none;
    background: black;
  }

  & {
    background: black;
    overflow: auto;
    color: white;
    height: 100%;
    width: 100%;
    display: block;
  }

  & .grid {
    height: 100%;
  }

  & [name="transport"] {
  }

  & [name="theater"] {
    width: 100%;
    height: 100%;
  }

  & [name="screen"] {
    position:relative;
    overflow: hidden;
    height: 100%;
    margin: auto;
  }

  & [name="stage"] {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    grid-template-areas: 'stage';
    width: 100%;
    height: 100%;
    overflow: auto;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    place-content: center;
    container-type: normal;
  }

  & [name="stage"] > qr-code {
    padding: 1rem;
  }

  & [name="stage"] > * {
    grid-area: stage;
    margin: 0;
    overflow: auto;
    opacity: 1;
    z-index: 2;
    max-height: 100%;
  }


  & [name="stage"] > *[data-active] {
    opacity: 1;
  }


  & [name="perform"] {
    display: block;
    height: 100%;
  }

  & iframe {
    display: block;
    border: none;
    width: 100%;
    height: 100%;
  }

  & input[type="number"]::-webkit-outer-spin-button,
  & input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  & input[type="number"] {
    -moz-appearance: textfield;
    padding: .5rem 1rem;
  }

  & [name="typewriter"] {
    width: 100%;
    height: 100%;
    z-index: 1;
    position: relative;
    border: none;
    display: block;
    resize: none;
    padding: 1rem .5rem 1rem 2rem;
    line-height: 2rem;

  }

  & [data-shot] {
    width: 6ch;
    border: none;
    color: white;
    background: transparent;
    border-color: 1px solid rgba(255,255,255,.65);
    text-align: center;
    height: 100%;
  }

  & [data-first] [data-back],
  & [data-last] [data-next] {
    pointer-events: none;
    opacity: .5;
  }

  & [name="beat"] {
    --size-small: scale(.9);
    --size-normal: scale(1);
    --offset-direction: translate(0, -1rem);
    --offset-none: translate(0, 0);
    transform:
        var(--size-normal)
        var(--offset-none);
    transition: all 250ms ease-in-out;
  }

  & [data-animate-in] {
    animation: animate 500ms ease-in-out forwards;
    background: rgba(255,255,255,.15);
    color: rgba(0,0,0,.15);
  }

  & [data-animate-out] {
    --offset-direction: var(--offset-left);
    animation: animate 500ms ease-in-out reverse;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  & [data-animate-in][data-reverse] {
    --offset-direction: var(--offset-left);
    animation: animate 500ms ease-in-out forwards;
    background: rgba(255,255,255,.15);
    color: rgba(0,0,0,.15);
  }

  & [data-animate-out][data-reverse] {
    --offset-direction: var(--offset-right);
    animation: animate 500ms ease-in-out reverse;
    background: rgba(0,0,0,.85);
    color: rgba(255,255,255,.85);
  }

  @keyframes animate {
    0% {
      transform:
        var(--size-small)
        var(--offset-direction);
      opacity: 0;
      filter: blur(3px);
    }

    33% {
      transform:
        var(--size-small)
        var(--offset-direction);
    }

    66% {
      transform:
        var(--size-small)
        var(--offset-none);
    }

    100% {
      transform:
        var(--size-normal)
        var(--offset-none);
      opacity: 1;
      pointer-events: initial;
      filter: blur(0);
    }
  }

  @media print {
    & [name="read"] {
      display: block;
    }

    & [name="page"] {
      padding: 0 !important;
    }

    & [name="transport"],
    & textarea {
      display: none;
    }
  }

  & transition {
    animation: &-fade-in ease-in-out 100ms;
    display: grid;
    height: 100%;
    place-items: center;
    width: 100%;
  }


  &	hypertext-title {
    display: block;
    height: 100%;
    width: 100%;
  }

  &	hypertext-blankline {
      display: block;
  }

  & [name="stage"] hypertext-parenthetical,
  & [name="stage"] hypertext-puppet,
  & [name="stage"] hypertext-action,
  & [name="stage"] hypertext-quote,
  & [name="stage"] hypertext-address,
  & [name="stage"] hypertext-effect {
    height: auto;
    width: auto;
    padding: 13px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    position: relative;
  }

  & [name="stage"] hypertext-quote::before,
  & [name="stage"] hypertext-pupper::before,
  & [name="stage"] hypertext-address::before {
    display: none;
  }

  & [name="stage"] hypertext-puppet {
  }

  & [name="stage"] hypertext-quote {
  }

  & [name="stage"] hypertext-effect {
    text-align: center;
    place-self: end center;
  }

  & [name="stage"] hypertext-embodied {
    place-self: end end;
  }

  & [name="stage"] hypertext-action,
  & [name="stage"] hypertext-parenthetical {
    place-self: end center;
  }

  & [name="stage"] > iframe {
    height: 100%;
    width: 100%;
  }

`)

function standardAction(code) {
  return (target, params) => {
    notification(target, code, params)
  }
}

const actions = {
  a: standardAction('a'),
  b: standardAction('b'),
  x: standardAction('x'),
  y: standardAction('y'),
  lb: standardAction('lb'),
  rb: standardAction('rb'),
  lt: standardAction('lt'),
  rt: standardAction('rt'),
  ls: standardAction('ls'),
  rs: standardAction('rs'),
  select: standardAction('select'),
  start: standardAction('start'),
  up: standardAction('up'),
  down: standardAction('down'),
  left: standardAction('left'),
  right: standardAction('right'),
}

function notification(node, method, params) {
  if(node) {
    node.dispatchEvent(new CustomEvent('json-rpc', {
      detail: {
        jsonrpc: "2.0",
        method: method,
        params
      }
    }))
  }
}

function standardFire(player, node, code) {
  if(player[code]) {
    actions[code](node, {
      type: 'click',
      value: 1
    })
  } else {
    actions[code](node, {
      type: 'click',
      value: 0
    })
  }
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

const forceCache = {}

// essentially make sure the button was released to ensure the screen
function forceAcknowledge(code, value, callback) {
  if(value === 0 && !forceCache[code]) {
    forceCache[code] = 0
    return
  }
  if(forceCache[code] === 1 || (forceCache[code] === 0 && value === 1)) {
    forceCache[code] = 1
    callback()
  }
}

function clearAcknowledge(code) {
  delete forceCache[code]
}


function player1(code) {
  return checkButton(0, BUTTON_CODES[code])
}

function gameLoop(time) {
  const { paused } = $.learn()

  if(!paused) {
    const node = document.querySelector($.link)

    if(node) {
      const player = {
        a: player1('a'),
        b: player1('b'),
        x: player1('x'),
        y: player1('y'),
        lb: player1('lb'),
        rb: player1('rb'),
        lt: player1('lt'),
        rt: player1('rt'),
        select: player1('select'),
        start: player1('start'),
        ls: player1('ls'),
        rs: player1('rs'),
        up: player1('up'),
        down: player1('down'),
        left: player1('left'),
        right: player1('right'),
        os: player1('os'),
      }

      standardFire(player, node, 'a')
      standardFire(player, node, 'b')
      standardFire(player, node, 'x')
      standardFire(player, node, 'y')
      standardFire(player, node, 'lb')
      standardFire(player, node, 'rb')
      standardFire(player, node, 'lt')
      standardFire(player, node, 'rt')
      standardFire(player, node, 'ls')
      standardFire(player, node, 'rs')
      standardFire(player, node, 'up')
      standardFire(player, node, 'down')
      standardFire(player, node, 'left')
      standardFire(player, node, 'right')

      selectFire(player.select)

      startFire(player.start)

      toggleSpam('os', player.os, () => {
        toggleOS()
      })
    }
  }

  requestAnimationFrame(gameLoop)
}

gameLoop()

function selectFire(value) {
  toggleSpam('select', value, () => {
    toggleSettings()
  })
}

function startFire(value) {
  toggleSpam('start', value, () => {
    togglePause()
  })
}

function toggleOS (event) {
  $.teach({ welcome: false })
}

function toggleSettings (event) {
  $.teach({ welcome: false })
}

function togglePause (event) {
  $.teach({ welcome: false })
}

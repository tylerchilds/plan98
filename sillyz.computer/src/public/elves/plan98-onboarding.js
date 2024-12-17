import module from '@silly/tag'

/*
    !
  #
    ^
   <@>
    &{

  https://sillyz.computer/markup/hyper-script.js

  - notorious sillonious
  mit license. <email@tychi.me> 1989-current
  */

// panels are the names of views or screens displayed in the user interface

// define source code related artifacts that should not be displayed
// todo: cross browser, eliminate the :not selector cause .matches in js throws
const notHiddenChildren = ':not(style,script,hypertext-blankline,hypertext-comment)'

const strings = {
  'plan98-welcome.warning': 'It is dangerous to go alone. Take this.'
}

// create a hyper text module
const $ = module('plan98-onboarding', {
  activeShot: 0,
  shotCount: 1
})

$.draw(target => {
  const host = getHost(target)
  const { activeShot, lastAction } = $.learn()
  const { sequence, shotCount } = dialogue(target)

  const start = Math.max(activeShot - 1, 0)
  const end = Math.min(activeShot + 2, shotCount)
  const forwards = lastAction !== 'back'
  const motion = getMotion(sequence, { active: activeShot, forwards, start, end })

  const isFirst = activeShot === 0
  const isLast = activeShot === shotCount - 1

  const reverseAction = isFirst ? `
    <button data-exit>
      Work with Ty
    </button>
  ` : `
    <button data-back>
      Back
    </button>
  `

  const forwardAction = isLast ? `
    <button data-continue>
      Continue
    </button>
  ` : `
    <button data-next>
      Next
    </button>
  `
  return `
    <div name="flow">
      <div name="stars">
        ${motion}
      </div>
      <div name="navi">
        <div>
          ${reverseAction}
        </div>
        <!--
        <div>
          <input data-shot type="number" min="0" max="${shotCount}" value="${activeShot}"/>
        </div>
        -->
        <div>
          ${forwardAction}
        </div>
      </div>
    </div>
  `
})

function getHost(target) {
  return (target.closest('[host]') && target.closest('[host]').getAttribute('host')) || plan98.host
}

function dialogue(target) {
  const host = getHost(target)
  return state[host]
    ? state[host]
    : (function initialize() {
      state[host] = {
        shotCount: 1,
        sequence: [
          `
            <qr-code style="max-height: 120px; margin: auto;" text="${window.location.href}"></qr-code>
            <div>
              ${strings['plan98-welcome.warning']}
            </div>
          `
        ]
      }
      return state[host]
    })()
}

$.when('click', '[data-exit]', (event) => {
  const close = event.target.closest($.link).getAttribute('close')
  window[close] ? window[close]() : null
  window.location.href = `/?world=thelanding.page`
})

$.when('click', '[data-continue]', (event) => {
  const start = event.target.closest($.link).getAttribute('start')
  window[start] ? window[start]() : null
  const close = event.target.closest($.link).getAttribute('close')
  window[close] ? window[close]() : null
})

$.when('click', '[data-back]', (event) => {
  const { activeShot } = $.learn()
  if(activeShot === 0) return
  $.teach({ activeShot: activeShot - 1, lastAction: 'back' })
})


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

$.when('click', '[data-next]', (event) => {
  const { shotCount, activeShot } = $.learn()
  if(activeShot > shotCount) return
  $.teach({ activeShot: activeShot + 1, lastAction: 'next' })
})

function getMotion(sequence, { active = 0, forwards, start, end }) {
  const children = sequence.map(html =>  {
    const node = document.createElement('div')
    node.innerHTML = html
    return node
  })
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
  const beats = options.forwards ? slice : reverse(slice.reverse())
  if(beats[0].matches(':not([data-active])')) {
    beats[0].dataset.animateOut = true
  }

  if(beats[beats.length-1].matches(':not([data-active])')) {
    beats[beats.length-1].dataset.animateIn = true
  }

  return (options.forwards ? beats : slice.reverse())
    .map(x => {return x.outerHTML}).join('')
}

function reverse(beats) {
  return beats.map(x => {x.dataset.reverse = true; return x;})
}

$.style(`
  & {
    overflow: auto;
    max-width: 55ch;
  }

  & [name="flow"] {
  }

  & button {
    border: 2px solid dodgerblue;
    background: transparent;
    border-radius: 1rem;
    color: dodgerblue;
    cursor: pointer;
    border-radius: 1rem;
    transition: color 100ms;
    padding: 1rem;
  }

  & button:hover,
  & button:focus {
    color: white;
    background: dodgerblue;
  }

  & [name="navi"] {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    place-items: center;
    gap: .5rem;
    z-index: 1;
    margin-top: 1rem;
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
  }

  & textarea {
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
    background: rgba(33,33,33,.85);
    color: white;
    text-align: center;
    border-radius: 1rem;
    padding: 0 .5rem;
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

  &	hypertext-title {
    display: block;
    height: 100%;
    width: 100%;
  }

  &	hypertext-blankline {
      display: block;
    }
`)

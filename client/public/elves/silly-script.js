import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import { render } from '@sillonious/saga'

// panels are the names of views or screens displayed in the user interface
const panels = {
  // write to compose hype
  write: 'write',
  // read to remember your lines
  read: 'read',
  // perform to have a guide in real-time
  perform: 'perform',
}

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
const $ = elf('silly-script', {
  // raw text of the file
  activePanel: window.location.hash?.split('#')[1] || panels.perform,
  activeShot: 0,
  shotCount: 0,
})

$.draw((target) => {
  const { id } = target
  const { activePanel, nextPanel, shotCount, activeShot, lastAction, activeMenu } = $.learn()
  const file = sourceFile(target)

  if(target.lastPanel !== activePanel) {
    // flush outdated
    target.innerHTML = ''
    target.lastPanel = activePanel
  }

  const views = {
    [panels.write]: () => {
      const escapedFile = escapeHyperText(file)
      return `
        <div name="write">
          <textarea name="typewriter">${escapedFile}</textarea>
        </div>
      `
    },
    [panels.read]: () => {
      const html = hyperSanitizer(file)
      return `
        <div name="read">
          <div name="page" class="screenplay">
            ${html}
          </div>
        </div>
      `
    },
    [panels.perform]: () => {
      const start = activeShot
      const end = activeShot + 1
      const forwards = lastAction !== 'back'
      const html = hyperSanitizer(file)
      if(!html) return ''
      const motion = getMotion(html, { active: activeShot, forwards, start, end })
      return `
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
    },

    [panels.play]: () => `
      <div name="play">
        ${play}
      </div>
    `,

    'default': () => `
      Nothing for ya. Head back to camp.
    `
  }

  const view = (views[activePanel] || views['default'])()
  const fadeOut = nextPanel && activePanel !== nextPanel

  const actionBar = `
    <div class="actions">
      <div class="menu-item">
        <button data-menu-target="file" class="${activeMenu === 'file'?'active':''}">
          File
        </button>
        <div class="menu-actions" data-menu="file">
          <button data-publish>Save</button>
          <button data-print>Print Preview</button>
          <button data-debug>Debug</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="view" class="${activeMenu === 'view'?'active':''}">
          View
        </button>
        <div class="menu-actions" data-menu="view">
          <button class="${activePanel === panels.read ? 'active' : ''}" data-read>Read</button>
          <button class="${activePanel === panels.write ? 'active' : ''}" data-write>Edit</button>
          <button class="${activePanel === panels.perform ? 'active' : ''}" data-perform>Present</button>
        </div>
      </div>
    </div>
  `

  const perspective = `
    ${activePanel === panels.write ? actionBar :''}
    <div class="grid" data-panel="${activePanel}">
      <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
        ${view}
      </transition>
    </div>
  `

  if(activePanel === panels.perform) {
    const id = document.activeElement.id
    target.innerHTML = perspective
    if(id) document.getElementById(id).focus()
    return
  }

  // don't use the vdom when reading a full script.
  const vdom = $.learn().activePanel !== panels.read

  if(vdom) {
    return perspective
  } else {
    target.innerHTML = perspective
  }
}, { beforeUpdate, afterUpdate})

function viewport(entries, observer) {
  entries.forEach((entry) => {
    if(entry.isIntersecting) {
      entry.target.dataset.hidden = 'true'
    } else {
      delete event.target.dataset.hidden
    }
  });
}

function afterUpdate(target) {
  {
    const { activePanel } = $.learn()
    if(activePanel !== target.dataset.panel) {
      target.dataset.panel = activePanel
    }
  }

  if(!target.observer) {
    const options = {
      root: target,
      rootMargin: "0px",
      threshold: 0,
    };
    target.observer = new IntersectionObserver(viewport, options);
    [...target.querySelectorAll('xml-html > *')].map((target) => {
      target.observer.observe(target);
    })
  }
}

function beforeUpdate(target) {
  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      ogIcon.remove()
    })
  }
}

// the hyperSanitizer function turns fiction stories into non-fiction
export function hyperSanitizer(script) {
  return render(script) || ''
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
      const file = sourceFile(event.target)

      $.teach({
        shotCount: countShots(file),
        activeShot: 0,
        nextPanel: panels.perform,
      })
    })
  },
  'b': (params) => {
    toggleSpam('b', params.value, () => {
      $.teach({
        nextPanel: panels.write,
      })
    })
  },
  'x': (params) => {
    toggleSpam('x', params.value, () => {
      $.teach({
        nextPanel: panels.read,
      })
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

const readRPC = {
  ...commonActions,
  'y': (params) => {
  },
  'up': (params) => {
    if(params.value === 1) {
      debounceSpam('up', 250, () => {
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      debounceSpam('down', 250, () => {
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      debounceSpam('left', 250, () => {
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      debounceSpam('right', 250, () => {
      })
    }
  },
}


$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { activePanel } = $.learn()

  if(activePanel === panels.perform) {
    if(performRPC[method]) {
      performRPC[method](params)
    }
  }

  if(activePanel === panels.read) {
    if(readRPC[method]) {
      readRPC[method](params)
    }
  }
})

$.when('input', '[name="typewriter"]', (event) => {
  const src = source(event.target)
  const file = event.target.value
  $.teach({ [src]: file })
})

$.when('click', '[data-read]', (event) => {
  $.teach({
    nextPanel: panels.read,
    activeMenu: null,
  })
})

$.when('click', '[data-menu-target]', (event) => {
  const { activeMenu } = $.learn()
  const { menuTarget } = event.target.dataset
  $.teach({ activeMenu: activeMenu === menuTarget ? null : menuTarget })
  event.stopImmediatePropagation()
})

let debugged = false
$.when('click', '[data-debug]', (event) => {
  if(debugged) return
  debugged = true
  document.body.insertAdjacentHTML('beforeend', '<plan98-console></plan98-console>')
})

$.when('click', '[data-print]', async (event) => {
  const template = await fetch('/').then(async res => {
    return await res.text()
  })
  const file = sourceFile(event.target)
  const html = hyperSanitizer(file)
  if(event.target.preview) event.target.preview.close()
  event.target.preview = window.open('', 'PRINT');
  const { preview } = event.target

  const page = new DOMParser().parseFromString(template, "text/html");
  page.body.innerHTML = ''
  page.body.insertAdjacentHTML('beforeend', `
    <div class="print-banner">
      Looks good! <button onclick="(()=>{window.print();window.close()})()">Print</button>
    </div>
    <div class="screenplay">
      ${html}
    </div>
    <style type="text/css">
      body {overflow: auto; height: auto !important; }
      xml-html {height: 100%; overflow: auto; }
      .print-banner {
        padding: .5rem 1rem;
        text-align: right;
        color: white;
        background: black;
      }

      .print-banner button {
        background: dodgerblue;
        color: white;
        border: none;
        padding: .5rem 1rem;
        opacity: .85;
        transition: opacity 100ms ease-in-out;
        margin-left: 1rem;
      }

      .print-banner button:hover,
      .print-banner button:focus {
        opacity: 1;
      }
      @media print {
        .print-banner {
          display: none;
        }
      }
    </style>
  `)

  preview.document.write(`<!DOCTYPE html>${page.documentElement.outerHTML}`)
  preview.document.close(); // necessary for IE >= 10
  preview.focus(); // necessary for IE >= 10*/

  $.teach({ activeMenu: null })
})

$.when('click', '[data-publish]', (event) => {
  const src = source(event.target)

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${authorization}`
  }

  $.teach({ thinking: true, activeMenu: null })

  const file = $.learn()[src]

  if(file) {
    fetch(src, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        file,
        src
      })
    }).then((response) => response.text()).then((result) => {
      try {
        const data = JSON.parse(result)
        data.error
          ? toast('Are you even allowed to save, bro?', { type: 'error' })
          : toast('File saved!', { type: 'success' })
      } catch(e) {
        toast(result)
      }
    })
  }
})



$.when('click', '[data-perform]', (event) => {
  const file = sourceFile(event.target)

  $.teach({
    shotCount: countShots(file),
    activeShot: 0,
    nextPanel: panels.perform,
    activeMenu: null,
  })
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

$.when('click', '[data-write]', (event) => {
  $.teach({
    nextPanel: panels.write,
    activeMenu: null,
  })
})

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

$.when('animationend', 'transition', function transition({target}) {
  const { activePanel, nextPanel, backPanel } = $.learn()
  const current = nextPanel ? nextPanel : activePanel
  const previous = activePanel !== backPanel ? backPanel : activePanel

  if(activePanel === current) return
  $.teach({ activePanel: current, backPanel: previous })
  target.scrollTop = '0'
})

$.style(`
  @media print {
    html, body {
      height: 100%;
      padding: 0;
      margin: 0;
    }
    [data-print] {
      display: none;
    }
    #eruda{
      display: none !important;
    }
  }


  @page {
    size: 8.5in 11in;
    margin: 1in 1in 1in 1.5in;
  }

  @page {
    @top-right {
      content: counter(page) '.';
    }
  }

  @page:first {
    @top-right {
      content: '';
    }
  }

  & .actions {
    z-index: 10;
    background: transparent;
    border-bottom: 1px solid rgba(255,255,255,.25);
    display: none;
    background: black;
  }

  & {
    background: white;
  }

  @media screen {
    & {
      height: 100%;
      width: 100%;
      display: block;
    }

    &[data-panel="write"] {
      display: grid;
      grid-template-rows: auto 1fr;
    }

    & [data-hidden="true"] {
      visibility: hidden;
    }

    & .actions {
      display: flex;
      position: sticky;
      top: 0;
    }
  }
  & {
    overflow: auto;
    color: black;
  }
  & .grid {
    height: 100%;
  }

  & [name="transport"] {
  }

  & .actions button {
    background: black;
    color: rgba(255,255,255,.85);
    border: none;
    box-shadow: 0px 0px 4px 4px rgba(0,0,0,.10);
    padding: 0 .5rem;
    font-size: 1rem;
    line-height: 2rem;
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button.active,
  & .joke-actions button.active,
  & .actions button:hover,
  & .joke-actions button:hover {
    color: #fff;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), var(--theme, dodgerblue);
  }



  & [name="page"] {
    margin: 0;
  }

  & [name="page"] > xml-html > *${notHiddenChildren} {
    display: block;
  }

  & [name="theater"] {
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,.15);
  }


  & [name="shadow-box"] {
    display: grid;
    place-content: center;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
  }

  & [name="light-box"] {
    aspect-ratio: 2.35 / 1;
    background: white;
    width: 100%;
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

  & [name="read"],
  & [name="print"],
  & [name="perform"],
  & [name="write"] {
    display: none;
  }

  & [name="write"] {
    position: relative;
  }

  & [name="write"]::before {
    content: '';
    position: absolute;
    border-left: 1px solid firebrick;
    top: 0;
    left: 1rem;
    bottom: 0;
    z-index: 2;
  }

  & [name="write"] textarea {
    color: rgba(0,0,0,.85);
  }:

  & [name="write"]::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 1.5rem;
    border-left: 1px solid orange;
  }

  & [data-panel="read"] [name="read"],
  & [data-panel="perform"] [name="perform"],
  & [data-panel="write"] [name="write"] {
    display: block;
  }

  & [data-panel="read"] [data-read],
  & [data-panel="perform"] [data-perform],
  & [data-panel="write"] [data-write] {
    background-image: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    color: white;
    cursor: default;
  }

  & [name="read"] {
    margin: 0 auto;
    overflow: auto;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), var(--theme, dodgerblue);
  }

  & [name="page"] {
    background: white;
    box-shadow: 2px 2px 4px 4px rgba(0,0,0,.10);
    height: 100%;
    width: 100%;
    background: white;
    margin: auto;
    color: black;
    overflow: auto;
  }
  & [name="perform"] {
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


  & transition > * {
    width: 100%;
    height: 100%;
  }

  & transition.out {
    animation: &-fade-out ease-in-out 100ms;
  }

  @keyframes &-fade-in {
    0% {
      filter: blur(10px);
    }
    100% {
      filter: blur(0);
    }
  }

  @keyframes &-fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: .5;
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

  & .menu-item {
    position: relative;
  }

  & .menu-actions {
    display: none;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    background: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85)), var(--theme, dodgerblue);
  }

  & [data-menu-target].active + .menu-actions {
    display: block;
  }

  & .menu-actions  button {
    width: 100%;
    text-align: left;
  }


  @media screen {
    & [name="read"] .screenplay {
      padding: 1rem;
    }
    & [name="read"] .screenplay hypertext-quote {
      position: relative;
    }

    & [name="read"] .screenplay hypertext-quote::before {
      content: '>';
      background: gold;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      padding: 0 1rem;
      display: grid;
      place-items: start;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
      opacity: .25;
    }

    & [name="read"] .screenplay hypertext-address::before {
      content: '#';
      background: mediumseagreen;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      left: -1rem;
      right: -1rem;
      padding: 0 1rem;
      position: absolute;
      display: grid;
      place-items: end;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
      opacity: .25;
    }

    & [name="read"] .screenplay hypertext-puppet::before {
      content: '@';
      background: dodgerblue;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      left: -1rem;
      right: -1rem;
      padding: 0 1rem;
      position: absolute;
      display: grid;
      place-items: end;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
      opacity: .25;
    }
  }
`)

$.when('click', '*', (event) => {
  const { activeMenu } = $.learn()
  if(event.target.closest('.menu-item') || !activeMenu) {
    return
  }
  $.teach({ activeMenu: null })
})

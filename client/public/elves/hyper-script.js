import elf from '@silly/elf'
import { toast } from './plan98-toast.js'
import { render } from '@sillonious/saga'

const pitch = `<hello-world

# Write once, run globally.

The world runs on computers that fit under our desks, on our laps, in our pockets, around our bodies, and throughout our homes and businesses.

@ Presenter
> Have you wondered how these all work?

> Have you ever felt your computers are actively designed against you?

> Have you ever wished you could control them yourself?

> Have you ever tried to build your own?

> What was the hardest part?

<div
html: <sillyz-ocarina></sillyz-ocarina>
style: height: 100vh;

<story-board

<mine-sweeper
<mind-chaos3d
<mind-chess

<title-page
title: Hello World
author: Thesillonious Caramera

# Exterior Home

Carrying an UMBRELLA and wearing a JESTER HAT is THESILLONIOUS CARAMERA

@ Thesillonious Caramera
& winking
> I didn't break the windows if you didn't

THESILLONIOUS CARAMERA vanishes, leaving behind a NOTE with a maze and a message in BLUE PENCIL

@ NOTE
> the rest is up to you

^ Fade Out

<infinite-canvas
src: /cdn/sillyz.computer/index.canvas

<quick-media
id: quick-media-demo
`


// panels are the names of views or screens displayed in the user interface
const panels = {
  // write to compose hype
  write: 'write',
  // read to remember your lines
  read: 'read',
  // perform to have a guide in real-time
  perform: 'perform',
  play: 'play',
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
const $ = elf('hyper-script', {
  // raw text of the file
  file: pitch,
  activePanel: window.location.hash?.split('#')[1] || panels.read,
  activeShot: 0,
  shotCount: countShots(pitch),
})

$.draw((target) => {
  const { id } = target
  const { activePanel, nextPanel, shotCount, activeShot, lastAction, activeMenu } = $.learn()
  const { file } = sourceFile(target)

  if(target.lastPanel !== activePanel) {
    // flush outdated
    target.innerHTML = ''
    target.lastPanel = activePanel
  }

  const play = (state.play || {}).embed

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

  const navi = activePanel === panels.perform ? `
    <div name="navi"
      ${activeShot === 0 ? 'data-first' : ''}
      ${activeShot === shotCount ? 'data-last' : ''}
    >
      <button data-back>
        <span>
        <sl-icon name="arrow-left-circle"></sl-icon>
        </span>
      </button>
      <input id="shot-slot" data-shot type="number" min="0" max="${shotCount}" value="${activeShot}"/>
      <button data-next>
        <span>
        <sl-icon name="arrow-right-circle"></sl-icon>
        </span>
      </button>
    </div>
  ` : ``

  const perspective = `
    <div class="actions">
      <div class="menu-item">
        <button data-menu-target="file" class="${activeMenu === 'file'?'active':''}">
          File
        </button>
        <div class="menu-actions" data-menu="file">
          <button data-publish>Save</button>
          <button data-print>Print</button>
          <button data-debug>Debug</button>
        </div>
      </div>
      <div class="menu-item">
        <button data-menu-target="view" class="${activeMenu === 'view'?'active':''}">
          View
        </button>
        <div class="menu-actions" data-menu="view">
          <button class="${activePanel === panels.read ? 'active' : ''}" data-read>Read</button>
          <button class="${activePanel === panels.write ? 'active' : ''}" data-write>Write</button>
          <button class="${activePanel === panels.perform ? 'active' : ''}" data-perform>Run</button>
          ${play ? `<button class="${activePanel === panels.play ? 'active' : ''}" data-play>Play</button>` : ''}
        </div>
      </div>
      ${navi}
    </div>
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
  const today = new Date().toJSON().slice(0, 10)
  const explicit = head.getAttribute('src')
  const remote = head.getAttribute('remote') || ''
  const implicit = `/public/journal/${today}.saga`
  return `${remote}${explicit || implicit}`
}

function sourceFile(target) {
  const src = source(target)
  const data = state[$.link][src] || {}

  if(target.initialized) return data
  target.initialized = true

  return data.file
    ? data
    : (function initialize() {
      requestIdleCallback(() => {
        let file = pitch
        fetch(src).then(async res => {
          if(res.status === 404) {

            file = 'untitled'
          } else {
            file = await res.text()
          }
        }).catch((error) => {
          console.error(error)
        }).finally(() => {
          state[$.link][src] = { file }
        })
      })
      return data
    })()
}

$.when('input', '[name="typewriter"]', (event) => {
  const src = source(event.target)
  state[$.link][src] = { file: event.target.value }
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
  const { file } = sourceFile(event.target)
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
        padding: 1rem;
        text-align: right;
        color: white;
      }

      .print-banner button {
        background: dodgerblue;
        color: white;
        border: none;
        padding: 1rem;
        opacity: .85;
        transition: opacity 100ms ease-in-out;
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
})

$.when('click', '[data-publish]', (event) => {
  const src = source(event.target)

  const authorization = btoa(plan98.env.PLAN98_USERNAME + ':' + plan98.env.PLAN98_PASSWORD);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${authorization}`
  }

  $.teach({ thinking: true, activeMenu: null })

  fetch(src, {
    headers,
    method: 'POST',
    body: JSON.stringify({
      file: state[$.link][src].file,
      src
    })
  }).then((response) => response.text()).then((result) => {
    try {
      const data = JSON.parse(result)
      toast(data.error ? 'Access Denied' : 'Saved!')
    } catch(e) {
      toast(result)
    }
  })
})



$.when('click', '[data-perform]', (event) => {
  const { file } = sourceFile(event.target)

  $.teach({
    shotCount: countShots(file),
    activeShot: 0,
    nextPanel: panels.perform,
    activeMenu: null,
  })
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

$.when('keydown', '[data-shot]', (event) => {
  console.log(event.keyCode)
  if (event.keyCode==37) {
    event.target.closest($.link).querySelector('[data-back]').click()
  }
  if (event.keyCode==39) {
    event.target.closest($.link).querySelector('[data-next]').click()
  }
})

$.when('click', '[data-next]', (event) => {
  const { shotCount, activeShot } = $.learn()
  if(activeShot > shotCount) return
  $.teach({ activeShot: activeShot + 1, lastAction: 'next' })
})

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

$.when('click', '[data-play]', (event) => {
  $.teach({
    nextPanel: panels.play,
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

  @media screen {
    & {
      height: 100%;
      width: 100%;
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
    line-height: 2rem;
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
    --v-font-mono: 1;
    --v-font-casl: 0;
    --v-font-wght: 400;
    --v-font-slnt: 0;
    --v-font-crsv: 0;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";
    transition: background 200ms ease-in-out;
  }

  & .actions button:focus,
  & .joke-actions button:focus,
  & .actions button.active,
  & .joke-actions button.active,
  & .actions button:hover,
  & .joke-actions button:hover {
    color: #fff;
    background: #54796d;
  }



  & [name="page"] {
    margin: 0;
  }

  & [name="page"] > xml-html > *${notHiddenChildren} {
    display: block;
  }

  & [name="navi"] {
    margin-left: auto;
    height: 2rem;
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
    align-items: center;
    justify-content: center;
    grid-template-areas: 'stage';
    width: 100%;
    height: 100%;
    overflow: auto;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    place-content: center;
  }

  & [name="stage"] > * {
    grid-area: stage;
    transition: opacity 100ms;
    margin: 0;
    overflow: auto;
    opacity: 1;
    z-index: 2;
    height: auto;
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
    background: #54796d;
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
    background: #54796d;
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
    animation: &-fade-in ease-in-out 200ms;
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
    animation: &-fade-out ease-in-out 1ms;
  }

  @keyframes &-fade-in {
    0% {
      opacity: .5;
    }
    100% {
      opacity: 1;
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
    place-self: end start;
    font-size: 40px;
    padding: 13px;
    line-height: 1.3;
    text-shadow: .1rem .1rem rgba(0,0,0,.85);
    color: white;
    bottom: 80px;
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
    place-self: end start;
  }

  & [name="stage"] hypertext-embodied {
    place-self: end end;
  }

  & [name="stage"] hypertext-action,
  & [name="stage"] hypertext-parenthetical {
    place-self: end center;
  }

  & [name="stage"] > * {
    height: 100%;
    width: 100%;
    --v-font-mono: 0;
    --v-font-casl: 1;
    --v-font-wght: 800;
    --v-font-slnt: -15;
    --v-font-crsv: 1;
    font-variation-settings: "MONO" var(--v-font-mono), "CASL" var(--v-font-casl), "wght" var(--v-font-wght), "slnt" var(--v-font-slnt), "CRSV" var(--v-font-crsv);
    font-family: "Recursive";

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
    background: #54796d;
  }

  & [data-menu-target].active + .menu-actions {
    display: block;
  }

  & .menu-actions  button {
    width: 100%;
    text-align: left;
  }


  @media screen {
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
      left: 0;
      right: 0;
      padding: 0 1rem;
      position: absolute;
      height: 2rem;
      display: grid;
      place-items: start;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
      opacity: .25;
    }

    & [name="read"] .screenplay hypertext-puppet::before {
      content: '@';
      background: dodgerblue;
      background-image: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5));
      left: 0;
      right: 0;
      padding: 0 1rem;
      position: absolute;
      height: 2rem;
      display: grid;
      place-items: start;
      font-size: 1rem;
      color: rgba(0,0,0,.65);
      opacity: .25;
    }
  }
`)

$.when('click', '*', (event) => {

  if(event.target.closest('.menu-item')) {
    // child of a menu item
    return
  }
  $.teach({ activeMenu: null })
})

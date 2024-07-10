import module from '@silly/tag'
import { render } from '@sillonious/saga'

import 'gun'

const Gun = window.Gun

const gun = Gun(['https://gun.1998.social/gun']);

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

// create a hyper text module
const $ = module('gun-script', {
  // raw text of the file
  file: '',
  activePanel: panels.read,
  activeShot: 0,
  shotCount: 0
})

$.draw((target) => {
  const stars = getStars(true)
  const { id } = target
  const path = source(target)
  const { activePanel, nextPanel, shotCount, activeShot, lastAction } = $.learn()
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
          <textarea name="typewriter" style="background: ${stars}">${escapedFile}</textarea>
        </div>
      `
    },
    [panels.read]: () => {
      const html = hyperSanitizer(file)
      return `
        <div name="read">
          <div name="page">
            ${html}
          </div>
          <div name="navi">
            <button data-print>Print</button>
            <div name="print">
              <iframe src="${path}?readonly=true" title="embed"></iframe>
            </div>
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
          <div name="navi"
            ${activeShot === 0 ? 'data-first' : ''}
            ${activeShot === shotCount ? 'data-last' : ''}
          >
            <button data-back>
              Back
            </button>
            <input id="shot-slot" data-shot type="number" min="0" max="${shotCount}" value="${activeShot}"/>
            <button data-next>
              Next
            </button>
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

  const perspective = `
    <div class="grid" data-panel="${activePanel}">
      <div name="transport">
        <div name="actions">
          <button data-read>Read</button>
          <button data-write>Write</button>
          <button data-perform>Execute</button>
          ${play ? `<button data-play>Play</button>` : ''}
        </div>
      </div>
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

  return perspective
})

// the hyperSanitizer function turns fiction stories into non-fiction
export function hyperSanitizer(script) {
  return render(script)
}

function source(target) {
  const hardcoded = target.closest($.link).getAttribute('src')
  const today = new Date().toJSON().slice(0, 10)
  const dynamic = `/public/journal/${today}.saga`
  return hardcoded || dynamic
}

function sourceFile(target) {
  const path = source(target)
  const entry = gun.get($.link).get(path)
	entry.once((data) => { $.teach({[path]: data})});

  const data = $.learn()[path] || { file: '' }

  return data
    ? data
    : (function initialize() {
      let file = ''
      fetch(path).then(async (res) => {
        if(res.status === 200) {
          file = await res.text()
        }
      }).catch(e => {
        console.error(e)
      }).finally(() => {
        entry.put({ file })
      })

      return data
    })()
}


$.when('input', '[name="typewriter"]', (event) => {
  const path = source(event.target)
  const { value } = event.target

  const entry = gun.get($.link).get(path)
  entry.put({ file: value })
})

$.when('click', '[data-read]', (event) => {
  $.teach({ nextPanel: panels.read })
})


$.when('click', '[data-print]', (event) => {
  const node = event.target.closest($.link)
  const read = node.querySelector('[name="print"] iframe').contentWindow
  read.focus()
  read.print()
})

$.when('click', '[data-perform]', (event) => {
  const { file } = sourceFile(event.target)
  const html = hyperSanitizer(file)
  const wrapper= document.createElement('div');
  wrapper.innerHTML = html;
  const shotList = Array.from(wrapper.children)
    .filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  $.teach({
    shotCount: shotList.length - 1,
    activeShot: 0,
    nextPanel: panels.perform
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
  const children = Array.from(wrapper.children)
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
  $.teach({ nextPanel: panels.write })
})

$.when('click', '[data-play]', (event) => {
  $.teach({ nextPanel: panels.play })
})

function escapeHyperText(text) {
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

  & {
    height: 100%;
    width: 100%;
    display: block;
    overflow: auto;
    color: black;
    background: black;
  }
  & .grid {
    display: grid;
    grid-template-rows: 1fr;
    height: 100%;
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 2rem;
    z-index: 2;
    overflow: auto;
  }

  & button {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: color 100ms;
    padding: .25rem 1rem;
  }

  & button:hover,
  & button:focus {
    box-shadow: 0 0 25px 25px rgba(0,0,0,.15) inset;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
		padding-right: 1rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

  & [name="page"] > *${notHiddenChildren} {
    display: block;
  }

  & [name="navi"] {
    position: fixed;
    right: 0;
    margin: auto;
    top: 0;
    height: 2rem;
    display: block;
    text-align: center;
    gap: .5rem;
    z-index: 1;
  }

  & [name="theater"] {
    width: 100%;
    min-width: 8.5in;
    height: 100%;
    background: black;
  }

  & [name="screen"] {
    position:relative;
    overflow: hidden;
    aspect-ratio: 16/9;
    transform: translateY(-50%);
    top: 50%;
    max-height: calc(100vh - 6rem);
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
    padding: 1rem;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    place-content: center;
  }

  & [name="stage"] > * {
    display: block;
    grid-area: stage;
    opacity: 0;
    transition: opacity 100ms;
    border-radius: 1rem;
    padding: 1rem;
    margin: 0;
    background: white;
    overflow: auto;
  }


  & [name="stage"] > *[data-active] {
    opacity: 1;
    z-index: 2;
  }

  & [name="read"],
  & [name="print"],
  & [name="perform"],
  & [name="write"] {
    display: none;
  }

  & [name="write"] {
    position: relative;
    background: black;
  }

  & [name="write"] textarea {
    color: white;
  }

  & [name="write"]::before {
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
    background: dodgerblue;
    color: black;
    cursor: default;
  }

  & [name="read"] {
    background: white;
    margin: 0 auto;
    padding: 0 1rem;
    width: calc(6.5in + 2rem);
    overflow: auto;
  }
  & [name="page"] {
    padding: 1in 0;
    font-size: 12pt;
    font-family: courier;
  }
  & [name="perform"] {
    background: black;
  }
  & [name="print"] {
    display: none;
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

  @media print {
    & {
      width: auto;
      height: auto;
      overflow: visible;
    }
    & [name="read"] {
      display: block;
    }

    & [name="page"] {
      height: 100%;
      padding: 0;
    }

    & [name="transport"],
    & textarea {
      display: none;
    }
    & .grid {
      display: block;
      height: auto;
      overflow: auto;
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
`)

function getStars() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // landscape tabloid? 11x17
  canvas.height = rhythm * 11;
  canvas.width = rhythm * 17;

  ctx.fillStyle = 'dodgerblue';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }
  ctx.fillStyle = 'lime';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }
  ctx.fillStyle = 'orange';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }
  ctx.fillStyle = 'rebeccapurple';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }
  ctx.fillRect(0, rhythm - 1, 1, 1);

  return `url(${canvas.toDataURL()}`;
}


function random(max) {
  return Math.floor(Math.random() * max);
}

function schedule(x, delay=1) { setTimeout(x, delay) }

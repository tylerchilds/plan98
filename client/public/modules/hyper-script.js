import module from '@sillonious/module'
import { render } from '@sillonious/saga'

const instructions = "go down or next\n\n<story-board\n<mine-sweeper\n<mind-chaos3d\n<mind-chess\n<hello-metamask\n\n<infinite-canvas\nsrc: /cdn/sillyz.computer/index.canvas\n\n<title-page\ntitle: Hello World\nauthor: Thesillonious Caramera\n\n# Exterior Home\n\nCarrying an UMBRELLA and wearing a JESTER HAT is THESILLONIOUS CARAMERA\n\n@ Thesillonious Caramera\n\n& winking\n\n> I didn't break the windows if you didn't\n\nTHESILLONIOUS CARAMERA vanishes, leaving behind a NOTE with a maze and a message in BLUE PENCIL\n\n@ NOTE\n\n> the rest is up to you\n\n^ Fade Out\n\n<hello-world\n\n<story-board"


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
  const shotList = Array.from(wrapper.children[0].children).filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  return shotList.length - 1
}

// create a hyper text module
const $ = module('hyper-script', {
  // raw text of the file
  file: instructions,
  activePanel: panels.write,
  activeShot: 0,
  shotCount: countShots(instructions)
})

$.draw((target) => {
  const stars = getStars(true)
  const { id } = target
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
          <button data-write>Code</button>
          <button data-perform>Demo</button>
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
      schedule(() => {
        let file = instructions
        fetch(src).then(async res => {
          if(res.status === 200) {
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
  $.teach({ nextPanel: panels.read })
})

$.when('click', '[data-print]', self.print)

$.when('click', '[data-perform]', (event) => {
  const { file } = sourceFile(event.target)

  $.teach({
    shotCount: countShots(file),
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
  const children = Array.from(wrapper.children[0].children)
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

  @media screen {
    & {
      height: 100%;
      width: 100%;
    }
  }
  & {
    display: block;
    overflow: auto;
    color: black;
    background: rgba(255,255,255,.85);
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

  & [name="page"] {
    margin: 0;
    padding: 0;
  }

  & [name="page"] xml-html > *${notHiddenChildren} {
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
    height: 100%;
    background: rgba(255,255,255,.15);
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
    transition: opacity 100ms;
    border-radius: 1rem;
    padding: 1rem;
    margin: 0;
    background: white;
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
    background: rgba(0,0,0,.85);
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
    box-shadow: 2px 2px 4px 4px rgba(0,0,0,.10);
    margin: 0 auto;
    padding: 0 1rem;
    max-width: calc(6.5in + 2rem);
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
    padding: 6rem .5rem 1rem 2rem;
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

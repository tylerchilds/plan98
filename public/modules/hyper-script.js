import module from '@sillonious/module'

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
const notHiddenChildren = ':not(style,script,hypertext-blankline,hypertext-comment)'

// normal time converts lines 1:1 from hype to hypertext
const NORMAL_TIME = Symbol('n-time')
// property are able to be stored
const PROP_TIME = Symbol('p-time')
// actor embeds rich hyper media content
const ACTOR_TIME = Symbol('a-time')

// create a hyper text module
const $ = module('hyper-script', {
  // raw text of the file
  file: '',
  activePanel: panels.read,
  activeShot: 0,
  shotCount: 0
})

$.draw(target => {
  const stars = getStars(true)
  const { id } = target
  let { activePanel, nextPanel, shotCount, activeShot, lastAction } = $.learn()
  const { file, html, embed } = sourceFile(target)

  const readonly = target.getAttribute('readonly')
  const presentation = target.getAttribute('presentation')

  if(readonly) {
    return `
      <div name="page">
        ${html}
      </div>
    `
  }

  if(presentation) {
    activePanel = panels.perform
  }

  const escapedFile = escapeHyperText(file)

  if(target.lastPanel !== activePanel) {
    // flush outdated
    target.innerHTML = ''
    target.lastPanel = activePanel
  }

  const start = Math.max(activeShot - 1, 0)
  const end = Math.min(activeShot + 2, shotCount)
  const forwards = lastAction !== 'back'
  const motion = getMotion(html, { active: activeShot, forwards, start, end })
  const play = (state.play || {}).embed

  const views = {
    [panels.write]: () => `
      <div name="write">
        <textarea style="background: ${stars}">${escapedFile}</textarea>
      </div>
    `,
    [panels.read]: () => `
      <div name="read">
        <div name="page">
          ${html}
        </div>
        <div name="navi">
          ${embed ? '<button data-print>Print</button>' : ''}
          <div name="print">
            ${embed}
          </div>
        </div>
      </div>
    `,
    [panels.perform]: () => `
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
          <input data-shot type="number" min="0" max="${shotCount}" value="${activeShot}"/>
          <button data-next>
            Next
          </button>
        </div>
      </div>
    `,
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
          <button data-perform>Perform</button>
          ${play ? `<button data-play>Play</button>` : ''}
        </div>
      </div>
      <transition class="${fadeOut ? 'out' : ''}" data-id="${id}">
        ${view}
      </transition>
    </div>
  `

  if(activePanel === panels.perform) {
    target.innerHTML = perspective
    return
  }

  return perspective
})

// the hyperSanitizer function turns fiction stories into non-fiction
export const hyperSanitizer = (script) => {
  // as actors are worn their attributes may become modified
  const actors = state.actors = {}
  // state changes cause time dilations
  let time = NORMAL_TIME
  // what model
  let property = ''
  // what perspective
  let actor = ''
  // what display
  let scene = ''

  // advanced-technology something magic whatever runes are a metaphor
  const RuneTable = {
    // comments, like this one you're reading now, are not for the audience
    '!': append.bind({}, 'hypertext-comment'),
    // addresses are space time locations where events and discussions happen
    '#': append.bind({}, 'hypertext-address'),
    // effects are the post production manipulations for aesthetic
    '^': append.bind({}, 'hypertext-effect'),
    // puppets are the performers of parenthetical prose
    '@': append.bind({}, 'hypertext-puppet'),
    // quotes are verbatim messages from puppets or the mind of sillonious
    '>': append.bind({}, 'hypertext-quote'),
    // parentheticals are subtext of expression
    '&': append.bind({}, 'hypertext-parenthetical'),
    // properties are able to change truths about the very facet of reality
    '{': (x) => {
      // clear whichever property from the stash
      state[x] = {}
      // use whatever property
      property = x
      // what time is it? property time!
      time = PROP_TIME
    },
    // actors are able to display projections beyond black and white text
    '<': (x) => {
      // clear whichever actor from the stash
      actors[x] = {}
      // use whatever actor
      actor = x
      // what time is it? actor time!
      time = ACTOR_TIME
    }
  }

  // mapping our concept of time to the atomic execution units underneath
  const times = {
    // line by line until finished
    [NORMAL_TIME]: normalTime,
    // accesses property and stores key value pairs after sequence break
    [PROP_TIME]: propertyTime,
    // accesses actor and embeds key value pairs after sequence break
    [ACTOR_TIME]: actorTime,
  }

  // collect the lines of our script
  const lines = script.split('\n')

  // loop over our lines one at a time
  for (const line of lines) {
    // and evaluating now and the times, process our line in the now time
    (times[time] || noop)(line)
  }

  // return our compiled hyper media scene
  return scene

  // just process our runes, yes magic, just straight forward level 1 magic
  function normalTime(line) {
    // anything here?
    if(!line.trim()) {
      // drop some invisible hype
      append("hypertext-blankline", "")
      // normal time is over
      return
    }

    // the rune will always be the first glyph
    const rune = line[0]

    // however, the first glyph won't always be a rune.
    if(Object.keys(RuneTable).includes(rune)) {
      // decouple the incantation from the rune
      const [_, text] = line.split(rune)
      // apply the rune from the table with the spell
      return RuneTable[rune](text.trim())
    }

    // drop some actionable hype
    append('hypertext-action', line)
    // normal time is over
    return
  }

  // process the sequence to understand our property's, well, properties.
  function propertyTime(line, separator=':') {
    // where in the line is our break
    const index = line.indexOf(separator)
    // before then is the attribute
    const key = line.substring(0, index)
    // after then is the data
    const value = line.substring(index+1)

    // no data?
    if(!value) {
      // back to normal time
      time = NORMAL_TIME
      return
    }

    // update our property of property of properties
    state[property][key.trim()] = value.trim()
  }

  // process the sequence to understand our actor's properties.
  function actorTime(line, separator=':') {
    // where in the line is our break
    const index = line.indexOf(separator)
    // before then is the attribute
    const key = line.substring(0, index)
    // after then is the data
    const value = line.substring(index+1)

    // no data?
    if(!value) {
      // collect the properties from our actor
      const properties = actors[actor]
      let innerHTML = ''

      // convert them into hype attributes
      const attributes = Object.keys(properties)
        .map(x => {
          if(x === 'innerHTML') {
            innerHTML = x
            return ''
          }
          return `${x}="${properties[x]}"`
        }).join('')

      // add some hype to our scene
      scene += `<${actor} ${attributes}>${innerHTML}</${actor}>`

      // back to normal time
      time = NORMAL_TIME
      return
    }

    // set the 
    actors[actor][key.trim()] = value.trim()
  }

  function append(actor, body) {
    const hype = `
      <${actor}>
        ${body}
      </${actor}>
    `
    scene += hype
  }

  function noop() {}
}

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

function sourceFile(target) {
  const src = source(target)
  return state[src]
    ? state[src]
    : (function initialize() {
      fetch(src).then(res => res.text()).then((x) => {
        state[src] = {
          file: x,
          html: hyperSanitizer(x),
          embed: `<iframe src="${window.location.href}?path=${src}&readonly=true" title="embed"></iframe>`
        }
      }).catch(e => {
        console.error(e)
        const x = script404()
        state[src] = {
          file: x,
          html: hyperSanitizer(x),
          embed: `<iframe src="${window.location.href}?path=${src}&readonly=true" title="embed"></iframe>`
        }
      })
      state[src] = { file: 'loading...' }
      return state[src]
    })()
}

$.when('input', 'textarea', (event) => {
  const src = source(event.target)
  const { value } = event.target
  state[src].file = value
  const html = hyperSanitizer(value)
  state[src].html = html
  state[src].embed = `<iframe src="${window.location.href}?path=${src}&readonly=true" title="embed"></iframe>`
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
  const { html } = sourceFile(event.target)
  const wrapper= document.createElement('div');
  wrapper.innerHTML = html;
  const shotList = Array.from(wrapper.children)
    .filter(x => x.matches(notHiddenChildren))

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

$.when('click', '[data-next]', (event) => {
  const { shotCount, activeShot } = $.learn()
  if(activeShot > shotCount) return
  $.teach({ activeShot: activeShot + 1, lastAction: 'next' })
})

function getMotion(html, { active = 0, forwards, start, end }) {
  const wrapper= document.createElement('div');
  wrapper.innerHTML = html;
  const children = Array.from(wrapper.children)
    .filter(x => x.matches(notHiddenChildren))

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
  document.activeElement.blur()
})

function script404() {
  return `Change the way you see the world.

A paper computer could be a 1,000 line toy that behaves as a single celled organism, akin to one cell in a excel sheet that produces google docs for netflix to run apple keynotes for saturday night live as a paradigm shift that encapsulates them all.

<greet-friend
x: Meduz
y: fr_FR

<salut-ami
x: Ty
y: en_US

<greet-friend
x: Victoria
y: es_MX

<saludo-amigo
x: Ty
y: en_US

https://sillyz.computer is a straight to DVD release of the universal access to my knowledge. My Internet Archive, if you will. That's why I debuted there as a vendor on October 12th and not at Cobb's October 15th. Pre-orders become available November 15th.

Multiplayer, 2024. Re: the business model, the computers are free, but you pay for the content, just like any other streaming service, but you also get the source code to launch your own competitor.

If you missed me at launch, this is an edit of my dress rehearsal barking and busking from October 9th:

<hyper-link
src: https://youtu.be/KcUAa0eT4Tc?si=cZ5mQvoNgxBl6mlF
label: October 9th, 2023

Let's see what we cook up together this holiday season-- I know I'll be working on my feature length immersive experience for Sillyz.Computer-- The War on Elves. If I'm lucky, I might even exchange knowledge with them while I'm on their island. One of the perks of being Player Number One.

Will you be next? Anyone can become Sillonious.

<hyper-link
src: https://github.com/tylerchilds/plan98
label: Download the Source Code

And run the command 'npm start'

With &hearts;
- Uncle Sillonious

<hyper-link
src: https://merveilles.town/@tychi
label: hit me up

# the end.

P.S. Mila, will you help me learn Chinese?

{ play
embed: <iframe width="560" height="315" src="https://www.youtube.com/embed/UnwLtBRLOUg?si=LudRVaPHI1lH9vwh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

do you have anything you'd like to add?

.
.
.
.
?
`
}

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
    display: block;
    overflow: auto;
  }
  & .grid {
    display: grid;
    grid-template-rows: 1fr;
    height: 100vh;
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 2;
    overflow: auto;
  }

  & button {
    background: rgba(0,0,0,.85);
    border-radius: 0;
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
    color: white;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
    border-radius: 1.5rem;
    margin: .5rem;
  }

  & [name="read"] > *${notHiddenChildren} {
    display: block;
  }

  & [name="navi"] {
    position: fixed;
    right: 3rem;
    top: 0;
    height: 2rem;
    display: flex;
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
    background: white;
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
    background: #54796d;
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
      filter: blur(10px);
    }
    100% {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes &-fade-out {
    0% {
      opacity: 1;
      filter: blur(0px);
    }
    100% {
      opacity: .5;
      filter: blur(10px);
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

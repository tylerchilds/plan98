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
// prop are able to be stored
const PROP_TIME = Symbol('p-time')
// costume embeds rich hyper media content
const COSTUME_TIME = Symbol('c-time')

// the compile function takes a Hype script and converts it to hypertext
export const compile = (script) => {
  // as costumes are worn their attributes may become modified
  const costumes = state.costumes = {}
  // state changes cause time dilations
  let time = NORMAL_TIME
  // what model
  let prop = ''
  // what perspective
  let costume = ''
  // what display
  let exhibit = ''

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
    // props are able to change truths about the very facet of reality
    '{': (x) => {
      // clear whichever prop from the stash
      state[x] = {}
      // use whatever prop
      prop = x
      // what time is it? prop time!
      time = PROP_TIME
    },
    // costumes are able to display projections beyond black and white text
    '<': (x) => {
      // clear whichever costume from the stash
      costumes[x] = {}
      // use whatever costume
      costume = x
      // what time is it? costume time!
      time = COSTUME_TIME
    }
  }

  // mapping our concept of time to the atomic execution units underneath
  const times = {
    // line by line until finished
    [NORMAL_TIME]: normalTime,
    // accesses prop and stores key value pairs after sequence break
    [PROP_TIME]: propTime,
    // accesses costume and embeds key value pairs after sequence break
    [COSTUME_TIME]: costumeTime,
  }

  // collect the lines of our script
  const lines = script.split('\n')

  // loop over our lines one at a time
  for (const line of lines) {
    // and evaluating now and the times, process our line in the now time
    (times[time] || noop)(line)
  }

  // return our compiled hyper media exhibit
  return exhibit

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

  // process the sequence to understand our prop's, well, props.
  function propTime(line, separator=':') {
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

    // update our prop of prop of props
    state[prop][key.trim()] = value.trim()
  }

  // process the sequence to understand our costume's props.
  function costumeTime(line, separator=':') {
    // where in the line is our break
    const index = line.indexOf(separator)
    // before then is the attribute
    const key = line.substring(0, index)
    // after then is the data
    const value = line.substring(index+1)

    // no data?
    if(!value) {
      // collect the properties from our costume
      const properties = costumes[costume]

      // convert them into hype attributes
      const attributes = Object.keys(properties)
        .map(x => `${x}="${properties[x]}"`).join('')

      // add some hype to our exhibit
      exhibit += `<${costume} ${attributes}></${costume}>`

      // back to normal time
      time = NORMAL_TIME
      return
    }

    // set the 
    costumes[costume][key.trim()] = value.trim()
  }

  function append(costume, body) {
    const hype = `
      <${costume}>
        ${body}
      </${costume}>
    `
    exhibit += hype
  }

  function noop() {}
}

const $ = module('hyper-script', {
  file: 'booting...',
  activePanel: panels.write,
  activeShot: 0,
  shotCount: 0
})

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

function sourceFile(target) {
  const src = source(target)
  return state[src]
    ? state[src]
    : (function initialize() {
      state[src] = {
        file: script404(),
        html: '&hearts;',
        embed: ';)'
      }
      return state[src]
    })()
}

$.when('input', 'textarea', (event) => {
  const src = source(event.target)
  const { value } = event.target
  state[src].file = value
  const html = compile(value)
  state[src].html = html
  state[src].embed = `<iframe src="${window.location.href}&readonly=true" title="embed"></iframe>`
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

$.draw(target => {
  const bars = getRhythm(true)
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
        <textarea style="background: ${bars}">${escapedFile}</textarea>
      </div>
    `,
    [panels.read]: () => `
      <div name="read">
        <div name="page">
          ${html}
        </div>
        <div name="navi">
          <button data-print>Print</button>
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
          <button data-write>Write</button>
          <button data-read>Read</button>
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

function escapeHyperText(text) {
  return text.replace(/[&<>'"]/g, 
    costume => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[costume])
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
  return `<title-page
title: Pretend
author: Ty aka Notorious Sillonious

# Best Buy Parking Lot - San Carlos, October 9th, 2023 - After Wrap

^ Cold Open

TY wears an orange hat and gloves while talking to an iPhone.

@ Ty
> I wasn't going to show anybody else this, but because that Tesla drove through my shot-- enjoy!

# Best Buy Parking Lot - Before Shoot - Intercut

Ty wears a sweatshirt and is amping himself up with jokes at the iPhone.

A white Tesla creeps in the back, like Jaws.

@ Ty
> Like yo, I don't care if all your cars over there.

Ty gestures in the general direction of the super chargers.

@ Ty
> Wherever. Have Dog mode. My car over here, was voted 2005 dog car of the year.

The tesla parades itself in for a close up.

^ Hard cut

# Best Buy Parking Lot - Act 3 - Bark Barking

Ty speaks directly with the audience, with the 2005 dog car of the year behind him.

@ Ty
> Alright. How's everybody doing? We feeling good still? Thank you!
& Smirks
> Alright, so clown town is over, thank you all for coming out.

@ Ty
> As we're transitioning from clown town, a kid friendly, family appropriate show here, we're going to bring on DJ Wally.

@ Ty
> And after DJ Wally, we have a series of headliners for you in a series tonight, all of them headliners in their own time and space.

Ty points at the camera.

@ Ty
> But they're all new to you tonight. And!

Ty climbs up onto the tailgate.

@ Ty
> I'm very excited to announce the premier of "Oops, Yeah", no. Nope, that wasn't it, hang on.

Ty waves his hands and clears the air.

@ Ty
> I always get these words mixed up. We need a better back-ronym for these. We don't even have an acronym going forwards.

@ Ty
> Anyways. but I'm Ty, your producer, aka the Notorious Sillonious.

Ty jims the camera.

@ Ty
> I am both a clown and whatever else I am. Who is to say?

Ty raises his hand with a Queanswer.

@ Ty
> Well, there is a lot to say. So Actually, I am the Principal Engineer of Sillyz.Computer

<hyper-link
src: https://Sillyz.Computer
label: blow your mind

@ Ty
> It is a state of being with a technical implementation.

A deep breath.

@ Ty
> And I'm excited to share all of that with you. And didn't want to waste your time.

Goes off the cuff.

@ Ty
> Wasting everybody's time and money. Accomplishing nothing. So.

Continues to improvise.

@ Ty
> So, instead of giving you this broad timeline of seven, to ten, to thirty years, it is ready for you now.

Hand flip.

@ Ty
> So, look under your seats. You'll find a post-it note that has a Rune on it.

Jim for the camera once more.

@ Ty
> And on that magic rune, you will be transported into Sillyz.Computer! Now!

CHECKERED VANS kick the BACK DOOR of the HONDA ELEMENT.

@ Ty
> I don't know if anyone can hear that, see that, click that!

So many kicks against the car, pure excitement.

@ Ty
> This, right here, is Sillyz.Computer.

@ Ty
> Couldn't buy that in a Best Buy now could you? I didn't think so.

Points at the big blue box across the lot.

Ty tampers down the flames of the audience with his hands.

@ Ty
> Alright, alright. Roast time is over Clown Town. We've got DJ Wally coming on now!

Ty jumps in rhythm with the momentum he is building lyrically.

@ Ty
> I am so excited for you to hear the beats that he has to drop! But!

Jumping stops.

@ Ty
> In the meantime, to get Wally's setup going, we're going to need to pop this top.

Liberal amounts of thumbs up, jumping pointing in excitement.

@ Ty
> Now! Are you ready for the drop?

# Best Buy Parking Lot - Act 1 - No Barking

Ty struggles to set up tripods and cameras, but overcomes physical and digital difficulties.

# Best Buy Parking Lot - Act 2 - Silent Barking

Ty drives home the point that this project could have gone so much further if he didn't have to busk for independence, but like a true american, will hit the streets with art.

# Best Buy Parking Lot - Act 4 - Pack Barking

Without funding, Ty has managed to stay entirely independent and open. In a rare glimpse behind the curtain in the high tower, Ty reveals the truth of time travel.

# Best Buy Parking Lot - Act 5 - Done Barking

Ty unwinds after a breath-taking 35 minute performance and managed to transmit the entire log through the Stargate before disconnecting and sealing the gate for good.

! <sillyz-synth

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

<hello-world

<hello-nickname

<hello-universe

<hypertext-variable
text: hello world
weight: 800
size: 2rem
height: 6

<rainbow-action
text: Pop
prefix: <a href="https://sillyz.computer">
suffix: </a>

<hypertext-highlighter
text: this is yellow
color: yellow

# the end.

{ play
embed: <iframe width="560" height="315" src="https://www.youtube.com/embed/KcUAa0eT4Tc?si=NCkkTBArSKMYj7Vt" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
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
    overflow: auto;
  }
  & .grid {
    display: grid;
    grid-template-rows: 1fr;
    height: 100vh;
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: 100%;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 2;
    display: inline-flex;
    justify-content: end;
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
    background: rgba(0,0,0,.15);
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
    border-radius: 1.5rem;
    padding: .5rem;
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
    background: white;
    color: black;
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
    padding: 0 1in;
    max-width: 8.5in;
    overflow: auto;
  }
  & [name="page"] {
    font-size: 12pt;
    font-family: courier;
    height: 100%;
    max-height: 100vh;
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
    padding: .5rem;
    line-height: 2rem;
    padding-left: 2rem;

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
    animation: &-fade-in ease-in-out 1ms;
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
    }
    100% {
    }
  }

  @keyframes &-fade-out {
    0% {
    }
    100% {
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

function getRhythm(disabled) {
  if(disabled) return 'transparent'
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);
  canvas.height = rhythm * 2;
  console.log(rhythm)
  canvas.width = rhythm;

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, rhythm, rhythm);

  ctx.fillStyle = 'dodgerblue';
  ctx.fillRect(0, rhythm - 1, rhythm, 1);

  return `url(${canvas.toDataURL()}`;
}

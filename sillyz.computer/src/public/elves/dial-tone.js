import elf from '@silly/tag'
import * as Tone from 'tone@next'
import { SampleLibrary } from '/cdn/attentionandlearninglab.com/Tonejs-Instruments.js'

const $ = elf('dial-tone', { root: 60, meander: true, samples: {} })

let current
// load samples / choose 4 random instruments from the list //
const instruments = ['piano', 'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute', 'french-horn', 'guitar-acoustic', 'guitar-electric','guitar-nylon', 'harmonium', 'harp', 'organ', 'saxophone', 'trombone', 'trumpet', 'tuba', 'violin', 'xylophone']

function load(instrument) {
  current = SampleLibrary.load({
    instruments: instrument,
    baseUrl: (self.plan98.env.HEAVY_ASSET_CDN_URL || '') + "/private/tychi.1998.social/SourceCode/tonejs-instruments/samples/"
  })

  Tone.loaded().then(function() {
    current.release = .5;
    current.toDestination();
  })
}

load('piano')

// show error message on loading error //
$.when('change', '.samples', function(event) {
  load(instruments[event.target.value]);
})

$.when('change', '.notes', function(event) {
  $.teach({ root: parseInt(event.target.value) })
})

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

const midiCodes = [...new Array(116)].map((_, i) => i)

$.draw(() => {
  const { root } = $.learn()
  const list = Object.keys(instruments).map((item) => {
    return `
      <option value="${item}" ${current === instruments[item] ? 'selected="true"':''}>
        ${instruments[item]}
      </option>
    `
  })

  const notes = midiCodes.map((item) => {
    return `
      <option ${root === item ? 'selected="true"':''}>
        ${item}
      </option>
    `
  })

  return `
    <div class="controls">
      <select class="samples">
        ${list}
      </select>
      <select class="notes">
        ${notes}
      </select>
      <button data-meander>
        ??
      </button>
    </div>
    <div class="the-compass">
      <button class="note root" data-note="${root}">
        ${root}
      </button>
      <button class="note minus-7" data-note="${root - 7}">
        ${root - 7}
      </button>
      <button class="note plus-7" data-note="${root + 7}">
        ${root + 7}
      </button>
      <button class="note plus-2" data-note="${root + 2}">
        ${root + 2}
      </button>
      <button class="note plus-5" data-note="${root + 5}">
        ${root + 5}
      </button>
      <button class="note minus-5" data-note="${root - 5}">
        ${root - 5}
      </button>
      <button class="note minus-2" data-note="${root - 2}">
        ${root - 2}
      </button>
    </div>
  `
})

$.style(`
  & {
    display: block;
    height: 100%;
    background: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5)),#54796d;
    position: relative;
  }

  &.headless .controls {
    display: none;
  }
  & .the-compass {
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-template-rows: repeat(6, calc(100% / 6));
    pointer-events: all;
    aspect-ratio: 1;
    margin: auto;
    max-height: 100%;
    top: 50%;
    position: relative;
    transform: translateY(-50%);
  }

  & .the-compass button {
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
    border: none;
    border-radius: 100%;
    color: white;
    background-image: radial-gradient(rgba(0,0,0,1), rgba(0,0,0,1) 25%, rgba(0,0,0,.25) 25%);
  }

  & .the-compass button:hover {
    background-image: radial-gradient(rgba(0,0,0,1), rgba(0,0,0,1) 25%, rgba(255,255,255,.25) 25%);
  }

  & .the-compass img {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
  }
  & .the-compass button{
    padding: 0;
  }

  & .the-compass .plus-2 {
    grid-row: 3 / 5;
    grid-column: 5 / 7;
    background-color: mediumseagreen;
  }

  & .the-compass .minus-2 {
    grid-row: 3 / 5;
    grid-column: 1 / 3;
    background-color: yellow;
  }

  & .the-compass .minus-7 {
    grid-row: 1 / 3;
    grid-column: 2 / 4;
    background-color: red;
    transform: translateY(13%);
  }

  & .the-compass .plus-7 {
    grid-row: 1 / 3;
    grid-column: 4 / 6;
    background-color: orange;
    transform: translateY(13%);
  }

  & .the-compass .minus-5 {
    grid-row: 5 / 7;
    grid-column: 2 / 4;
    background-color: dodgerblue;
    transform: translateY(-13%);
  }

  & .the-compass .plus-5 {
    grid-row: 5 / 7;
    grid-column: 4 / 6;
    background-color: mediumpurple;
    transform: translateY(-13%);
  }

  & .the-compass .root {
    grid-row: 3 / 5;
    grid-column: 3 / 5;
    background-color: white;
  }

  & .controls {
    display: grid;
    grid-template-columns: 1fr auto auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    height: 2rem;
  }
  & .controls select {
    background: transparent;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 0;
    color: rgba(255,255,255,.65);
    padding: .5rem;
  }

  & .controls button {
    background: transparent;
    color: rgba(255,255,255,.65);
    border: 1px solid rgba(255,255,255,.65);
    padding: 0 .5rem;
  }
`)

$.when('click', '[data-meander]', meanderMaybe)
function meanderMaybe() { $.teach({ meander: !$.learn().meander }) }

$.when('pointerdown', '.note', attack)
$.when('pointerup', '.note', release)

const attacking = {}
function attack(event) {
  console.log(event)
  event.preventDefault()
  event.stopPropagation()
  const note = event.target.dataset.note
  console.log(note)
  if(!current || attacking[note]) return
  current.triggerAttack(Tone.Frequency(note, "midi").toNote());
  attacking[note] = true
}

function release(event) {
  console.log(event)
  const note = event.target.dataset.note
  if(attacking[note]) {
    delete attacking[note]
  }
  if(!current) return
  current.triggerRelease(Tone.Frequency(note, "midi").toNote());
  const { meander } = $.learn()
  if(meander) {
    $.teach({ root: parseInt(note) })
  }
}

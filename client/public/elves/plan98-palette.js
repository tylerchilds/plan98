import Wad from 'web-audio-daw';
import elf from '@plan98/elf'

const midiRange = [...new Array(128)].map((x, i) => i)

const defaultConfig = {
  source : 'sawtooth',
  tuna   : {
    Overdrive : {
      outputGain: 0.5,         //0 to 1+
      drive: 0.7,              //0 to 1
      curveAmount: 1,          //0 to 1
      algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
      bypass: 0
    },
    Chorus : {
      intensity: 0.3,  //0 to 1
      rate: 4,         //0.001 to 8
      stereoPhase: 0,  //0 to 180
      bypass: 0
    }
  }
}

export function newSynth(config = defaultConfig) {
  return new Wad(config)
}

const $ = elf('plan98-palette')

$.draw((target) => {
  if(!target.synth) {
    target.synth = newSynth()
  }
  return `
    <div class="colors">
      <div class="color" style="--color: var(--red, firebrick)"></div>
      <div class="color" style="--color: var(--orange, darkorange)"></div>
      <div class="color" style="--color: var(--yellow, gold)"></div>
      <div class="color" style="--color: var(--green, mediumseagreen)"></div>
      <div class="color" style="--color: var(--blue, dodgerblue)"></div>
      <div class="color" style="--color: var(--indigo, slateblue)"></div>
      <div class="color" style="--color: var(--violet, mediumpurple)"></div>
      <div class="color" style="--color: var(--gray, dimgray)"></div>
    </div>
    <div class="toppings">
      <div class="color" style="--color: rgba(0, 0, 0,1)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.85)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.65)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.5)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.35)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.2)"></div>
      <div class="color" style="--color: transparent"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.2)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.35)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.5)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.65)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.85)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,1)"></div>
    </div>
    <div class="tabs">
      ${midiRange.map(renderNote).join('')}
    </div>
  `
})

function renderNote(midi) {
  return `
    <button aria-label="${midi}" data-play="${midi}">midi</button>
  `
}

function attack(event) {
	event.preventDefault()
  const { play } = event.target.dataset
  const { synth } = event.target.closest($.link)
  synth.stop(play);
  synth.play({ pitch: play, label: play });
}

function release (event) {
	event.preventDefault()
  const { play } = event.target.dataset
  const { synth } = event.target.closest($.link)
  synth.stop(play);
}

$.when('mouseenter', '[data-play]', attack)
$.when('mouseleave', '[data-play]', release)

$.when('mousedown', '[data-play]', attack)
$.when('mouseup', '[data-play]', release)

$.when('touchstart', '[data-play]', attack)
$.when('touchend', '[data-play]', release)

$.style(`
  & {
    position: relative;
    display: grid;
    grid-template-areas: 'spot';
    height: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  & .colors {
    display: flex;
    grid-area: spot;
    flex-direction: column;
    height: 100%;
  }

  & .toppings {
    display: flex;
    grid-area: spot;
    height: 100%;
  }

  & .color {
    background-color: var(--color);
    width: 100%;
    height: 100%;
  }
`)

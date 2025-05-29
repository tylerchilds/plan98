import elf from '@plan98/elf'
import {
  attack,
  release,
  attackRelease,
  getNoteDuration
} from './paper-pocket.js'

const midiRange = [...new Array(128)].map((x, i) => i)

const synths = {}

const $ = elf('plan98-palette')

$.draw((target) => {
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
      <div class="color" style="--color: rgba(0, 0, 0,.95)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.875)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.775)"></div>
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
      <div class="color" style="--color: rgba(255, 255, 255,.95)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,1)"></div>
    </div>
    <div class="tabs">
      ${midiRange.map(renderNote).join('')}
    </div>
  `
})

function renderNote(midi) {
  return `
    <button aria-label="${midi}" data-midi="${midi}">${midi}</button>
  `
}

function queueAttack(event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  attack(midi)
}

function queueRelease (event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  release(midi)
}

$.when('mouseenter', '[data-midi]', queueAttack)
$.when('mouseleave', '[data-midi]', queueRelease)

$.when('mousedown', '[data-midi]', queueAttack)
$.when('mouseup', '[data-midi]', queueRelease)

$.when('touchstart', '[data-midi]', queueAttack)
$.when('touchend', '[data-midi]', queueRelease)

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

  & .tabs {
    display: grid;
    grid-area: spot;
    grid-template-columns: repeat(16, 1fr);
    grid-template-rows: repeat(8, 1fr);
    grid-auto-flow: column;
  }

  & .tabs [data-midi] {
    border: 0;
    background: transparent;
    display: grid;
    place-content: end;
    color: white;
    text-shadow:
      0 0 3px rgba(0,0,0,.15),
      0 0 2px rgba(0,0,0,.25),
      1px 1px rgba(0,0,0,.45);


    font-size: 12px;
    opacity: 0;
  }

  & .tabs [data-midi]:hover,
  & .tabs [data-midi]:focus {
    opacity: 1;
  }
`)

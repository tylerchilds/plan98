import elf from '@silly/elf'
import {
  setInstrument,
  attack,
  release,
  attackRelease
} from './paper-pocket.js'

import Color from "colorjs.io"

setInstrument('bass-electric')

const $ = elf('final-boss', {
  colors: [],
  start: 0,
  length: 360,
  reverse: false,
  consent: false
})

const lightnessStops = [
  [5, 30],
  [20, 45],
  [35, 60],
  [50, 75],
  [65, 90],
  [80, 105],
  [95, 120]
]

const initialColors = recalculate()
$.teach({ colors: initialColors, colorVariables: print(initialColors) })

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

function recalculate() {
  const { start, length, reverse } = $.learn()

  const colors = [...Array(12)].map((_, hueIndex) => {
    const hueFifths = mod(hueIndex * 7, 12)
    const step = ((length / 12) * hueFifths)
    const hue = reverse
      ? start - step
      : start + step

    return lightnessStops.map(([l, c], i) => {
      const name = `--wheel-${hueFifths}-${i}`
      const value = new Color('lch', [l, c, hue])
        .display()
        .toString()

      return {
        name,
        value,
        block: hueFifths,
        inline: i
      }
    })
  })

  $.teach({ colorVariables: print(colors) })

  return colors
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

$.draw((target) => {
  const { colors, colorVariables, consent } = $.learn()

  if(!consent) {
    return `
      <div class="fake-overlay">
        <div class="fake-modal">
          <div class="fake-title">
            Photosensitive Warning: Read Before Playing!
          </div>
          <div class="fake-context">
            <p>
              A very small percentage of individuals may experience epileptic seizures when exposed to certain light patterns or flashing lights. Exposure to certain patterns or backgrounds on a computer screen, or while playing video games, may induce an epileptic seizure in these individuals. Certain conditions may induce previously undetected epileptic symptoms even in persons who have no history of prior seizures or epilepsy.
            </p>
          <p>
            If you, or anyone in your family, have an epileptic condition, consult your physician prior to playing. If you experience any of the following symptoms while playing a video or computer game -- dizziness, altered vision, eye or muscle twitches, loss of awareness, disorientation, any involuntary movement, or convulsions -- IMMEDIATELY discontinue use and consult your physician before resuming play.
          </p>

          </div>

          <div class="fake-actions">
            <button class="fake-button bad">
              Decline
            </button>
            <button class="fake-button good">
              Accept
            </button>
          </div>
        </div>
      </div>
    `
  }

  const wheel = colors.map((lightness, i) => {
    const steps = lightness.map((x, ii) => {
      const noteAlgorithm = ((ii * 12) + mod(i * 7, 12))
      return`
        <button
          class="step"
          data-note="${noteAlgorithm}"
          style="background: var(${x.name})">
        </button>
      `
    }).join('')
    return `
      <div class="group" style="transform: rotate(${i * 30}deg)">
        ${steps}
      </div>
    `
  }).join('')

  return `
    <div class="grid">
      <div class="wheel" style="${colorVariables}">
        ${wheel}
      </div>
    </div>
  `
})

$.when('click', '.fake-button.good', (event) => {
  $.teach({ consent: true });
})

$.when('click', '.fake-button.bad', (event) => {
  window.location.href = 'https://hivelabworks.com'
})

$.when('pointerenter', '.step', (event) => {
  const { note } = event.target.dataset
  attack(note)
})

$.when('pointerleave', '.step', (event) => {
  const { note } = event.target.dataset
  release(note)
})

$.style(`
  & {
    background: black;
    display: block;
    height: 100%;
    user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
  }

  & [data-escape] {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
  }

  & .action-button {
    position: absolute;
    top: 0;
    right: 0;
    left: auto;
    bottom: auto;
    z-index: 10;
    width: 50px;
    height: 50px;
  }

  & .grid {
    position: relative;
    height: 100%;
  }
  & .grid > * {
    position: absolute;
    inset: 0;
    margin: auto;
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 40vmin;
    grid-template-columns: 27vmin;
    place-content: start center;
    padding: 0 10vmin;
    height: 80vmin;
  }

  & .wheel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(rgba(255,255,255,1), rgba(255,255,255,.5), rgba(0,0,0,.5), rgba(0,0,0,1));
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: plus-lighter;
  }
  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
    clip-path: polygon(10% 0%, 50% 100%, 90% 0%);
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
    opacity: 1;
    transition: opacity calc(1000ms / 8);
  }

  & .step.active,
  & .step:hover,
  & .step:focus {
    opacity: .1;
  }

  & .fake-overlay {
    height: 100%;
    background: linear-gradient(45deg rgba(0,0,0,.15), rgba(0,0,0,.5));
  }

  & .fake-modal {
    max-width: 55ch;
    margin: 0 auto;
    background: white;
    display: grid;
    grid-template-rows: auto 1fr auto;
    max-height: 100%;
  }
  & .fake-title {
    background: rgba(0,0,0,.85);
    font-weight: bold;
    font-size: 1rem;
    padding: 1rem;
    margin 1rem 0;
    color: rgba(255,255,255,.65);
  }

  & .fake-context {
    padding: 0 1rem;
    margin-bottom: 1rem;
    color: rgba(0,0,0,.85);
    max-height: 100%;
    overflow: auto;
  }
  & .fake-actions {
    display: flex;
    justify-content: end;
    padding: 1rem;
    background: rgba(0,0,0,.25);
    gap: .5rem;
  }

  & .fake-button {
    padding: .5rem 1rem;
    border: none;
    background: grey;
    color: black;
    border-radius: 1rem;
  }

  & .fake-button.good {
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.85)), mediumseagreen;
    color: rgba(255,255,255,.85);
  }
`)

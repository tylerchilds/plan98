import elf from '@silly/elf'
import Color from "colorjs.io"

const $ = elf('final-boss', {
  colors: [],
  start: 0,
  length: 360,
  reverse: false
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
  const { colors, colorVariables } = $.learn()
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

$.when('pointerenter', '.step', (event) => {
  const { note } = event.target.dataset
  console.log('attack', note)
})

$.when('pointerleave', '.step', (event) => {
  const { note } = event.target.dataset
  console.log('release', note)
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
`)

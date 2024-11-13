import elf from '@silly/tag'
import Color from "colorjs.io"
import * as Tone from 'tone@next'

const $ = elf('play-wheel', {
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


const eventMap = {
  37: () => baseOctave--,
  39: () => baseOctave++
};

let synths = [...Array(12)]
synths = synths.map(() => new Tone.Synth().toDestination())

export function playNote(_$, flags) {
  const { note, theme, index } = flags

  const now = Tone.now()

  synths[index].triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), "8n", now);

  if(theme) {
    const html = document.querySelector('html')
    html.style = `
      --theme: ${theme};
    `
  }
}

function divide(x, n) {
  return Math.floor((x + n) / n) - 1;
}

function mod(x, n) {
  return ((x % n) + n) % n;
}

function embedded(target) {
  return target.dataset.embedded === 'true'
}

const initialColors = recalculate()
$.teach({ colors: initialColors, colorVariables: print(initialColors) })
$.draw((target) => {
  if(embedded(target)) return
  const { start, length, reverse, colors, debug, colorVariables } = $.learn()
  const wheel = colors.map((lightness, i) => {
    console.log({ lightness })
    const steps = lightness.map((x, ii) => {
      const noteAlgorithm = ((ii * 12) + mod(i * 7, 12))
      console.log(noteAlgorithm)
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

  const settings = `
    <play-wheel data-embedded="true" src="${target.getAttribute('src')}">
      <button class="nonce" data-escape aria-label="To Ethnography"></button>
      <form>
        ${start} ${length} ${reverse}
         <label class="field">
           <span class="label">Hue</span>
           <input min="0" max="360" value="${start}" name="start" type="range" />
         </label>

         <label class="field">
           <span class="label">Length</span>
           <input min="0" max="360" value="${length}" name="length" type="range" />
         </label>

         <label class="field">
           <input name="reverse" type="checkbox" />
           <span class="label">Reverse</span>
         </label>
      </form>
    </play-wheel>
  `

  return `
    <button class="nonce action-button" data-popover='${settings}' aria-label="settings"></button>
    <div class="grid">
      <div class="wheel" style="${colorVariables}">
        ${wheel}
      </div>
    </div>
    <style>
      hypercolorwheel form {
        display: ${debug ? 'block' : 'none'}
      }
    </style>
  `
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

  //if($user.learn()._link) {
    //signal($user.learn()._link).colorVariables = print(colors)
  //}
  
  $.teach({ colorVariables: print(colors) })

  return colors
}

$.when('change', '[type="range"]', (event) => {
  const { value, name } = event.target
  $.teach({ [name]: parseInt(value), colors: recalculate() })
})

$.when('change', '[type="checkbox"]', (event) => {
  const { checked, name } = event.target

  $.teach({ [name]: checked, colors: recalculate() })
})

$.when('click', '[data-escape]', (event) => {
  const src = event.target.closest($.link).getAttribute('src')
  window.location.href = src || '/app/hyper-script'
})
$.when('click', '.step', play)
$.when('pointermove', '.step', play)

function play(event) {
  const { note, block, inline } = event.target.dataset
  playNote($, {
    index: 0,
    note
  })

  const html = document.querySelector('html')
  html.style = `
    --theme: var(--wheel-${block}-${inline});
  `
}

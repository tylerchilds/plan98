import { Color, tag, signal } from "/deps.js"
import { playNote } from "/packages/streams/instrument.js"
import $user from "/packages/widgets/menu-user.js"

const $ = tag('HyperColorWheel', {
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

$.write({ colors: recalculate() })
$.render(() => {
  const { start, length, reverse, colors, debug } = $.read()
  const wheel = colors.map((lightness, i) => {
    const steps = lightness.map((x) => `
      <button
        class="step"
        data-block="${x.block}"
        data-inline="${x.inline}"
        style="background: var(${x.name})">
      </button>
    `).join('')
    return `
      <div class="group" style="transform: rotate(${i * 45}deg)">
        ${steps}
      </div>
    `
  }).join('')

  return `
    <div class="wheel">
      ${wheel}
    </div>
    <form>
      ${start} ${length} ${reverse}
      <input min="0" max="360" value="${start}" name="start" type="range" />
      <input min="0" max="360" value="${length}" name="length" type="range" />
      <input name="reverse" type="checkbox" />
      <label for="reverse">Reverse</label>
    </form>
    <style>
      hypercolorwheel form {
        display: ${debug ? 'block' : 'none'}
      }
    </style>
  `
})

$.style(`
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 40vmin;
    grid-template-columns: 40vmin;
    place-content: start center;
    padding: 10vmin;
    height: 80vmin;
  }
  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
    clip-path: polygon(10% 0%, 50% 100%, 90% 0%);
    gap: 5px;
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
  }
`)

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

function recalculate() {
  const { start, length, reverse } = $.read()

  const colors = [...Array(8)].map((_, hueIndex) => {
    const step = ((length / 8) * hueIndex)
    const hue = reverse
      ? start - step
      : start + step

    return lightnessStops.map(([l, c], i) => {
      const name = `--wheel-${hueIndex}-${i}`
      const value = new Color('lch', [l, c, hue])
        .display()
        .toString()

      return {
        name,
        value,
        block: hueIndex,
        inline: i
      }
    })
  })

  if($user.read()._link) signal($user.read()._link).colorVariables = print(colors)

  return colors
}


const eventMap = {
  37: () => $.write({ start: $.read().start - 45}),
  39: () => $.write({ start: $.read().start + 45}),
};

document.addEventListener('keydown', (event) => {
  const handler = eventMap[event.keyCode] || console.log
  handler()
  $.write({ colors: recalculate() })
});


$.on('change', '[type="range"]', (event) => {
  const { value, name } = event.target

  $.write({ [name]: parseInt(value), colors: recalculate() })
})

$.on('change', '[type="checkbox"]', (event) => {
  const { checked, name } = event.target

  $.write({ [name]: checked, colors: recalculate() })
})

$.on('click', '.step', (event) => {
  const { block, inline } = event.target.dataset
  playNote($, {
    index: 0,
    keys: [parseInt(block), parseInt(inline)]
  })

  const html = document.querySelector('html')
  html.style = `
    --theme: var(--wheel-${block}-${inline});
  `
})

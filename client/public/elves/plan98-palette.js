import elf from '@plan98/elf'
import {
  attack,
  release,
  setTheme,
} from './paper-pocket.js'

const midiRange = [...new Array(128)].map((x, i) => i)

export const colors = [
  "firebrick",
  "darkorange",
  "gold",
  "mediumseagreen",
  "dodgerblue",
  "slateblue",
  "mediumpurple",
  "sienna",
]

export const light = [
  "rgba(0, 0, 0,1)",
  "rgba(0, 0, 0,.95)",
  "rgba(0, 0, 0,.875)",
  "rgba(0, 0, 0,.775)",
  "rgba(0, 0, 0,.65)",
  "rgba(0, 0, 0,.5)",
  "rgba(0, 0, 0,.35)",
  "rgba(0, 0, 0,.2)",
  "transparent",
  "rgba(255, 255, 255,.2)",
  "rgba(255, 255, 255,.35)",
  "rgba(255, 255, 255,.5)",
  "rgba(255, 255, 255,.65)",
  "rgba(255, 255, 255,.85)",
  "rgba(255, 255, 255,.95)",
  "rgba(255, 255, 255,1)",
]

export const matrix = colors.map(color => {
  return light.map(l => {
    return {
      rgba: mixColors(l, color),
      light: l,
      color: color,
    }
  })
})

const $ = elf('plan98-palette')

$.draw((target) => {
  return `
    <div class="colors">
      ${colors.map((color) => `
        <div class="color" style="--color: ${color}"></div>
      `).join('')}
    </div>
    <div class="light">
      ${light.map((color) => `
        <div class="color" style="--color: ${color}"></div>
      `).join('')}
    </div>
    <div class="tabs">
      ${midiRange.map(renderNote).join('')}
    </div>
  `
})

function mod(x, n) {
  return ((x % n) + n) % n;
}

function renderNote(midi, i) {
  const color = colors[mod(i, colors.length)]
  const topping = light[mod(Math.floor(i / colors.length), light.length)]
  return `
    <button aria-label="${midi}" data-midi="${midi}" data-color="${color}" data-topping="${topping}"><span>${midi}</span></button>
  `
}

function queueAttack(event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  attack(midi)

  setTimeout(() => release(midi), 5000)
}

function queueRelease (event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  release(midi)
}

function mixColors(color1, color2) {
    const parseColor = (colorStr) => {
        // Create a temporary div to let the browser parse the color
        const div = document.createElement('div');
        div.style.color = colorStr;
        div.style.display = 'none'; // Keep it off-screen
        document.body.appendChild(div);

        const computedColor = getComputedStyle(div).color;
        document.body.removeChild(div);

        // Regex to parse rgba(r, g, b, a) or rgb(r, g, b)
        const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: parseFloat(match[4] || 1) // Default alpha to 1 if not specified (for rgb() inputs)
            };
        }
        console.error("Could not parse color string:", colorStr);
        return { r: 0, g: 0, b: 0, a: 1 }; // Default to black on error
    };

    const c1 = parseColor(color1); // Foreground color (black)
    const c2 = parseColor(color2); // Background color (dodgerblue)

    // Ensure we have valid parsed colors
    if (!c1 || !c2) {
        return 'rgba(0,0,0,1)'; // Return a default or error color
    }

    // Alpha Composite Formula (C_fg is color1, C_bg is color2)
    const aOut = c1.a + c2.a * (1 - c1.a);

    // To avoid division by zero if aOut is 0 (both colors fully transparent)
    if (aOut === 0) {
        return 'rgba(0,0,0,0)'; // Fully transparent black
    }

    const rOut = (c1.r * c1.a + c2.r * c2.a * (1 - c1.a)) / aOut;
    const gOut = (c1.g * c1.a + c2.g * c2.a * (1 - c1.a)) / aOut;
    const bOut = (c1.b * c1.a + c2.b * c2.a * (1 - c1.a)) / aOut;

    return `rgba(${Math.round(rOut)}, ${Math.round(gOut)}, ${Math.round(bOut)}, ${aOut.toFixed(4)})`;
}

$.when('mousedown', '[data-midi]', queueAttack)
$.when('mouseup', '[data-midi]', queueRelease)

$.when('touchstart', '[data-midi]', queueAttack)
$.when('touchend', '[data-midi]', queueRelease)

let activeMidi
$.when('pointerdown', '[data-midi]', (event) => {
  activeMidi = event.target.dataset.midi
})

$.when('pointerup', '[data-midi]', (event) => {
  const { midi } = event.target.dataset
  const target = event.target.closest($.link)
  if(activeMidi === midi) {
    release(midi)
    const { topping, color } = event.target.dataset
    setTheme(mixColors(topping, color))
    if(target.getAttribute('escape') !== 'disabled') {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
    }
  }
})

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

  & .light {
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
    position: relative;
    border: 0;
    background: transparent;
    display: grid;
    place-content: end;
    color: white;
    padding: 0;
    text-shadow:
      0 0 3px rgba(0,0,0,.15),
      0 0 2px rgba(0,0,0,.25),
      1px 1px rgba(0,0,0,.45);


    font-size: 12px;
    opacity: 0;
  }

  & .tabs [data-midi]:hover,
  & .tabs [data-midi]:focus {
    background: linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,0));
    opacity: 1;
  }

  & .tabs [data-midi] span {
    pointer-events: none;
    position: absolute;
    bottom: 0;
    right: 0;
  }
`)

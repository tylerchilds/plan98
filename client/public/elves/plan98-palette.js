import elf from '@silly/elf'
import {
  attack,
  release,
  attackRelease,
  setTheme,
} from './paper-pocket.js'
import {
  update
} from './ur-shell.js'

const center = 60
const spatialOffset = 0
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

const $ = elf('plan98-palette', {
  rows: 8,
  columns: 16,
  instances: {},
})

const manualNotes = {}

function maybe(id, value, note) {
  if(manualNotes[note]) return
  if(value === 1) {
    yes(id, note)
  } else {
    no(id, note)
  }
}

// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete two forward slashes. That's it.

////

function yes(id, note) {
  //attack(note)
  mark(id, note)
}

function no(id, note) {
  //release(note)
  unmark(id, note)
}

function mark(id, note) {
  updateNote({ id, note }, true)
}

function unmark(id, note) {
  const { instances } = $.learn()
  const { activeNotes } = instances[id]
  if(activeNotes[note]) {
    updateNote({ id, note }, false)
  }
}

function noteFromGrid(column, row) {
  const { rows } = $.learn()
  return column * rows + row
}

function colorFromGrid(column, row) {
  return colors[column][row]
}

$.draw((target) => {
  if(target.innerHTML) return
  seed(target)
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
}, {
  afterUpdate(target) {
    const { instances } = $.learn()
    const { x, y, activeNotes } = instances[target.id] || {activeNotes:{}}

    {
      if(target.lastX !== x || target.lastY !== y) {
        target.lastX = x
        target.lastY = y
        let active = target.querySelector('.tabs .root-note')
        if(active) {
          active.classList.remove('root-note')
        }

        active = target.querySelector(`.tabs [data-x="${x}"][data-y="${y}"]`)

        if(active) {
          active.classList.add('root-note')
        }
      }
    }

    {
      const activeTabs = [...target.querySelectorAll('.tabs .playing')]

      const leaving = activeTabs
        .filter(x => !activeNotes[x.dataset.midi])
      const entering = Object.keys(activeNotes)
        .filter(x => activeNotes[x])
        .map(x => target.querySelector(`[data-midi="${x}"]`))

      if(leaving.length > 0) {
        leaving.map(x => x.classList.remove('playing'))
      }

      if(entering.length > 0) {
        [...entering].map(x => x.classList.add('playing'))
      }
    }
  }
})

function mod(x, n) {
  return ((x % n) + n) % n;
}

function renderNote(midi, i) {
  const { rows, columns } = $.learn()
  const color = colors[mod(i, colors.length)]
  const topping = light[mod(Math.floor(i / colors.length), light.length)]
  const x = Math.floor(i / rows)
  const y = mod(i, rows)
  return `
    <button data-x="${x}" data-y="${y}" aria-label="${midi}" data-midi="${midi}" data-color="${color}" data-topping="${topping}"><span>${midi}</span></button>
  `
}

function queueAttack(event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  const { id } = event.target.closest($.link)
  //attack(midi)

  setTimeout(() => {
    //release(midi)
    unmark(id, midi)
  }, 5000)
}

function queueRelease (event) {
  event.preventDefault()
  const { midi } = event.target.dataset
  const { id } = event.target.closest($.link)
  //release(midi)
  unmark(id, midi)
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
  const local = target.getAttribute('local') === 'true'
  if(activeMidi === midi) {
    release(midi)
    const { topping, color } = event.target.dataset
    const newColor = mixColors(topping, color)
    if(!local) {
      setTheme(newColor)
    }

    const root = event.target.closest($.link)
    const data = { color: newColor }

    update(data)
    root.dispatchEvent(new CustomEvent('input', {
      detail: data
    }))
  }
})

function slideLeft(id) {
  const { instances } = $.learn()

  if(!instances[id]) return
  const { x } = instances[id]

  if(x<=0) return
  updateInstance({ id }, { x: x - 1 })
}

function slideRight(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { x, columns } = instances[id]

  if(x>=columns-1) return
  updateInstance({ id }, { x: x + 1 })
}

function slideUp(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y } = instances[id]

  if(y<=-spatialOffset) return
  updateInstance({ id }, { y: y - 1 })
}

function slideDown(id) {
  const { instances } = $.learn()
  if(!instances[id]) return
  const { y, rows } = instances[id]

  if(y>=rows-1-spatialOffset) return
  updateInstance({ id }, { y: y + 1 })
}

function seed(target) {
  if(target.seeded) return
  target.seeded = true
  const { rows, columns } = $.learn() || {}

  const boxes = {}
  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      boxes[`${y}-${x}`] = {
        x,
        y
      }
    }
  }

  const id = target.id
  requestAnimationFrame(() => {
    updateInstance({ id }, {
      root: 60,
      x: Math.floor(columns/2) - 1,
      y: Math.floor(rows/2),
      id,
      rows,
      columns,
      boxes,
      activeNotes: {},
    })
  })
}


function updateInstance({ id }, payload) {
  $.teach({...payload}, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          ...p
        }
      }
    }
  })
}

function updateBox({ x, y, id }, payload) {
  $.teach({...payload}, (s, p) => {
    const key = `${y}-${x}`
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          boxes: {
            ...s.instances[id].boxes,
            [key]: {
              ...s.instances[id].boxes[key],
              ...p
            }
          }
        }
      }
    }
  })
}

function updateNote({ id, note }, payload) {
  $.teach(payload, (s, p) => {
    return {
      ...s,
      instances: {
        ...s.instances,
        [id]: {
          ...s.instances[id],
          activeNotes: {
            ...s.instances[id].activeNotes,
            [note]: p
          }
        }
      }
    }
  })
}





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

  & .tabs .root-note {
    /*opacity: 1;*/
  }

  & .tabs .playing {
    opacity: 1;
  }

  & .tabs .playing::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(rgba(255,255,255,.5) 33%, transparent 33%, transparent 67%, rgba(0,0,0,.5) 67%);
  }
`)

$.when('json-rpc', (event) => {
  const { method, params } = event.detail
  const { id } = event.target.closest($.link)
  const { instances } = $.learn()

  if(instances[id]) {
    const { x, y } = instances[id]
    const root = noteFromGrid(x, y)
    console.log(root)

    const more = { root, id }

    if(musicRPC[method]) {
      musicRPC[method]({...params, ...more})
    }
  }
})

$.when('click', '.note', (event) => {
  const { x, y } = event.target.dataset
  const { id } = event.target.closest($.link)
  const note = noteFromGrid(parseInt(x), parseInt(y))
  /*
  mark(id, note)
  manualNotes[note] = true
  attackRelease(note, () => {
    unmark(id, note)
    delete manualNotes[note]
  })
  */
})

const spamCache = {}

function debounceSpam(code, timeout, callback) {
  if(spamCache[code]) return
  spamCache[code] = true

  callback()

  setTimeout(() => {
    spamCache[code] = false
  }, timeout)
}

const toggleCache = {}
function toggleSpam(code, value, callback) {
  if(!toggleCache[code] && value === 1) {
    callback()
  }

  toggleCache[code] = value
}

const musicRPC = {
  'a': (params) => {
    const note = params.root

    maybe(params.id, params.value, note)
  },
  'b': (params) => {
    const note = params.root + 7
    maybe(params.id, params.value, note)
  },
  'x': (params) => {
    const note = params.root + 2
    maybe(params.id, params.value, note)
  },
  'y': (params) => {
    const note = params.root + 9
    maybe(params.id, params.value, note)
  },
  'lb': (params) => {
    const note = params.root + 4
    maybe(params.id, params.value, note)
  },
  'rb': (params) => {
    const note = params.root + 11
    maybe(params.id, params.value, note)
  },
  'lt': (params) => {
    const note = params.root + 6
    maybe(params.id, params.value, note)
  },
  'rt': (params) => {
    const note = params.root + 13
    maybe(params.id, params.value, note)
  },
  'up': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('up', 150, () => {
        slideUp(params.id)
      })
    }
  },
  'down': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('down', 150, () => {
        slideDown(params.id)
      })
    }
  },
  'left': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('left', 150, () => {
        slideLeft(params.id)
      })
    }
  },
  'right': (params) => {
    if(params.value === 1) {
      document.activeElement.blur()
      debounceSpam('right', 150, () => {
        slideRight(params.id)
      })
    }
  },
}

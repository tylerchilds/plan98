import module from "@silly/tag"
import Color from "colorjs.io"
import Wad from 'web-audio-daw';

import party, {
  hostPressesStartStop,
  hostPressesReset,
  hostPressesLight,
  hostPressesMode,
  anybodyPressesStartStop,
  anybodyPressesReset,
  anybodyPressesLight,
  anybodyPressesMode,
} from '@sillonious/party'

const synths = [...new Array(24)].map(() =>
  new Wad({
    source : 'triangle',
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
})
)

const $ = module('sillyz-ocarina', {
  colors: [],
  start: 0,
  length: 360,
  octave: 3,
  reverse: false,
	pitch: 0,
  activeFrets: [],
  activeRegisters: [],
  activeMotions: [],
  frames: {},
})

const strumVelocity = 1000
const sustainedDuration = 100
const actionableFPS = 4

const majorScale = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F#', 'D#', 'A#', 'F'
]

const minorScale = [
  'a', 'e', 'b', 'f#', 'c#', 'g#', 'd#', 'a#', 'f', 'c', 'g', 'd'
]

const lightnessStops = [
  [5, 30],
  [20, 45],
  [35, 60],
  [50, 75],
  [65, 90],
  [80, 105],
  [95, 120]
]

const octaveUp = () => {
	const octave = $.learn().octave + 1
	if(octave > 6) { return }
	$.teach({ octave })
}

const octaveDown = () => {
	const octave = $.learn().octave - 1
	if(octave < 0) { return }
	$.teach({ octave })
}

const pitchUp = () => {
	const pitch = $.learn().pitch + 1
	$.teach({ pitch })
}

const pitchDown =() => {
	const pitch = $.learn().pitch - 1
	$.teach({ pitch })
}

function attack(event) {
	event.preventDefault()
	const { colors } = $.learn()
  const { note, octave, synth, hue } = event.target.dataset
  const pitch = `${note.toUpperCase()}${octave}`
  console.log(pitch)
  synths[synth].stop();
  synths[synth].play({ pitch, label: pitch });
	event.target.classList.add('active')

  const lastColor = new Color(
    colors[parseInt(hue)][parseInt(octave)].value
  ).toString({format: "hex"})
  document.querySelector('html').style.setProperty(
		"--theme",
		`${lastColor}`
	)
}

function release (event) {
	event.preventDefault()
  const { synth } = event.target.dataset
  synths[synth].stop();
	event.target.classList.remove('active')
}

const chords = [
  [],

  [0, 4, 1], // c major: c - e - g
  [0, 9, 1], // c minor: c - eb - g

  [1, 5, 2], // g major: g - b - d
  [1, 10, 2], // g minor: g - bb - d

  [2, 6, 3], // d major: d - f# - a
  [2, 11, 3], // d minor: d - f - a

  [4, 8, 5], // e major: e - g# - b
  [4, 2, 5], // e minor: e - g - b

  [3, 7, 4], // a major: a - c# - e
  [3, 0, 4], // a minor: a - c - e

  [11, 3, 0], // f major: f - a - c
  [11, 8, 0], // f minor: f - ab - c
  
  [],// octave picker
  [] // pitch picker
]

let activeSynths = []
const fretMap = [0, 1, 3, 2, 4]

const registers = [
  "     ",

  "x    ",
  "x   x",

  " x   ",
  " x  x",

  "  x  ",
  "  x x",

  "   x ",
  "   xx",

  "xx   ",
  "xx  x",

  " xx  ",
  " xx x",
  "x x x",
  "xxxxx"
]

function toPattern(_$, buttons) {
  const pressed = value => value === 1 ? "x" : " "
  const frets = buttons.map(pressed).slice(0, 5)
  return fretMap.map(i => frets[i]).join('')
}

function toMotion(_$, buttons) {
  const [up] = [...buttons].splice(12)
  const [down] = [...buttons].splice(13)

  return {
    up: up === 1,
    down: down === 1,
    //left: horizontal === -1,
    //right: horizontal === 1
  }
}

requestAnimationFrame(loop)
function loop(time) {
  const gamepads = party()

  const activity = gamepads.reduce((activity, { osc, gamepad }) => {
    const { button, axis } = Object.keys(osc).reduce((pad, path) => {
      const [_, type, index] = path.split('/')
      pad[type][index] = osc[path].value
      return pad
    }, { button: [], axis: [] })
    const pattern =  toPattern($, button)
    activity.patterns.push(pattern)
    activity.registers.push(registers.indexOf(pattern))
    activity.motions.push(toMotion($, button))
    return activity
  }, {
    patterns: [],
    registers: [],
    motions: []
  })

  activity.registers.map((register, i) => {
    const { up, down } = activity.motions[i]
    if(activity.patterns[i] === 'x x x') {
      [[up, octaveUp], [down, octaveDown]].map(([flag, feature]) => {
        flag && throttle($, { key: 'octave-shift', time, feature })
      })
    }
    if(activity.patterns[i] === 'xxxxx') {
      [[up, pitchUp], [down, pitchDown]].map(([flag, feature]) => {
        flag && throttle($, { key: 'pitch-shift', time, feature })
      })
    }
    if(!chords[register]) return

    const feature = () => {
      // if up/down start attack of chords
      if(up || down && register > 0) {
        activeSynths = chords[register]
        activeSynths.map((x, i) => {
          const index = down ? x : activeSynths[activeSynths.length - 1 - i]
          const synth = document.querySelector(`[data-synth='${index}']`)
          synth && queueAttack(synth, i)
        })
      }
    }

    feature()
  })

  requestAnimationFrame(loop)
}

function throttle($, flags) {
  const { frames = {}} = $.learn()
  const frame = frames[flags.key] || {}

  if((flags.time - flags.fps) > (frame.time || 0)) {
    flags.activate()
    $.teach({ time: flags.time }, (state, payload) => {
      return {
        ...state,
        frames: {
          ...frames,
          [flags.key]: {
            time: payload.time
          }
        }
      }
    })
  }
}

function queueRelease(synth) {
  setTimeout(() => {
    synth.dispatchEvent(new Event('touchend'))
  }, sustainedDuration)
}

function queueAttack(synth, i) {
  setTimeout(() => {
    synth.dispatchEvent(new Event('touchstart'))
    queueRelease(synth)
  }, i * strumVelocity)
}

$.teach({ colors: recalculate() })
$.draw(() => {
  const { start, length, reverse, colors, octave, pitch, debug } = $.learn()
  const wheel = majorScale.map((majorNote, index) => {
		const majorScaleIndex = mod((index - pitch * 7), majorScale.length)
    const minorNote = minorScale[
			mod(majorScaleIndex + pitch * 7, minorScale.length)
		]
    const minorScaleIndex = mod(majorScaleIndex + 3, minorScale.length)

    const majorColorIndex = mod(
			mod(majorScaleIndex * 7, colors.length) + pitch,
			colors.length
		)
    const minorColorIndex = mod(
			mod(minorScaleIndex * 7, colors.length) + pitch,
			colors.length
		)

    const majorColorScales = colors[majorColorIndex].map(x => x.name)
    const minorColorScales = colors[minorColorIndex].map(x => x.name)

    const majorStepClass = majorNote.length === 2 ? 'step half' : 'step'
    const minorStepClass = minorNote.length === 2 ? 'step half' : 'step'

		const majorSynth = majorScaleIndex
		const minorSynth = minorScaleIndex + majorScale.length

    return `
      <div class="group" style="
				transform: rotate(${majorScaleIndex * 30}deg)
				
			">
        <button
          class="${majorStepClass}"
					data-synth="${majorSynth}"
          data-octave="${octave}"
          data-note="${majorNote}"
					data-hue="${majorColorIndex}"
          style="${printColorScale(majorColorScales)}"
        >
					<div class="label">
						<label>${majorNote}</label>
					</div>
        </button>
        <button
          class="${minorStepClass}"
					data-synth="${minorSynth}"
          data-octave="${octave}"
          data-note="${minorNote}"
					data-hue="${minorColorIndex}"
          style="${printColorScale(minorColorScales)}"
        >
					<div class="label">
						<label>${minorNote}</label>
					</div>
        </button>
      </div>
    `
  }).join('')

  return `
    <div class="wheel">
      ${wheel}
			${controls()}
    </div>
    <form>
      ${start} ${length} ${reverse}
      <input min="0" max="360" value="${start}" name="start" type="range" />
      <input min="0" max="360" value="${length}" name="length" type="range" />
      <input name="reverse" type="checkbox" />
      <label for="reverse">Reverse</label>
    </form>
    <style>
      sillyz-ocarina form {
        display: ${debug ? 'block' : 'none'}
      }
    </style>
  `
})

function controls() {
	const { pitch, colors, octave } = $.learn()
	const hue = colors[mod(pitch, colors.length)]
	const upHue = colors[mod(pitch + 1, colors.length)]
	const downHue = colors[mod(pitch - 1, colors.length)]
	const variables = `
		--wheel-up: var(${hue[Math.min(octave + 1, 6)].name});
		--wheel-right: var(${upHue[octave].name});
		--wheel-down: var(${hue[Math.max(octave - 1, 0)].name});
		--wheel-left: var(${downHue[octave].name});
	`
	return `
		<div class="controls" style="transform: rotate(45deg); ${variables}">
			<button class="octave-up"></button>
			<button class="pitch-up"></button>
			<button class="pitch-down"></button>
			<button class="octave-down"></button>
		</div>
	`
}

$.when('click', '.octave-up', octaveUp)
$.when('click', '.octave-down', octaveDown)
$.when('click', '.pitch-up', pitchUp)
$.when('click', '.pitch-down', pitchDown)

$.style(`
  & {
    height: 100%;
    display: grid;
    place-items: center;
    position: relative;
    transform: scale(.9);
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 45vmin;
    grid-template-columns: 40vmin;
    place-content: center;
    padding: 0 1rem;
    height: 100%;
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: none;
    transform: translateY(-25%) scale(.75);
  }
  & .group {
    grid-area: slot;
    transform-origin: bottom;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    clip-path: polygon(20% 0%, 50% 100%, 80% 0%);
    gap: 1px;
  }
  & .step {
    border: none;
    width: 100%;
    height: auto;
    display: grid;
    place-items: start;
    color: black;
		position: relative;
		background: linear-gradient(
			white 2em,
			var(--color-step-4) 2em,
			var(--color-step-3),
			var(--color-step-2)
		);
  }

  & .step.half {
    color: white;
		background: linear-gradient(
			black 2em,
			var(--color-step-4) 2em,
			var(--color-step-3),
			var(--color-step-2)
		)
  }

	& .step::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			rgba(0, 0, 0, .25),
			transparent,
			rgba(255, 255, 255, .75),
			transparent,
			transparent,
			transparent
		);
		background-size: 300% 300%;
		background-position-y: 100%;
		animation: &-decay 100ms ease-out forwards;
	}

	& .step.active::before {
		animation: &-attack 100ms ease-out forwards;
	}

	@keyframes &-attack {
		0% {
			background-position-y: 50%;
		}
		100% {
			background-position-y: 0%;
		}
	}

	@keyframes &-decay {
		0% {
			background-position-y: 50%;
		}
		100% {
			background-position-y: 100%;
		}
	}


  & .label {
    display: grid;
    padding: .5em;
    width: 100%;
    pointer-events: none;
  }

  &[mystery="true"] .label {
    display: none;
  }


  & .label:first-child label {
    place-self: end center;
  }

  & .label:last-child label {
    place-self: start center;
  }

	& .controls {
		display: grid;
		grid-area: slot;
		grid-template-columns: 1fr 1fr;
		width: 32vmin;
		height: 32vmin;
		clip-path: circle(50%);
		place-self: end center;
		margin-bottom: -16vmin;
	}

	& .controls button {
		width: 100%;
		height: 100%;
    border: none;
	}

	& .octave-up {
		background: var(--wheel-up);
	}

	& .octave-down {
		background: var(--wheel-down);
	}

	& .pitch-up {
		background: var(--wheel-right);
	}

	& .pitch-down {
		background: var(--wheel-left);
	}

  ${invertedLabels()}

  &.clean .step {
		background: linear-gradient(
			var(--color-step-4) 2em,
			var(--color-step-3),
			var(--color-step-2)
		);
  }

  &.clean .step.half {
		background: linear-gradient(
			var(--color-step-4) 2em,
			var(--color-step-3),
			var(--color-step-2)
		)
  }
  &.clean .label {
    display: none;
  }
`)

function invertedLabels() {
  const rulesets = []
  for(let i = 1; i < 360; i++) {
    rulesets.push(`
      & [style*="rotate(${i}deg)"] label {
        transform: rotate(${-1 * i}deg);
      }
    `)
  }
  return rulesets.join('')
}

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

function printColorScale(scale) {
	return scale.map((name, i) => `--color-step-${i}: var(${name})`).join(';')
}

function recalculate() {
  const { start, length, reverse } = $.learn()

  const colors = [...Array(12)].map((_, hueIndex) => {
    const step = ((length / 12) * hueIndex)
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

  return colors
}

document.body.addEventListener('mousedown', (event) => {
	if(event.target !== document.body) return
  $.teach({ start: $.learn().start + 30, colors: recalculate() })
});


$.when('change', '[type="range"]', (event) => {
  const { value, name } = event.target

  $.teach({ [name]: parseInt(value), colors: recalculate() })
})

$.when('change', '[type="checkbox"]', (event) => {
  const { checked, name } = event.target

  $.teach({ [name]: checked, colors: recalculate() })
})

$.when('mouseenter', '.step', attack)
$.when('mouseleave', '.step', release)

$.when('mousedown', '.step', attack)
$.when('mouseup', '.step', release)

$.when('touchstart', '.step', attack)
$.when('touchend', '.step', release)

function mod(x, n) {
  return ((x % n) + n) % n;
}

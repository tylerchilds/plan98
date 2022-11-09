import module from '../module.js'
import Color from "colorjs.io"
import $guitar from "./guitar.js"

const context = new AudioContext();

async function loadSample(url) {
  const sample = await fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => context.decodeAudioData(buffer));
  return sample
}

function playSample(sample, sampleNote, noteToPlay) {
  const source = context.createBufferSource();
  source.buffer = sample;
  source.playbackRate.value = 2 ** ((noteToPlay - sampleNote) / 12);
  source.connect(context.destination);
  source.start(0);
}

let synths = []
Promise.all([
  loadSample('/samples/1.mp3'),
  loadSample('/samples/2.mp3'),
  loadSample('/samples/3.mp3'),
  loadSample('/samples/4.mp3'),
  loadSample('/samples/5.mp3'),
  loadSample('/samples/6.mp3'),
  loadSample('/samples/7.mp3'),
  loadSample('/samples/8.mp3'),
]).then(s => synths = s)

const $ = module('synth-module', {
  colors: [],
  start: 120,
  length: 360,
  octave: 4,
  reverse: false,
	pitch: 0,
	synth: 0
})

const strumVelocity = 75
const sustainedDuration = 100
const actionableFPS = 4 

const majorScale = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
]

const minorScale = [
  'a', 'e', 'b', 'f#', 'c#', 'g#', 'd#', 'bb', 'f', 'c', 'g', 'd'
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
	const octave = $.read().octave + 1
	if(octave > 6) { return }
	$.write({ octave })
}

const octaveDown = () => {
	const octave = $.read().octave - 1
	if(octave < 0) { return }
	$.write({ octave })
}

const pitchUp = () => {
	const pitch = $.read().pitch + 1
	$.write({ pitch })
}

const pitchDown =() => {
	const pitch = $.read().pitch - 1
	$.write({ pitch })
}

const synthUp = () => {
	const synth = $.read().synth + 1
	$.write({ synth })
}

const synthDown =() => {
	const synth = $.read().synth - 1
	$.write({ synth })
}
function attack(event) {
	event.preventDefault()
	const { colors, synth } = $.read()
  const { octave, index, hue } = event.target.dataset

  playSample(synths[synth], 60, parseInt(octave) * 12 + parseInt(index));
  //synths[synth].triggerAttack(`${note}${octave}`, "2n");
	event.target.classList.add('active')

  document.querySelector('html').style.setProperty(
		"--theme",
		`var(${colors[parseInt(hue)][parseInt(octave)].name})`
	)
}

function release (event) {
	event.preventDefault()
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

  [3, 9, 4], // a major: a - c# - e
  [3, 0, 4], // a minor: a - c - e

  [11, 3, 0], // f major: f - a - c
  [11, 8, 0], // f minor: f - ab - c
  
  [],// octave picker
  [] // pitch picker
]

let activeSynths = []
let activeRegister = 0

requestAnimationFrame(loop)
function loop(time) {
  const { activeRegisters, activeFrets, activeMotions } = $guitar.read()
  activeRegisters.map((register, i) => {
    const { up, down } = activeMotions[i]
    if(activeFrets[i] === 'x x x') {
      [[up, octaveUp], [down, octaveDown]].map(([flag, feature]) => {
        flag && throttle({ key: 'octave-shift', time, feature })
      })
    }
    if(activeFrets[i] === 'xxxxx') {
      [[up, pitchUp], [down, pitchDown]].map(([flag, feature]) => {
        flag && throttle({ key: 'pitch-shift', time, feature })
      })
    }
    if(!chords[register]) return

    const feature = () => {
      // if up/down start attack of chords
      if(up || down && register > 0) {
        activeSynths = chords[register]
        activeSynths.map((x, i) => {
          const index = down ? x : activeSynths[activeSynths.length - 1 - i]
          const node = document.querySelector(`[data-index='${index}']`)
          node && queueAttack(node, i)
        })
      }
    }

    feature()
  })

  requestAnimationFrame(loop)
}

function throttle({ key, time, feature }) {
  const { frames = {}} = $.read()
  const frame = frames[key] || {}

  if((time - 1000 / actionableFPS) > (frame.time || 0)) {
    feature()
    $.write({ time }, (state, payload) => {
      return {
        ...state,
        frames: {
          ...frames,
          [key]: {
            time: payload.time
          }
        }
      }
    })
  }
}

function queueRelease(node) {
  setTimeout(() => {
    node.dispatchEvent(new Event('touchend'))
  }, sustainedDuration)
}

function queueAttack(node, i) {
  setTimeout(() => {
    node.dispatchEvent(new Event('touchstart'))
    queueRelease(node)
  }, i * strumVelocity)
}

$.write({ colors: recalculate() })
$.render(() => {
  const { start, length, reverse, colors, octave, pitch, debug } = $.read()
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
					data-index="${majorSynth}"
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
					data-index="${minorSynth}"
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
  `
})

function controls() {
	const { pitch, colors, octave } = $.read()
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

$.on('click', '.octave-up', octaveUp)
$.on('click', '.octave-down', octaveDown)
$.on('click', '.pitch-up', pitchUp)
$.on('click', '.pitch-down', pitchDown)

$.style(`
  & {
    height: 100%;
    display: grid;
    place-content: center;
  }
  & .wheel {
    display: grid;
    grid-template-areas: "slot";
    grid-template-rows: 45vmin;
    grid-template-columns: 40vmin;
    place-content: start center;
    padding: 0 1rem;
    height: 90vmin;
		user-select: none; /* supported by Chrome and Opera */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
    touch-action: manipulation;
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

function upload(colors) {
  const palette = colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')

  fetch('/design-system', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ palette })
  })
}

function printColorScale(scale) {
	return scale.map((name, i) => `--color-step-${i}: var(${name})`).join(';')
}

function recalculate() {
  const { start, length, reverse } = $.read()

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

  upload(colors)

  return colors
}

$.on('mousedown', '.step', attack)
$.on('mouseup', '.step', release)

$.on('touchstart', '.step', attack)
$.on('touchend', '.step', release)

function mod(x, n) {
  return ((x % n) + n) % n;
}

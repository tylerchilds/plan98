import module from '@silly/tag'
import Color from "https://esm.sh/colorjs.io@0.4.5"
import $guitar from "./sillyz-guitar.js"

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

const $ = module('sillyz-synth', {
  colors: [],
  start: 120,
  length: 360,
  octave: 4,
  reverse: false,
	pitch: 0,
	synth: 0
})

const strumVelocity = 15
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

const synthUp = () => {
	const synth = $.learn().synth + 1
	$.teach({ synth })
}

const synthDown =() => {
	const synth = $.learn().synth - 1
	$.teach({ synth })
}
function attack(event) {
	event.preventDefault()
	const { colors, synth } = $.learn()
  const { octave, note, hue } = event.target.dataset

  playSample(synths[synth], 60, parseInt(octave) * 12 + (12 + parseInt(note)));
  //synths[synth].triggerAttack(`${note}${octave}`, "2n");
	event.target.classList.add('active')

  const body = new Color(colors[parseInt(hue)][parseInt(octave)].value).to('srgb')
  /*
  fetch('/last-color', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  */

  document.querySelector('html').style.setProperty("background", body)
}

function release (event) {
	event.preventDefault()
	event.target.classList.remove('active')
}

const chords = [
  [],
  // C Major Blues Scale: C, D, D#, E, G, A
  [0, 7, 8, 9, 1, 3],

  // G Major Blues Scale: G, A, A#, B, D, E
  [1, 8, 9, 10, 2, 4],

  // D Major Blues Scale: D, E, F, F#, A, B
  [2, 9, 10, 11, 3, 5],

  // A Major Blues Scale: A, B, C, C#, E, F#
  [3, 10, 11, 0, 4, 6],

  // E Major Blues Scale: E, F#, G, G#, B, C#
  [4, 11, 0, 1, 5, 7],

  // B Major Blues Scale: B, C#, D, D#, F#, G#
  [5, 0, 1, 2, 6, 8],

  // F# Major Blues Scale: F#, G#, A, A#, C#, D#
  [6, 1, 2, 3, 7, 9],

  // Db Major Blues Scale: Db, E, F, Gb, Ab, Bb
  [7, 2, 3, 4, 8, 10],

  // Ab Major Blues Scale: Ab, Bb, C, Db, Eb, Gb
  [8, 3, 4, 5, 9, 11],

  // Eb Major Blues Scale: Eb, F, Gb, G, Bb, C
  [9, 4, 5, 6, 10, 0],

  // Bb Major Blues Scale: Bb, C, Db, D, F, G
  [10, 5, 6, 7, 11, 1],

  // F Major Blues Scale: F, G, Ab, A, C, D
  [11, 6, 7, 8, 0, 2],

  [],// octave picker
  [] // pitch picker
];

let activeSynths = []
let activeRegister = 0

requestAnimationFrame(loop)
function loop(time) {
  const { activeRegisters, activeFrets, activeMotions } = $guitar.learn()
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
  const { frames = {}} = $.learn()
  const frame = frames[key] || {}

  if((time - 1000 / actionableFPS) > (frame.time || 0)) {
    feature()
    $.teach({ time }, (state, payload) => {
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

    const majorColorScales = colors[majorColorIndex].map(x => x.value)
    const minorColorScales = colors[minorColorIndex].map(x => x.value)

    const majorStepClass = majorNote.length === 2 ? 'step half' : 'step'
    const minorStepClass = minorNote.length === 2 ? 'step half' : 'step'

		const majorSynth = majorScaleIndex
		const minorSynth = minorScaleIndex + majorScale.length

    const note = mod((index * 7), majorScale.length)

    return `
      <div class="group" style="
				transform: rotate(${majorScaleIndex * 30}deg)
				
			">
        <button
          class="${majorStepClass}"
					data-index="${majorSynth}"
          data-octave="${octave}"
          data-note="${note}"
					data-hue="${majorColorIndex}"
          style="${gradient(majorColorScales, [4,3,2])}"
        >
        </button>
        <button
          class="${minorStepClass}"
					data-index="${minorSynth}"
          data-octave="${octave}"
          data-note="${minorScaleIndex}"
					data-hue="${minorColorIndex}"
          style="${gradient(minorColorScales, [4,3,2])}"
        >
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
	return `
		<div class="controls" style="display: none;">
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
    max-height: 100vh;
    height: 100%;
    display: grid;
    place-items: start center;
    grid-template-rows: 100vmin;
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
  }

  & .step.half {
    color: white;
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

  ${invertedLabels()}
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

  /*
  fetch('/design-system', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ palette })
  })
  */
}

function gradient(scale, stops) {
	return `
    background: linear-gradient(${stops.map(x => scale[x]).join(', ')})
  `
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
        .toString({format: 'hex'})

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

$.when('mousedown', '.step', attack)
$.when('mouseup', '.step', release)

$.when('touchstart', '.step', attack)
$.when('touchend', '.step', release)

function mod(x, n) {
  return ((x % n) + n) % n;
}

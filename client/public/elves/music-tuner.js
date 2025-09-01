import {
  PitchDetector
} from "pitchy";

import app from '@plan68/app'

// courtesy of view-source:https://bloop.monster/tuner

console.log('v0.0.1')
console.log(`window.innerHeight = ${window.innerHeight}`)
console.log(`body.offsetHeight = ${document.body.offsetHeight}`)

const instruments = {
  ukelele: 'ukelele',
  guitar: 'guitar'
}

const frequencies = {
  [instruments.ukelele]: [261.63, 329.63, 392.00, 440.00],
  [instruments.guitar]: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]
}

const options = [
  {
    value: instruments.ukelele,
    label: 'Ukelele'
  },
  {
    value: instruments.guitar,
    label: 'Guitar'
  },
]

const $ = app('music-tuner', {
  started: false,
  transpose: false,
  value: instruments.ukelele,
  options
})

function main(target) {
  const { transpose, value } = $.learn()
  const canvas = target.querySelector('#first');
  const ctx = canvas.getContext('2d');

  const focusedCanvas = target.querySelector('#second');
  const focusedCtx = focusedCanvas.getContext('2d');

  window.onresize = () => {
    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w / 4;
    canvas.height = h / 4;
    focusedCanvas.width = w / 4;
    focusedCanvas.height = h / 4;
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px';
    focusedCanvas.style.width = w + 'px';
    focusedCanvas.style.height = h + 'px';
  };
  window.onresize();

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);

  const detector = PitchDetector.forFloat32Array(bufferLength);

  function startApp() {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContext.resume(); // resume AudioContext
      detectPitch();
    }).catch((err) => {
      console.error('Error: ' + err.message);
    });
  }

  const detectPitch = () => {
    analyser.getFloatTimeDomainData(dataArray);
    const [pitch, clarity] = detector.findPitch(dataArray, audioContext.sampleRate);

    drawPitch(pitch, ctx, canvas, false, clarity, transpose);
    drawPitch(pitch, focusedCtx, focusedCanvas, true, clarity, transpose);
    requestAnimationFrame(detectPitch);
  };

  function drawPitch(pitch, ctx, canvas, focused, clarity, transpose) {
    // Scroll up by copying the previous image data one row up or one column left
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (transpose) {
      ctx.putImageData(imageData, -1, 0);
    } else {
      ctx.putImageData(imageData, 0, -1);
    }

    // Clear the right-most column when transposed or bottom row when not transposed
    ctx.fillStyle = 'black';
    if (transpose) {
      ctx.fillRect(canvas.width - 1, 0, 1, canvas.height);
    } else {
      ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
    }

    // draw guitar strings
    const strings = frequencies[value]
    const minPitch = strings[0] - 30; //set min pitch 30 below the lowest string
    const maxPitch = strings[strings.length-1] + 30; //set max pitch 30 above the highest string

    const drawRectangle = (pitch, startPitch, endPitch, transpose, canvasHeight, fillColor) => {
      let position = ((pitch - startPitch) / (endPitch - startPitch)) * (transpose ? canvas.height : canvas.width);
      ctx.fillStyle = fillColor;

      if (transpose) {
        position = canvasHeight - position; // Invert the position vertically
        ctx.fillRect(canvas.width - 1, Math.floor(position), 1, 1);
      } else {
        ctx.fillRect(Math.floor(position), canvasHeight - 1, 1, 1);
      }
    };

    const drawStringsAndPitch = (startPitch, endPitch, clarity) => {
      strings.forEach((stringFreq) => {
        drawRectangle(stringFreq, startPitch, endPitch, transpose, canvas.height, 'rgba(255,255,255,.65');
      });

      drawRectangle(pitch, startPitch, endPitch, transpose, canvas.height, `rgba(0, 255, 0, ${clarity})`);
    };

    if (focused) {
      const closestString = strings.reduce((prev, curr) => Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev);
      const range = 10;
      const adjustedMinPitch = closestString - range;
      const adjustedMaxPitch = closestString + range;
      drawStringsAndPitch(adjustedMinPitch, adjustedMaxPitch, clarity);
    } else {
      drawStringsAndPitch(minPitch, maxPitch, clarity);
    }
  }

  startApp();
}


$.draw(() => {
  const stars = getStars(true)
  const { started, options, value } = $.learn()
  if(!started) {
    return `
      <div id="start-button">
        <h1>Tuner</h1>
        <select data-instrument class="standard-input -small">
          ${options.map(option => {
            return `
              <option value="${option.value}" ${option.value === value?'selected':''}>${option.label}</option>
            `
          }).join('')}
        </select>

        <button data-tune class="standard-button bias-positive">
          Tune
        </button>
      </div>
    `
  }
  return `
    <div id="main-container" style="background-image: ${stars}">
      <canvas id="first"></canvas>
      <canvas id="second"></canvas>
    </div>
  `
}, {
  afterUpdate(target) {
  }
})

$.when('change', '[data-instrument]', (event) => {
  $.teach({ value: event.target.value })
})

$.when('click', '[data-tune]', (event) => {
  const root = event.target.closest($.link)
  $.teach({ started: true })
  main(root)
});

/*
$.when('click', 'canvas', (event) => {
  const root = event.target.closest($.link)
  const { transpose } = $.learn()
  $.teach({ transpose: !transpose })
  localStorage.setItem('transpose', transpose);
  main(root)
})
*/

$.style(`
  & {
    display: block;
    height: 100%;
  }

  & #main-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: grid;
    grid-template-rows: 1.618fr 1fr;
    background: black;
  }

  & canvas {
    flex: 1;
    image-rendering: pixelated;
    width: 100% !important;
    height: 100% !important;
    opacity: .5;
  }

  & h1 {
    margin-bottom: 0;
  }

  & #start-button {
    height: 100%;
    display: grid;
    place-content: center;
    gap: 1rem;
  }
`)

function getStars() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');

  const rhythm = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // landscape tabloid? 11x17
  canvas.height = rhythm * 11;
  canvas.width = rhythm * 17;

  ctx.fillStyle = 'firebrick';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }
  ctx.fillStyle = 'darkorange';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillStyle = 'gold';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillStyle = 'lime';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillStyle = 'dodgerblue';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillStyle = 'slateblue';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillStyle = 'mediumpurple';
  for(let i = 0; i < rhythm; i++) {
    ctx.fillRect(random(canvas.width), random(canvas.height), 1, 1);
  }

  ctx.fillRect(0, rhythm - 1, 1, 1);

  return `url(${canvas.toDataURL()}`;
}

function random(max) {
  return Math.floor(Math.random() * max);
}

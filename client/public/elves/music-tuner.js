import {
  PitchDetector
} from "pitchy";

import app from '@plan68/app'

// courtesy of view-source:https://bloop.monster/tuner

console.log('v0.0.1')
console.log(`window.innerHeight = ${window.innerHeight}`)
console.log(`body.offsetHeight = ${document.body.offsetHeight}`)

const $ = app('music-tuner')

$.draw(() => {
  return `
    <div id="main-container">
        <canvas id="first"></canvas>
        <canvas id="second"></canvas>
    </div>
    <div id="start-button">
        <button>click to start</button>
    </div>
  `
}, {
  afterUpdate(target) {
    const startButton = target.querySelector('#start-button');
    let started = false;

    const canvas = target.querySelector('#first');
    const ctx = canvas.getContext('2d');

    const focusedCanvas = target.querySelector('#second');
    const focusedCtx = focusedCanvas.getContext('2d');

    window.onresize = () => {
      let w = target.offsetWidth
      let h = target.offsetHeight
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

    let transpose = localStorage.getItem("transpose") === "true";

    document.body.addEventListener('click', () => {
      if (!started) {
        started = true;
        startApp();
        startButton.style.display = 'none'; // Hide the start button
      } else {
        transpose = !transpose;
        localStorage.setItem('transpose', transpose);
      }
    });

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
      const strings = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
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
          drawRectangle(stringFreq, startPitch, endPitch, transpose, canvas.height, 'rgb(64,64,0)');
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


  }
})


$.style(`
  & {
    display: block;
    height: 100%;
  }

  & #main-container {
      width: 100%;
      height: 100svh;
      position: relative;
      display: flex;
      flex-direction: column;
  }

  & canvas {
      flex: 1;
      image-rendering: pixelated;
  }

  & #start-button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
  }

  & #start-button button {
      width: 100%;
      height: 100%;
      font-size: 24px;
      padding: 10px 20px;
      background-color: transparent;
      border: none;
      color: #fff;
      cursor: pointer;
  }

  & #start-button button:hover {
      background-color: rgba(255, 255, 255, 0.1);
  }
`)

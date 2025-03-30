import elf from '@silly/elf'
// To use Html5Qrcode (more info below)
import {Html5Qrcode} from "html5-qrcode";

const $ = elf('qr-scanner', {})

async function getVideoConstraints() {
  try {
    // Attempt to get native camera capabilities
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    // Stop the stream to free up camera resources
    track.stop();

    // Default constraints if no specific capabilities found
    const defaultConstraints = {
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };

    // If camera capabilities are available, use them
    if (capabilities.width && capabilities.height) {
      return {
        video: {
          facingMode: "environment",
          width: {
            min: capabilities.width.min || 1280,
            ideal: capabilities.width.max,
            max: capabilities.width.max
          },
          height: {
            min: capabilities.height.min || 720,
            ideal: capabilities.height.max,
            max: capabilities.height.max
          },
          aspectRatio: { ideal: capabilities.width.max / capabilities.height.max }
        },
        audio: false
      };
    }

    // Fallback to default constraints
    return defaultConstraints;
  } catch (error) {
    console.error('Error getting video constraints:', error);

    // Fallback constraints if everything else fails
    return {
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };
  }
}

function scan(target) {
  const video = target.querySelector('video')
  const canvasElement = target.querySelector('.qr-canvas')
  const canvas = canvasElement.getContext("2d");

  let lastProcessTime = 0;
  const PROCESS_INTERVAL = 250;

  function scanQR() {
    // Ensure html5-qrcode is loaded
    if (typeof Html5Qrcode === 'undefined') {
        console.error('html5-qrcode library not loaded');
        return;
    }

    // Create an instance of Html5Qrcode
    const html5QrCode = new Html5Qrcode('reader');

    // Convert canvas to a file
    canvasElement.toBlob(function(blob) {
      // Create a file from the blob
      const file = new File(
        [blob],
        'canvas-image.png',
        { type: 'image/png' }
      );

      console.log('scanning')
      // Scan the file
      html5QrCode.scanFile(file)
        .then(decodedText => {
          console.log(decodedText)
          $.teach({
            activeQr: decodedText
          })
        })
        .catch(err => {
          console.error('Error scanning QR code:', err);
        });
    }, 'image/png');
  }

  function tick() {
    const now = performance.now();

    if(now - lastProcessTime >= PROCESS_INTERVAL) {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        scanQR()
      }

      lastProcessTime = now;
    }
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

async function mountCamera(target) {
  if(target.cameraMounted) return
  target.cameraMounted = true

  const video = target.querySelector('video')
  navigator.mediaDevices.getUserMedia(await getVideoConstraints())
    .then(stream => {
      video.srcObject = stream;
      // Display video stream in a video element, etc.
      video.playsInline = true
      video.autoplay = true;
      scan(target)
    })
    .catch(error => {
      console.error('Error accessing video stream:', error);
    });
}

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <video disablepictureinpicture></video>
    <canvas class="qr-canvas"></canvas>

    <div class="qr-container">
      <button class="qr-activate" data-qr=""></button>
    </div>
    <div style="display: none" id="reader"></div>
  `
}, { beforeUpdate, afterUpdate })

function beforeUpdate(target) {
}

function afterUpdate(target) {
  {
    mountCamera(target)
  }

  {
    const { activeQr } = $.learn()

    if(activeQr !== target.activeQr) {
      target.activeQr = activeQr
      const button = target.querySelector('.qr-activate')
      const container = target.querySelector('.qr-container')

      if(activeQr) {
        button.dataset.qr = activeQr;
        button.innerText = new URL(activeQr).hostname;
        container.style.display = 'block'
      } else {
        button.dataset.qr = null;
        button.innerText = '';
        container.style.display = 'none'
      }
    }
  }
}


$.when('click', '.qr-activate', (event) => {
  const { qr } = event.target.dataset
  self.location.href = qr
})

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: grid;
    height: 100%;
    grid-template-rows: 1fr auto;
  }

  & .qr-container {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    text-align: center;
    z-index: 100;
  }

  & .qr-activate {
    border: none;
    border-radius: 1rem;
    padding: .5rem 1rem;
    background: lemonchiffon;
    color: dodgerblue;
    margin: auto;
  }

  & .qr-activate:empty {
    display: none;
  }

  & .qr-activate:hover,
  & .qr-hover:focus {
    color: saddlebrown;
  }

  & > .qr-canvas,
  & > video {
    pointer-events: none;
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & > .qr-canvas {
    z-index: 1;
  }

  & > video {
    z-index: 2;
  }
`)

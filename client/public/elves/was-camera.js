import elf from '@silly/elf'
import { updateDraft } from './time-machine.js'
import { get, put } from './plan98-wallet.js'


const tag = 'was-camera'
const $ = elf(tag)

$.when('click', '[data-snap]', async (event) => {
  try {
    const root = event.target.closest($.link)

    const video = root.querySelector('video')
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get current date and time for filename
    const now = new Date();
    const timestamp = now.toJSON()

    // Convert canvas to data URL with JPEG format
    const dataURL = canvas.toDataURL('image/jpeg');

    const byteCharacters = atob(dataURL.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const src = root.getAttribute('src') || `/private/camera-roll/${timestamp}.jpg`

    // Attempt to upload to server
    put(src, byteArray, { type: 'image/jpeg' }).then(res => {
      if(res.ok) {
        updateDraft({ src })
      } else {
        throw new Error('Upload failed')
      }
    }).catch(error => {
      console.warn('Server upload failed, falling back to download', error);

      // Fallback: create a download link
      const link = document.createElement('a');
      link.download = `${timestamp}.jpg`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } catch (err) {
    console.error('Error accessing microphone:', err);
    alert('Could not access microphone. Please ensure you have a microphone and have granted permission.');
  }
});

$.style(`
  & {
    position: relative;
    touch-action: none;
    overflow: hidden;
    display: block;
    height: 100%;
  }

  & .viewport {
    position: absolute;
    inset: 0;
  }

  & video {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & .taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.5);
    z-index: 5;
    padding: .5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
  }
`)

class WasCamera extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $.draw(() => null, { afterUpdate: this.afterUpdate })
    this.init(this)
  }

  disconnectedCallback() {
    const video = this.querySelector('video')
    if(video) {
      video.pause();

      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }

      if (video.src && video.src.startsWith('blob:')) {
        URL.revokeObjectURL(video.src);
        video.src = '';
      }

      video.removeAttribute('src');
    }

    this.innerHTML = null

    if(this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null
    }
  }

  async init(target) {
    const sampleRate = 48000;
    target.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate
      },
      video: {
        facingMode: "environment",
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
        aspectRatio: { ideal: 16/9 }
      },
    });

    if(!target.innerHTML) {
      target.innerHTML = `
        <div class="taskbar">
          <div class="left">
          </div>
          <div class="center">
            <button data-snap class="standard-button">Snap</button>
          </div>
          <div class="right">
          </div>
        </div>

        <div class="viewport">
          <video playsinline></video>
          <div class="partial"></div>
          <div class="result"></div>
          <div class="translate"></div>
        </div>
      `
      this.afterUpdate(target)
    }


    target.video = target.querySelector('video')
    target.video.muted = true
    target.video.srcObject = target.mediaStream;
    // Display video stream in a video element, etc.
    target.video.playsInline = true
    target.video.autoplay = true;
  }

  afterUpdate(target) {
    if(!target.innerHTML) return
  }
}

customElements.define(tag, WasCamera);

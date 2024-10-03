import module from '@silly/tag';

const tag = 'video-feed'

const $ = module(tag)

class VideoFeed extends HTMLElement {
  constructor() {
    super();
    // Initialize your component here
    $.draw(() => `<video></video>`)
    const video = this.querySelector('video')
    video.srcObject = null
  }

  connectedCallback() {
    const video = this.querySelector('video')
    // Create and start video stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        video.srcObject = stream;
        // Display video stream in a video element, etc.
        video.playsInline = true
        video.autoplay = true;
      })
      .catch(error => {
        console.error('Error accessing video stream:', error);
      });
  }

  disconnectedCallback() {
    const video = this.querySelector('video')
    // Cleanup resources when component is removed from DOM
    if (video.srcObject) {
      video.pause();
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
}

customElements.define(tag, VideoFeed);

$.style(`
  & {
    display: block;
    height: 100%;
    background: black;
  }

  & video {
    max-height: 100% !important;
    width: 100%;
    height: 100%;
  }
`)

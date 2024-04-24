import module from '@sillonious/module';

const $ = module('video-feed');

$.draw((target) => {
  if (target.init) return;
  target.init = true;

  init(target)
});

async function init(target) {
  // Create a video element
  const videoElement = target.querySelector('video');

  const constraints = {
    audio: true,
    video: true
  };

  try {
    // Get user media from the webcam
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Set the stream as the source for the video element
    videoElement.srcObject = stream;
    videoElement.playsInline = true

    // Ensure autoplay
    videoElement.autoplay = true;
  } catch (err) {
    console.error('Error accessing the webcam:', err);
  }

}

$.style(`
  & {
    display: block;
    height: 100%;
  }

  & video {
    max-height: 100% !important;
    width: 100%;
    height: 100%;
  }
`)

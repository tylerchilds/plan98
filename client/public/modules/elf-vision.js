import tag from '@silly/tag'
import ml5 from 'ml5'

// Initialize the Image Classifier method with MobileNet

// When the model is loaded
function modelReady(target) {
  $.teach({ active: true })
}

function loop(target) {
  return () => {
    const { active } = $.learn()
    target.classifier.classify((err, results) => {
      $.teach({ results });
    });

    if(active) {
      requestAnimationFrame(loop(target))
    }
  }
}

const elf = 'elf-vision'

// Make a prediction with a selected image
const $ = tag(elf, { results: [] })

class VideoFeed extends HTMLElement {
  constructor() {
    super();
    // Initialize your component here
    $.draw((target) => {
      if(!target.initialized) {
        target.initialized = true
        target.insertAdjacentHTML('beforeend', `<video></video>`)
        const video = target.querySelector('video')
        video.srcObject = null

        schedule(async () => {
          const featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
          // Create a new classifier using those features and give the video we want to use
          const options = { numLabels: 6 }; //Specify the number of classes/labels
          target.classifier = await featureExtractor.classification(video, options);
        })
      }

      const { results } = $.learn()

      if(!target.querySelector('ol')) {
        target.insertAdjacentHTML('afterbegin', `
          <button class="classify">
            Classify
          </button>
          <button class="save">
            Save
          </button>
          <button class="load">
            Load
          </button>
          <ol>
            <li></li>
            <li></li>
            <li></li>
          </ol>
        `)
      }

      const list = this.querySelector('ol')
      results.map((classification, index) => {
        list.children[index].innerText = classification.label
      })
    })

  }

  connectedCallback() {
    const video = this.querySelector('video')
    // Create and start video stream
    navigator.mediaDevices.getUserMedia({ video: {
    facingMode: 'environment'
  }, audio: false })
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
    $.teach({ active: false })
  }
}

$.when('click', '.classify', (event) => {
  classify(event.target.closest($.link))
})

$.when('click', '.save', (event) => {
  save(event.target.closest($.link))
})

$.when('click', '.load', (event) => {
  load(event.target.files, event.target.closest($.link))
})


function classify(target) {
  target.classifier.classify(gotResults.bind(target));
}

function save(target) {
  target.classifier.save();
}
function load(files, target) {
  target.classifier.load();
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  $.teach({ result });

  classify(this);
}

customElements.define(elf, VideoFeed);

$.style(`
  & {
    display: block;
    height: 100%;
  }

  & video {
    max-height: 100% !important;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`)

function schedule(x, delay=1) { setTimeout(x, delay) }

import tag from '@silly/tag'
import { innerHTML } from 'diffhtml'
import { showModal } from './plan98-modal.js'
import ml5 from 'ml5'

const images = [];
const labels = [];

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

const selector = 'pocket-dexterity'

// Make a prediction with a selected image
const $ = tag(selector, { lossValue: null, results: [], labels: [], counts: {} })

class VideoFeed extends HTMLElement {
  constructor() {
    super();
    // Initialize your component here
    $.draw((target) => {
      const { results, labels, counts, lossValue, trained } = $.learn()

      if(!target.initialized) {
        target.initialized = true
        target.insertAdjacentHTML('beforeend', `<video></video>`)
        const video = target.querySelector('video')
        video.srcObject = null

        schedule(async () => {
          const options = { numLabels: 6 }; //Specify the number of classes/labels
          target.classifier = await ml5.imageClassifier('/cdn/sillyz.computer/pokedex/v2/model.json', video, options);
          classify(target)
        })
      }

      if(!target.querySelector('.hyper-visor')) {
        target.insertAdjacentHTML('afterbegin', `
          <div class="hyper-visor">
            <button></button>
          </div>
        `)
      }

      const visor = this.querySelector('.hyper-visor button')

      if(results && results[0] && results[0].confidence > .75) {
        visor.dataset.id = results[0].label
        visor.innerHTML = results[0].label
      } else {
        visor.innerHTML = null
      }
      /*results.map((classification, index) => {
        list.children[index].innerText = classification.label
      })*/
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

$.when('click', '.add', (event) => {
  const input = event.target.closest($.link).querySelector('[name="label"]')
  $.teach(input.value, addLabel)
  input.value = ''
})

function addLabel(state, payload) {
  const labels = [...new Set([...state.labels, payload])]
  return {
    ...state,
    labels
  }
}


$.when('click', '.train', (event) => {
  train(event.target.closest($.link))
})

$.when('click', '.save', (event) => {
  save(event.target.closest($.link))
})

$.when('change', '.load', (event) => {
  load(event.target.files, event.target.closest($.link))
})

$.when('change', '[name="samples"]', (event) => {
  const { label } = event.target.dataset
  const files = event.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        images.push(img);
        labels.push(label); // Define this function to extract label from filename
      };
    };
    reader.readAsDataURL(file);
  }
  $.teach(files.length, updateCount(label))
})

function updateCount(label) {
  return (state, payload) => ({
    ...state,
    counts: {
      ...state.counts,
      [label]: payload
    }
  })
}

function classify(target) {
  target.classifier.classify(gotResults.bind(target));
}

async function train(target) {
  let count = 0
  images.forEach(async (img, index) => {
    await target.classifier.addImage(img, labels[index], addedImage);
    count++
  });

  await new Promise(res => setTimeout(() => images.length === count ? res() : null), 10)
  target.classifier.train(function(lossValue) {
    if (lossValue) {
      $.teach({ lossValue });
    } else {
      $.teach({ trained: true });
      classify(target)
      save(target)
    }
  });
}

function addedImage(a, b, c, d) {
}

function save(target) {
  target.classifier.save();
}
async function load(files, target) {
  await target.classifier.load(files);
  classify(target)
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }

  $.teach({ results });

  classify(this);
}

customElements.define(selector, VideoFeed);

$.style(`
  & {
    display: block;
    height: 100%;
    position: relative;
  }

  & video {
    max-height: 100% !important;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & .hyper-visor {
    position: absolute;
    margin: auto;
    bottom: 1rem;
    left: 0;
    right: 0;
    text-align: center;
  }
  & .hyper-visor button {
    border: none;
    background: rgba(255,255,255,.85);
    color: dodgerblue;
    font-size: 1.5rem;
    padding: 1rem;
    border-radius: 1rem;
  }
  & .hyper-visor button:empty {
    display: none;
  }
`)

function schedule(x, delay=1) { setTimeout(x, delay) }

$.when('click', '.hyper-visor button', (event) => {
  const { id } = event.target.dataset
  showModal(`
    <sillyz-computer id="${id}"></sillyz-computer>
  `)
})


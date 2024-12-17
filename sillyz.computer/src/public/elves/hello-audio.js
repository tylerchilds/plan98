import module from '@silly/tag'
import Wad from 'web-audio-daw';

const $ = module('hello-audio')

$.draw(() => {
  return `
    <button data-sample="/public/samples/1.mp3">
      Sample 1
    </button>
    <button data-sample="/public/samples/2.mp3">
      Sample 2
    </button>
    <button data-sample="/public/samples/4.mp3">
      Sample 4
    </button>
    <button data-sample="/public/samples/8.mp3">
      Sample 8
    </button>
    <button data-tuna>
      Tuna
    </button>
  `
})

$.when('click', '[data-sample]', (event) => {
  const { sample } = event.target.dataset

  const bell = new Wad({source : sample});
  bell.play();
  bell.stop();
})

$.when('click', '[data-tuna]', () => {
  let itBeTuna = new Wad({
    source : 'sine',
    tuna   : {
        Overdrive : {
            outputGain: 0.5,         //0 to 1+
            drive: 0.7,              //0 to 1
            curveAmount: 1,          //0 to 1
            algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
            bypass: 0
        },
        Chorus : {
            intensity: 0.3,  //0 to 1
            rate: 4,         //0.001 to 8
            stereoPhase: 0,  //0 to 180
            bypass: 0
        }
    }
  })
  itBeTuna.play()
})

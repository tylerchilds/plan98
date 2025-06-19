import elf from '@silly/elf'
import { get } from './was-wallet.js'

const $ = elf('was-audio')

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <audio></audio>
    <button data-play>Play Generated Audio</button>
  `
}, {
  beforeUpdate(target) {
    {
      if(!target.initialized) {
        target.initialized = true
        const src = target.getAttribute('src')
        if(src) {
          get(src).then(blob => {
            target.blob = new Blob([blob], { type: 'audio/wav' });
          })
        }
      }
    }
  }
})

$.when('click', '[data-play]', async (event) => {
  const root = event.target.closest($.link)

  if(root.blob) {
    const audio = root.querySelector('audio')
    audio.src = URL.createObjectURL(root.blob);
    audio.play()
      .catch(e => console.error("Error playing audio:", e));

    // Clean up the object URL after the audio has played (or is no longer needed)
    // You might want to do this in an 'ended' event listener for long audio files
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
    };
  }
})

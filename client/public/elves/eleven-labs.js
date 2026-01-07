import { Self } from '@plan98/types'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: plan98.env.ELEVEN_LABS_API_KEY // Replace with your actual API key
});

const $ = Self('eleven-labs')

$.draw(() => {
  return `
    <form>
      <textarea name="text"></textarea>
      <button>Speak</button>
    </form>
  `
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()
  const { value } = event.target.text

  const audio = await elevenlabs.textToSpeech.convert('nPczCjzI2devNBz1zQrb', {
    text: value,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  // Convert the stream to a blob and play it
  const chunks = [];
  const reader = audio.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const blob = new Blob(chunks, { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  const audioElement = new Audio(url);
  await audioElement.play();

  // Clean up the URL when done
  audioElement.onended = () => URL.revokeObjectURL(url);
})

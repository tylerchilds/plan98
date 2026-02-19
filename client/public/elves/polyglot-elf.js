import elf from '@silly/elf'
import Vosk from 'vosk-browser'
import translate from 'translate'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

translate.engine = 'libre'
translate.url = plan98.env.LIBRE_TRANSLATE_URL + '/translate'

const elevenlabs = new ElevenLabsClient({
  apiKey: plan98.env.ELEVEN_LABS_API_KEY
})

const VOICE_ID = 'nPczCjzI2devNBz1zQrb'

const VOSK_LANGUAGES = [
  { name: 'English (US)',    code: 'en', model: 'vosk-model-small-en-us-0.15.tar.gz' },
  { name: 'English (India)', code: 'en', model: 'vosk-model-small-en-in-0.4.tar.gz' },
  { name: 'German',          code: 'de', model: 'vosk-model-small-de-0.15.tar.gz' },
  { name: 'French',          code: 'fr', model: 'vosk-model-small-fr-pguyot-0.3.tar.gz' },
  { name: 'Spanish',         code: 'es', model: 'vosk-model-small-es-0.42.tar.gz' },
  { name: 'Portuguese',      code: 'pt', model: 'vosk-model-small-pt-0.3.tar.gz' },
  { name: 'Russian',         code: 'ru', model: 'vosk-model-small-ru-0.22.tar.gz' },
  { name: 'Italian',         code: 'it', model: 'vosk-model-small-it-0.22.tar.gz' },
  { name: 'Dutch',           code: 'nl', model: 'vosk-model-small-nl-0.22.tar.gz' },
  { name: 'Turkish',         code: 'tr', model: 'vosk-model-small-tr-0.3.tar.gz' },
  { name: 'Farsi',           code: 'fa', model: 'vosk-model-small-fa-0.42.tar.gz' },
  { name: 'Chinese',         code: 'zh', model: 'vosk-model-small-cn-0.22.tar.gz' },
  { name: 'Catalan',         code: 'ca', model: 'vosk-model-small-ca-0.4.tar.gz' },
]

const MODELS_PATH = '/public/cdn/cache/alphacephei.com/models/'
const WORKLET_PATH = '/public/cdn/sillyz.computer/models/vosk-browser/recognizer-processor.js'

const $ = elf('polyglot-elf', {
  consented: false,
  sourceModel: VOSK_LANGUAGES[0].model,
  from: VOSK_LANGUAGES[0].code,
  to: 'es',
  destinationLanguages: [],
  outputMode: 'text',
  status: 'Ready',
  caption: '',
  translated: '',
  partial: '',
})

// ─── Cleanup refs ─────────────────────────────────────────────────────────────
let _audioContext = null
let _mediaStream = null
let _recognizer = null
let _model = null
let _running = false

function teardown() {
  _running = false
  if (_recognizer) {
    try { _recognizer.remove() } catch (e) {}
    _recognizer = null
  }
  if (_audioContext) {
    try { _audioContext.close() } catch (e) {}
    _audioContext = null
  }
  if (_mediaStream) {
    _mediaStream.getTracks().forEach(t => t.stop())
    _mediaStream = null
  }
  if (_model) {
    try { _model.terminate() } catch (e) {}
    _model = null
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  ttsQueue = Promise.resolve()
}

// ─── TTS queue ────────────────────────────────────────────────────────────────
let ttsQueue = Promise.resolve()
let currentAudio = null

function speakTranslation(text) {
  ttsQueue = ttsQueue.then(async () => {
    try {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }

      const stream = await elevenlabs.textToSpeech.convert(VOICE_ID, {
        text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      })

      const chunks = []
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio

      await audio.play()
      await new Promise(resolve => {
        audio.onended = resolve
        audio.onerror = resolve
      })

      URL.revokeObjectURL(url)
      currentAudio = null
    } catch (e) {
      console.error('TTS error', e)
    }
  })
}

// ─── Language list ────────────────────────────────────────────────────────────
async function loadLanguages() {
  try {
    const res = await fetch(plan98.env.LIBRE_TRANSLATE_URL + '/languages', {
      headers: { 'Content-Type': 'application/json' },
    })
    const languages = await res.json()

    const seen = new Set()
    const allTargets = languages
      .flatMap(l => l.targets.map(code => {
        const match = languages.find(x => x.code === code)
        return { code, name: match?.name || code }
      }))
      .filter(({ code }) => !seen.has(code) && seen.add(code))
      .sort((a, b) => a.name.localeCompare(b.name))

    $.teach({ destinationLanguages: allTargets })
  } catch (e) {
    console.error('Failed to load languages', e)
  }
}

loadLanguages()

// ─── Draw ─────────────────────────────────────────────────────────────────────
$.draw((target) => {
  const {
    consented,
    sourceModel,
    to,
    destinationLanguages,
    outputMode,
    status,
    caption,
    translated,
    partial,
  } = $.learn()

  if (!consented) {
    return `
      <div data-setup>
        <h2>Polyglot</h2>
        <p>Real-time speech translation. Speak — your listener reads or hears in their language.</p>

        <label class="field">
          <span class="label">Speaker language</span>
          <select name="sourceModel" data-bind>
            ${VOSK_LANGUAGES.map(l => `
              <option value="${l.model}" ${sourceModel === l.model ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>
        </label>

        <label class="field">
          <span class="label">Listener language</span>
          <select name="to" data-bind>
            ${destinationLanguages.map(l => `
              <option value="${l.code}" ${to === l.code ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>
        </label>

        <label class="field">
          <span class="label">Output mode</span>
          <div class="toggle-group">
            <label class="toggle-option">
              <input type="radio" name="outputMode" value="text" ${outputMode === 'text' ? 'checked' : ''} data-bind-radio />
              <span>📖 Text</span>
            </label>
            <label class="toggle-option">
              <input type="radio" name="outputMode" value="speak" ${outputMode === 'speak' ? 'checked' : ''} data-bind-radio />
              <span>🔊 Speak (ElevenLabs)</span>
            </label>
          </div>
        </label>

        <button data-load>Start</button>
      </div>
    `
  }

  return `
    <div class="panel source-panel">
      <div class="panel-label">Speaker</div>
      <div class="caption">
        <span class="committed">${caption}</span><span class="partial">${partial ? ' ' + partial + '…' : ''}</span>
      </div>
    </div>

    <div class="panel listener-panel">
      <div class="panel-label">Listener ${outputMode === 'speak' ? '🔊' : '📖'}</div>
      <div class="caption">
        <span class="committed">${translated}</span><span class="partial">${partial ? ' ···' : ''}</span>
      </div>
    </div>

    <div class="status-bar">
      <span class="status-dot ${status === 'Listening…' ? 'active' : ''}"></span>
      <span>${status}</span>
      <button data-stop>⏹ Stop</button>
    </div>
  `
})

// ─── Event handlers ───────────────────────────────────────────────────────────
$.when('change', '[data-bind]', (event) => {
  const { name, value } = event.target
  $.teach({ [name]: value })
  if (name === 'sourceModel') {
    const lang = VOSK_LANGUAGES.find(l => l.model === value)
    if (lang) $.teach({ from: lang.code })
  }
})

$.when('change', '[data-bind-radio]', (event) => {
  $.teach({ [event.target.name]: event.target.value })
})

$.when('click', '[data-load]', (event) => {
  $.teach({ consented: true })
  init(event.target.closest($.link))
})

$.when('click', '[data-stop]', () => {
  teardown()
  $.teach({
    consented: false,
    caption: '',
    translated: '',
    partial: '',
    status: 'Ready',
  })
})

// ─── Core pipeline ────────────────────────────────────────────────────────────
async function init(target) {
  const { sourceModel } = $.learn()
  const channel = new MessageChannel()

  $.teach({ status: 'Loading model…' })
  const model = await Vosk.createModel(MODELS_PATH + sourceModel)
  model.registerPort(channel.port1)
  _model = model

  const sampleRate = 48000
  const recognizer = new model.KaldiRecognizer(sampleRate)
  recognizer.setWords(true)
  _recognizer = recognizer
  _running = true

  $.teach({ status: 'Listening…' })

  recognizer.on('partialresult', (message) => {
    if (!_running) return
    $.teach({ partial: message.result.partial || '' })
  })

  recognizer.on('result', async (message) => {
    if (!_running) return
    const text = message.result?.text
    if (!text) return

    const { caption } = $.learn()
    $.teach({
      caption: [caption, text].filter(Boolean).join(' '),
      partial: '',
    })

    const { to, from, outputMode, translated } = $.learn()
    let result = text
    if (from !== to) {
      try {
        result = await translate(text, { to, from })
      } catch (e) {
        result = `[${text}]`
      }
    }

    // Check again after async translate — stop may have been pressed during await
    if (!_running) return

    $.teach({ translated: [translated, result].filter(Boolean).join(' ') })

    if (outputMode === 'speak') {
      speakTranslation(result)
    }
  })

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate,
    },
  })
  _mediaStream = mediaStream

  const audioContext = new AudioContext()
  _audioContext = audioContext

  await audioContext.audioWorklet.addModule(WORKLET_PATH)

  const recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', {
    channelCount: 1,
    numberOfInputs: 1,
    numberOfOutputs: 1,
  })

  recognizerProcessor.port.postMessage(
    { action: 'init', recognizerId: recognizer.id },
    [channel.port2]
  )

  recognizerProcessor.connect(audioContext.destination)
  audioContext.createMediaStreamSource(mediaStream).connect(recognizerProcessor)
}

// ─── Styles ───────────────────────────────────────────────────────────────────
$.style(`
  & {
    background: #1e272e;
    color: #dfe6e9;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr auto;
    height: 100%;
    overflow: hidden;
    font-family: system-ui, sans-serif;
  }

  & [data-setup] {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 2rem;
    max-width: 480px;
    margin: auto;
    width: 100%;
    box-sizing: border-box;
  }

  & [data-setup] h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  & [data-setup] p {
    margin: 0;
    opacity: 0.6;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  & .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  & .label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.55;
  }

  & select {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #485460;
    background: #2f3640;
    color: #dfe6e9;
    font-size: 0.95rem;
    cursor: pointer;
    width: 100%;
  }

  & .toggle-group {
    display: flex;
    gap: 0.5rem;
  }

  & .toggle-option {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #485460;
    background: #2f3640;
    cursor: pointer;
    font-size: 0.9rem;
  }

  & .toggle-option:has(input:checked) {
    border-color: #00b894;
    background: #1d3a32;
  }

  & button[data-load] {
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    background: #00b894;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
  }

  & button[data-load]:hover {
    background: #00cba3;
  }

  & .panel {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    overflow: hidden;
    border-right: 1px solid #2f3640;
  }

  & .listener-panel {
    border-right: none;
    background: #1a252f;
  }

  & .panel-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.4;
    margin-bottom: 0.75rem;
  }

  & .caption {
    flex: 1;
    overflow-y: auto;
    font-size: 1.5rem;
    line-height: 1.6;
    word-break: break-word;
  }

  & .committed {
    color: #dfe6e9;
  }

  & .partial {
    color: #636e72;
    font-style: italic;
  }

  & .status-bar {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background: #141d23;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  & .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #485460;
    flex-shrink: 0;
  }

  & .status-dot.active {
    background: #00b894;
    box-shadow: 0 0 6px #00b894;
    animation: pulse 1.5s ease-in-out infinite;
  }

  & .status-bar span:last-of-type {
    flex: 1;
  }

  & button[data-stop] {
    background: #d63031;
    border: none;
    border-radius: 5px;
    color: white;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`)

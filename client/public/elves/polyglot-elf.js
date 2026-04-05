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
  sourceModel: VOSK_LANGUAGES[0].model,
  from: VOSK_LANGUAGES[0].code,
  to: 'es',
  status: 'idle',
  translated: '',
  partial: '',
  micMuted: true,    // starts muted — first unmute triggers init
  spoken: false,
  labels: {},
})

// --- Cleanup refs -----------------------------------------------------------
let _audioContext = null
let _mediaStream = null
let _recognizer = null
let _model = null
let _channel = null
let _running = false
let _micSource = null
let _processorNode = null
let currentAudio = null
let _ttsActive = false

function teardown() {
  _running = false
  _ttsActive = false

  if (currentAudio) { currentAudio.pause(); currentAudio = null }

  if (_micSource) {
    try { _micSource.disconnect() } catch (e) {}
    _micSource = null
  }
  if (_processorNode) {
    try { _processorNode.disconnect() } catch (e) {}
    _processorNode = null
  }

  if (_channel) {
    try { _channel.port1.close() } catch (e) {}
    _channel = null
  }

  if (_recognizer) {
    try { _recognizer.remove() } catch (e) {}
    _recognizer = null
  }

  if (_model) {
    try { _model.terminate() } catch (e) {}
    _model = null
  }

  if (_mediaStream) {
    _mediaStream.getTracks().forEach(t => t.stop())
    _mediaStream = null
  }

  if (_audioContext) {
    try { _audioContext.close() } catch (e) {}
    _audioContext = null
  }
}

// --- TTS --------------------------------------------------------------------
// Drop-if-busy: if ElevenLabs is already speaking, skip the new result.
// Never queue — stale audio is worse than silence.
async function speakTranslation(text) {
  if (_ttsActive) {
    console.log('[polyglot] tts busy, dropping:', text)
    return
  }
  _ttsActive = true

  // Disconnect mic from Vosk during playback to prevent feedback loop
  if (_micSource && _processorNode) {
    try { _micSource.disconnect(_processorNode) } catch (e) {}
  }

  try {
    if (currentAudio) { currentAudio.pause(); currentAudio = null }

    const stream = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
      languageCode: $.learn().to,
      voiceSettings: {
        stability: 0.75,        // consistent across short utterances, no drift
        similarityBoost: 0.85,  // clear pronunciation, close to source voice
        style: 0.0,             // no style exaggeration — lower latency, more stable
        useSpeakerBoost: true,  // sharper clarity on translated speech
      },
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
    await new Promise(resolve => { audio.onended = resolve; audio.onerror = resolve })

    URL.revokeObjectURL(url)
    currentAudio = null
  } catch (e) {
    console.error('TTS error', e)
  } finally {
    _ttsActive = false
    // Reconnect mic after playback (or on error)
    if (_running && _micSource && _processorNode) {
      try { _micSource.connect(_processorNode) } catch (e) {}
    }
  }
}

// --- UI label translation ---------------------------------------------------
// Serialized through a queue — one request at a time, skips 'en' (no-op).
// Not called on module load; called after first user interaction to avoid
// hammering LibreTranslate before the tab is ready.
const UI_LABELS = {
  from: 'from',
  to: 'to',
  listen: 'listen',
  muted: 'muted',
  idle: 'idle',
  spoken: 'spoken',
  silent: 'silent',
}

let _labelQueue = Promise.resolve()

function refreshLabels() {
  _labelQueue = _labelQueue.then(async () => {
    const { from, to } = $.learn()
    const keys = Object.keys(UI_LABELS)
    const labels = {}

    for (const k of keys) {
      labels[`${k}_from`] = from === 'en'
        ? UI_LABELS[k]
        : await translate(UI_LABELS[k], { to: from, from: 'en' }).catch(() => UI_LABELS[k])
      labels[`${k}_to`] = to === 'en'
        ? UI_LABELS[k]
        : await translate(UI_LABELS[k], { to, from: 'en' }).catch(() => UI_LABELS[k])
    }

    $.teach({ labels, status: `${labels.idle_from} / ${labels.idle_to}` })
  })
}

const LANG_NAMES = {
  es: 'Spanish', en: 'English', fr: 'French', de: 'German',
  pt: 'Portuguese', it: 'Italian', ru: 'Russian', zh: 'Chinese',
  ar: 'Arabic', ja: 'Japanese', ko: 'Korean', nl: 'Dutch',
  tr: 'Turkish', fa: 'Farsi', ca: 'Catalan',
}

// --- Draw -------------------------------------------------------------------
$.draw((target) => {
  const {
    sourceModel,
    to,
    translated,
    partial,
    micMuted,
    spoken,
    labels,
  } = $.learn()

  const muteLabel = micMuted
    ? (labels.muted_from ? `${labels.muted_from}/${labels.muted_to}` : 'muted')
    : (labels.listen_from ? `${labels.listen_from}/${labels.listen_to}` : 'unmuted')

  const spokenLabel = spoken
    ? (labels.spoken_from ? `${labels.spoken_from}/${labels.spoken_to}` : 'unmuted')
    : (labels.silent_from ? `${labels.silent_from}/${labels.silent_to}` : 'muted')

  return `
    <div class="tim-cookin">

      <div class="action-bar">
        <div>
          <button data-quit class="minimal-button">Q</button>
        </div>
        <div class="url-grid">
          <span class="protocol">LOL://</span>
          <select name="sourceModel" data-bind-model>
            ${VOSK_LANGUAGES.map(l => `
              <option value="${l.model}" ${sourceModel === l.model ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>
          <span class="sep">→</span>
          <select name="to" data-bind-to>
            ${Object.entries(LANG_NAMES).map(([code, name]) => `
              <option value="${code}" ${to === code ? 'selected' : ''}>${name}</option>
            `).join('')}
          </select>
        </div>
        <div style="text-align: right;">
          <button data-reset class="minimal-button">R</button>
        </div>
      </div>

      <div class="arena">
        <div class="translated ${translated ? '' : 'empty'}">${translated || '_'}</div>
      </div>

      <div class="bottom-bar">
        <div class="partial-hint">${partial ? partial + '…' : '\u00a0'}</div>
        <div class="status-bar">
          <div class="io-control">
            <span class="io-label">input</span>
            <button data-mute class="footer-button ${micMuted ? 'muted' : 'active'}">${muteLabel}</button>
          </div>
          <div class="io-control io-right">
            <span class="io-label">output</span>
            <button data-spoken style="margin-left: auto;" class="footer-button ${spoken ? 'active' : 'muted'}">${spokenLabel}</button> 
          </div>
        </div>
      </div>

    </div>
  `
})

// --- Event handlers ---------------------------------------------------------
$.when('change', '[data-bind-model]', (event) => {
  const model = event.target.value
  const lang = VOSK_LANGUAGES.find(l => l.model === model)
  $.teach({ sourceModel: model, translated: '', partial: '', ...(lang ? { from: lang.code } : {}) })
  refreshLabels()
  // Source model changed — must reinit Vosk with the new language model
  if (_running) {
    teardown()
    $.teach({ micMuted: false })
    init(event.target.closest($.link))
  }
})

$.when('change', '[data-bind-to]', (event) => {
  // Target language is read at translate-time — no reinit needed
  $.teach({ to: event.target.value })
  refreshLabels()
})

$.when('click', '[data-quit]', () => {
  teardown()
  self.location.href = '/app/quick-sketch'
})

$.when('click', '[data-reset]', () => {
  console.clear()
  $.teach({ translated: '', partial: '', status: 'idle' })
})

$.when('click', '[data-mute]', (event) => {
  const { micMuted } = $.learn()
  const next = !micMuted
  $.teach({ micMuted: next })

  if (next) {
    if (_micSource && _processorNode) {
      try { _micSource.disconnect(_processorNode) } catch (e) {}
    }
  } else {
    if (!_running) {
      init(event.target.closest($.link))
      refreshLabels()
    } else if (_micSource && _processorNode) {
      try { _micSource.connect(_processorNode) } catch (e) {}
    }
  }
})

$.when('click', '[data-spoken]', () => {
  $.teach({ spoken: !$.learn().spoken })
})

// --- Core pipeline ----------------------------------------------------------
let _initInProgress = false

async function init(target) {
  if (_initInProgress) return
  _initInProgress = true

  // Tear down first and give the worker a tick to actually stop
  if (_running) {
    teardown()
    await new Promise(r => setTimeout(r, 100))
  }

  try {
    const { sourceModel } = $.learn()
    const channel = new MessageChannel()
    _channel = channel

    $.teach({ status: 'loading model...' })
    const model = await Vosk.createModel(MODELS_PATH + sourceModel)
    model.registerPort(channel.port1)
    _model = model

    const sampleRate = 48000
    const recognizer = new model.KaldiRecognizer(sampleRate)
    recognizer.setWords(true)
    _recognizer = recognizer
    _running = true

    $.teach({ status: 'listening...' })

    recognizer.on('partialresult', (message) => {
      if (!_running) return
      $.teach({ partial: message.result.partial || '' })
    })

    recognizer.on('result', async (message) => {
      if (!_running) return
      const text = message.result?.text
      if (!text) return

      $.teach({ partial: '' })
      console.log('[polyglot] source:', text)

      const { to, from, spoken, micMuted } = $.learn()
      if (micMuted) return

      let result = text
      if (from !== to) {
        try { result = await translate(text, { to, from }) }
        catch (e) { result = `[${text}]` }
      }

      if (!_running) return

      console.log('[polyglot] translated:', result)
      $.teach({ translated: [$.learn().translated, result].filter(Boolean).join(' ') })

      if (spoken) speakTranslation(result)
    })

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1, sampleRate },
    })
    _mediaStream = mediaStream

    const audioContext = new AudioContext()
    _audioContext = audioContext

    await audioContext.audioWorklet.addModule(WORKLET_PATH)

    const recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', {
      channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1,
    })

    recognizerProcessor.port.postMessage(
      { action: 'init', recognizerId: recognizer.id },
      [channel.port2]
    )

    recognizerProcessor.connect(audioContext.destination)

    const micSource = audioContext.createMediaStreamSource(mediaStream)
    micSource.connect(recognizerProcessor)

    _micSource = micSource
    _processorNode = recognizerProcessor

  } catch (e) {
    console.error('[polyglot] init failed:', e)
    teardown()
    $.teach({ micMuted: true, status: 'init failed' })
  } finally {
    _initInProgress = false
  }
}

// --- Styles -----------------------------------------------------------------
$.style(`
  & {
    display: block;
    height: 100%;
    overflow: hidden;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12pt;
    user-select: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    touch-action: none;
  }

  & .tim-cookin {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
  }

  & .action-bar {
    background: rgba(0,0,0,.85);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    padding: 2px;
  }

  & .url-grid {
    display: grid;
    grid-template-columns: auto auto auto auto;
    gap: 4px;
    place-content: center;
  }

  & .protocol {
    color: #8ec07c;
    font-size: 0.75rem;
    padding: 0 4px;
    white-space: nowrap;
  }

  & .sep {
    color: #665c54;
    font-size: 0.75rem;
  }

  & select {
    color: #d79921;
    background: transparent;
    border: none;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8rem;
    padding: 2px;
    cursor: pointer;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  & select option {
    background: #1a1a1a;
    color: #d79921;
  }

  & .footer-button.active { color: #8ec07c; }

  & .footer-button {
    background: transparent;
    border: none;
    color: #a89984;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 2px 6px;
    letter-spacing: 0.05em;
  }

  & .footer-button:hover { color: #ebdbb2; }
  & .footer-button.muted { color: #cc241d; }
  & .footer-button.go { color: #8ec07c; }
  & .footer-button.stop { color: #cc241d; }

  & .arena {
    overflow: auto;
    padding: 1.5rem 1.25rem;
    background: #1d2021;
    display: flex;
    align-items: flex-start;
  }

  & .translated {
    font-size: clamp(1.4rem, 4.5vw, 3rem);
    color: #ebdbb2;
    line-height: 1.3;
    word-break: break-word;
  }

  & .translated.empty { color: #504945; font-style: italic; }

  & .bottom-bar {
    background: rgba(0,0,0,.85);
    display: flex;
    flex-direction: column;
    border-top: 1px solid #3c3836;
  }

  & .partial-hint {
    font-size: 0.72rem;
    color: #665c54;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    min-height: 18px;
    font-style: italic;
  }

  & .status-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
    padding: 4px;
    border-top: 1px solid #3c3836;
  }

  & .io-control {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
  }

  & .io-control.io-right {
    align-items: flex-end;
  }

  & .io-label {
    font-size: 0.65rem;
    color: #665c54;
    letter-spacing: 0.05em;
    padding: 0 6px;
  }`)


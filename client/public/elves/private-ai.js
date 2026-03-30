/*

Private AI

A way to phone home

Using the @silly/elf as MVCES

m -- Model (data)
v -- View (structure)
c -- Controller (reconcilliation)
e -- Event (interactivity)
s -- Skin (presentation)

all human computer interactions can be expressed with these five letters to maintain mental self-soveriegnty amid context collapse in the torment nexus

*/

import { default as MVCES } from '@silly/elf'
import Cache from '@silly/cache'

const elf = 'private-ai'
const cache = Cache(elf)

const { m, v, c, e, s } = MVCES(elf, {
  ready: false,
  draft: '',
  error: '',
  url: '',
  key: '',
  models: [],
  modelId: '',
  messages: [],
  streaming: false,
  thinking: '',
})

;(function main() {
  cache.get('creds').then(record => {
    if (!record || !record.data) return
    const { url, key } = record.data
    const patch = {}
    if (url) patch.url = url
    if (key) patch.key = key
    c(patch)
  })
})()

v(() => {
  const { models, modelId, url, key, ready, error, draft, messages, streaming, thinking } = m()

  if (!ready) {
    return `
      <form name="connect" class="wizard">
        ${error ? `<div class="error">${error}</div>` : ''}
        <div>
          <label class="field">
            <span class="label">url</span>
            <input data-store="creds" name="url" value="${escapeHyperText(url)}" />
          </label>
          <small>The https:// thing for where the actual model lives in the tubes</small>
        </div>
        <div>
          <label class="field">
            <span class="label">key</span>
            <input data-store="creds" name="key" type="password" value="${escapeHyperText(key)}" />
          </label>
          <small>Your super secret password</small>
        </div>
        <div class="ready-area">
          <button type="submit" class="standard-button">Ready</button>
        </div>
      </form>
    `
  }

  const modelOptions = models.map(model => `
    <option value="${model.id}" ${modelId === model.id ? 'selected' : ''}>
      ${model.name || model.id}
    </option>
  `).join('')

  const messageHtml = messages.map(msg => `
    <div class="message message--${msg.role}">
      <span class="message__role">${msg.role}</span>
      <div class="message__content">${escapeHyperText(msg.content)}</div>
    </div>
  `).join('')

  const thinkingHtml = thinking ? `
    <div class="thinking-bubble">
      <span class="thinking-label">thinking</span>
      <div class="thinking-content" id="thinking-target">${escapeHyperText(thinking)}</div>
    </div>
  ` : ''

  const streamHtml = streaming ? `
    <div class="message message--assistant streaming">
      <span class="message__role">assistant</span>
      <div class="message__content" id="stream-target"></div>
    </div>
  ` : ''

  return `
    <div class="chat-layout">
      <div class="toolbar">
        <label class="field model-picker">
          <span class="label">model</span>
          <select class="models" name="modelId">
            ${modelOptions}
          </select>
        </label>
        <button class="standard-button secondary" name="clear">Clear</button>
      </div>

      <div class="messages" id="messages-feed">
        ${messageHtml}
        ${thinkingHtml}
        ${streamHtml}
      </div>

      <form name="chat" class="input-area">
        ${error ? `<div class="error">${error}</div>` : ''}
        <div class="input">
          <textarea
            class="standard-input"
            name="draft"
            placeholder="Type something and send it to a digital robot"
            ${streaming ? 'disabled' : ''}
          >${escapeHyperText(draft)}</textarea>
        </div>
        <div class="ready-area">
          <button type="submit" class="standard-button" ${streaming ? 'disabled' : ''}>
            ${streaming ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  `
})

async function loadModels() {
  const { url, key } = m()

  const response = await fetch(url + '/api/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) throw new Error(`Model fetch failed: ${response.status}`)

  const json = await response.json()
  const models = json.data || json.models || []
  const modelId = models[0]?.id || ''
  c({ models, modelId })
}

async function sendMessage(userContent) {
  const { url, key, modelId, messages } = m()

  const updatedMessages = [...messages, { role: 'user', content: userContent }]
  c({ messages: updatedMessages, draft: '', streaming: true, error: '', thinking: '' })

  try {
    const response = await fetch(url + '/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: updatedMessages,
        stream: true
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error: ${response.status}`)
    }

    await streamResponse(response, updatedMessages)

  } catch (err) {
    c({ streaming: false, thinking: '', error: err.message })
  }
}

async function streamResponse(response, priorMessages) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''
  let accumulatedThinking = ''

  function patchTarget(id, text) {
    const el = document.getElementById(id)
    if (el) el.textContent = text
    scrollToBottom()
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta

          // reasoning_content comes from models like deepseek-r1
          // open-webui also surfaces web search steps here before content starts
          const thinkingDelta = delta?.reasoning_content || delta?.thinking
          const contentDelta = delta?.content

          if (thinkingDelta) {
            accumulatedThinking += thinkingDelta
            // patch thinking bubble directly — no full re-render
            const el = document.getElementById('thinking-target')
            if (el) {
              el.textContent = accumulatedThinking
            } else {
              // thinking bubble not in DOM yet — trigger a render to create it
              c({ thinking: accumulatedThinking })
            }
            scrollToBottom()
          }

          if (contentDelta) {
            accumulated += contentDelta
            patchTarget('stream-target', accumulated)
          }

        } catch (e) {
          // malformed chunk — skip
        }
      }
    }

    c({
      messages: [...priorMessages, { role: 'assistant', content: accumulated }],
      streaming: false,
      thinking: '',
    })
    scrollToBottom()

  } catch (err) {
    c({
      streaming: false,
      thinking: '',
      error: err.message,
      messages: accumulated
        ? [...priorMessages, { role: 'assistant', content: accumulated }]
        : priorMessages
    })
  } finally {
    reader.releaseLock()
  }
}

function scrollToBottom() {
  const feed = document.getElementById('messages-feed')
  if (feed) feed.scrollTop = feed.scrollHeight
}

e('submit', 'form[name="connect"]', event => {
  event.preventDefault()
  const { url, key } = m()
  if (url && key) {
    c({ ready: true, error: '' })
    loadModels().catch(err => c({ error: err.message }))
  } else {
    c({ error: 'Configuration misconfigurated. Try again more better.' })
  }
})

e('submit', 'form[name="chat"]', event => {
  event.preventDefault()
  const { draft, streaming } = m()
  if (streaming || !draft.trim()) return
  sendMessage(draft.trim())
})

e('change', 'select[name="modelId"]', event => {
  c({ modelId: event.target.value })
})

e('input', 'textarea[name="draft"]', event => {
  c({ draft: event.target.value })
})

e('keydown', 'textarea[name="draft"]', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    const { draft, streaming } = m()
    if (!streaming && draft.trim()) sendMessage(draft.trim())
  }
})

e('click', '[name="clear"]', event => {
  c({ messages: [], error: '', thinking: '' })
})

e('input', '[data-store="creds"]', event => {
  const { name, value } = event.target

  // patch top-level state for live binding
  c({ [name]: value })

  // always persist the full creds object — never thrash one key at a time
  const { url, key } = m()
  cache.put('creds', { url, key })
})

function escapeHyperText(text = '') {
  return String(text).replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]))
}

s(`
  & {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  & .error {
    color: firebrick;
    padding: .5rem 1rem;
  }

  & .wizard {
    max-width: 480px;
    margin: 2rem auto;
    padding: 1rem;
  }

  & .field + small {
    display: block;
    transform: translateY(-.75rem);
    padding: 0 1rem;
    opacity: .7;
  }

  & .chat-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  & .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: .5rem 1rem;
    border-bottom: 1px solid currentColor;
    flex-shrink: 0;
  }

  & .model-picker {
    flex: 1;
    max-width: 320px;
  }

  & .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: .75rem;
  }

  & .message {
    display: flex;
    flex-direction: column;
    gap: .25rem;
    max-width: 768px;
    width: 100%;
  }

  & .message--user {
    align-self: flex-end;
    align-items: flex-end;
  }

  & .message--assistant {
    align-self: flex-start;
  }

  & .message__role {
    font-size: .7rem;
    opacity: .5;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  & .message__content {
    padding: .5rem .75rem;
    border: 1px solid currentColor;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  & .message--user .message__content {
    opacity: .85;
  }

  & .streaming .message__content::after {
    content: '▋';
    animation: blink .8s step-end infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  & .thinking-bubble {
    align-self: flex-start;
    max-width: 768px;
    width: 100%;
    opacity: .6;
  }

  & .thinking-label {
    font-size: .7rem;
    opacity: .5;
    text-transform: uppercase;
    letter-spacing: .05em;
    display: block;
    margin-bottom: .25rem;
  }

  & .thinking-content {
    padding: .5rem .75rem;
    border: 1px dashed currentColor;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: .85em;
    font-style: italic;
    max-height: 200px;
    overflow-y: auto;
  }

  & .input-area {
    border-top: 1px solid currentColor;
    padding: .75rem 1rem;
    flex-shrink: 0;
  }

  & .input {
    margin-bottom: .5rem;
  }

  & .standard-input {
    width: 100%;
    min-height: 80px;
    resize: vertical;
    box-sizing: border-box;
  }

  & .ready-area {
    text-align: right;
  }

  & .secondary {
    opacity: .6;
  }
`)

export const starLordButta = {
  async chat({ model, messages, stream = true, apiKey, ...rest }) {
    const { url, key } = m()
    const effectiveKey = apiKey || key

    if (!url || !effectiveKey) {
      throw new Error('starLordButta: missing url or key — connect via the private-ai UI first')
    }

    const response = await fetch(url + '/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        ...rest
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `starLordButta API error: ${response.status}`)
    }

    if (stream) {
      return starLordButta.handleStream(response)
    } else {
      const data = await response.json()
      return (async function* () {
        yield {
          message: { role: 'assistant', content: data.choices[0].message.content },
          done: true
        }
      })()
    }
  },

  async *handleStream(response) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            yield { message: { role: 'assistant', content: '' }, done: true }
            return
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta
            const role = delta?.role
            const contentDelta = delta?.content
            const thinkingDelta = delta?.reasoning_content || delta?.thinking
            const toolCalls = delta?.tool_calls

            // surface reasoning so agentic-dash can see it if it wants
            if (thinkingDelta) {
              yield {
                message: { role: role || 'assistant', content: '', reasoning: thinkingDelta },
                done: false
              }
            }

            if (contentDelta) {
              yield {
                message: { role: role || 'assistant', content: contentDelta },
                done: false
              }
            }

            if (toolCalls) {
              yield {
                message: { role: 'assistant', content: '', tool_calls: toolCalls },
                done: false
              }
            }
          } catch (e) {
            // malformed chunk — skip
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

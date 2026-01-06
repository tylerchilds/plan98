// Anthropic API Integration via Deno proxy
// Client sends API key with each request

const ANTHROPIC_PROXY_URL = '/api/anthropic'
const ANTHROPIC_API_KEY = '' // Set this in your app config or via localStorage

export const anthropic = {
  async chat({ model, messages, stream = true, apiKey = ANTHROPIC_API_KEY }) {
    if (!apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    // Separate system message from conversation
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch(ANTHROPIC_PROXY_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemMessage,
        messages: conversationMessages,
        stream: stream
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Anthropic API error: ${response.statusText}`)
    }

    if (stream) {
      return this.handleStream(response)
    } else {
      const data = await response.json()
      return {
        message: {
          role: 'assistant',
          content: data.content[0].text
        },
        done: true
      }
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              // Handle content delta - yield ONLY the new chunk, not accumulated
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield {
                  message: {
                    role: 'assistant',
                    content: parsed.delta.text  // Just the delta, like Ollama
                  },
                  done: false
                }
              }

              // Handle message completion
              if (parsed.type === 'message_stop') {
                yield {
                  message: {
                    role: 'assistant',
                    content: ''
                  },
                  done: true
                }
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

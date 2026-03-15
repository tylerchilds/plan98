import elf from '@plan98/elf'
import { showModal, isVisible, hideModal } from './plan98-modal.js'
import { ai, getSearchEngineConfig, afterUpdateTheme } from './paper-pocket.js'
import { Ollama } from 'ollama/browser'
const $ = elf('gg-synthia', { synthia: {} })
import { update } from './ur-shell.js'

const host = plan98.env.OLLAMA_HOST || ''
export const ollama = new Ollama({
  host,
})

export const friends = {
  bengo: {
    bios: 'https://plan98.org/app/quick-blog?src=https://www.bengo.is/outbox/'
  },
  tychi: {
    bios: '/app/time-machine'
  }
}

export function getModels() {
  return ollama.list().then(data => {
    const models = {}

    for(const x of data.models) {
      models[x.name] = x.model
    }

    return models
  })
}

export const agenticFormatPlaceholder = {
  "type": "object",
  "properties": {
    "age": {
      "type": "integer"
    },
    "available": {
      "type": "boolean"
    }
  },
  "required": [
    "age",
    "available"
  ]
}

export const agenticOptionsPlaceholder = {
  "num_keep": 5,
  "seed": 42,
  "num_predict": 100,
  "top_k": 20,
  "top_p": 0.9,
  "min_p": 0.0,
  "typical_p": 0.7,
  "repeat_last_n": 33,
  "temperature": 0.8,
  "repeat_penalty": 1.2,
  "presence_penalty": 1.5,
  "frequency_penalty": 1.0,
  "penalize_newline": true,
  "stop": ["<br>", "user:"],
  "numa": false,
  "num_ctx": 1024,
  "num_batch": 2,
  "num_gpu": 1,
  "main_gpu": 0,
  "use_mmap": true,
  "num_thread": 8
}

export const agenticToolsPlaceholder = [
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform basic mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate (e.g., \"2 + 2\", \"15 * 23\")"
          }
        },
        required: ["expression"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and time",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather information for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state/country"
          }
        },
        required: ["location"]
      }
    }
  }
]

$.draw((target) => {
  return `
    game over, gg.
  `
}, {
})

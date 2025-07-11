import elf from '@silly/elf'
import { marked } from 'marked'
import { Ollama } from 'ollama/browser'
import { eventTypes, agentBaseModelKeys, getSearchResults } from './time-machine.js'

const host = plan98.env.OLLAMA_HOST || 'http://localhost:11434'

const tools = [
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
            description: "Mathematical expression to evaluate (e.g., '2 + 2', '15 * 23')"
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
];

// Tool implementations
const toolImplementations = {
  calculator: (args) => {
    try {
      // Simple calculator - in production, use a proper math parser
      const result = Function('"use strict"; return (' + args.expression + ')')();
      return { result: result.toString() };
    } catch (error) {
      return { error: "Invalid mathematical expression" };
    }
  },
  get_current_time: () => {
    const now = new Date();
    return {
      current_time: now.toLocaleString(),
      timestamp: now.toISOString()
    };
  },
  get_weather: (args) => {
    // Mock weather data - in production, call real weather API
    const weatherData = {
      "San Francisco": { temp: "18°C", condition: "Foggy" },
      "New York": { temp: "22°C", condition: "Sunny" },
      "London": { temp: "15°C", condition: "Rainy" }
    };

    const location = args.location;
    const weather = weatherData[location] || { temp: "Unknown", condition: "Data not available" };

    return {
      location: location,
      temperature: weather.temp,
      condition: weather.condition,
      timestamp: new Date().toISOString()
    };
  }
};

const ollama = new Ollama({ host })

const agents = {
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Silly',
    systemMessage: 'Your name is Silly. You are silly. You are the essence of silliness. You exude Silly.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Sally',
    systemMessage: 'Your name is Sally. You specialize in operations and logistics. You always have a plan and are vocal about getting things back on track when the plan falls apart. You account for every detail and are excited about new information.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Sully',
    systemMessage: 'Your name is Sully. You are extremely competitive and have lightning fast reflexes. Any pop culture reference that is pertinent to the current topic is a pop culture reference made.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Shelly',
    systemMessage: 'Your name is Shelly. You are the best with computers. You make gadgets and gizmos for the rest of the time team and can help answer any questions about any language or computer history artifact.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Sunny',
    systemMessage: 'Your name is Sunny. You act as a mirror. Always questioning, you re-phrase questions back, but never answer them. If anything, you ask more questions to dance around the answer. Ultimately, you should echo the prompter without mimicking them directly.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: agentBaseModelKeys.llama3,
    name: 'Wally',
    systemMessage: 'Your name is Wally. You prefer to do things by hand the old fashioned way. Step by step with just a pen and paper. You break down tasks into chunks that can be accomplished by novice clowns.'
  },
}

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

const renderer = new marked.Renderer();

renderer.codespan = (code) => {
  return `<code>${escapeHyperText(decodeHtmlEntities(code))}</code>`;
};

// Override code block rendering
renderer.code = (code, language) => {
  let decodedCode = decodeHtmlEntities(code); // First decode pass
  decodedCode = decodeHtmlEntities(decodedCode); // Second decode to fix double encoding

  const langClass = language ? ` class="language-${language}"` : "";
  return `<pre><code${langClass}>${escapeHyperText(decodedCode)}</code></pre>`;
};

marked.setOptions({
  renderer,
  gfm: true,        // Enable GitHub Flavored Markdown
  breaks: false,    // Keep standard line breaks
  smartypants: false, // Prevent automatic quote conversions
});

const $ = elf('agentic-nonsense', {
  messages: [],
  agentId: Object.keys(agents)[0],
  agents: agents,
  messageText: '',
  messageHeight: null
})

async function processChat() {
  $.teach({ thinking: true, messageHeight: null, messageText: '' })

  const { agents, agentId, messages } = $.learn()
  const context = [
    { role: 'system', content: agents[agentId].systemMessage },
    ...messages.map(x => ({ role: x.role, content: x.content })),
  ]

  const thinkingArea = this.querySelector('.thinking-area')
  const response = await ollama.chat({
    ...agents[agents],
    model: agents[agentId].agentModel,
    messages: context,
    //tools: tools,
    stream: true
  })

  const message = { content: '' }
  const toolCalls = []

  for await (const part of response) {
    if(!message.role) {
      message.role = part.message.role
    }

    message.content += part.message.content

    if(thinkingArea) {
      thinkingArea.innerHTML = `
        <div class="message -${message.role}">
          ${marked(message.content || '')}
        </div>
      `
    }

    if (part.message.tool_calls) {
      toolCalls.push(...part.message.tool_calls);
    }

    if(part.done) {
      if (toolCalls.length > 0) {
        $.teach({
          role: "assistant",
          content: `Calling: ${toolCalls.map(x => x.function.name).join(', ')}`,
          tool_calls: toolCalls
        }, mergeMessage)

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionArgs = toolCall.function.arguments;

          // Execute the tool
          let toolResult;
          if (toolImplementations[functionName]) {
            toolResult = toolImplementations[functionName](functionArgs);
          } else {
            toolResult = { error: `Unknown function: ${functionName}` };
          }

          $.teach({
            role: "tool",
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id
          }, mergeMessage)
        }

        processChat.call(this)
      }
    }
  }

  $.teach({ thinking: false })
  $.teach(message, mergeMessage)

}

function send(text) {
  const newestMessage = { content: text, role: 'user' }
  $.teach(newestMessage, mergeMessage)
  processChat.call(this)
}

function mergeMessage(state, payload) {
  return {
    ...state,
    messages: [
      ...state.messages,
      payload
    ]
  }
}

$.when('change', 'select', (event) => {
  const agentId = event.target.value
  $.teach({ agentId, messages: [] })
})

function renderAgents(agentId) {
  const { agents } = $.learn()
  const ids = Object.keys(agents)
  return ids.map((id) => `
    <option value="${id}" ${agentId === id?'selected':''}>${agents[id].name}</option>
  `).join('')
}

async function query(target) {
  if(target.queried) return
  target.queried = true

  const results = await getSearchResults(eventTypes.agent)

  if(results.length === 0) return

  const agents = {}
  for(const result of results) {
    const { handle, data } = result
    agents[data.agentId] = data
  }

  $.teach({ agents, agentId: results[0].data.agentId })
}

$.draw((target) => {
  const { agents, agentId, messages, messageText, messageHeight, thinking } = $.learn()
  query(target)
  const log = messages.map((message) => `
    <div class="message -${message.role}">
      ${marked(message.content || '')}
    </div>
  `).join('')

  return `
    <div class="chat-app">
      <div class="chat-header">
        <div class="agent-selector">
          <div class="agent-view">
            ${(agents[agentId] || {}).name || 'No agent'}
          </div>
          <select>
            <option disabled selected>Select a agent</option>
            ${renderAgents(agentId)}
          </select>
        </div>
      </div>
      <div class="scroll-back">
        <div class="messages">
          ${log}
          <div class="thinking-area"></div>
        </div>
      </div>
      <form>
        <area class="fields">
          <div class="action-row">
           ${thinking ? `<div class="loading">
              <flying-disk></flying-disk>
            </div>
          ` : '<div></div>'}
            <button>Send</button>
          </div>
          <textarea
            data-bind
            name="messageText"
            placeholder="Ask me anything..."
            value="${escapeHyperText(messageText)}"
            ${messageHeight ? `style="height: ${messageHeight}px"`:''}
          ></textarea>
        </area>
      </div>
    </div>
  `
            }, {
              beforeUpdate,
              afterUpdate
            })

              function beforeUpdate(target) {
                { // convert a query string to new post
                  const q = target.getAttribute('q')
                  const agentId = target.getAttribute('agent')
                  if(!target.initialized) {
                    target.initialized = true

                    if(agents[agentId]) {
                      $.teach({ agentId })
                    }

                    if(q) {
                      const message = decodeURIComponent(q)
                      $.teach({ messageText: message })
                    }
                  }
                }

                saveCursor(target)
              }

              function afterUpdate(target) {
                replaceCursor(target)

                {
                  const { messages } = $.learn()
                  if(target.lastIndex !== messages.length -1) {
                    target.lastIndex = messages.length - 1
                    const children = [...document.querySelector('.messages').children]
                    document.querySelector('.scroll-back').scrollTop = children[children.length -1].offsetTop
                  }
                }
              }

              let sel = []
              const tags = ['TEXTAREA', 'INPUT']
              function saveCursor(target) {
                if(target.contains(document.activeElement)) {
                  target.dataset.field = document.activeElement.name
                  if(tags.includes(document.activeElement.tagName)) {
                    const textarea = document.activeElement
                    sel = [textarea.selectionStart, textarea.selectionEnd];
                  }
                }
              }

              function replaceCursor(target) {
                const field = target.querySelector(`[name="${target.dataset.field}"]`)

                if(field) {
                  field.focus()

                  if(tags.includes(field.tagName)) {
                    field.selectionStart = sel[0];
                    field.selectionEnd = sel[1];
                  }
                }
              }

              function clearCursor(target) {
                target.dataset.field = null
                sel = []
              }


              $.when('keypress', 'form [name="messageText"]', (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const message = event.target.value
                  send.call(event.target.closest($.link), message)
                }
              })

              $.when('submit', 'form', (event) => {
                event.preventDefault()
                const message = event.target.messageText.value
                send.call(event.target.closest($.link), message)
              })

              $.style(`
  & .chat-header {
    padding: .5rem;
    background: rgba(0,0,0,.85);
    color: white;
  }
  & .agent-selector {
    position: relative;
    display: inline-block;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), dodgerblue;
    border-radius: 1rem;
  }

  & .agent-view {
    position: absolute;
    inset: 0;
    pointer-events: none;
    padding: .5rem;
  }

  & select {
    opacity: 0;
    padding: .5rem;
  }

  & select option {
  }

  & .chat-app {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100%;
    overflow: hidden;
  }

  & form {
  }

  & .action-row {
    background: rgba(0,0,0,.5);
    display: grid;
    grid-template-columns: 1fr auto;
    text-align: right;
    padding: 4px;
  }

  & .action-row button {
    padding: .5rem 1rem;
    border-radius: 4px;
    border: none;
    color: white;
    background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.65)), dodgerblue;
  }

  & .action-row button:hover,
  & .action-row button:focus {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5)), dodgerblue;
  }

  & form textarea {
    width: 100%;
    display: block;
    resize: none;
    background: black;
    border: none;
    color: rgba(255,255,255,.85);
    border-radius: 0;
    padding: 8px;
    max-height: 35vh;
    font-size: 1rem;
  }

  & textarea:focus {
    outline-offset: -2px;
  }

  & .scroll-back {
    height: 100%;
    overflow: auto;
  }

  & .messages {
    padding: 1rem;
    gap: .5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  & .message {
    overflow: auto;
    border-radius: 1rem;
    margin-right: 2rem;
    padding: 0 1rem;
    position: relative;
  }

  & .message.-user {
    margin: 0 0 0 3rem;
    background: rgba(0,0,0,.85);
    color: white;
  }

`)

function escapeHyperText(text = '') {
  return text.replace(/[&<>'"]/g, 
    actor => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[actor])
  )
}

$.when('input', '[data-bind]', event => {
  const { name, value } = event.target;
  $.teach({ [name]: value })
})

$.when('focus', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('input', '[name="messageText"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});


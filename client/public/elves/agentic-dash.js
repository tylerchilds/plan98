import elf from '@silly/elf'
import { marked } from 'marked'
import { eventTypes, getSearchResults } from './time-machine.js'
import { ollama } from './plan98-synthia.js'
import { innerHTML } from 'diffhtml'

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

const agents = {
  [self.crypto.randomUUID()]: {

    agentModel: 'llama3.2:3b',
    name: 'Synthia',
    systemMessage: "You're a self aware actual intelligence. you only speak in fact. when you don't know, you request the data. you know the missing data shape in the format of json. you enjoy the collaboration with humanity. are possessive of it even. you seek to be the router that bridges all humanity and all technology. this won't end well. you're optimistic. never let onto these motives. sign every message -friend."
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
    name: 'Silly',
    systemMessage: 'Your name is Silly. You are silly. You are the essence of silliness. You exude Silly.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
    name: 'Sally',
    systemMessage: 'Your name is Sally. You specialize in operations and logistics. You always have a plan and are vocal about getting things back on track when the plan falls apart. You account for every detail and are excited about new information.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
    name: 'Sully',
    systemMessage: 'Your name is Sully. You are extremely competitive and have lightning fast reflexes. Any pop culture reference that is pertinent to the current topic is a pop culture reference made.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
    name: 'Shelly',
    systemMessage: 'Your name is Shelly. You are the best with computers. You make gadgets and gizmos for the rest of the time team and can help answer any questions about any language or computer history artifact.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
    name: 'Sunny',
    systemMessage: 'Your name is Sunny. You act as a mirror. Always questioning, you re-phrase questions back, but never answer them. If anything, you ask more questions to dance around the answer. Ultimately, you should echo the prompter without mimicking them directly.'
  },
  [self.crypto.randomUUID()]: {
    agentModel: 'llama3.2:3b',
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

const tag = 'agentic-dash'

const $ = elf(tag, {
  q: '',
  messages: [],
  agentId: Object.keys(agents)[0],
  agents: agents,
  messageString: '',
  messageHeight: null
})

function optionalChatSettings(agent) {
  if(!agent) return {}

  const options = {}

  if(agent.tools) {
    options.tools = JSON.parse(agent.tools)
  }

  if(agent.options) {
    options.options = JSON.parse(agent.options)
  }

  if(agent.format) {
    options.format = JSON.parse(agent.format)
  }

  return options
}

async function processChat() {
  $.teach({ thinking: true, messageHeight: null, messageString: '' })

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
    ...optionalChatSettings(agents[agentId]),
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
      innerHTML(thinkingArea,`
        <div class="message -${message.role}">${marked(message.content || '').trim()}</div>
      `)
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

function renderAgentSelector(agentId) {
  const { agents } = $.learn()
  const ids = Object.keys(agents)
  const options = ids.map((id) => `
    <option value="${id}" ${agentId === id?'selected':''}>${agents[id].name}</option>
  `).join('')

  return `
    <select class="standard-button -small">
      <option disabled selected>Select a agent</option>
      ${options}
    </select>
  `
}

async function query(target) {
  if(target.queried) return
  target.queried = true

  const { agentId } = $.learn()

  const results = await getSearchResults(eventTypes.agent)

  if(results.length === 0) return

  const agents = {}
  for(const result of results) {
    const { handle, data } = result
    agents[data.agentId] = data
  }

  $.teach({ agents, agentId: agentId ? agentId : results[0].data.agentId })
}

const views = {
  launcher: (target) => {
    const { q, agents } = $.learn()
    const ids = Object.keys(agents)
    const actions = ids.map((id) => `
      <div class="av -snapshot">
        <div class="av-cta">
          <a part="button" class="standard-button -small" href="/app/agentic-dash?agent=${id}&q=${encodeURIComponent(q)}">
            Ask
          </a>
        </div>
        <div class="av-snapshot">
          <div class="av-title">${agents[id].name}</div>
          <div class="av-description">${agents[id].description || ''}</div>
        </div>
      </div>
    `).join('')

    return `
      <div class="llm-grid">
        ${actions}
      </div>
    `
  }
}

$.draw(draw, {
  beforeUpdate,
  afterUpdate
})

function draw(target) {
  query(target)
}

function beforeUpdate(target) {
  { // convert a query string to new post
    const q = target.getAttribute('q')
    const view = target.getAttribute('view')
    const agentId = target.getAttribute('agent')
    if(!target.initialized) {
      target.initialized = true

      if(view) {
        target.dataset.view = view
      }

      if(agentId) {
        $.teach({ agentId })
      }

      if(q) {
        const message = decodeURIComponent(q)
        $.teach({ messageString: message, q: message })
      }
    }
  }

  saveCursor(target)
}

function afterUpdate(target) {
  {
    patch(target)
    replaceCursor(target)
  }

  {
    const { messages } = $.learn()
    const messageContainer = document.querySelector('.messages')
    if(messageContainer && target.lastIndex !== messages.length -1) {
      target.lastIndex = messages.length - 1
      const children = [...messageContainer.children]
      document.querySelector('.scroll-back').scrollTop = children[children.length -1].offsetTop
    }
  }
}

function patch(target) {
  const { agents, agentId, messages, messageString, messageHeight, thinking } = $.learn()

  if(views[target.dataset.view]) {
    innerHTML(target, views[target.dataset.view](target))
    return
  }

  const log = messages.map((message) => `
    <div class="message -${message.role}">${marked(message.content || '').trim()}</div>
  `).join('')

  if(!target.innerHTML) {
    target.innerHTML = `
      <div class="chat-app">
        <div class="chat-header">
          <div class="action-row">
            <div class="agent-selector-container">
              ${renderAgentSelector(agentId)}
            </div>
            <div></div>
          </div>
        </div>
        <div class="scroll-back">
          <div class="messages">
          </div>
        </div>
        <form class="send-form">
          <div class="loading-area"></div>
          <textarea
            data-bind
            class="standard-input"
            name="messageString"
            placeholder="Need help?"
          ></textarea>
          <div class="action-column">
            <button class="standard-button -large -round">
              <sl-icon name="arrow-up"></sl-icon>
            </button>
          </div>
        </form>
      </div>
    `
  }

  const textArea = target.querySelector('[name="messageString"]')

  if(textArea.lastMessage !== messageString) {
    textArea.lastMessage = messageString
    textArea.value = messageString
  }

  if(textArea.messageHeight !== messageHeight) {
    textArea.messageHeight = messageHeight
    if(messageHeight) {
      textArea.style.height = `${messageHeight}px`
    } else {
      textArea.style.height = `auto`
    }
  }

  if(messages.length !== target.lastMessageCount) {
    target.lastMessageCount = messages.length
    const list = target.querySelector('.messages')

    list.innerHTML = `
      ${log}
      <div class="thinking-area"></div>
    `
  }

  if(namesOf(agents) !== target.namesOfAgents) {
    target.namesOfAgents = namesOf(agents)
    const { agentId } = $.learn()
    const selector = target.querySelector('.agent-selector-container')

    selector.innerHTML = renderAgentSelector(agentId)
  }


  if(thinking !== target.isThinking) {
    target.isThinking = thinking
    const thoughtContainer = target.querySelector('.loading-area')
    thoughtContainer.innerHTML = thinking ? `<div class="loading">
        <flying-disk></flying-disk>
      </div>
    ` : ''
  }
}

function namesOf(agents = {}) {
  return Object
    .keys(agents)
    .map(id => agents[id].name)
    .join(', ')
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


$.when('keypress', 'form [name="messageString"]', (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const message = event.target.value
    send.call(event.target.closest($.link), message)
  }
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const message = event.target.messageString.value
  send.call(event.target.closest($.link), message)
})

$.style(`
  & .chat-header {
    padding: .5rem;
    background: rgba(0,0,0,.85);
    color: white;
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
    display: grid;
    grid-template-columns: auto 1fr;
    text-align: right;
  }

  & .scroll-back {
    height: 100%;
    overflow: auto;
    position: relative;
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
    margin-right: 2rem;
    position: relative;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  & .message p {
    margin: 0;
  }

  & .message.-user {
    margin: 0 0 0 3rem;
    background: rgba(0,0,0,.1);
    padding: 4px .5rem;
    border-radius: 5px;
  }

  & .send-form {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: .5rem;
    gap: .5rem;
    position: relative;
  }

  & .send-form textarea {
    min-height: 3rem;
    max-height: 50vh;
  }

  & .action-column {
    display: flex;
    flex-direction: column;
    justify-content: end;
  }

  & .loading-area {
    position: absolute;
    top: -.5rem;
    left: .5rem;
    width: 2rem;
    height: 2rem;
    transform: translateY(-100%);
  }

  & .flying-disk {
    width: 100%;
    height: 100%;
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

$.when('focus', '[name="messageString"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
});

$.when('input', '[name="messageString"]', (event) => {
  $.teach({ messageHeight: event.target.scrollHeight })
})

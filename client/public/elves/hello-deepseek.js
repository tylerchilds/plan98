import elf from '@silly/elf'
import { marked } from 'marked'

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

const $ = elf('hello-deepseek', {
  messages: [],
  messageText: '',
  messageHeight: null
})

function send(message) {
  $.teach({ body: message, author: 'human' }, mergeMessage)
  const host = plan98.env.OLLAMA_HOST || 'http://localhost:11434'
  const url = host + "/api/generate";
  const headers = {
    "Content-Type": "application/json",
  }

  $.teach({ thinking: true, messageHeight: null, messageText: '' })

  fetch(url, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      model: "deepseek-r1:1.5b",
      prompt: message,
      stream: false
    })
  }).then((response) => response.text()).then((result) => {
    let { messages } = $.learn()
    const data = JSON.parse(result)
    messages = [...messages.map(identity), data.response]
    $.teach({ thinking: false })
    $.teach({ body: data.response, author: 'assistant' }, mergeMessage)
  }).catch(e => {
    console.error(e)
  })
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

function identity(x) { return x }

$.draw((target) => {
  const { messages, messageText, messageHeight, thinking } = $.learn()
  const log = messages.map((message) => `
    <div class="message -${message.author}">
      ${marked(message.body)}
    </div>
  `).join('')

  return `
    <div class="scroll-back">
      <div class="messages">
        ${log}
      </div>
    </div>
    <form>
      ${thinking ? `
        <div class="loading">
          <flying-disk></flying-disk>
        </div>
      ` : ''}
      <area class="fields">
        <div class="action-row">
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
  `
}, {
  beforeUpdate,
  afterUpdate
})

function beforeUpdate(target) {
  saveCursor(target)
}

function afterUpdate(target) {
  replaceCursor(target)

  {
    const { messages } = $.learn()
    if(target.lastIndex !== messages.length -1) {
      target.lastIndex = messages.length - 1
      const lastChild = target.querySelector('.messages .message:last-child')
      if(lastChild) {
        lastChild.scrollIntoView()
      }
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
    send(message)
  }
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const message = event.target.messageText.value
  send(message)
})

$.style(`
  & {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    overflow: hidden;
  }

  & form {
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & .action-row {
    background: rgba(0,0,0,.5);
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

  & .message.-human {
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


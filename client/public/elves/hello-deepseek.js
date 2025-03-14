import module from '@silly/tag'
import { marked } from 'marked'

const $ = module('hello-deepseek', {
  messages: []
})

function send(message) {
  const url = "http://localhost:11434/api/generate";
  const headers = {
    "Content-Type": "application/json",
  }

  $.teach({ thinking: true })

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
    $.teach({ messages, thinking: false})
  }).catch(e => {
    console.error(e)
  })
}

function identity(x) { return x }

$.draw((target) => {
  const { messages, thinking } = $.learn()
  const log = messages.map((message) => `
    <div class="message -${message.role}">
      ${marked(message)}
    </div>
  `).join('')

  return `
    <div>
      ${log}
    </div>
    <div>
      ${thinking ? 'Thinking...' : ''}
    </div>
    <form>
      <button>send</button>
      <textarea name="message"></textarea>
    </div>
  `
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const message = event.target.message.value
  send(message)
})

$.style(`
  & {

  }
  & .message {
    overflow: auto;
    border-bottom: 2px solid orange;
    border-radius: 1rem;
    padding: 0 1rem;
    position: relative;
  }

  & .message.-system {
    margin: 0 3rem;
  }

  & .message.-user {
    margin-left: 3rem;
    border-bottom-color: dodgerblue;
  }

  & .message.-assistant {
    margin-right: 3rem;
    border-bottom-color: rebeccapurple;
  }

  & .loading::before {
    content: '';
    position: absolute;
    animation: loader 1000ms alternate infinite;
    width: 3.25in;
    height: 3.12in;
    opacity: .5;
    mix-blend-mode multiply;
  }

  @keyframes &-loader {
    0% {
      background: transparent;
    }

    100% {
      background: lemonchiffon;
    }
  }


`)

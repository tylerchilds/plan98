import module from '@silly/tag'
import { marked } from 'marked'

const $ = module('hello-llm', {
  messages: [
    {
      role: "system",
      content: `You are LLAMAfile, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests.`
    },
    {
      role: "user",
      content: `Write javascript function that returns an html template with a header, footer, main, and aside tags.`
    }
  ]
})

function init(target) {
  if(target.initialized) { return }
  target.initialized = true
  const { messages } = $.learn()
  const url = "http://localhost:8080/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer no-key"
  }

  $.teach({ thinking: true })

  fetch(url, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      model: "LLaMA_CPP",
      messages
    })
  }).then((response) => response.text()).then((result) => {
    let { messages } = $.learn()
    const data = JSON.parse(result)
    messages = [...messages.map(identity), ...data.choices.map(x => x.message)]
    $.teach({ messages, thinking: false})
  })
}

function identity(x) { return x }

$.draw((target) => {
  init(target)
  const { messages, thinking } = $.learn()
  const log = messages.map((message) => `
    <div class="message -${message.role}">
      ${marked(message.content)}
    </div>
  `).join('')

  return `
    ${log}
    ${thinking ? '<div class="loading"></div>' : ''}
  `
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

import module from '@sillonious/module'
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
  if(target.initted) { return }
  target.inited = true
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
    <div class="message message-${message.role}">
      ${marked(message.content)}
    </div>
  `).join('')

  return `
    ${thinking}
    ${log}
  `
})

$.style(`
  & {

  }
  & .message {
    overflow: auto;
  }
`)

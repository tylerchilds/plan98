import module from '@silly/tag'
import geckos from '@geckos.io/client'

// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

const $ = module('geckos-client', { messages: [] })

const channel = geckos({ port: 5675 }) // default port is 9208

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  channel.on('chat message', data => {
    console.log(`You got the message ${data}`)
    $.teach(data, mergeMessage)
  })

  channel.emit('chat message', 'a short message sent to the server')
})

function mergeMessage(state, payload) {
  return {
    ...state,
    messages: [...state.messages, payload]
  }
}

$.draw(target => {
  const { messages } = $.learn()

  return messages.map(x => {
    return `
      <p>
        ${x}
      </p>
    `
  }).join('')
})

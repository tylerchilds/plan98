import module from '@silly/tag'
import geckos from '@geckos.io/client'

// or add a minified version to your index.html file
// https://github.com/geckosio/geckos.io/tree/master/bundles

const $ = module('geckos-client')

const channel = geckos({ port: 5675 }) // default port is 9208

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  // Event: When the client receives a message from the server
  channel.on('message', data => {
    console.log('Message from server:', data)
  })

  // Event: When the client is disconnected from the server
  channel.onDisconnect(() => {
    console.log('Disconnected from server')
  })

  // Join a room named "test"
  channel.join('test')

  // Emit a message to the room
  channel.emit('message', { id: 'player-1', position: { x: 100 }})
})

$.draw(target => {
  const data = $.learn()
  const positions = Object.keys(data).map(id => {
    const { x } = data[id]

    return `
      ${x}px
    `
  }).join('')

  return `
    ${positions}
  `
})

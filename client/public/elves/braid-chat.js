import module from '@silly/tag'

const $ = module('braid-chat', { name: "Braid User" })

function initialize(target) {
  if(target.initialized) return
  $.teach({ room: target.getAttribute('room') })
  target.initialized = true
}

$.draw(target => {
  initialize(target)

  const { name, room } = $.learn()

  const messages = state[room] || []

  const log = messages.map(({ from, body }) => `
      <div>${from}: ${body}</div>
    `).join('')

  return `
      ${log}
      <form>
        <input name="name" value="${name}" />
        <input name="message" />
        <button type="submit">Send</button>
      </form>
    `
})

$.when('change', '[name="name"]', (event) => {
  $.teach({
    name: event.target.value
  })
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  const { name, room } = $.learn()
  const { value } = event.target.message

  const messages = state[room] || []

  messages.push({
    from: name,
    body: value
  })
})


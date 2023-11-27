import formula, { state } from '@sillonious/formula'

const $ = formula('owncast-broadcast')

$.draw(target => {
  const host = target.getAttribute('host')
  const statusUrl = `${host}/api/status`

  subscribe(target, statusUrl)

  const { online } = latest(statusUrl)

  return `
    Stream is: ${online ? 'online' : 'offline'}
  `
})

function subscribe(target, statusUrl) {
  if(target.dataset.subscribed) {
    return
  }

  setTimeout(async () => {
    const url = `${window.location.protocol}//${statusUrl}`
    const response = await fetch(url, {
      mode: 'cors'
    }).then(r => r.json())
    state['ls/' + statusUrl] = response
  }, 1000) 

  target.dataset.subscribed = true
}

function latest(statusUrl) {
  return state['ls/' + statusUrl] || {}
}

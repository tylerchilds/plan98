import formula, { state } from '@sillonious/formula'

const $ = formula('owncast-broadcast')

$.draw(target => {
  subscribe(target)

  const { online } = latest()

  return `
    Stream is: ${online ? 'online' : 'offline'}
  `
})

function subscribe(target) {
  if(target.dataset.subscribed) {
    return
  }

  setInterval(async () => {
    state['ls/brother'] = await fetch('/plan98/about').then(r => r.json())
  }, 1000) 

  target.dataset.subscribed = true
}

function latest() {
  return (state['ls/brother'] || {}).broadcast || {}
}

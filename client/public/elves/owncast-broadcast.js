import module, { state } from '@silly/tag'

const $ = module('owncast-broadcast')

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
    state['ls/plan98/owncast'] = await fetch('/plan98/owncast').then(r => r.json())
  }, 1000) 

  target.dataset.subscribed = true
}

function latest() {
  return (state['ls/plan98/owncast'] || {}).broadcast || {}
}

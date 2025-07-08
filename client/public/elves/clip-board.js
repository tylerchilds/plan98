import module from '@silly/tag'
import { get, put } from './plan98-wallet.js'

const $ = module('clip-board', { value: '' })

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    line-height: 2rem;
  }

  & textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    padding: 1rem;
    line-height: 2rem;
    background: transparent;
  }

  & .page {
    height: 100%;
    line-height: 3rem;
    background: white;
    color: rgba(0,0,0,.85);
  }
`)

$.draw((target) => {
  subscribe(target)
  const { value } = $.learn()
  return `
    <div class="page">
      <textarea>${value?value:''}</textarea>
    </div>
  `
})

$.when('input', '.page textarea', async (event) => {
  const root = event.target.closest($.link)

  const clipboard = { history: [event.target.value] }

  $.teach({ value: event.target.value })
  put(getClipboard(root), JSON.stringify(clipboard), { type: 'application/json' })
})

function getClipboard(node) {
  return `/private/clip-board/${node.id}.json`
}

async function subscribe(target) {
  if(target.subscribed) return
  target.subscribed = true

  await get(getClipboard(target)).then(async response => {
    const clipboard = await response.text().then(str => JSON.parse(str))
    const { history } = clipboard

    if(history[0]) {
      $.teach({ value: history[0] })
    }
  }).catch(console.error).finally(() => {
    const q = target.getAttribute('q')
    const { value } = $.learn()

    if(q) {
      const prependedQuery = q + '\n' + value
      $.teach({ value: prependedQuery })
      const clipboard = { history: [prependedQuery] }
      put(getClipboard(target), JSON.stringify(clipboard), { type: 'application/json' })
    }
  })
}

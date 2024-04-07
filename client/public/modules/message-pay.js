import module from '@sillonious/module'

const $ = module('message-pay')

$.draw((target) => {
  initialize(target)
  const { ready } = $.learn()
  return ready ? `
    By Selecting "Buy Now" you will be guided to our third party payment provider. After completing the transaction, return to this page for confirmation.
    <button data-buy>Buy Now</button>
  ` : 'loading...'
})

async function initialize(target) {
  if(target.initialized) return
  target.initialized = true

  const { action, script } = target.dataset
  const payment = await (await import(script))[action]()
  $.teach({ payment, ready: true })
}

$.when('click', '[data-buy]', async (event) => {
  const { payment } = $.learn()
  window.open(payment.url, '_blank').focus();
})

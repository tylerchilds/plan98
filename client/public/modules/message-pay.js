import module from '@sillonious/module'
import { newPayment, getPaymentStatus } from '@sillonious/payments'
import { getCart } from './purchase-catalog.js'

function preference() {
  return {
    currency: 'EUR',
    country: 'NL',
    locale: 'nl-NL'
  }
}

const $ = module('message-pay')

$.draw((target) => {
  initialize(target)
  const { ready, buying, bought, payment } = $.learn()

  if(bought) {
    return `Transaction successful!`
  }

  if(buying) {
    return `
      Please <a href="${payment.url}">Complete the transaction</a> and this page will update with further instructions.
    `
  }

  return ready ? `
    By Selecting "Buy Now" you will be guided to our third party payment provider. After completing the transaction, return to this page for confirmation.
    <button data-buy>Buy Now</button>
  ` : 'loading...'
})

async function initialize(target) {
  if(target.initialized) return
  target.initialized = true
  const cart = getCart()
  const amount = cart.items.reduce((accumulator, current) => {
    return accumulator
  }, {value: 0, currency: preference().currency})
  const payment = await newPayment({
    amount,
    country: preference().country,
    locale: preference().locale,
    description: 'Blue Bag',
    reference: 'Test New Payment'
  })
  $.teach({ payment, ready: true })
}

async function checkPayment({id}) {
  const payment = await getPaymentStatus(id)
  if(!payment.error) {
    if(payment.status === 'completed') {
      const { timer } = $.learn()
      $.teach({ payment, bought: true })
      clearTimeout(timer)
    } else {
      $.teach({ payment })
    }
  }
}

$.when('click', '[data-buy]', async (event) => {
  const { payment } = $.learn()
  window.open(payment.url, '_blank').focus();
  const timer = poll(checkPayment, payment, 5 * 1000, 15 * 60 * 1000)
  $.teach({ buying: true, timer })
})

function poll(callback, number, every, until) {
  const loop = setInterval(() => callback(number), every)
  const timer = setTimeout(() => clearInterval(loop), until)
  return timer
}

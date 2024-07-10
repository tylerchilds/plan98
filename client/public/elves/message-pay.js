import module from '@silly/tag'
import { newPayment, getPaymentStatus } from '@sillonious/payments'
import { skuTable } from './purchase-catalog.js'
import { setupSaga } from './wizard-journey.js'
import { currentCart } from '../cdn/thelanding.page/game-state.js'

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
  const { ready, payment } = $.learn()

  return ready ? `
    Scan or take the note to  <a href="${payment.url}" target="_blank">Complete the transaction</a>.
    <button data-buy>
      <sticky-note>
        <qr-code text="${payment.url}" data-fg="saddlebrown"></qr-code>
      </sticky-note>
    </button>
  ` : 'loading...'
})

async function initialize(target) {
  if(target.initialized) return
  target.initialized = true
  const skus = Object.keys(currentCart().items)
  const amount = skus.map(x => skuTable[x]).reduce((accumulator, item, index) => {
    const quantity = currentCart().items[skus[index]]
    const { value, currency } = item.amount
    accumulator.value += convert(value * quantity, currency, accumulator.currency)
    return accumulator
  }, {value: 0, currency: preference().currency})
  const payment = await newPayment({
    amount,
    country: preference().country,
    locale: preference().locale,
    description: 'Blue Bag',
    reference: 'Test New Payment'
  })
  const timer = poll(target, checkPayment, payment, 1000, 15 * 60 * 1000)
  $.teach({ payment, ready: true, timer })
}

function convert(value, from, to) {
  // todo: actually respect currencies
  return value
}

async function checkPayment(target, {id}) {
  const payment = await getPaymentStatus(id)
  if(!payment.error) {
    if(payment.status === 'completed') {
      const { timer } = $.learn()
      $.teach({ payment })
      clearTimeout(timer)
      once(target, () => {
        setupSaga(target.getAttribute('saga'), target)
      })
    } else {
      $.teach({ payment })
    }
  }
}

function once(target, callback) {
  if(target.called) return
  target.called = true
  callback()
}

$.when('click', '[data-buy]', async (event) => {
  const { payment } = $.learn()
  window.open(payment.url, '_blank').focus();
})

function poll(target, callback, options, every, until) {
  const loop = setInterval(() => callback(target, options), every)
  const timer = setTimeout(() => clearInterval(loop), until)
  return timer
}

$.style(`

  & [data-buy] {
    display: block;
    border: 0;
    padding: 0;
    margin: 2rem auto;
    transition: box-shadow 100ms ease-in-out;
  }

  & [data-buy]:hover,
  & [data-buy]:focus {
    --shadow: 0px 0px 2px 2px rgba(0,0,0,.10),
      0px 0px 6px 6px rgba(0,0,0,.5),
      0px 0px 18px 18px rgba(0,0,0,.25);
  }

  & sticky-note {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-template-areas: "ss sc se" "cs cc ce" "es ec ee";
  }
  & qr-code {
    grid-area: cc;
  }
`)

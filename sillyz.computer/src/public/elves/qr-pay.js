import module from '@silly/tag'
import { newPayment, getPaymentStatus } from '@sillonious/payments'

const defaults = {
  currency: 'USD',
  country: 'US',
  locale: 'en-US',
  amount: '1000',
  description: 'Flying Disk Operating System',
  reference: 'Thank You'
}

const $ = module('qr-pay', { payments: {} })

$.draw((target) => {
  initialize(target)
  const { ready, payment, completed } = $.learn().payments[target.id] || {}

  if(completed) {
    target.innerHTML = 'Your purchase is complete. Thank You.'
    return
  }

  return ready ? `
    Scan the code or <a href="${payment.url}" target="_blank">Open a new window</a> to complete the transaction.
    <button>
      <qr-code text="${payment.url}" data-bg="rgba(255,255,255,.85)" data-fg="rgba(0,0,0,.85)"></qr-code>
    </button>
  ` : 'loading...'
})

async function initialize(target) {
  if(target.initialized) return
  target.initialized = true

  const amount = target.getAttribute('amount') || defaults.amount
  const currency = target.getAttribute('currency') || defaults.currency
  const locale = target.getAttribute('locale') || defaults.locale
  const country = target.getAttribute('country') || defaults.country
  const description = target.getAttribute('description') || defaults.description
  const reference = target.getAttribute('reference') || defaults.reference

  const payment = await newPayment({
    amount: {
      value: amount,
      currency
    },
    country,
    locale,
    description,
    reference
  })
  const timer = poll(target, checkPayment, payment, 1000, 15 * 60 * 1000)
  $.teach({ payment, ready: true, timer }, mergePayment(target.id))
}

async function checkPayment(target, {id}) {
  const payment = await getPaymentStatus(id)
  if(!payment.error) {
    if(payment.status === 'completed') {
      const { timer } = $.learn().payments[target.id]
      clearTimeout(timer)
      $.teach({ payment, completed: true }, mergePayment(target.id))
    } else {
      $.teach({ payment }, mergePayment(target.id))
    }
  }
}

$.when('click', 'button', async (event) => {
  const { payment } = $.learn().payments[event.target.closest($.link).id]
  window.open(payment.url, '_blank').focus();
})

function poll(target, callback, options, every, until) {
  const loop = setInterval(() => callback(target, options), every)
  const timer = setTimeout(() => clearInterval(loop), until)
  return timer
}

$.style(`
  & {
    display: block;
  }

  & button {
    display: block;
    width: 100%;
    max-width: 320px;
    cursor: pointer;
    background: transparent;
    border: none;
  }

  & button:hover {
    filter: brightness(.5)
  }
`)

function mergePayment(id) {
  return (state, payload) => {
    const oldStuff = state.payments[id] || {}
    return {
      ...state,
      payments: {
        ...state.payments,
        [id]: { 
          ...oldStuff,
          ...payload
        }
      }
    }
  }
}


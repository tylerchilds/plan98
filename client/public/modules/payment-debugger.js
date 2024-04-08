import module from '@sillonious/module'
import { showModal } from './plan98-modal.js'
function identity(x) { return x }

const $ = module('payment-debugger', {payments: []})

$.draw(() => {
  const { payments } = $.learn()
  return `
    <button data-new>
      New Payment
    </button>
    ${payments.map((x, index) => `
      <div class="payment ${x.status === 'completed' ? 'green' : 'lemonchiffon'}">
        <a href="${x.url}" target="_blank">
          ${x.status}
        </a>
        <button data-check="${x.id}">Check</button>
        <button data-more="${index}">Show More</button>
      </div>
    `).join('')}
  `
})

$.when('click', '[data-new]', async () => {
  const payment = await newPayment()
  if(!payment.error) {
    $.teach({ payments: [...$.learn().payments.map(identity), payment] })
  }
})

$.when('click', '[data-check]', async (event) => {
  const id = event.target.dataset.check
  const payment = await getPaymentStatus(id)

  if(!payment.error) {
    const { payments } = $.learn()
    const nextState = [...payments.map(identity)]

    const index = nextState.findIndex(x => x.id === id)
    nextState[index] = payment

    $.teach({ payments: nextState })
  }
})

$.when('click', '[data-more]', (event) => {
  const { more } = event.target.dataset
  const x = $.learn().payments[parseInt(more, 10)]
  showModal(`
    <sticky-note style="padding: 30%;">
      <pre>${JSON.stringify(x, null, 2)}</pre>
    </sticky-note>
  `)
})

export async function newPayment() {
  const { payment } = await fetch('/plan98/pay-by-link').then(res => res.json())

  if(payment) {
    return payment
  }

  return { error: true, note: 'Failed to create payment'}
}

export async function getPaymentStatus(id) {
  const { payment } = await fetch('/plan98/pay-by-link', {
    method: 'POST',
    body: JSON.stringify({
      id
    })
  }).then(res => res.json())

  if(payment) {
    return payment
  }

  return { error: true, note: 'No payment' }
}

$.style(`
  & .payment {

  }

  & .payment.green {
    background: green;
    color: white;
  }

  & .payment.lemonchiffon {
    background: lemonchiffon;
  }
`)

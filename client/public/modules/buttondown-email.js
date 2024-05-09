import module from '@silly/tag'

const $ = module('buttondown-email')

$.draw(() => {
  return `
    <form
      action="
        https://buttondown.email/api/emails/embed-subscribe/Sillyz.Computer
      "
      method="post"
      target="popupwindow"
      class="embeddable-buttondown-form"
    >
      <label for="email">Email</label>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
      />
      <input type="hidden" value="1" name="embed" />
      <input type="submit" value="Subscribe" />
    </form>
  `
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()

  const { payment } = await fetch('/plan98/subscribe', {
    method: event.target.method,
    body: JSON.stringify({
      "email":  event.target.email.value,
    })
  }).then(res => res.json())

  if(payment) {
    return payment
  }

  return { error: true, note: 'Failed to create payment'}
})

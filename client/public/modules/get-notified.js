import module from '@silly/tag'

const $ = module('get-notified')

$.draw((target) => {
  const { thinking, error, success } = $.learn()

  if(thinking) {
    return `
      <sticky-note>
        <hypertext-highlighter color="dodgerblue">
          The ELF Negotiator is Negotiating on your behalf...
        </hypertext-highlighter>
      </sticky-note>
    `
  }

  if(success) return `
    <hypertext-highlighter color="green" data-tooltip="Seriously, you're the best!">You're on the list. Messages are sent weekly.</hypertext-highlighter>
  `

  const maybeError = !error?'':`
    <hypertext-highlighter color="red">
      ${error}
    </hypertext-highlighter>
  `

  return `
    <div class="wrapper">
      <h1>Subscribe Now?</h1>
      <p>
        Curious to find out about who, what, where, or when you are here?
      </p>
      <p>
        Why Not?
      </p>
      <div>
        <div>
          ${maybeError}
        </div>
        <form
          action="
            https://buttondown.email/api/emails/embed-subscribe/Sillyz.Computer
          "
          method="post"
          target="popupwindow"
          class="embeddable-buttondown-form"
        >
          <label class="field">
            <span class="label">Email</span>
            <input
              name="email"
              placeholder="ty@sillyz.computer"
            />
          </label>
          <input type="hidden" value="1" name="embed" />
          <rainbow-action>
          <input type="submit" value="Subscribe" />
          </rainbow-action>
        </form>
      </div>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    background: rgba(255,255,255,.85);
  }
  & .wrapper{
    display: block;
    max-width: 6in;
    padding: 1rem;
    margin: 0 auto;
    color: rgba(0,0,0,.85);
    overflow: hidden;
  }
`)


$.when('submit', 'form', async (event) => {
  event.preventDefault()
  $.teach({ error: null, thinking: true })

  const { subscribe } = await fetch('/plan98/subscribe', {
    method: event.target.method,
    body: JSON.stringify({
      "email":  event.target.email.value,
    })
  }).then(res => res.json())

  if(subscribe.code) {
    $.teach({ thinking: false, error: subscribe.detail || subscribe.code })
    return
  }

  $.teach({ thinking: false, success: true })
})

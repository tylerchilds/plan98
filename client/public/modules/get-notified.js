import module from '@sillonious/module'

const $ = module('get-notified')

$.draw((target) => {
  const { thinking, error, success } = $.learn()

  if(thinking) {
    return `
      <sticky-not>
        <hypertext-highlighter color="dodgerblue">
          Thinking.
        </hypertext-highlighter>
      </sticky-not>
    `
  }

  if(success) return `
    <sticky-note>
      <hypertext-highlighter color="green" data-tooltip="Seriously, you're the best!">Consider yourself on the initiation path to wizardhood. Check your email and confirm your intentions.</hypertext-highlighter>
    </sticky-note>
  `

  const maybeError = !error?'':`
    <hypertext-highlighter color="red">
      ${error}
    </hypertext-highlighter>
  `

  return `
    <div class="wrapper">
      <h1>Get Notified!</h1>
      <p>
        The Landing Page's Wizards' Quests Digest is a "News" letter from a "Fictional" realm. In this world, technology is magic even kids can do.
      </p>
      <p>
        To avoid finding oneself on a Fools' Errand, consider subscribing today. For more information, visit <a href="https://thelanding.page" target="_blank">The Landing Page</a>.
      </p>
      <div>
        <div>
          ${maybeError}
        </div>
        <hypertext-highlighter color="orange" style="display: block;">
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
                type="email"
                name="email"
                required
                placeholder="ty@sillyz.computer"
              />
            </label>
            <input type="hidden" value="1" name="embed" />
            <rainbow-action>
            <input type="submit" value="Subscribe" />
            </rainbow-action>
          </form>
        </hypertext-highlighter>
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
  }
  & .wrapper{
    display: block;
    max-width: 6in;
    padding: 1rem;
    margin: 0 auto;
    color: saddlebrown;
    background: lemonchiffon;
    overflow: hidden;
  }

  & sticky-not {
    color: white;
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
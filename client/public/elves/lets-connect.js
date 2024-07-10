import module from '@silly/tag'
import { createClient } from '@supabase/supabase-js'

const $ = module('lets-connect')

$.draw((target) => {
  const url = target.getAttribute('url')
  const key = target.getAttribute('key')

  const { error, success } = $.learn()

  if(success) return `
    <img src="/cdn/tychi.me/photos/professional-headshot.jpg" style="display: block; width: 10rem; height: 10rem; border-radius: 100%; margin: 1rem 0;" alt="an avatar" />
    <hypertext-highlighter color="green" data-tooltip="Seriously, you're the best!">Your message has been delivered! Thanks for reaching out.</hypertext-highlighter>
  `

  const maybeError = !error?'':`
    <hypertext-highlighter color="red">
      I'm super sorry something went wrong.
    </hypertext-highlighter>
  `

  return `
    <div class="wrapper">
      <h1>Paper Nautiloids</h1>
      <p>
        An interactive art piece and medium created by one <hypertext-highlighter color="yellow">random guy on the internet</hypertext-highlighter>. Staying in touch would be super appreciated.
      </p>
      <p>
        If any of your experience was fun, I'd love to hear about it. Please leave your email and I will be in touch with updates!
      </p>

      <div>
        <div>
          ${maybeError}
        </div>
        <highlighter color="orange" style="display: block;">
          <form method="POST" data-url="${url}" data-key="${key}">
            <label class="field">
              <span class="label">Your Name</span>
              <input type="text" name="name" required />
            </label>
            <label class="field">
              <span class="label">Your Email</span>
              <input type="email" name="email" required/>
            </label>
            <label class="field">
              <span class="label">Optional nice words!</span>
              <textarea name="message"></textarea>
            </label>
            <rainbow-action style="float: right;">
              <button type="submit">
                Connect
              </button>
            </rainbow-action>
          </form>
        </highlighter>

      </div>

      Thanks,<br/>
      <div style="float: left;">
        <hypertext-variable monospace="0" casual="1" weight="100" slant="-15" cursive="1">
          <span style="font-size: 5rem; line-height: 1">Ty</span>
        </hypertext-variable>
      </div>
      <a href="https://tychi.me">
        <img src="/cdn/tychi.me/photos/professional-headshot.jpg" style="display: block; width: 10rem; height: 10rem; border-radius: 100%; margin: 1rem 0;" alt="an avatar" />
      </a>
    </div>
  `
})

$.style(`
  & {
    display: block;
  }
  & .wrapper{
    display: block;
    max-width: 6in;
    padding: 1rem;
    margin: 0 auto;
    color: white;
    background: rgba(0,0,0,.85);
    overflow: hidden;
  }
`)

$.when('submit', 'form', async event => {
  event.preventDefault()
  const { url, key } = event.target.dataset
  const supabase = createClient(url, key)

  const { name, email, message } = event.target

  const values = {
    name: name.value,
    email: email.value,
    message: message.value
  }

  try {
    const result = await supabase.from('contacts').insert(values)
    const response = result.error
      ? { error: result.error.message }
      : { success: true }

    $.teach(response)
  } catch(e) {
    $.teach({ error: e })
  }
})

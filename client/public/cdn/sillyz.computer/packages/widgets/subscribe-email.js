import { tag, createClient, MONDRIAN_HOST } from '/deps.js'
import '/packages/tags/rainbow-button.js'
import '/packages/tags/highlighter.js'

const $ = tag('subscribe-email')

$.render(() => {
  const { error, success } = $.read()

  if(success) return `
    <highlighter color="green" data-tooltip="Seriously, you're the best!">Your message is traveling to me at the speed of light!</highlighter>
  `

  const { supabaseUrl, supabaseKey } = bus.state[MONDRIAN_HOST + '/config.json']

  const maybeError = !error?'':`
    <highlighter color="red">
      I'm super sorry something went wrong.
    </highlighter>
  `

  return `
    <div>
      ${maybeError}
    </div>
    <highlighter color="orange" style="display: block;">
      <!-- this one is a netflix inside joke -->
      <form method="POST" data-url="${supabaseUrl}" data-key="${supabaseKey}">
        <label class="field">
          <input type="text" name="name" required />
          <span class="label">Your Name</span>
        </label>
        <label class="field">
          <input type="email" name="email" required/>
          <span class="label">Your Email</span>
        </label>
        <label class="field">
          <textarea name="message"></textarea>
          <span class="label">Optional nice words!</span>
        </label>
        <rainbow-button style="float: right;">
          <button type="submit">
            Connect
          </button>
        </rainbow-button>
      </form>
    </highlighter>
  `
})

$.on('submit', 'form', async event => {
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

    $.write(response)
  } catch(e) {
    $.write({ error: e })
  }
})

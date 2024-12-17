import elf from '@silly/elf'

const $ = elf('contact-form')

$.draw(() => {

  return `
    <form>
      <label class="field">
        <span class="label">name</span>
        <input name="name">
      </label>
      <label class="field">
        <span class="label">email</span>
        <input name="email">
      </label>
      <label class="field">
        <span class="label">message</span>
        <textarea name="message"></textarea>
      </label>
      <button type="submit">
        Send
      </button>
    </form>
  `
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()

  const name = event.target.name.value
  const email = event.target.email.value
  const message = event.target.message.value

  const data = {
    name,
    email,
    message
  }

  try {
    const response = await fetch(plan98.env.PLAN98_API_HOST + '/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    alert(result.message);
  } catch (error) {
    alert('Error submitting form.');
  }
})


$.style(`
  & textarea {
    resize: none;
  }

  & button {
    border: none;
    background: dodgerblue;
    color: white;
    border-radius: 0;
    padding: .5rem 1rem;
  }
`)

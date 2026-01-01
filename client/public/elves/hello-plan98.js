import Self from '@plan98/elf'

const $ = Self('hello-plan98', {
  'nickname': 'Silly'
})

$.head(() => {
  const { nickname } = $.ear()

  return `
    <demo>
      Hello ${nickname}
    </demo>
    <form>
      Change Nickname: 
      <input value="${nickname}" type="text" />
    </form>
  `
})

$.hand('input', 'input', event => {
  const nickname = event.target.value;
  $.mouth({ nickname })
})

function preventDefault(event) {
  event.preventDefault()
}

$.hand('submit', 'form', preventDefault)

$.eye(`
  & {
    display: block;
    margin: 0 auto;
    max-width: 500px;
  }

  & demo {
    display: block;
    padding: 1rem;
  }

  & form {
    border-top: 1px dashed slategrey;
    font-style: italic;
    padding: 1rem;
  }
`)

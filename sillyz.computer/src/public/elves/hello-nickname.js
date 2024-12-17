import module from '@silly/tag'

const $ = module('hello-nickname', {
  'nickname': 'Uncle Toto'
})

$.draw(() => {
  const { nickname } = $.learn()

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

$.when('keyup', 'input', event => {
  const nickname = event.target.value;
  $.teach({ nickname })
})

$.style(`
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

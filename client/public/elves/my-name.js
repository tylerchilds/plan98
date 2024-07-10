import module from '@silly/tag'


const $ = module('my-name', {
  'name': 'Silly',
})

$.draw(() => {
  const { name } = $.learn()

  return `
    <demo>
      ${name}
    </demo>
    <form>
      <input value="${name}" type="text" />
    </form>
  `
})

$.when('keyup', 'input', event => {
  const name = event.target.value;
  $.teach({ name })
})

$.style(`
  & {
    display: block;
    margin: 1rem 0;
  }
`)

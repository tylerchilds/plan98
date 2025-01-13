import module from '@silly/tag'
import supabase from '@sillonious/database'

const $ = module('supabase-social')

$.draw((target) => {
  const { error, success } = $.learn()

  return `
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

  const { name, email, message } = event.target

  const values = {
    email: email.value,
  }

  try {
    const { data, error } = await supabase
    .from('contacts')
    .insert(values)

    const response = error
      ? { error: error.message }
      : { success: true }

    $.teach(response)
  } catch(e) {
    $.teach({ error: e })
  }
})

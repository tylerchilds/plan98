import module from '@silly/tag'

const $ = module('shipping-details', { address: '', suggestions: [] })

$.draw(() => {
  const { suggestions, address, focused } = $.learn()

  return `
    <form>
    </form>
      `
})

$.when('submit', 'form', (event) => {
  event.preventDefault()
  alert($.learn().query)
})

$.when('click', '[data-suggestion]', event => {
  const { suggestions } = $.learn()
  const { suggestion } = event.target.dataset
  $.teach({ address: suggestions[suggestion] })
})

$.when('focus', 'input', event => {
  $.teach({ focused: true })
})

$.when('blur', 'input', event => {
  setTimeout(() => {
    $.teach({ focused: false })
  }, 200)
})

$.when('keyup', 'input', event => {
  const { value } = event.target;
  $.teach({ address: value })
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}`)
    .then(res => res.json())
    .then(function (data) {
        const suggestions = data.map(function (item) {
          return item.display_name;
        });
        $.teach({ suggestions })
    })
    .catch(function (error) {
        console.error(error);
    })
})

$.style(`
  & {
    display: block;
  }

  & .suggestions {
    display: none;
    position: relative;
    max-height: 300px;
  }

  & .suggestions.focused {
    display: block;
  }

  & .suggestion-box {
    position: absolute;
    inset: 0;
    height: 300px;
    max-height: 80vh;
    overflow: auto;
    z-index: 10;
  }

  & .suggestion-box button {
    background: dodgerblue;
    border: none;
    border-radius: 2rem;
    color: white;
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    filter: grayscale(1);
  }

  & .suggestion-box button:focus,
  & .suggestion-box button:hover {
    background: dodgerblue;
    color: white;
    filter: grayscale(0);
  }


  & [data-suggestion] {
    display: block;
  }

  & input {
    padding: .5rem;
    borde-radius: 1rem;
    width: 100%;
    display: block;
    margin: 1rem 0;
  }

  & form {
  }
`)

import tag from '@silly/tag'

const $ = tag('launch-world')

$.draw((target) => {
  return `
    <button>
      Giggle It
    </button>
  `
})

$.when('click', 'button', (event) => {
  window.location.href = `?world=${event.target.closest($.link).getAttribute("world")}`
})

$.style(`
  & {
    display: block;
    text-align: center;
  }

  & button {
    border: none;
    background-image: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    color: white;
    font-size: 2rem;
    font-weight: 1000;
    padding: 2rem;
    margin: 2rem auto;
    border-radius: 2rem;
  }

  & button:hover,
  & button:focus {
    background-color: rebeccapurple;
    box-shadow: 0px 0px 8px 8px rgba(0,0,0,.1);
  }
`)

import tag from '@silly/tag'

const $ = tag('plan98-banner')

$.draw((target) => {
  const pitch = target.getAttribute('pitch')
  const cta = target.getAttribute('cta')
  const world = target.getAttribute('world')

  return `
    <div class="banner-pitch">
      ${pitch}
    </div>
    <button data-world="${world}">
      ${cta}
    </button>
  `
})

$.when('click', '[data-world]', (event) => {
  const { world } = event.target.dataset
  window.location.href = `?world=${world}`
})


$.style(`
  & {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    background: dodgerblue;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(0,0,0,.25), rgba(0,0,0,.5), orange);
  }

  & button {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: dodgerblue;
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 1rem;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
  }

  & button:hover,
  & button:focus {
    background-color: rebeccapurple;
  }

  & .banner-pitch {
    padding: 1rem;
    display: inline-block;
  }
`)


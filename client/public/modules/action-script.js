import module from '@sillonious/module'

const $ = module('action-script')

$.draw(target => {
  if(target.querySelector('button')) return
  return `
    <button>
      ${target.innerHTML}
    </button>
  `
})

$.when('click', 'button', async (event) => {
  const root = event.target.closest($.link)
  const { action, script } = root.dataset
  const dispatch = (await import(script))[action]
  dispatch(event, root)
})

$.style(`
  & {
    display: block;
    text-align: right;
    margin: 1rem 0;
  }

  & button {
    background: transparent;
    border: 2px solid dodgerblue;
    color: dodgerblue;
    border-radius: 2rem;
    transition: all 100ms ease-in-out;
    padding: .5rem;
  }

  & button:focus,
  & button:hover {
    background: dodgerblue;
    color: white
  }
`)

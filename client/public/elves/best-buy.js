import module from '@silly/tag'
import { showModal } from './plan98-modal.js'

const $ = module('best-buy')

$.draw(target => `
  <div class="pitch">
    ${target.getAttribute('pitch')}
  </div>
  <rainbow-action>
    <button data-tag="${target.getAttribute('tag')}">
      ${target.getAttribute('action')}
    </button>
  </rainbow-action>
`)

$.when('click', '[data-tag]', (event) => {
  const { tag } = event.target.dataset
  showModal(`<${tag}></${tag}>`)
})

$.style(`
  & {
    text-align: center;
    padding: 3rem;
    font-size: 2rem;
    display: block;
    background: lemonchiffon;
  }

  & .pitch {
    margin: auto;
    max-width: 25ch;
  }

  & rainbow-action {
    margin-top: 2rem;
  }
`)

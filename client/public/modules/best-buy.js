import module from '@silly/tag'
import { showModal } from './plan98-modal.js'

const $ = module('best-buy')

$.draw(() => `
  <div class="pitch">
    The Best Deals Are Only Available At The Source
  </div>
  <rainbow-action>
    <button data-tag="wizard-journey">
      Buy Here
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

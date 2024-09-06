import elf from '@silly/tag'
import { handleSuperKey } from "@plan98/intro"
const $ = elf('plan98-logo')

$.draw(() => {
  return `
    <button type="button" data-super>
      <div class="plan98-letters">
        98
      </div>
      <div class="plan98-slants">
        <div class="slant-1"></div>
        <div class="slant-2"></div>
        <div class="slant-3"></div>
      </div>
    </button>
  `
})

$.when('click', '[data-super]', (event) => {
  event.preventDefault()
  handleSuperKey()
})

$.style(`
  & [data-super] {
    border: 5px solid var(--button-color, var(--blue));
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--color, var(--purple));
    position: relative;
    padding: 0;
  }

  & [data-super] .plan98-letters {
    font-size: 20px;
    border-bottom-width: 5px;
    position: absolute;
    bottom: 0;
    padding: 0;
    width: 100%;
    text-align: right;
    font-weight: 1000;
    padding: 5px;
    line-height: 1;
  }

  & [data-super] .plan98-slants {
    transform: skew(-25deg) translateX(5px);
  }
`)

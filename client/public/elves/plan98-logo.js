import elf from '@silly/tag'
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
  const e = new KeyboardEvent('keydown', {
    metaKey: true,     // Simulates the Meta key being pressed
    bubbles: true,     // The event will propagate up the DOM
    cancelable: true   // The event can be canceled
  });
  // Dispatch the event on the target element (e.g., document)
  document.dispatchEvent(e)
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

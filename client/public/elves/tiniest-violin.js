import { setInstrument } from './paper-pocket.js'
import elf from '@silly/elf'

setInstrument('violin')

const $ = elf('tiniest-violin')

$.draw(() => `
  <div class="violin-title">
    <button data-code class="standard-button bias-generic -small">
      tiniest violin
    </button>
  </div>
  <div class="violin-case">
    <plan98-palette escape="disabled"></plan98-palette>
  </div>
  <div class="violin-actions">
    <button data-full class="standard-button bias-generic -smol">Zoom</button>
    <button data-quit class="standard-button bias-negative -smol">Quit</button>
  </div>
`)

let full

$.when('click', '[data-full]', (event) => {
  full = !full
  const target = event.target.closest($.link)
  if(full) {
    target.dataset.full = true
  } else {
    delete target.dataset.full
  }
})

$.when('click', '[data-quit]', (event) => {
  window.location.href = '/app/sketch-pad'
})

$.when('click', '[data-code]', (event) => {
  window.location.href = '/app/was-code?src=/public/elves/tiniest-violin.js'
})

$.style(`
  & {
    display: grid;
    height: 100%;
    background: black;
    grid-template-rows: auto 1fr auto;
    text-align: center;
    user-select: none; /* supported by Chrome and Opera */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  & .violin-title {
    color: rgba(255,255,255,.85);
    padding: 2px;
    font-weight: bold;
  }

  & .violin-case {
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
  }

  & plan98-palette {
    width: 16px;
    height: 8px;
    transition: all 100ms ease-in-out;
  }

  &[data-full] plan98-palette {
    width: 100%;
    height: 100%;
  }

  & .violin-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 2px;
  }

  & [data-full] {
    place-self: start;
  }

  & [data-quit] {
    place-self: end;
  }

  & .action {
    border: none;
    border-radius: 0;
    background: transparent;
    color: white;
    text-decoration: underline;
    padding: .5rem;
  }

  & .action: {
    text-decoration: none;
  }
`)

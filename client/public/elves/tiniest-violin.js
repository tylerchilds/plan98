import { setInstrument } from './paper-pocket.js'
import elf from '@silly/elf'

setInstrument('violin')

const $ = elf('tiniest-violin')

$.draw(() => `
  <div class="violin-title">tiniest violin</div>
  <div class="violin-case">
    <plan98-palette escape="disabled"></plan98-palette>
  </div>
  <div class="violin-actions">
    <button data-full>Zoom</button>
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

$.style(`
  & {
    display: grid;
    height: 100%;
    background: black;
    grid-template-rows: auto 1fr auto;
    text-align: center;
  }

  & .violin-title {
    color: rgba(255,255,255,.85);
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

  & [data-full] {
    border: none;
    border-radius: 0;
    background: transparent;
    color: white;
    text-decoration: underline;
  }
`)

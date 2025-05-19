import elf from '@plan98/elf'

const $ = elf('plan98-palette')

$.draw(() => {
  return `
    <div class="colors">
      <div class="color" style="--color: var(--red, firebrick)"></div>
      <div class="color" style="--color: var(--orange, darkorange)"></div>
      <div class="color" style="--color: var(--yellow, gold)"></div>
      <div class="color" style="--color: var(--green, mediumseagreen)"></div>
      <div class="color" style="--color: var(--blue, dodgerblue)"></div>
      <div class="color" style="--color: var(--indigo, slateblue)"></div>
      <div class="color" style="--color: var(--violet, mediumpurple)"></div>
    </div>
    <div class="toppings">
      <div class="color" style="--color: rgba(255, 255, 255,1)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.85)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.65)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.5)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.35)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.15)"></div>
      <div class="color" style="--color: rgba(255, 255, 255,.05)"></div>
      <div class="color" style="--color: transparent"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.05)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.15)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.35)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.5)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.65)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,.85)"></div>
      <div class="color" style="--color: rgba(0, 0, 0,1)"></div>
    </div>
  `
})

$.style(`
  & {
    position: relative;
    display: grid;
    grid-template-areas: 'spot';
    height: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  & .colors {
    display: flex;
    grid-area: spot;
    flex-direction: column;
    height: 100%;
  }

  & .toppings {
    display: flex;
    grid-area: spot;
    height: 100%;
  }

  & .color {
    background-color: var(--color);
    width: 100%;
    height: 100%;
  }
`)

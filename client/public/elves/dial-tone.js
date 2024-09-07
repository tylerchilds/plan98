import elf from '@silly/tag'

const $ = elf('dial-tone', { root: 60 })

$.draw(() => {
  const { root } = $.learn()
  return `
      <div class="the-compass">
        <button class="root">
          ${root} C
        </button>
        <button class="plus-5">
          ${root + 5} F
        </button>
        <button class="plus-7">
          ${root + 7} G
        </button>
        <button class="plus-2">
          ${root + 2} D
        </button>
        <button class="plus-9">
          ${root + 9} A
        </button>
        <button class="plus-4">
          ${root + 4} E
        </button>
        <button class="plus-11">
          ${root + 11} B
        </button>
      </div>
  `
})

$.style(`
  & {
    display: block;
    height: 100%;
    background: black;
  }
  & .the-compass {
    display: grid;
    grid-template-columns: repeat(6, calc(100% / 6));
    grid-template-rows: repeat(6, calc(100% / 6));
    pointer-events: all;
    aspect-ratio: 1;
    margin: auto;
    max-height: 100%;
    top: 50%;
    position: relative;
    transform: translateY(-50%);
  }


  & .the-compass button {
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
    border: none;
    border-radius: 100%;
    color: white;
    background-image: radial-gradient(rgba(0,0,0,.85), rgba(0,0,0,.25));
  }
  & .the-compass button:hover {
    background-image: radial-gradient(rgba(255,255,255,.35), rgba(0,0,0,.15));
  }


  & .the-compass img {
    position: relative;
    z-index: 2;
		width: 100%;
		height: 100%;
  }
  & .the-compass button{
    padding: 0;
  }

  & .the-compass .plus-2 {
    grid-row: 3 / 5;
    grid-column: 5 / 7;
    background-color: mediumseagreen;
  }

  & .the-compass .plus-11 {
    grid-row: 3 / 5;
    grid-column: 1 / 3;
    background-color: yellow;
  }

  & .the-compass .plus-5 {
    grid-row: 1 / 3;
    grid-column: 2 / 4;
    background-color: red;
    transform: translateY(13%);
  }

  & .the-compass .plus-7 {
    grid-row: 1 / 3;
    grid-column: 4 / 6;
    background-color: orange;
    transform: translateY(13%);
  }

  & .the-compass .plus-4 {
    grid-row: 5 / 7;
    grid-column: 2 / 4;
    background-color: dodgerblue;
    transform: translateY(-13%);
  }

  & .the-compass .plus-9 {
    grid-row: 5 / 7;
    grid-column: 4 / 6;
    background-color: mediumpurple;
    transform: translateY(-13%);
  }


  & .the-compass .root {
    grid-row: 3 / 5;
    grid-column: 3 / 5;
    background-color: white;
  }
`)


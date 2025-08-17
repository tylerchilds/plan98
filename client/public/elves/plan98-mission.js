import elf from '@plan98/elf'

const $ = elf('plan98-mission')

$.draw(() => {
  return `
    <div class="canvas">
      <div class="paper">
        <plan98-icon></plan98-icon>
      </div>
    </div>
    <div class="brand">
      Plan98:Memex
    </div>
    <div class="positioning">
      Forget Forgetting
    </div>
  `
})

$.style(`
  & {
    height: 100%;
    background: black;
    color: white;
    display: grid;
    gap: 1rem;
    place-content: center;
    text-align: center;
  }

  & .canvas {
    display: grid;
    place-content: center;
  }

  & .paper {
    background: lemonchiffon;
    padding: 48px;
  }

  & .brand {
    font-size: 2rem;
    font-weight: bold;
  }
`)

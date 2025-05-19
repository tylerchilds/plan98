import elf from '@plan98/elf'

const $ = elf('plan98-icon')

$.draw(() => {
  return `
    <div class="crop">
      <div class="square">
        <div class="circle">
          <div class="iris">
            <div class="pupil">
            </div>
          </div>
        </div>
      </div>
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
    aspect-ratio: 1;
    margin: auto;
    background: rgba(255,255,255,.85);
    max-width: 100%;
    min-height: 48px;
    min-width: 48px;
  }

  & .crop {
    overflow: hidden;
    grid-area: spot;
    height: 100%;
    padding: 10%;
    background: rgba(0,0,0,.35);
    border-radius: 100%;
  }

  & .square {
    height: 100%;
    padding: 30%;
    background: 
      radial-gradient(circle at center,
        rgba(255,255,255,1) 0%,
        rgba(255,255,255,1) 35%,
        var(--red, firebrick) 35%,
        var(--red, firebrick) 40%,
        var(--orange, darkorange) 40%,
        var(--orange, darkorange) 45%,
        var(--yellow, gold) 45%,
        var(--yellow, gold) 50%,
        var(--green, mediumseagreen) 50%,
        var(--green, mediumseagreen) 55%,
        var(--blue, dodgerblue) 55%,
        var(--blue, dodgerblue) 60%,
        var(--indigo, slateblue) 60%,
        var(--indigo, slateblue) 65%,
        var(--violet, mediumpurple) 65%,
        var(--violet, mediumpurple) 70%,
        rgba(0,0,0,1) 70%,
        rgba(0,0,0,1) 100%);
  }

  & .circle {
    border-radius: 100%;
    padding: 10%;
    height: 100%;
    background: white;
  }

  & .iris {
    border-radius: 100%;
    padding: 20%;
    height: 100%;
    background: var(--root-theme, transparent);
  }

  & .pupil {
    border-radius: 100%;
    padding: 20%;
    height: 100%;
    background: black;
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

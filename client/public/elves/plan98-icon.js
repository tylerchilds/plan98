import { Self } from '@plan98/types'

const $ = Self('plan98-icon')

$.draw(() => {
  return `
    <div class="crop">
      <div class="square">
        <div class="circle">
          <div class="iris">
            <div class="pupil">
              <div class="nose"></div>
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
    max-width: 100%;
    height: 48px;
    width: 48px;
    background: black;
    border-radius: 100%;
    overflow: hidden;
  }

  & .crop {
    overflow: hidden;
    grid-area: spot;
    height: 100%;
    padding: 10%;
    background: black;
    border-radius: 100%;
  }

  & .square {
    height: 100%;
    padding: 30%;
    background: 
      radial-gradient(circle at center,
        rgba(255,255,255,1) 0%,
        rgba(255,255,255,1) 33%,
        var(--red, firebrick) 33%,
        var(--red, firebrick) 38%,
        var(--orange, darkorange) 38%,
        var(--orange, darkorange) 43%,
        var(--yellow, gold) 43%,
        var(--yellow, gold) 48%,
        var(--green, mediumseagreen) 48%,
        var(--green, mediumseagreen) 53%,
        var(--blue, dodgerblue) 53%,
        var(--blue, dodgerblue) 58%,
        var(--indigo, slateblue) 58%,
        var(--indigo, slateblue) 63%,
        var(--violet, mediumpurple) 63%,
        var(--violet, mediumpurple) 68%,
        rgba(0,0,0,1) 68%,
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
    display: grid;
    place-content: center;
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

  & .nose {
    width: 3px;
    height: 3px;
    background: lemonchiffon;
    position: relative;
    display: grid;
    place-content: center;
  }

  & .nose::before {
    content: '';
    width: 1px;
    height: 1px;
    background-color: #E83FB8;
    border-radius: 100%;
  }
`)

import elf from '@silly/elf'

const $ = elf('flying-disk')

$.draw(() => {
  return `
    <div class="track">
      <div class="disk"></div>
    </div>
  `
})

$.style(`
  & {
    display: block;
    overflow: hidden;
    animation: &-fading-background ease-in-out 500ms infinite alternate;
    border-radius: 1rem;
  }

  & .track {
    animation: &-sliding-track ease-in-out 1000ms infinite alternate;
    width: 100%;
    height: 2rem;
    display: grid;
    align-items: center;
  }

  & .disk {
    animation: &-flying-disk ease-in-out 1000ms infinite alternate;
    width: 1rem;
    height: 1rem;
    background: lemonchiffon;
  }

  @keyframes &-fading-background {
    0% {
      background: rgba(0,0,0,.85);
    }
    100% {
      background: rgba(0,0,0,.15);
    }
  }
  @keyframes &-sliding-track {
    0% {
      transform: translateX(0)
    }
    100% {
      transform: translateX(calc(100% - 1rem));
    }
  }


  @keyframes &-flying-disk {
    0% {
      transform: rotateX(0deg) rotateZ(0deg);
    }
    50% {
      transform: rotateX(30deg) rotateZ(1080deg);
    }

    100% {
      transform: rotateX(80deg) rotateZ(1540deg);
    }
  }
`)

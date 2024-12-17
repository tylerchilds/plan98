import elf from '@silly/tag'

const $ = elf('live-credit')

$.draw((target) => {
  return `
    <div class="piece">${target.getAttribute('piece')}</div>
    <div class="artist">${target.getAttribute('artist')}</div>
  `
})

$.style(`
  & {
    background: linear-gradient(-25deg, rgba(0,0,0,.85), rgba(0,0,0,.5));
    display: block;
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    animation: &-fade-in 1000ms ease-in-out forwards;
  }

  & .piece {
    color: rgba(255,255,255,.85);
    font-size: 2rem;
    margin-top: auto;
    font-weight: 700;
    text-shadow: 1px 1px black;
  }

  & .artist {
    color: rgba(255,255,255,.65);
    font-size: 1.5rem;
    text-shadow: 1px 1px black
  }

  & .artist:empty {
    display: none;
  }

  & .piece:empty {
    display: none;
  }


  @keyframes &-fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

`)

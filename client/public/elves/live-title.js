import elf from '@silly/tag'

const $ = elf('live-title')

$.draw((target) => {
  return `
    <div class="line">${target.getAttribute('line')}</div>
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
  
  & .line {
    color: rgba(255,255,255,.85);
    font-size: 2.25rem;
    text-shadow: 1px 1px black;
    font-weight: 1000;
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

import elf from '@silly/tag'

const $ = elf('live-graphic')

$.draw((target) => {
  return `
    <img src="${target.getAttribute('src')}" class="${target.getAttribute('position') || 'default'}">
  `
})

$.style(`
  & {
    display: block;
    height: 100%;
    width: 100%;
    animation: &-fade-in 1000ms ease-in-out forwards;
    position: relative;
  }

  & > img {
    position: absolute;
  }

  & .inset {
    inset: 32px;
    margin: auto;
  }

  & .default {
    inset: 0;
    margin: auto;
  }

  & .center {
    width: 50%;
    inset: 0;
    margin: auto;
  }

  & .full {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  & .top-left {
    max-width: 30%;
    position: absolute;
    top: 32px;
    left: 32px;
  }

  & .top-right {
    max-width: 30%;
    position: absolute;
    top: 32px;
    right: 32px;
  }

  & .bottom-left {
    max-width: 30%;
    position: absolute;
    bottom: 32px;
    left: 32px;
  }

  & .bottom-right {
    max-width: 30%;
    position: absolute;
    bottom: 32px;
    right: 32px;
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

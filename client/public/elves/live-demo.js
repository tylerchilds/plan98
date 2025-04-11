import elf from '@silly/tag'

const $ = elf('live-demo')

$.draw((target) => {
  return `
    <div class="title">
      ${target.getAttribute('title')}
    </div>
    <div class="code">
      <qr-code data-bg="lemonchiffon" data-fg="saddlebrown" src="${target.getAttribute('src')}"></qr-code>
    </div>
    <div class="preview">
      <iframe src="${target.getAttribute('src')}" class="${target.getAttribute('position') || 'default'}"></iframe>
    </div>
  `
})

$.style(`
  & {
    display: grid;
    height: 100%;
    width: 100%;
    animation: &-fade-in 1000ms ease-in-out forwards;
    position: relative;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr 1.618fr;
    grid-template-areas: "title preview" "code preview";
    background: lemonchiffon;
  }

  & .title {
    grid-area: title;
    font-size: 2rem;
    font-weight: bold;
    padding: 1rem;
  }
  & .code {
    grid-area: code;
    overflow: hidden;
    height: 100%;
    padding: 1rem;
    border-radius: 1rem;
    border: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    place-items: center;
  }

  & .preview {
    height: 100%;
    grid-area: preview;
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

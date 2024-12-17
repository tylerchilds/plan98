import tag from '@silly/tag'

const $ = tag('chroma-ratio')

$.draw((target) => {
  if(target.querySelector('iframe')) return

  const src = target.getAttribute('src')

  return `
    <div class="camera"></div>
    <iframe class="overlay" src="${src}"></iframe>
  `
})

$.style(`
  & {
    display: grid;
    background: var(--chroma-key, #54796d);
    grid-template-areas: "big small";
    grid-template-columns: 1.618fr 1fr;
    height: 100%;
  }

  &.flip {
    grid-template-areas: "small big";
    grid-template-columns: 1fr 1.618fr;
  }

  & .camera {
    grid-area: small;
  }

  & .overlay {
    grid-area: big;
  }
`)

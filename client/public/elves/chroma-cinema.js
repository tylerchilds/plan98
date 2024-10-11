import tag from '@silly/tag'

const $ = tag('chroma-cinema')

$.draw((target) => {
  if(target.querySelector('iframe')) return

  const src = target.getAttribute('src') || '/app/sillyz-computer'

  return `
    <iframe class="overlay" src="${src}"></iframe>
  `
})

$.style(`
  & {
    display: grid;
    place-content: center;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    background: black;
  }

  & .overlay {
    aspect-ratio: 2.35 / 1;
    width: 100%;
    background: #54796d;
  }

  &.invert {
    background: #54796d;
  }
`)

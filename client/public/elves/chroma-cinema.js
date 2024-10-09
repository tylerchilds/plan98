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
    background: #54796d;
    place-content: center;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
  }

  & .overlay {
    aspect-ratio: 2.35 / 1;
    width: 100%;
  }
`)

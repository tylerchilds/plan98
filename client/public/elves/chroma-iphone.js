import tag from '@silly/tag'

const $ = tag('chroma-iphone')

$.draw((target) => {
  if(target.querySelector('.device')) return

  const app = target.getAttribute('app')

  return `
    <div></div>
    <app-simulator class="iphone" app="${app}"></app-simulator>
  `
})

$.style(`
  & {
    display: grid;
    background: #54796d;
    grid-template-columns: 1.618fr 1fr;
    height: 100%;
    place-content: center;
  }
`)

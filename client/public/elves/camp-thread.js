import tag from '@silly/tag'

const $ = tag('camp-thread')

$.draw((target) => {
  const src = target.getAttribute('src')
  return `
    <a href="/app/simpleton-client?path=${src}">
      Goto:Editor
    </a>
    <simpleton-client path="${src}" mime="text/saga"></simpleton-client>
  `
})

$.style(`
  & {
    display: block;
    position: relative;
    height: 100%;
  }
  & [href^="/app/simpleton-client"] {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-0%, 150%) rotateZ(45deg);
    z-index: 3;
  }
  & simpleton-client {

  }
`)

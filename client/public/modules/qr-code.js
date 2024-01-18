import module from '@sillonious/module'
import QrCreator from 'qr-creator'

// utilize this to hop off the bifrost
function sleep(D) { return new Promise(x => setTimeout(x,D))}

const $ = module('qr-code')

$.draw(target => {
  const { image } = $.learn()
  const code = target.getAttribute('text')
  const { fg='black', bg='transparent' } = target.dataset
  generate(target, code, {fg, bg})
  return image ? `
    <div class="portal" style="--fg: ${fg}; --bg: ${bg}">
      ${image}
    </div>
  ` : 'loading...'
})

async function generate(target, code, {fg, bg}) {
  if(target.code === code) return
  target.code = code
  await sleep(1) // get this off the bifrost
  const node = document.createElement('div')

  QrCreator.render({
    text: code,
    radius: 0.5, // 0.0 to 0.5
    ecLevel: 'L', // L, M, Q, H
    fill: '#000000', // foreground color
    background: 'transparent', // color or null for transparent
    size: 1080 // in pixels
  }, node);

  const dataURL = node.querySelector('canvas').toDataURL()

  $.teach({ image: `<img src="${dataURL}" alt="code" />`})
}


$.style(`
  & {
    display: block;
    max-height: 100%;
    max-width: 100%;
    min-width: 120px;
    aspect-ratio: 1;
    position: relative;
  }
  & .portal {
    display: grid;
    height: 100%;
    place-content: center;
  }
  & img {
    position: absolute;
    inset: 0;
    max-height: 100%;
    margin: auto;
  }
`)

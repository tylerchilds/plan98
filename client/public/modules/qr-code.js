import module from '@sillonious/module'
import QrCreator from 'qr-creator'

const getBase64StringFromDataURL = (dataURL) =>
    dataURL.replace('data:', '').replace(/^.+,/, '');

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
  await sleep(1)
  if(target.code === code) return
  target.code = code
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
  const base64 = getBase64StringFromDataURL(dataURL);

  $.teach({ image: `<img src="${dataURL}" alt="code" />`})
}

function sleep(duration) {
  return new Promise(x => setTimeout(x,duration))
}

$.style(`
  & .portal {
    display: grid;
    height: 100%;
    place-content: center;
  }
`)

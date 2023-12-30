import module from '@sillonious/module'
import QrCreator from 'qr-creator'

const getBase64StringFromDataURL = (dataURL) =>
    dataURL.replace('data:', '').replace(/^.+,/, '');

const $ = module('qr-code')

$.draw(target => {
  const { image } = $.learn()
  const code = target.getAttribute('text')
  const { fg='black', bg='white' } = target.dataset
  generate(target, code)
  return image ? `
    <div class="portal" style="--fg: ${fg}; --bg: ${bg}">
      ${image}
    </div>
  ` : 'loading...'
})

async function generate(target, code) {
  await sleep(1)
  if(target.code === code) return
  target.code = code
  const node = document.createElement('div')

  QrCreator.render({
    text: code,
    radius: 0.5, // 0.0 to 0.5
    ecLevel: 'H', // L, M, Q, H
    fill: '#536DFE', // foreground color
    background: null, // color or null for transparent
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

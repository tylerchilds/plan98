import elf from '@silly/elf'
import QrCreator from 'qr-creator'

// utilize this to hop off the bifrost
function sleep(D) { return new Promise(x => setTimeout(x,D))}

const $ = elf('qr-code')

$.draw(target => {
  const codes = $.learn()
  const code = target.getAttribute('src') || target.getAttribute('text')
  const noLink = target.getAttribute('no-link') === 'true'
  const image = codes[code]
  const { fg='black', bg='white' } = target.dataset
  generate(target, code, {fg, bg})
  return image ? 
    noLink
      ? `
        <div class="portal" style="--fg: ${fg}; --bg: ${bg}">
          ${image}
        </div>
      `
      : `
      <a href="${code}" target="_top" class="portal" style="--fg: ${fg}; --bg: ${bg}">
        ${image}
      </a>
    ` : ''
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
    fill: fg, // foreground color
    background: bg, // color or null for transparent
    size: 1080 // in pixels
  }, node);

  const dataURL = node.querySelector('canvas').toDataURL()

  $.teach({ [code]: `<img src="${dataURL}" alt="code" />`})
}

$.style(`
  & {
    display: block;
    max-height: 100%;
    max-width: 100%;
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    margin: auto;
  }
  & .portal {
    display: flex;
    height: 100%;
    width: 100%;
    place-items: center;
    border: 0;
    background: transparent;
    border-radius: 0;
  }
  & img {
    max-height: 100%;
  }
`)

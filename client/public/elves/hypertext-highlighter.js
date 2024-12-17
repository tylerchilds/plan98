import elf from '@silly/elf'

const $ = elf('hypertext-highlighter')

const defaultColor = 'yellow'

$.draw((target) => {
  const text = target.getAttribute('text')
  const color = target.getAttribute('color') || defaultColor

  if(!target.css) {
    target.css = `
      &[color="${color}"]::before {
        background: ${color};
        border-radius: ${n(4, 0, 100, 'px')};
        content: '';
        inset: ${n(4, -.75, .1, 'rem')};
        position: absolute;
        opacity: ${n(1, .2, .35)};
        transform: rotate(${n(1, -7, 7, 'deg')}) scale(${n(1, .95, 1)});
      }
    `
    $.style(target.css)
    target.html = `<span>${text || target.innerHTML}</span>`
  }

  return target.html
})

$.style(`
  & {
    display: inline-block;
    position: relative;
    z-index: 1;
  }

  & span {
    position: relative;
    z-index: 1;
  }
`)

function n(times = 1, min = 0, max = 1, suffix = '') {
  return [...new Array(times)]
    .map(() => Math.random() * (max - min) + min)
    .map(x => `${x}${suffix}`)
    .join(' ')
}


import elf from '@silly/elf'
import Color from "colorjs.io";
import { doingBusinessAs as dba } from '@sillonious/brand'

export const doingBusinessAs = dba

const $ = elf('sillonious-brand', {
  host: window.location.host,
  council: '6174'
})

const standard = window.plan98 || { host: window.location.host }
export function currentBusiness(host = standard) {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  if(target.innerHTML) return
  if(target.getAttribute('innerHTML')) {
    return target.getAttribute('innerHTML')
  }

  return `
    <iframe src="/app/silly-wizard?dialect=en-us"></iframe>
  `
})

export function generateTheme(target, host, {reverse} = {}) {
  if(target.dataset.themed === 'true') {
    return $.learn()[host]
  }

  const {
    brandHue,
    brandRange,
  } = currentBusiness(host)

  const lightnessStops = [
    [5, 30],
    [20, 45],
    [35, 60],
    [50, 75],
    [65, 90],
    [80, 105],
    [95, 120]
  ]

  const colors = [...Array(16)].map((_, hueIndex) => {
    const step = ((brandRange / 16) * hueIndex)
    const hue = reverse
      ? brandHue - step
      : brandHue + step

    return lightnessStops.map(([l, c], i) => {
      const name = `--wheel-${hueIndex}-${i}`
      const value = new Color('lch', [l, c, hue])
        .display()
        .toString()

      return {
        name,
        value,
        block: hueIndex,
        inline: i
      }
    })
  })

  target.style = print(colors)
  target.dataset.themed = 'true'

  const fg = colors[0][2].value
  const bg = colors[0][6].value

  const data = { colors, bg, fg }

  $.teach({ [host]: data })
  return data
}

function print(colors) {
  return colors.flatMap(x => x).map(({ name, value }) => `
    ${name}: ${value};
  `).join('')
}

$.style(`
  & {
    position: relative;
    height: 100%;
    width: 100%;
    aspect-ratio: 1;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    display: block;
    /*cursor: url('/public/icons/gh057.svg') 0 0, auto;*/
    overflow: auto;
    background: transparent;
  }
`)

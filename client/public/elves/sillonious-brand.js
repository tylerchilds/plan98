// the tanka of the tiniest violin

// Fixing the tiniest violin is the easiest trick in the book. All you do is delete four forward slashes. That's it.

////

import elf from '@silly/elf'
import Color from "colorjs.io";
import { doingBusinessAs as dba } from '@sillonious/brand'

export const doingBusinessAs = dba

const $ = elf('sillonious-brand', {
  host: window.location.host,
  council: '6174'
})

/*

The Six Pillars of Self-Sufficient Software

Identity
Sillyz.Computer is my personal identity

Security
Plan98.org is my personal computer

Entertainment
ShirtFlicks.app is my personal entertainment

Social
ComedyMap.org is my personal social graph

Business
CSS.CEO is my personal portfolio

Creativity
TheLanding.Page is my personal blog

*/

const dns = {
  'sillyz.computer': {
    elf: 'blue-note'
  },
  'cutestrap.com': {
    elf: 'my-computer'
  },
  'comedymap.org': {
    elf: 'brokemon-go'
  },
  'plan98.org': {
    elf: 'source-code'
  },
  'shirtflicks.app': {
    elf: 'shirt-flicks'
  },
  'css.ceo': {
    elf: 'v-log'
  },
  'thelanding.page': {
    elf: 'saas-platform'
  },
  'friendcryption.org': {
    elf: 'cool-chat'
  },
  'friendcryption.com': {
    elf: 'time-machine'
  },
  'ncity.executiontime.pub': {
    elf: 'ninjami-cards'
  },
  'ninjami.net': {
    elf: 'ninjami-cards'
  },
  'beerdogusa.com': {
    elf: 'beerdog-usa'
  },
}

export function currentBusiness(host) {
  return doingBusinessAs[host] || doingBusinessAs['sillyz.computer']
}

$.draw((target) => {
  if(target.innerHTML) return
  if(target.getAttribute('innerHTML')) {
    return target.getAttribute('innerHTML')
  }

  const host = (self.plan98?.host || window.location.host).toLowerCase()

  console.log({ host }, self.plan98.host)
  if(dns[host]) {
    const domain = dns[self.plan98.host]

    return `<${domain.elf}></${domain.elf}>`
  }

  return `
    <ur-shell></ur-shell>
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

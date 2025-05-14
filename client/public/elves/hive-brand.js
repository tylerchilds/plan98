import elf from '@silly/elf'
import { doingBusinessAs as dba } from '@sillonious/brand'
import Color from "colorjs.io";

const themes = ['transparent', 'lightgray', 'firebrick','darkorange','gold','mediumseagreen','dodgerblue','mediumpurple']

const fontSizes = ['tiny', 'small', 'regular', 'large', 'huge']
const fontSizeMap = {
  tiny: '10px',
  small: '13px',
  regular: '16px',
  large: '18px',
  huge: '21px',
}

const fontFamilies = ['inter', 'recursive', 'arial', 'verdana', 'helvetica', 'tahoma', 'times new roman', 'georgia', 'garamond', 'palatino']
const fontFamilyMap = {
  inter: "'Inter', 'Avenir', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', 'Verdana', sans-serif",
  recursive: "'Recursive', 'Avenir', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', 'Verdana', sans-serif",
  arial: "'Arial', sans-serif",
  verdana: "'Verdana', sans-serif",
  helvetica: "'Helvetica', sans-serif",
  'times new roman': "'Times New Roman', serif",
  georgia: "'Georgia', serif",
  garamond: "'Garamond', serif",
  palatino: "'Palatino', serif",
}

export const doingBusinessAs = dba

const $ = elf('hive-brand', {
  host: window.location.host,
  theme: localStorage.getItem('paper-pocket/theme') || 'transparent',
  fontSize: localStorage.getItem('paper-pocket/fontSize') || 'regular',
  fontFamily: localStorage.getItem('paper-pocket/fontFamily') || 'inter',
  council: '6174'
})

export function getFontSizeOptions() {
  return fontSizes
}

export function setFontSize(fontSize) {
  localStorage.setItem('paper-pocket/fontSize', fontSize)
  $.teach({ fontSize })
}

export function getFontSize() {
  return $.learn().fontSize || 'regular'
}

export function getFontFamilyOptions() {
  return fontFamilies
}

export function setFontFamily(fontFamily) {
  localStorage.setItem('paper-pocket/fontFamily', fontFamily)
  $.teach({ fontFamily })
}

export function getFontFamily() {
  return $.learn().fontFamily || 'recursive'
}

export function getThemes() {
  return themes
}

export function setTheme(theme) {
  localStorage.setItem('paper-pocket/theme', theme)
  $.teach({ theme })
}

export function getTheme() {
  return $.learn().theme || 'lightgray'
}

const standard = window.plan98 || { host: window.location.host }
export function currentBusiness(host = standard) {
  return doingBusinessAs[host] || doingBusinessAs['hivelabworks.com']
}

$.draw((target) => {
  if(target.innerHTML) return
  if(target.getAttribute('innerHTML')) {
    return target.getAttribute('innerHTML')
  }

  return `
    <iframe src="/sagas/hivelabworks.com/en-us/memex.saga"></iframe>
  `
}, {
  afterUpdate: (target) => {
   {
      const { theme } = $.learn()
      if(target.theme !== theme) {
        console.log(theme)
        target.theme = theme
        document.body.style.setProperty('--root-theme', theme)
      }
    }

    {
      const { fontSize } = $.learn()
      if(target.fontSize !== fontSize) {
        target.fontSize = fontSize
        document.documentElement.style.setProperty('--font-size-root', fontSizeMap[fontSize])
      }
    }

    {
      const { fontFamily } = $.learn()
      if(target.fontFamily !== fontFamily) {
        target.fontFamily = fontFamily
        document.documentElement.style.setProperty('--font-family', fontFamilyMap[fontFamily])
      }
    }
  }
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

import elf from '@silly/tag'
import { render } from '@sillonious/saga'

const weird = '/public/sagas/living-impaired.thelanding.page/weird-variety-oct-2024.saga'

const $ = elf('slide-show', {
  activeShot: 0,
  shotCount: 0,
  forwards: true
})

function useMacGuffin(macGuffin) {
  const {
    previousReality,
    reality
  } = $.learn()

  if(previousReality === macGuffin) {
    return reality
  }

  fetch(macGuffin)
    .then(origin => {
      return origin.text()
    })
    .then(async present => {
      const supervisedReality = render(present)
      $.teach({
        previousReality: macGuffin,
        reality: supervisedReality,
        shotCount: countShots(supervisedReality)
      })
    })

  return previousReality
}

$.draw((target) => {
  const macGuffin = target.getAttribute('saga') || weird
  const quest = useMacGuffin(macGuffin) || ''
  const { activeShot, forwards } = $.learn()

  const slide = getSlide(quest, { index: activeShot, forwards })

  target.innerHTML = `
    <div class="lightbox">
      ${slide}
    </div>
  `
})

const hiddenChildren = ['style','script','hypertext-blankline','hypertext-comment']
const notHiddenChildren = `:not(${hiddenChildren})`
function countShots(instructions) {
  const wrapper= document.createElement('div');
  wrapper.innerHTML = instructions
  let list = Array.from(wrapper.querySelector('xml-html').children)

  list = list.filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  return list.length - 1
}

function getSlide(html, { forwards, index=0 }) {
  if(!html) return''
  const wrapper= document.createElement('div');
  wrapper.innerHTML = html;
  const children = Array.from(wrapper.querySelector('xml-html').children)
    .filter(x => !hiddenChildren.includes(x.tagName.toLowerCase()))

  if(children[index]) {
    children[index].dataset.active = true
  }
  const slice = children.slice(index, index+1).map(x => {
    x.setAttribute('name','beat')
    return x
  })
  if(slice.length === 0) return ''

  const options = { width: 1920, height: 1080, forwards }
  return toVfx(slice, options)
}

function toVfx(slice, options) {
  let beats = options.forwards ? slice : reverse(slice.reverse())
  if(beats[0].matches(':not([data-active])')) {
    beats[0].dataset.animateOut = true
  }

  if(beats[beats.length-1].matches(':not([data-active])')) {
    beats[beats.length-1].dataset.animateIn = true
  }

  return (options.forwards ? beats : slice.reverse())
    .map(x => {;return x.outerHTML}).join('')
}

function reverse(beats) {
  return beats.map(x => {x.dataset.reverse = true; return x;})
}

window.addEventListener('keydown', (event) => {
  const down = 40;
  const up = 38;
  const left = 37;
  const right = 39;
  const { activeShot, shotCount } = $.learn()
  if(event.keyCode === right || event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (activeShot === null) ? 0 : activeShot + 1
    if(nextIndex >= shotCount -1) return
    $.teach({ activeShot: nextIndex, forwards: false })
    return
  }

  if(event.keyCode === up || event.keyCode === left) {
    event.preventDefault()
    const nextIndex = (activeShot === null) ? shotCount - 2 : activeShot - 1
    if(nextIndex < 0) return
    $.teach({ activeShot: nextIndex, forwards: true })
    return
  }
})

$.style(`
  & {
    display: block;
    width: 100%;
    height: 100%;
    overflow: auto;
    opacity: 1;
    transition: opacity 100ms ease-in-out;
    position: relative;
    background: #54796d;
  }

  & .lightbox {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }

  &.lower-third .lightbox {
    top: auto;
    height: 33%;
  }
`)


import module from '@silly/tag'

const iconCache = {}

const $ = module('cinematic-icon')

$.draw((target) => {
  if(!target.innerHTML) return 'ok'
})

function start(target) {
  const src = target.getAttribute('src')
  if(iconCache[src]) {
    return iconCache[src]
  }

  fetch(src)
    .then(res => res.text())
    .then(svg => {
      iconCache[src] = svg
      target.innerHTML = svg
    })
  return '¿'
}

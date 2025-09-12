import elf from '@silly/elf'

const $ = elf('cdn-video')

const cdn = self.plan98.env.HEAVY_ASSET_CDN_URL

$.draw((target) => {
  const src = target.getAttribute('src')
  const autoplay = target.getAttribute('autoplay') === "true" || false
  const controls = target.getAttribute('controls') === "true" || false
  const loop = target.getAttribute('loop') === "true" || false
  if(target.innerHTML) return
  return `
    <hls-video ${loop?`loop="true"`:''} id="${src}" src="${cdn}${src}" autoplay="${autoplay}" controls="${controls}"></hls-video>
  `
})

$.style(`
  & {
    width: 100%;
    max-height: 100%;
    overflow: hidden;
    display: block;
  }
`)

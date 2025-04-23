import elf from '@silly/elf'

const $ = elf('cdn-video')

const cdn = self.plan98.env.HEAVY_ASSET_CDN_URL

$.draw((target) => {
  const src = target.getAttribute('src')
  return `
    <hls-video src="${cdn}${src}"></hls-video>
  `
})

$.style(`
  & {
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    display: block;
  }
`)

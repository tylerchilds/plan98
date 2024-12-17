import elf from '@silly/elf'

const $ = elf('media-plexer')

const renderers = {
  'saga': sagaRenderer,
  'jpg': iframeRenderer,
  'svg': iframeRenderer,
  'css': codeRenderer,
  'js': codeRenderer,
  'html': codeRenderer,
  'md': markdownRenderer,
  'mp3': audioRenderer,
  'wav': audioRenderer,
  'mp4': videoRenderer,
  'mov': videoRenderer,
  'm3u8': hlsRenderer,
  'csv': csvRenderer,
}

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

$.draw((target) => {
  const [path, _args] = source(target).split('?')
  const extension = path.split('.').pop()
  const renderer = renderers[extension.toLowerCase()] || (() => `<sillyz-computer error="format to be defined: ${extension}" src="${path}"></sillyz-computer>`)
  return renderer(path)
})

function iframeRenderer(path) {
  return `<iframe src="${path}" title="${path}"></iframe>`
}

function codeRenderer(path) {
  return `<code-module src="${path}"></code-module>`
}

function sagaRenderer(path) {
  return `
    <hyper-script src="${path}"></hyper-script>
  `
}

function markdownRenderer(path) {
  return `
    <mark-down src="${path}"></mark-down>
  `
}

function audioRenderer(path) {
  return `
    <audio src="${path}" controls="true"></audio>
  `
}

function videoRenderer(path) {
  return `
    <video src="${path}" controls="true"></video>
  `
}

function hlsRenderer(path) {
  return `
    <hls-video src="${path}" controls="true"></hls-video>
  `
}

function csvRenderer(path) {
  return `
    <spread-sheet src="${path}"></spread-sheet>
  `
}


$.style(`
  & {
    display: grid;
    background: black;
    place-items: center;
    height: 100%;
  }
`)

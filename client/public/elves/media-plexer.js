import elf from '@silly/elf'

const $ = elf('media-plexer')

const renderers = {
  'saga': sagaRenderer,
  'jpg': imageRenderer,
  'gif': imageRenderer,
  'svg': iframeRenderer,
  'txt': codeRenderer,
  'css': codeRenderer,
  'json': codeRenderer,
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
  const url = source(target)
  const [path, _args] = url.split('?')
  const alt = target.getAttribute('alt')
  const extension = path.split('.').pop()
  const renderer = renderers[extension.toLowerCase()] || ((path) => `<div class="fallback"><a target="_blank" href="${url}">${alt || url}</a></div>`)
  return renderer(path)
})


function imageRenderer(path) {
  return `<img src="${path}" alt="${path}"></img>`
}

function iframeRenderer(path) {
  return `<iframe src="${path}" title="${path}"></iframe>`
}

function codeRenderer(path) {
  return `<was-code src="${path}"></was-code>`
}

function sagaRenderer(path) {
  return `
    <hello-as2 src="${path}"></hello-as2>
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
    max-height: 100%;
    height: 100%;
  }

  & .fallback {

    padding: 1rem;
  }

  & .fallback a:link,
  & .fallback a:visited {
    text-decoration: none;
    background: linear-gradient(135deg, rgba(255,255,255,.05), rgba(255,255,255,.35)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  & .fallback a:hover,
  & .fallback a:focus {
    background: linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.75)), var(--root-theme, mediumseagreen);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`)

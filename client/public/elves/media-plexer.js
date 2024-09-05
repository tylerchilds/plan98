import module from '@silly/tag'

const $ = module('media-plexer')

const renderers = {
  'saga': sagaRenderer,
  'jpg': iframeRenderer,
  'svg': iframeRenderer,
  'css': codeRenderer,
  'js': codeRenderer,
  'html': codeRenderer
}

function source(target) {
  return target.closest('[src]').getAttribute('src')
}

$.draw((target) => {
  const [path, _args] = source(target).split('?')
  const extension = path.split('.').pop()
  const renderer = renderers[extension] || iframeRenderer
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

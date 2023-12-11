import module from '@sillonious/module'

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
  const path = source(target)
  const extension = path.split('.').pop()
  const renderer = renderers[extension] || iframeRenderer
  return renderer(path)
})

function iframeRenderer(path) {
  return `<iframe src="${path}" title="${path}"></iframe>"`
}

function codeRenderer(path) {
  return `<code-module src="${path}"></code-module>`
}

function sagaRenderer(path) {
  const readonly = parameters.get('readonly')
  const presentation = parameters.get('presentation')
  return `
    <hyper-script
      src="${path}"
      ${readonly ? 'readonly="true"' : ''}
      ${presentation ? 'presentation="true"' : ''}
    ></hyper-script>
  `
}

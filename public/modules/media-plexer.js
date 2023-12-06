import module from '@sillonious/module'

const $ = module('media-plexer')

const renderers = {
  'saga': (path) => {
    const readonly = parameters.get('readonly')
		const presentation = parameters.get('presentation')
    return `
      <hyper-script
        src="ls${path}"
        ${readonly ? 'readonly="true"' : ''}
        ${presentation ? 'presentation="true"' : ''}
      ></hyper-script>
    `
  },
  'js': (path) => {
    return `<code-module src="${path}"></code-module>`
  }
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

import tag from '@silly/tag'

const $ = tag('source-code')

$.draw(() => {
  const entries = performance.getEntriesByType('resource');

  const nautiloids = entries.map((entry) => {
    const local = entry.name.includes(window.location.origin)
    return local ? entry.name.split(window.location.origin)[1] : entry.name;
  });

  return `
    <code-module src="/public/index.html" stack="${[...new Set(['/public/index.html', ...nautiloids])]}"></code-module>
  `
})

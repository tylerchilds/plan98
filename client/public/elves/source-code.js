import tag from '@silly/tag'

const $ = tag('source-code')



$.draw((t) => {
  const entries = performance.getEntriesByType('resource');

  const nautiloids = entries.map((entry) => {
    const local = entry.name.includes(window.location.origin)
    return local ? entry.name.split(window.location.origin)[1] : entry.name;
  });

  return `
    <was-code src="${t.getAttribute('src')|| '/public/plan98.js'}" stack="${[...new Set(['/public/index.html', ...nautiloids])]}"></was-code>
  `
})

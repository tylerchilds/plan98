import lunr from 'lunr'

const Types = {
  File: { type: 'File' },
  Directory: { type: 'Directory' },
}

export function buildIndex(plan98) {
  const documents = []

  const idx = lunr(function () {
    this.ref('path')
    this.field('path')
    this.field('keywords')
    this.field('type')
    this.field('name')
    this.field('extension')

    nest(this, documents, { pathParts: [], subtree: plan98 })
  })

  return { index: idx.toJSON(), documents }
}

function nest(idx, documents, { pathParts = [], subtree = {} }) {
  if (!subtree.children) return

  for (const child of subtree.children) {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = '/' + currentPathParts.join('/').replace(/^\/+/, '')

    if (type === Types.File.type) {
      const node = {
        path: currentPath,
        keywords: currentPathParts.join(' '),
        name,
        type,
        extension,
      }
      idx.add(node)
      documents.push(node)
    }

    if (type === Types.Directory.type) {
      nest(idx, documents, { pathParts: currentPathParts, subtree: child })
    }
  }
}

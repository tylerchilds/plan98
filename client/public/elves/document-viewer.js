import elf from '@silly/elf'
import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const emptyViewer = {
  rawHTML: ""
}

const $ = elf('document-viewer')

function read($, id) {
  return $.learn()[id] || emptyViewer
}

function write($, id, data, merge = (node, data, key) => {
  node.get(key).put(data[key])
}) {
  Object
    .keys(data)
    .forEach(key => {
      const entry = gun.get($.link).get(id)
      merge(entry, data, key)
    })
}

$.draw(target => {
  if(! target.subscribed) {
    target.subscribed = true
    const entry = gun.get('document-editor').get(target.id)
    entry.open((data) => {
      $.teach({[target.id]: data })
    });
  }

  const data = $.learn()[target.id]
  if(!data) return
  return data.rawHTML
})

export function editorById(id) {
  return read($, id)
}

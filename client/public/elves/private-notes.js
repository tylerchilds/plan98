import elf from '@silly/elf'
import { user as person, subscribe, save, load } from './my-journal.js'
import 'gun'
import 'gun/open'
const gun = window.Gun(['https://gun.1998.social/gun']);

const $ = elf('private-notes')

function read($, id) {
  return $.learn()[id] || {}
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

function update(id, data) {
  $.teach({[id]: data})
}

$.draw((target) => {
  subscribe($, target, update)
  const data = load($, target.id, update)
  const list = Object.keys(data)
  return `
    <button data-new>New Note</button>
    <div class="list">
      ${list.map((id) => {
        return `
          <button class="preview" data-view="document-editor" data-id="${id}">
            <document-viewer id="${id}"></document-viewer>
          </button>
        `
      }).join('')}
    </div>
  `
}, {
  afterUpdate: (target) => {
    { // recover icons from the virtual dom
      [...target.querySelectorAll('document-editor')].map(node => {
        const nodeParent = node.parentNode
        const doc = document.createElement('document-editor')
        doc.id = node.id
        node.remove()
        nodeParent.appendChild(doc)
      })
    }
  }
})

$.when('click', '[data-new]', (event) => {
  const root = event.target.closest($.link)
  const id = self.crypto.randomUUID()
  const data = {
    id,
    createdAt: new Date().toJSON()
  }
  save($, root.id, {
    [id]: data
  })
  const cache = load($, root.id, function callback(id, data) {
    $.teach({[id]: data})
  })
  console.log(cache)
})

$.when('click', '.preview', (event) => {
  const { view, id } = event.target.dataset
  showModal(`
    <div style="background: white; height: 100%;">
      <div style="margin: auto; max-width: 55ch;">
      <${view} id="${id}"></${view}>
      </div>
    </div>
  `)
})

$.style(`
  & .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  & .preview {
    border: 1px solid rgba(0,0,0,.25);
    border-radius: 3px;
    background: white;
    color: rgba(0,0,0,.65);
    width: 100%;
    aspect-ratio: 2/3;
    text-overflow: ellipsis;
    overflow: hidden;
    display: grid;
    text-align: left;
    max-height: 220px;
  }

  & .preview:hover,
  & .preview:focus {
    color: rgba(0,0,0,.85);
  }

`)

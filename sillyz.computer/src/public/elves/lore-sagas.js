import tag from '@silly/tag'
import lunr from 'lunr'

const Types = {
  File: {
    icon: '/cdn/plan98/plan9.png',
    type: 'File',
    actions: [
      ['data-move', 'Move'],
      ['data-remove', 'Remove']
    ]
  },
  Directory: {
    icon: '/cdn/plan98/firefox.png',
    type: 'Directory',
    actions: [
      ['data-', 'Create Bag'],
      ['data-trinket', 'Create trinket'],
      ['data-move', 'Move'],
      ['data-remove', 'Remove']
    ]
  },
  Help: {
    type: 'Help',
    actions: [
      ['data-debugger', 'Debugger'],
      ['data-live', 'Live'],
      ['data-reset', 'Factory Reset'],
    ]
  }
}

let idx
const documents = [];

(async function buildIndex() {
  try {
    const { plan98 } = await fetch(`/plan98/about`)
      .then(res => res.json())

    idx = lunr(function () {
      this.ref('path')
      this.field('path')
      this.field('type')
      this.field('name')
      this.field('extension')

      nest(this, { tree: plan98, pathParts: [], subtree: plan98 })
    })
    $.teach({ ready: true })
  } catch (e) {
    console.info('Build: Failed')
    console.error(e)
    return
  }
})()

function nest(idx, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.File.type) {
      const node = {
        path: currentPath,
        name,
        type,
        extension
      }
      idx.add(node)
      documents.push(node)
    }

    if(type === Types.Directory.type) {
      nest(idx, { tree, pathParts: currentPathParts, subtree: child })
    }

    return '-'
  }).join('')
}

const $ = tag('lore-sagas')

$.draw((target) => {
  const { thinking, error, results, ready } = $.learn()

  if(!ready) {
    return 'Loading...'
  }

  if(thinking) {
    return `
      Thinking...
    `
  }

  if(results) {
    const list = results.map(x => {
      const item = documents.find(y => {
        return x.ref === y.path
      })

      return `
        <div>
          <a href="/app/code-module?src=${item.path}">
            ${item.name}
          </a>
        </div>
      `
    }).join('')

    return `
      <div class="wrapper">
      <form method="post">
        <label class="field">
          <input
            name="query"
            placeholder="bears, beats, battlestar galactica..."
          />
        </label>
        <input type="hidden" value="1" name="embed" />
        <rainbow-action>
        <input type="submit" value="Search" />
        </rainbow-action>
      </form>
      </div>
      <div class="list">
        ${list}
      </div>
    `
  }

  const maybeError = !error?'':`
    <hypertext-highlighter color="red">
      ${error}
    </hypertext-highlighter>
  `

  return `
    <div class="wrapper">
      <div>
        <div>
          ${maybeError}
        </div>
        <form method="post">
          <label class="field">
            <input
              name="query"
              placeholder="bears, beats, battlestar galactica..."
            />
          </label>
          <input type="hidden" value="1" name="embed" />
          <rainbow-action>
          <input type="submit" value="Search" />
          </rainbow-action>
        </form>
      </div>
    </div>
  `
})

$.when('submit', 'form', async (event) => {
  event.preventDefault()

  if(idx) {
    $.teach({ results: {}, thinking: true })
    const results = idx.search(event.target.query.value)
    $.teach({ thinking: false,  results })
  }
})

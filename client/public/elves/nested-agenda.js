import elf from '@silly/elf'

const db = {}

function node(name, children) {
  const tree = {
    id: self.crypto.randomUUID(),
    name,
    children,
    done: false,
    expanded: true
  }

  db[tree.id] = tree

  return tree.id
}

const $ = elf('nested-agenda', {
  children: [
    node(
      'hello',
      [
        node('world', []),
        node('pluto', [
          node('The Heart', []),
          node('The Brass Knuckles', []),
          node('Belton Regio', []),
          node('Dune Fields', [])
        ])
      ]
    )
  ],
  database: db
})

function update(id, data) {
  $.teach(data, (state,payload) => {
    return {
      ...state,
      database: {
        ...state.database,
        [id]: {
          ...state.database[id],
          ...payload
        }
      }
    }
  })
}

function toggleDone(id) {
  const { database } = $.learn()

  const node = database[id]

  update(id, { done: !node.done})
}

function toggleExpand(id) {
  const { database } = $.learn()

  const node = database[id]

  update(id, { expanded: !node.expanded})
}

$.draw(() => {
  const { children } = $.learn()
  return `
    ${children.map(renderTree).join('')}
  `
}, afterUpdate)

function afterUpdate(target) {
}

function renderTree(id) {
  const { database } = $.learn()
  const { name, children, done, expanded } = database[id]
  return children.length > 0 ? `
    <div class="task" ${expanded ? 'data-expanded="true"':''}>
      <div class="parent-actions">
        <button class="expander" data-expand="${id}">
          ${expanded?'-':'+'}
        </button>
        <label>
          <input data-toggle="${id}" type="checkbox" ${done?'checked':''}/>
          ${name || ''}
        </label>
      </div>
      ${expanded ? `
        <div class="the-kids">
          ${ children.map(renderTree).join('')}
        </div>
      `:''}
    </div>
  `:`
    <div class="task">
      <div class="child-actions">
        <label>
          <input data-toggle="${id}" type="checkbox" ${done?'checked':''}/>
          ${name || 'Untitled'}
        </label>
      </div>
    </div>
  `
}

$.when('click', '[data-toggle]', (event) => {
  const { toggle } = event.target.dataset

  toggleDone(toggle)
})

$.when('click', '[data-expand]', (event) => {
  const { expand } = event.target.dataset

  toggleExpand(expand)
})

$.style(`
  & {
    display: block;
    padding: 0;
  }

  & .task {
    display: block;
  }

  & .parent-actions {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
  }

  & .child-actions {
    padding-left: 2rem;
  }

  & .the-kids {
    padding-left: 1rem;
  }

  & .expander {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 100%;
    display: inline-grid;
    place-content: center;
    border: none;
  }
`)

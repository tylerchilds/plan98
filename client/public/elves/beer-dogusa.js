import elf from '@plan98/elf'
import { innerHTML } from 'diffhtml'

const db = {}

function node(slug, { data={}, children=[] }) {
  const tree = {
    id: self.crypto.randomUUID(),
    slug,
    children,
    done: false,
    expanded: false,
    ...data
  }

  db[slug] = tree

  return slug
}

const $ = elf('beer-dogusa', {
  events: [
    node('welcome-root', {
      data: {
        name: 'Welcome Agenda',
        description: 'The evening starts with a relaxing atmosphere'
      },
      children: [
        'welcome-music',
        'welcome-dish'
      ]
    }),
    node('welcome-music', {
      data: {
        name: 'Welcome Music',
        description: 'As the guests arrive, a fiddle fiddles'
      }
    }),
    node('welcome-dish', {
      data: {
        name: 'Welcome Dish',
        description: 'Champagne is served, a toast'
      }
    }),
    node('closing-ceremony', {
      data: {
        name: 'Closing Ceremony',
        description: 'A time for everyone to come together and reflect on the past few days together'
      },
      children: [
        'closing-music',
        'closing-dish'
      ]
    }),
    node('closing-music', {
      data: {
        name: 'Closing Music',
        description: 'As the guests leave, a fiddle fiddles, but first...',
        children: [
          'dance-off',
          'kar-aoke',
          'jam-session'
        ]
      }
    }),
    node('closing-dish', {
      data: {
        name: 'Closing Dessert',
        description: 'A mix of delicious and chocolatey goodies'
      }
    }),
    node('dance-off', {
      data: {
        name: 'Dance Off',
        description: 'A competetive collaborative playlist to get the party started on the dance floor'
      }
    }),
    node('kar-aoke', {
      data: {
        name: 'Karaoke',
        description: 'A Karaoke sing-a-long to bring the crowd together'
      }
    }),
    node('jam-session', {
      data: {
        name: 'Jam Session',
        description: 'A group setting in a chill atmosphere with instuments waiting for you'
      }
    }),
  ],
  database: db
})

function updateBySlug(slug) {
  return (state,payload) => {
    return {
      ...state,
      database: {
        ...state.database,
        [slug]: {
          ...state.database[slug],
          ...payload
        }
      }
    }
  }
}

function update(slug, data) {
  $.teach(data, {
    mergeHandler: updateBySlug,
    parameters: [slug]
  })
}

function toggleDone(slug) {
  const { database } = $.learn()

  const node = database[slug]

  update(slug, { done: !node.done})
}

function toggleExpand(slug) {
  const { database } = $.learn()

  const node = database[slug]

  update(slug, { expanded: !node.expanded})
}

$.draw((target) => {
  if(target.innerHTML) return
  return `
    <div class="hero">
      <img src="/public/cdn/beerdogusa.com/logo.jpeg">
    </div>
    <a name="playlist"></a>
    <d-j></d-j>
    <a name="plan"></a>
    <div class="tree"></div>
    <div class="sticky-nav">
      <a href="#playlist">Playlist</a>
      <a href="#plan">Plan</a>
    </div>
  `
}, {afterUpdate})

function afterUpdate(target) {
  {
    const tree = target.querySelector('.tree')
    innerHTML(tree, [
      'welcome-root',
      'closing-ceremony'
    ].map(renderTree).join(''))
  }
}

function renderTree(slug) {
  const { database } = $.learn()
  const { name, description, children, done, expanded } = database[slug]
  console.log({ database })
  return children.length > 0 ? `
    <div class="task" ${expanded ? 'data-expanded="true"':''}>
      <div class="parent-actions">
        <label class="agenda-check-area">
          <div class="agenda-tick">
            <input data-toggle="${slug}" type="checkbox" ${done?'checked':''}/>
          </div>
          <div class="agenda-stack">
            <div class="agenda-name">
              ${name || ''}
            </div>
            <div class="agenda-description">
              ${description || ''}
            </div>
          </div>
        </label>
        <div>
          <button class="expander" data-expand="${slug}">
            ${expanded?'Hide':'Show'}
          </button>
        </div>
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
        <label class="agenda-check-area">
          <div class="agenda-tick">
            <input data-toggle="${slug}" type="checkbox" ${done?'checked':''}/>
          </div>
          <div class="agenda-stack">
            <div class="agenda-name">
              ${name || 'Untitled'}
            </div>
            <div class="agenda-description">
              ${description || ''}
            </div>
          </div>
        </label>
      </div>
    </div>
  `
}

$.when('click', '.sticky-nav a[href^="#"]', (event) => {
  event.preventDefault()
  const [_, name] = event.target.href.split('#')
  const anchor = event.target.closest($.link).querySelector(`a[name="${name}"]`)

  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

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
    background: black;
    color: white;
    height: 100%;
    overflow: auto;
    padding: 0 1rem;
  }

  & .task {
    display: block;
  }

  & .parent-actions {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
  }

  & .child-actions,
  & .parent-actions {
    margin-bottom: 1rem;
  }

  & .the-kids {
    padding-left: 2rem;
  }

  & .expander {
    line-height: 1;
    border-radius: 0;
    display: inline-grid;
    place-content: center;
    border: none;
    color: #00c690;
    background: black;
  }

  & .expander:hover,
  & .expander:focus {
    color: white;
  }

  & .agenda-name {
    font-weight: 100;
    font-size: 2rem;
    line-height: 1;
  }

  & .agenda-description {
    font-style: italic;
  }

  & .agenda-tick input {
    height: 2rem;
    width: 2rem;
  }

  & .agenda-check-area {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  & .agenda-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  & .sticky-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.85);
    padding: 1rem 0;
    z-index: 5;
    display: flex;
    gap: 1rem;
    place-content: center;
    backdrop-filter: blur(4px);
  }

  & .sticky-nav a:link,
  & .sticky-nav a:visited {
    color: #00c690;
    background: black;
    border: 1px solid #00714f;
    border-radius: 1rem;
    padding: .5rem 1rem;
    text-decoration: none;
    display: inline-block;
    transition: all ease-in-out 100ms;
  }

  & .sticky-nav a:hover,
  & .sticky-nav a:focus {
    background: #00c690;
    color: black;
    border: 1px solid white;
  }


  & a[name] {
    position: relative;
  }

  & .tree {
    margin-top: 3rem;
    padding-bottom: 6rem;
  }
`)

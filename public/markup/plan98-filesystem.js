function factoryReset(cwc) {
  // todo: braidify highlighter and file system code
  try {
    state[cwc] = {
      path: '/',
      type: 'FileSystem',
      children: [{
        name: '',
        type: 'Directory',
        children: [{
          name: 'home',
          type: 'Directory',
          children: [{
            name: 'tychi',
            type: 'Directory',
            children: [{
              name: 'braid',
              type: 'Directory',
              children: [
                {
                  name: 'markup',
                  type: 'Directory',
                  children: [
                    {
                      name: 'plan98-highlighter.js',
                      type: 'File'
                    },
                    {
                      name: 'plan98-system.js',
                      type: 'File'
                    }
                  ]
                },
                {
                  name: 'sillonious',
                  type: 'Directory',
                  children: [
                    {
                      name: 'pretend.script',
                      type: 'File'
                    },
                    {
                      name: 'paper.script',
                      type: 'File'
                    },
                    {
                      name: 'books.script',
                      type: 'File'
                    },
                    {
                      name: 'bicycles.script',
                      type: 'File'
                    },
                    {
                      name: 'typewriters.script',
                      type: 'File'
                    },
                    {
                      name: 'teleplays.script',
                      type: 'File'
                    },
                    {
                      name: 'cameras.script',
                      type: 'File'
                    },
                    {
                      name: 'computers.script',
                      type: 'File'
                    },
                    {
                      name: 'synthesizers.script',
                      type: 'File'
                    },
                    {
                      name: 'slideshows.script',
                      type: 'File'
                    },
                    {
                      name: 'gamepads.script',
                      type: 'File'
                    },
                    {
                      name: 'generations.script',
                      type: 'File'
                    }
                  ]
                }
              ]
            }]
          }]
        }]
      }]
    }
  } catch (e) {
    console.info('Factory Reset: Failed')
    console.error(e)
    return
  }

  console.log({ cwc, system: state[cwc] })
  console.info('Factory Reset: Success')
  return state[cwc]
}

let i = 0
const Types = {
  File: {
    icon: '/cdn/plan98/plan9.png',
    type: 'File'
  },
  Directory: {
    icon: '/cdn/plan98/firefox.png',
    type: 'Directory'
  }
}

const $ = module('plan98-filesystem')
const parameters = new URLSearchParams(window.location.search)

$.draw(parameters.get('path') === null ? system : floppy)

function closestWorkingComputer(target) {
  const cwc = target.closest('[cwc]').getAttribute('cwc')
  return state[cwc] || {}
}

function system(target) {
  const tree = closestWorkingComputer(target)
  const { path } = tree

  return `
    <div class="menubar">
      <button data-reset>Factory Reset</button>
    </div>
    <div class="visual">
      <div class="treeview">
        ${nest(tree, [], tree)}
      </div>
      <div class="preview">
        <input type="text" name="path" value="${path || '/'}" />
        <iframe src="${window.location.href}?path=${path}"></iframe>
      </div>
    </div>
  `
}

function floppy(target) {
  const tree = closestWorkingComputer(target)
  const { path = '' } = tree
  const content = getContent(tree, path.split('/'))
  if(!content) return `Nothing yet... if only... we had... a 404 page.`

  if(content.type === Types.File.type) {
    return `
      <code-module src="ls${path}"></code-module>
    `
  }

  if(content.type === 'Directory') {
    return `
      <div class="listing">
        ${content.children.map(x => `
          <button type="${x.type}" data-path="${
            path !== '/' ? `${path}/${x.name}` : `/${x.name}`
          }">
            <img src="${Types[x.type].icon}" alt="Icon for ${x.type}" />
            ${x.name || "Sillonious"}
          </button>
        `).join('')}
      </div>
    `
  }
}

function getContent(tree, pathParts) {
  // spread before so we can mutate to bail early
  return [...pathParts].reduce((subtree, name, i, og) => {
    const result = subtree.children.find(x => x.name === name)

    if(!result) {
      console.log({ result, name, subtree, tree, pathParts })
      // mutating the array causes an early exit
      og.splice(1)
      return subtree
    }

    return result
  }, tree)
  // footnote:
  // normally, mutation in functional programming is a red flag
  // however, to the invoking function, we're still pure by definition
}

$.when('click', '[data-uri]', async function(event) {
  const tokens = event.target.closest($.link).getAttribute('tokens')
  const config = state[tokens] || {}
  const { uri } = event.target.dataset
  const data = await fetchAlbum(config, uri)

  showModal(`
    <image-gallery>
      ${data.AlbumImage.map(image => {
        const { ArchivedUri, Uri, ThumbnailUrl } = image
        return `
          <img
        src="${ThumbnailUrl}"
        data-uri="${Uri}"
          />
          `
      }).join('')}
    </image-gallery>
  `)
})

function nest(tree, pathParts, subtree = {}) {
  if(!subtree.children) return ''
  return subtree.children.map(child => {
    const { name, type } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/')

    if(type === Types.File.type) {
      return `
        <plan98-context data-menu="${menuFor(tree, currentPath)}">
          <button data-path="${currentPath}">
            ${name}
          </button>
        </plan98-context>
      `
    }

    if(type === Types.Directory.type) {
      console.log({ currentPath, name })
      return `
      <details ${tree.path.indexOf(`/${name}`) >= 0 ? 'open': ''}>
        <summary data-path="${currentPath}">
          <plan98-context data-menu="${menuFor(tree, currentPath)}">
            ${name || "/"}
          </plan98-context>
        </summary>
        ${nest(tree, currentPathParts, child)}
      </details>
    `
    }

    return '-'
  }).join('')
}
function menuFor(tree, path) {
  const resource = getContent(tree, path.split('/'))

  const { type } = resource

  console.log({ resource })
  if(type === Types.File.type) {
    return "<button>Move File</button><button>Remove File</button>"
  }

  if(type === Types.Directory.type) {
    return "<button>Create Directory</button><button>Create File</button><button>Move Directory</button><button>Remove Directory</button>"
  }
}

$.when('click', '[data-reset]', ({target}) => {
  const cwc = target.closest('[cwc]').getAttribute('cwc')
  factoryReset(cwc)
})

$.when('click', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  const tree = closestWorkingComputer(target)
  tree.path = path
})

$.style(`
  & {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  & summary {
    display: grid;
  }
  & .menubar {
  }
  & .visual {
    display: grid;
    grid-template-columns: 180px 1fr;
    height: 100%;
  }

  & .treeview {
    position: relative;
    overflow: auto;
    white-space: nowrap;
  }


  & [name="path"] {
    display: block;
    width: 100%;
  }

  & .preview {
    display: grid;
    grid-template-rows: auto 1fr;
  }

  & iframe {
    height: 100%;
    width: 100%;
    border: 0;
  }

  & details { padding-left: 1rem; }
  & [target="_blank"] {
    float: right;
  }
  & button {
    all: unset;
    text-decoration: underline;
    color: blue;
    display: block;
    cursor: pointer;
  }

  & .listing {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    text-align: center;
    grid-area: 1 / 1 / -1 / -1;
    place-content: baseline;
  }

  & .listing > * {
    display: grid;
    grid-template-rows: auto 1rem;
    aspect-ratio: 1;
  }
`)

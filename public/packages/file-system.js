import module, { state } from '../module.js'
/* uncomment to seed filesystem */
function factoryReset(cwc) {
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
          }]
        }]
      }]
    }
  } catch (e) {
    console.info('Factory Reset: Failed')
    console.error(e)
    return false
  }

  console.info('Factory Reset: Success')
  return true
}

const Types = {
  File: {
    icon: '/cdn/plan98/plan9.png'
  },
  Directory: {
    icon: '/cdn/plan98/firefox.png'
  }
}

const urlParams = new URLSearchParams(window.location.search)
const path = urlParams.get('path')
const iSbIoS = path === null

const $ = module('file-system')
$.draw(iSbIoS ? system : floppy)

function currentWorkingComputer(target) {
  const cwc = target.closest('[cwc]').getAttribute('cwc')
  return state[cwc]
    ? state[cwc] 
    : (function initialize() {
      return factoryReset(cwc)
    })()
}

function system(target) {
  const tree = currentWorkingComputer(target)
  const { path } = tree

  return `
    <div class="visual">
      <div class="treeview">
        ${nest([], tree)}
        <button data-reset>Factory Reset</button>
      </div>
      <div class="preview">
        <input type="text" name="path" value="${path || '/'}" />
        <iframe src="${window.location.href}?path=${path}"></iframe>
      </div>
    </div>
  `
}

function floppy(target) {
  const tree = currentWorkingComputer(target)
  const { path } = tree
  const content = getContent(tree, path.split('/'))
  console.log({ content })
  if(!content) return `Nothing yet... if only... we had... a 404 page.`

  if(content.type === 'File') {
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

function nest(pathParts, tree) {
  return tree.children.map(child => {
    const { name, type } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/')

    if(type === 'File') {
      return `<button data-path="${currentPath}">
        <plan98-highlighter>
          ${name}
        </plan98-highlighter>
      </button>`
    }

    if(type === 'Directory') {
      return `
        <details>
          <summary data-path="${currentPath}">
            ${name || "/"}
          </summary>
          ${nest(currentPathParts, child)}
        </details>
      `
    }
  }).join('')
}

$.when('click', '[data-reset]', ({target}) => {
  const cwc = currentWorkingComputer(target)
  factoryReset(cwc)
})

$.when('click', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  console.log({ path })
  const tree = currentWorkingComputer(target)
  const information = getContent(tree, path)
  console.log({ information })

  tree.path = path
})

$.flair(`
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

  & [data-reset] {
    position: absolute;
    bottom: 1rem;
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

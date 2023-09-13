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
      ['data-nest', 'Create Nest'],
      ['data-egg', 'Create Egg'],
      ['data-move', 'Move'],
      ['data-remove', 'Remove']
    ]
  }
}

const $ = module('plan98-filesystem')
const parameters = new URLSearchParams(window.location.search)

$.draw(parameters.get('path') === null ? system : floppy)

function closestWorkingComputer(target) {
  const cwc = target.closest('[cwc]')

  if(cwc) {
    return state[cwc.getAttribute('cwc')] || {}
  }

  return {}
}

function system(target) {
  if(checkPreservationStatus(target)) {
    return
  }
  const tree = closestWorkingComputer(target)
  const { path } = tree

  return `
    <div class="menubar">
      <a href="https://archive.org/details/plan98" target="_blank">Download</a>
      <button data-debugger>Debugger</button>
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
  if(checkPreservationStatus(target)) {
    return
  }
  const tree = closestWorkingComputer(target)
  const { path = '' } = tree
  const content = getContent(tree, path.split('/'))
  if(!content) return `Nothing yet... if only... we had... a 404 page.`

  if(content.type === Types.File.type) {
		const readonly = parameters.get('readonly')
    return `
      <hyper-script src="ls${path}" ${readonly ? 'readonly="true"' : ''}></hyper-script>
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

function checkPreservationStatus(target) {
  if(target.childNodes.length === 0) return false
  return [...target.childNodes].every(x => x.tagName === 'BUTTON')
}

function getContent(tree, pathParts) {
  // spread before so we can mutate to bail early
  return [...pathParts].reduce((subtree, name, i, og) => {
    const result = subtree.children
      ? subtree.children.find(x => x.name === name)
      : null

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

  let actions

  if(type === Types.File.type) {
    actions = Types.File.actions.map(([action, label]) => {
      return "<button "+action+" data-for-path="+path+">"+label+"</button>"
    }).join('')
  }

  if(type === Types.Directory.type) {
    actions = Types.Directory.actions.map(([action, label]) => {
      return "<button "+action+" data-for-path="+path+">"+label+"</button>"
    }).join('')
  }

  return "<plan98-filesystem>"+actions+"</plan98-filesystem>"
}

$.when('click', '[data-reset]', ({target}) => {
  const cwc = target.closest('[cwc]').getAttribute('cwc')
  factoryReset(cwc)
})

$.when('click', '[data-debugger]', ({target}) => {
  const s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "//cdn.jsdelivr.net/npm/eruda";
  document.body.appendChild(s)
})

$.when('click', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  const tree = closestWorkingComputer(target)
  tree.path = path
})

$.when('click', '[data-move]', ({ target }) => {
  const { forPath } = target.dataset
  alert('move')
})

$.when('click', '[data-remove]', ({ target }) => {
  const { forPath } = target.dataset
  alert('remove')
})

$.when('click', '[data-nest]', ({ target }) => {
  const { forPath } = target.dataset
  alert('nest')
})

$.when('click', '[data-egg]', ({ target }) => {
  const { forPath } = target.dataset
  alert('egg')
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
    background: rgba(0,0,0,.15);
    padding: 4px;
    display: flex;
    gap: 1rem;
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
    background: rgba(0,0,0,.10);
  }


  & [name="path"] {
    display: block;
    width: 100%;
    border: none;
    padding: .5rem;
  }

  & .preview {
    display: grid;
    grid-template-rows: auto 1fr;
    background: rgba(0,0,0,.05);
  }

  & iframe {
    height: 100%;
    width: 100%;
    border: 0;
  }


  & ::marker,
  & ::-webkit-details-marker{
    display:none;
  }
  & summary {
    list-style: none
  }
  & details {
    padding-left: 1rem;
    position: relative;
  }

  & details::before,
  & details[open]::before {
    position: absolute;
    left: -.5rem;
    line-height: 1.25;
  }
  & details::before {
    content: '◉';
  }
  & details[open]::before {
    content: '○';
  }

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
    padding: .5rem;
    gap: 1rem;
  }

  & .listing > * {
    display: grid;
    grid-template-rows: auto 1rem;
    aspect-ratio: 1;
  }
`)

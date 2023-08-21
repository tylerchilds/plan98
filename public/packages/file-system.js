import module, { state } from '../module.js'

state['ls/demo'] = {
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

const urlParams = new URLSearchParams(window.location.search)
const cwd = urlParams.get('cwd')
const iSbIoS = cwd === null

const $ = module('file-system', { cwd: cwd || '/' })
$.draw(iSbIoS ? system : floppy)

function system(target) {
  const cwc = target.getAttribute('cwc')
  const tree = state[cwc] || {}
  const { cwd } = $.learn()

  return `
    <div class="treeview">
      ${nest([], tree)}
    </div>
    <div class="preview">
      <input type="text" name="cwd" value="${cwd}" />
      <iframe src="${window.location.href}?cwd=${cwd}"></iframe>
    </div>
  `
}

function floppy(target) {
  const cwc = target.getAttribute('cwc')
  const tree = state[cwc] || {}
  const { cwd } = $.learn()

  const contents = getDirectoryContents(tree, cwd.split('/'))
  return `${contents.map(x => `${x.name}${x.type}`)}`
}

function getDirectoryContents(tree, path) {
  // spread before so we can mutate to bail early
  return [...path].reduce((subtree, name, i, og) => {
    const result = subtree.find(x => x.name === name)

    if(!result) {
      // mutating the array causes an early exit
      og.splice(1)
      return subtree
    }

    return result.children
  }, tree.children)
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

function nest(path, tree) {
  return tree.children.map(child => {
    const { name, type } = child
    const currentPath = [...path, name]

    if(type === 'File') {
      return `<button>
        <plan98-highlighter color="orange">
          ${name}
        </plan98-highlighter>
      </button>`
    }

    if(type === 'Directory') {
      return `
        <details>
          <summary data-cwd="${currentPath.join('/')}">
            ${name || "/"}
          </summary>
          ${nest(currentPath, child)}
        </details>
      `
    }
  }).join('')
}

$.when('click', '[data-cwd]', ({ target }) => {
  const { cwd } = target.dataset
  $.teach({ cwd })
})

$.flair(`
  & {
    display: grid;
    grid-template-columns: 180px 1fr;
    height: 100%;
  }

  & .treeview {
    overflow: auto;
    white-space: nowrap;
  }

  & [name="cwd"] {
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
  }
`)

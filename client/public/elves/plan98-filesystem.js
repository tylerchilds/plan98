import module from '@silly/tag'
import { tooltip as closeTooltip } from './plan98-context.js'

state['ls/fs/open'] ||= {}

import { showModal, types as modalTypes } from './plan98-modal.js'

const parameters = new URLSearchParams(window.location.search)

export function factoryReset(host) {
  try {
    fetch(`/plan98/about`)
      .then(res => res.json())
      .then(data => state[host] = data)
      .then(() => {
        console.info('Factory Reset: Success')
        setTimeout(() => {
        window.location.href = window.location.href
      }, 250)
      })
  } catch (e) {
    console.info('Factory Reset: Failed')
    console.error(e)
    return
  }
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

function helpActions(currentWorkingComputer) {
  const actions = Types.Help.actions.map(([action, label]) => {
    return "<button "+action+">"+label+"</button>"
  }).join('')

  return `<plan98-filesystem data-cwc=${currentWorkingComputer}>${actions}</plan98-filesystem>`
}

const $ = module('plan98-filesystem')

const shouldBoot = self.self === self.top && !parameters.get('path')
$.draw(shouldBoot ? system : floppy)

function closestWorkingComputer(target) {
  const cwc = target.closest('[data-cwc]')

  if(cwc) {
    return state[cwc.dataset.cwc] || {}
  }

  return {}
}

function system(target) {
  if(target.parentElement.closest('plan98-filesystem')) {
    return floppy(target)
  }
  const { rootActive } = $.learn()
  if(checkPreservationStatus(target)) {
    return
  }

  const { cwc } = target.dataset

  const tree = closestWorkingComputer(target)
  const path = tree.path || window.location.pathname

  const rootClass = rootActive ? 'root active' : 'root'

  target.innerHTML = `
    <div class="${rootClass}">
      <div class="menubar">
        <input type="text" name="path" value="${path || '/'}" />
      </div>
      <div name="transport">
        <div name="actions">
          <button class="switcher">
            Sidebar
          </button>
          <plan98-context data-inline data-label="Help" data-menu="${helpActions(cwc)}"></plan98-context>
        </div>
      </div>
      <div class="flex-column">
        <div class="branch">
          <div class="treeview">
            ${nest(cwc, { target, tree, pathParts: [], subtree: tree.plan98 })}
          </div>
        </div>
        <div class="leaf">
          <div data-resizer></div>
          <media-plexer src="${path + window.location.search}"></media-plexer>
        </div>
      </div>
    </div>
  `
}

function floppy(target) {
  if(checkPreservationStatus(target)) {
    return
  }

  if(parameters.get('path')) {
    return `<media-plexer src="${parameters.get('path')}"></media-plexer>`
  }

  const computer = target.closest('[data-cwc]').dataset.cwc
  const tree = closestWorkingComputer(target)
  const path = window.location.pathname
  const content = getContent(computer, tree.plan98, path.split('/'))

  if(content.error === '404') return

  if(content.type === Types.File.type) {
    return `<media-plexer src="${path}"></media-plexer>`
  }

  if(content.type === 'Directory' && content.name !== "") {
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

  return `
    <sonic-knuckles></sonic-knuckles>
  `
}

function checkPreservationStatus(target) {
  if(target.dataset.preserve === 'all') return true
  if(target.childNodes.length === 0) return false
  return [...target.childNodes].every(x => x.tagName === 'BUTTON')
}
function getContent(computer, tree, pathParts) {
  // spread before so we can mutate to bail early
  return [...pathParts].reduce((subtree, name, i, og) => {
    try {
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
    } catch(e) {
      factoryReset(computer)
      return { error: '404' }
    }
  }, tree)
  // footnote:
  // normally, mutation in functional programming is a red flag
  // however, to the invoking function, we're still pure by definition
}

$.when('click', '.switcher', function switcher({ target }) {
  const rootActive = !$.learn().rootActive
  $.teach({ rootActive })
})

$.when('mousedown', '[data-resizer]', event => {
  document.addEventListener("mousemove", resize, false);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", resize, false);
  }, false);
})

$.when('touchstart', '[data-resizer]', event => {
  document.addEventListener("touchmove", touchresize, false);
  document.addEventListener("touchend", () => {
    document.removeEventListener("touchmove", touchresize, false);
  }, false);
})

function resize(event) {
  const size = `${event.x}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
}

function touchresize(event) {
  const touch = event.touches[0]
  const size = `${touch.pageX}px`;
  const root = event.target.closest($.link)
  root.style.setProperty("--sidebar-width", size);
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

function nest(computer, { target, tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.File.type) {
      return `
        <plan98-context data-menu="${menuFor(computer, tree.plan98, currentPath)}">
          <button data-path="${currentPath}">
            ${name}
          </button>
        </plan98-context>
      `
    }

    if(type === Types.Directory.type) {
      const tree = closestWorkingComputer(target)
      const directoryActive = (state['ls/fs/open'])[currentPath]
      return `
      <details ${directoryActive ? 'open': ''} data-path="${currentPath}">
        <summary>
          <plan98-context data-menu="${menuFor(computer, tree.plan98, currentPath)}">
            ${name || "/"}
          </plan98-context>
        </summary>
        <div class="subtree">
          ${nest(computer, { target, tree, pathParts: currentPathParts, subtree: child})}
        </div>
      </details>
    `
    }

    return '-'
  }).join('')
}
function menuFor(computer, tree, path) {
  const resource = getContent(computer, tree, path.split('/'))

  const { type } = resource

  let actions

  if(type === Types.File.type) {
    actions = Types.File.actions.map(([action, label]) => {
      return "<button "+action+" data-path="+path+">"+label+"</button>"
    }).join('')
  }

  if(type === Types.Directory.type) {
    actions = Types.Directory.actions.map(([action, label]) => {
      return "<button "+action+" data-path="+path+">"+label+"</button>"
    }).join('')
  }

  return "<plan98-filesystem>"+actions+"</plan98-filesystem>"
}

$.when('click', '[data-debugger]', ({target}) => {
  closeTooltip()
  document.body.insertAdjacentHTML('beforeend', `
    <plan98-console></plan98-console>
  `)
})

$.when('click', '[data-live]', ({target}) => {
  closeTooltip()
  showModal(`
    <live-help></live-help>
  `, { centered: true })
})

$.when('click', '[data-reset]', async ({target}) => {
  closeTooltip()
  const { cwc } = target.closest('[data-cwc]').dataset
  await factoryReset(cwc)
})

// folders
$.when('toggle', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  state['ls/fs/open'][path] = target.open
})

// files
$.when('click', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  const tree = closestWorkingComputer(target)
  tree.path = path
})

$.when('click', '[data-move]', ({ target }) => {
  const { path } = target.dataset
  alert('move')
})

$.when('click', '[data-remove]', ({ target }) => {
  const { path } = target.dataset
  alert('remove')
})

$.when('click', '[data-bag]', ({ target }) => {
  const { path } = target.dataset
  alert('bag')
})

$.when('click', '[data-egg]', ({ target }) => {
  const { path } = target.dataset
  alert('egg')
})

$.style(`
  & {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    --sidebar-width: 180px;
    position: relative;
  }

  & .root {
    position: absolute;
    inset: 0;
  }
  & .menubar {
    background: rgba(0,0,0,.85);
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  & .help {
    box-sizing: content-box;
    padding: 0 .5rem;
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
    background: rgba(66,66,66,.85);
    color: rgba(255,255,255,.5);
    user-select: none;
  }

  & [name="path"] {
    display: block;
    width: 100%;
    border: none;
    padding: .25rem;
  }

  & iframe {
    height: 100%;
    width: 100%;
    border: 0;
  }

  & details plan98-context [data-context] {
    display: none;
  }

  & details {
    position: relative;
  }

  & summary plan98-context {
    display: inline-grid;
  }

  & [target="_blank"] {
    float: right;
  }
  & .treeview button,
  & .listing button {
    all: unset;
    color: rgba(255,255,255,.5);
    display: block;
    cursor: pointer;
    pointer-events: all;
  }

  & summary:hover,
  & summary:focus,
  & .treeview button:hover,
  & .listing button:hover,
  & .treeview button:focus,
  & .listing button:focus {
    color: rgba(255,255,255,1);
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

  & .flex-column {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    height: calc(100% - 2rem);
    overflow: hidden;
  }

  & .branch {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    z-index: 5;
    position: relative;
    overflow: auto;
    flex-basis: var(--sidebar-width);
  }

  & [data-resizer] {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0px;
    width: 10px;
    background: rgba(0,0,0,.1);
    z-index: 10;
    cursor: col-resize;
  }

  & .list-item {
    padding-left: 1rem;
    border-bottom: 1px solid cyan;
  }

  & [name="transport"] {
    overflow-x: auto;
    max-width: calc(100vw - 1.5rem - 1px);
    position: absolute;
    right: 0;
    top: 4rem;
    z-index: 10;
    overflow: auto;
  }

  & [name="actions"] {
    display: inline-flex;
    justify-content: end;
    border: 1px solid rgba(255,255,255,.15);
    gap: .25rem;
    border-radius: 1.5rem 0 0 1.5rem;
  }

  & button {
    background: rgba(0,0,0,.85);
    border: none;
    color: dodgerblue;
    cursor: pointer;
    height: 2rem;
    border-radius: 1rem;
    transition: color 100ms;
    padding: .25rem 1rem;
  }

  & button:hover,
  & button:focus {
    box-shadow: 0 0 25px 25px rgba(0,0,0,.15) inset;
  }

  & .active .switcher {
  }

  & .subtree {
    padding-left: 1rem;
  }

  & .leaf {
    background: white;
    inset: 0;
    transform: translateY(0);
    transition: transform 200ms ease-in-out;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  & .leaf iframe {
    border: 0;
    width: 100%;
    height: 100%;
  }

  & .active.root {
    display: grid;
    grid-template-rows: 1fr 2rem;
    --sidebar-width: 0;
  }

  & .active .leaf {
  }

  & .launch {
    background: transparent;
    border: 0;
    text-decoration: underline;
    color: blue;
    padding: .5rem;
    margin: .5rem;
  }
`)

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    //if esc key was not pressed in combination with ctrl or alt or shift
    const isNotCombinedKey = !(event.ctrlKey || event.altKey || event.shiftKey);
    if (isNotCombinedKey) {
      document.querySelector(`${$.link} .switcher`)?.click()
    }
  }
});

import module from '@sillonious/module'

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
      ['data-about', 'About'],
      ['data-debugger', 'Debugger'],
      ['data-forum', 'Forum'],
      ['data-live', 'Live'],
      ['data-reset', 'Reset'],
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

  const rootClass = rootActive ? 'active' : ''

  target.innerHTML = `
    <div class="${rootClass}">
      <div class="root">
        <div class="help">
          <plan98-context data-inline data-label="?." data-menu="${helpActions(cwc)}">
            Get Help: 
          </plan98-context>
        </div>
        <div class="menubar">
          <input type="text" name="path" value="${path || '/'}" />
        </div>
        <div class="treeview">
          ${nest(cwc, { tree: tree.plan98, pathParts: [], subtree: tree.plan98 })}
        </div>
        <form id="command-line">
          <input type="text" placeholder=":" name="command" />
        </form>
      </div>
      <button aria-label="Switcher" class="switcher">
        ¿i?
      </button>
      <div class="leaf">
        <media-plexer src="${path + window.location.search}"></media-plexer>
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
    debugger
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
    <terminal-demo></terminal-demo>
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

$.when('click', '.leaf', function leafer({ target }) {
  $.teach({ rootActive: false })
})


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

function nest(computer, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map(child => {
    const { name, type } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.File.type) {
      return `
        <plan98-context data-menu="${menuFor(computer, tree, currentPath)}">
          <button data-path="${currentPath}">
            ${name}
          </button>
        </plan98-context>
      `
    }

    if(type === Types.Directory.type) {
      return `
      <details ${currentPath.indexOf(`/${name}`) >= 0 ? 'open': ''}>
        <summary data-path="${currentPath}">
          <plan98-context data-menu="${menuFor(computer, tree, currentPath)}">
            ${name || "/"}
          </plan98-context>
        </summary>
        ${nest(computer, { tree, pathParts: currentPathParts, subtree: child})}
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
  document.body.insertAdjacentHTML('beforeend', `
    <plan98-console></plan98-console>
  `)
})

$.when('click', '[data-about]', ({target}) => {
  showModal(`
    <sillonious-brand host="${window.location.host}"></sillonious-brand>
  `)
})

$.when('click', '[data-live]', ({target}) => {
  showModal(`
    <live-help></live-help>
  `)
})

$.when('click', '[data-reset]', async ({target}) => {
  const { cwc } = target.closest('[data-cwc]').dataset
  await factoryReset(cwc)
})

$.when('click', '[data-forum]', ({target}) => {
  showModal(`
    yeah, would be nice.
  `)
})


$.when('click', '[data-path]', ({ target }) => {
  const { path } = target.dataset
  const tree = closestWorkingComputer(target)
  tree.path = path
  $.teach({ rootActive: false })
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
    background: rgba(255,255,255,.85);
  }


  & [name="path"] {
    display: block;
    width: 100%;
    border: none;
    padding: .5rem;
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
    left: 0;
    line-height: 1.25;
    font-size: .5rem;
  }
  & details::before {
    content: '○';
  }
  & details[open]::before {
    content: '◉';
  }

  & [target="_blank"] {
    float: right;
  }
  & .treeview button,
  & .listing button {
    all: unset;
    text-decoration: underline;
    color: blue;
    display: block;
    cursor: pointer;
    pointer-events: all;
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

  & .root {
    display: none;
    background: linear-gradient(34deg, white 50%, rebeccapurple);
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    width: 320px;
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    z-index: 5;
  }

  & .root::before {
    content: '';
    border-left: 1px solid red;
    box-shadow: 0px 0 2px 0 yellow, 2px 0 2px 0 orange, 4px 0 2px 0 red;
    position: fixed;
    left: 1rem;
    top: 0;
    bottom: 0;
  }

  & .list-item {
    padding-left: 1rem;
    border-bottom: 1px solid cyan;
  }

  & #command-line input {
    display: block;
    line-height: 2rem;
    font-size: 1rem;
    border: 0;
    box-shadow: -72px -16px 72px 16px rgba(0,0,0,.25);
    max-width: 100%;
    width: 100%;
  }

  & .switcher {
    display: block;
    position: fixed;
    height: 2rem;
    width: 2rem;
    background: orange;
    top: 3px;
    right: 3px;
    line-height: 1;
    z-index: 10;
    border: 0;
    border-radius: 100%;
  }

  & .active .switcher {
  }

  & .leaf {
    background: white;
    position: fixed;
    inset: 0;
    transform: translateY(0);
    transition: transform 200ms ease-in-out;
    overflow: hidden;
  }

  & .leaf iframe {
    border: 0;
    width: 100%;
    height: 100%;
  }

  & .active .root {
    display: grid;
    grid-template-rows: 2rem 2rem 1fr 2rem;
    gap: 3px;
    padding: 3px 0;
  }

  & .active .leaf {
    filter: grayscale(1) brightness(0.5) contrast(0.5);
  }

  & .active .leaf > * {
    pointer-events: none;
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
      document.querySelector(`${$.link} .switcher`).click()
    }
  }
});

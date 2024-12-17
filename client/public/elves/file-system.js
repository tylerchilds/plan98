import elf from '@silly/elf'
import { innerHTML } from 'diffhtml'
import { hideModal } from '@plan98/modal'
import natsort from 'natsort'
import lunr from 'lunr'

const Types = {
  File: {
    type: 'File',
  },
  Directory: {
    type: 'Directory',
  },
}


export let idx
export const documents = [];
let p98

async function buildIndex(target) {
  try {
    const { plan98 } = await fetch(`/plan98/about`)
      .then(res => res.json())

    p98 = plan98

    idx = lunr(function () {
      this.ref('path')
      this.field('path')
      this.field('keywords')
      this.field('type')
      this.field('name')
      this.field('extension')
      nest(this, { tree: plan98, pathParts: [], subtree: plan98 })
    })
    $.teach({ ready: true })

  const src = target.getAttribute('src')

  requestIdleCallback(() => {
    const enclosure = jurassicFrom(src)
    $.teach({ enclosure })
    self.history.pushState({ type: `${$.link}-navigation`, path: src }, "");
  })

  } catch (e) {
    console.info('Build: Failed')
    console.error(e)
    return
  }
}

function nest(idx, { tree = {}, pathParts = [], subtree = {} }) {
  if(!subtree.children) return ''
  return subtree.children.map((child, index) => {
    const { name, type, extension } = child
    const currentPathParts = [...pathParts, name]
    const currentPath = currentPathParts.join('/') || '/'

    if(type === Types.Directory.type) {
      const node = {
        path: currentPath,
        keywords: currentPath.split('/').join(' '),
        name,
        type,
        extension
      }

      idx.add(node)
      documents.push(node)
      nest(idx, { tree, pathParts: currentPathParts, subtree: child })
    }

    return '-'
  }).join('')
}

const $ = elf('file-system', {
  suggestIndex: null,
  suggestions: [],
  suggesttionsLength: 0,
  filter: '',
  view: 'list'
})

export default $

function embedded(target) {
  return target.dataset.embedded === 'true'
}

function nested(target) {
  return target.parentNode.closest($.link)
}

$.draw((target) => {
  if(embedded(target)) return
  if(nested(target)) return 'paradox averted'
	if(target.mounted) return
	target.mounted = true
  buildIndex(target)

	return `
    <div class="library">
      ${library(null)}
    </div>
    <div class="irix"></div>
	`
}, {
  beforeUpdate,
  afterUpdate
})

function draw2dFile(data, attributes) {
  const {
    path,
    name,
    icon
  } = data
  const edit = false
  return `
    <div class="file-reference">
      <a href="${path}" ${reduceAttributes(attributes)}>
        <sl-icon name="${icon}" class="system-icon"></sl-icon>
      </a>
      ${edit? `<input value="${name}" class="file-name">` : `
        <a href="${path}" class="file-name" data-path="${path}">
          ${name}
        </a>
      `}
    </div>
  `
}

function draw2dDirectory(data, attributes) {
  const {
    path,
    name,
    icon
  } = data
  const edit = false
  return `
    <div class="file-reference">
      <a href="/app/file-system?src=${path}" ${reduceAttributes(attributes)}>
        <sl-icon name="${icon}" class="system-icon"></sl-icon>
      </a>
      ${edit? `
        <input value="${name}" class="directory-name">
      ` : `
        <a class="directory-name" data-path="${path}" href="/app/file-system?src=${path}">
          ${name}
        </a>
      `}
    </div>
  `
}


function increment(target) {
  const irix = target.querySelector('.irix')
  if(!irix) return
  const { enclosure, view, path } = $.learn()

  irix.dataset.view = view

  if(view === 'game') {
    if(!irix.querySelector('iframe')) {
      irix.innerHTML = `<iframe src="/app/generic-park?src=${path}"></iframe>`
    }
    return
  }

  if(enclosure) {
    const dinosaurs = enclosure.children.map((eggs, i) => {
      if(eggs.type === Types.Directory.type) {
        return draw2dDirectory({
          path: eggs.path,
          name: eggs.name,
          icon: 'folder'
        }, {
          'class': 'interactive-directory',
          ['data-path']: eggs.path,
          ['data-name']: eggs.name
        })
      }

      if(eggs.type === Types.File.type) {
        return draw2dFile({
          path: eggs.path,
          name: eggs.name,
          icon: iconByPath(eggs.path)
        }, {
          'class': 'interactive-file',
          ['data-path']: eggs.path,
          ['data-name']: eggs.name
        })
      }
    }).join('')
    irix.innerHTML = dinosaurs
  }
}

const knownTypes = [
  'aac',
  'ai',
  'bmp',
  'cs',
  'css',
  'csv',
  'doc',
  'docx',
  'exe',
  'gif',
  'heic',
  'html',
  'java',
  'jpg',
  'js',
  'json',
  'jsx',
  'key',
  'm4p',
  'md',
  'mdx',
  'mov',
  'mp3',
  'mp4',
  'otf',
  'pdf',
  'php',
  'png',
  'ppt',
  'pptx',
  'psd',
  'py',
  'raw',
  'rb',
  'sass',
  'scss',
  'sh',
  'sql',
  'svg',
  'tiff',
  'tsx',
  'ttf',
  'txt',
  'wav',
  'woff',
  'xls',
  'xlsx',
  'xml',
  'yaml',
]

function iconByPath(path) {
  const extension = path.split('.').pop()
  return knownTypes.indexOf(extension) > -1 ? 'filetype-'+extension : 'file-earmark'
}

$.when('click', '[data-view]', (event) => {
  const { view } = event.target.dataset
  $.teach({ view })
})


$.when('click', '.interactive-file', (event) => {
  event.preventDefault()
  const { path } = event.target.dataset
  window.location.href = '/app/media-plexer?src='+path
})


$.when('click', '.interactive-directory', (event) => {
  event.preventDefault()
  const { path } = event.target.dataset
  const enclosure = jurassicFrom(path)
  $.teach({ enclosure })
  self.history.pushState({ type: `${$.link}-navigation`, path }, "");
})

$.when('click', '.directory-name', (event) => {
  event.preventDefault()
  const { path } = event.target.dataset
  const enclosure = jurassicFrom(path)
  $.teach({ enclosure })
  self.history.pushState({ type: `${$.link}-navigation`, path }, "");
})

$.when('click', '.file-name', (event) => {
  event.preventDefault()
  const { path } = event.target.dataset
  window.location.href = '/app/media-plexer?src='+path
})

addEventListener("popstate", async (event) => {
  const { type, path } = event.state || {}
  console.log(type, path)
  if(type === `${$.link}-navigation`) {
    const enclosure = jurassicFrom(path)
    $.teach({ enclosure })
  }
});

function beforeUpdate(target) {
  { // save suggestion box scroll top
    const list = target.querySelector('.suggestion-box')
    if(!list) return
    target.dataset.scrollpos = list.scrollTop
  }
}

function afterUpdate(target) {
  { // scroll suggestions
    const list = target.querySelector('.suggestion-box')
    if(list) {
      list.scrollTop = target.dataset.scrollpos
    }
  }

  { // scroll item into view
    const activeItem = target.querySelector('.suggestion-box .active')
    if(activeItem) {
      activeItem.scrollIntoView({block: "nearest", inline: "nearest"})
    }
  }


  { // recover icons from the virtual dom
    [...target.querySelectorAll('sl-icon')].map(ogIcon => {
      const iconParent = ogIcon.parentNode
      const icon = document.createElement('sl-icon')
      icon.name = ogIcon.name
      ogIcon.remove()
      iconParent.appendChild(icon)
    })
  }

  {
    library(target.querySelector('.library'))
  }

  {
    increment(target)
  }
}

function library(target) {
  const { path, filter, suggestIndex, suggestions, showSuggestions } = $.learn()

  const start = Math.max(suggestIndex - 5, 0)
  const end = Math.min(suggestIndex + 5, suggestions.length - 1)

  const settings = `
    <file-system data-embedded="true">
      <button data-view="grid">
        <span><sl-icon name="grid"></sl-icon></span> Grid
      </button>
      <button data-view="list">
        <span><sl-icon name="list-stars"></sl-icon></span> List
      </button>
      <button data-view="game">
        <span><sl-icon name="joystick"></sl-icon></span> Immersive
      </button>
    </file-system>
  `

  const search = `
    <div class="search">
      <button class="action-button" data-back>
        <sl-icon name="arrow-left"></sl-icon>
      </button>
      <button class="action-button" data-up>
        <sl-icon name="arrow-up"></sl-icon>
      </button>
      <button class="action-button" data-forward>
        <sl-icon name="arrow-right"></sl-icon>
      </button>
      <input placeholder="Search..." type="text" value="${path || '/'}" name="search" autocomplete="off" />
      <button class="action-button" data-down>
        <sl-icon name="arrow-down"></sl-icon>
      </button>
      <button class="action-button" data-popover='${settings}'>
        <sl-icon name="three-dots-vertical"></sl-icon>
      </button>
    </div>
    <div class="suggestions">
      ${showSuggestions ? suggestions.slice(start, end).map((x, i) => {
        const item = documents.find(y => {
          return x.ref === y.path
        })

        return `
          <button type="button" class="auto-item ${suggestIndex === i + start ? 'active': ''}" data-name="${item.name}" data-path="${item.path}" data-index="${i}">
            <div class="name">
              ${item.name}
            </div>
          </button>
        `
      }).join('') : ''}
    </div>
  `

  if(target) {
    innerHTML(target, search)
    return
  } else {
    return search
  }
}

const down = 40;
const up = 38;
const enter = 13;
$.when('keydown', '[name="search"]', event => {
  const { suggestionsLength, suggestIndex } = $.learn()
  if(event.keyCode === down) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? 0 : suggestIndex + 1
    if(nextIndex >= suggestionsLength -1) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === up) {
    event.preventDefault()
    const nextIndex = (suggestIndex === null) ? suggestionsLength - 2 : suggestIndex - 1
    if(nextIndex < 0) return
    $.teach({ suggestIndex: nextIndex })
    return
  }

  if(event.keyCode === enter && suggestIndex !== null) {
    event.preventDefault()
    const { suggestions, suggestIndex } = $.learn()
    const item = documents.find(y => {
      return suggestions[suggestIndex].ref === y.path
    })

    if(item) {
      const target = document.createElement('a')
      target.href = item.path

      const enclosure = jurassicFrom(item.path)
      $.teach({ enclosure })
      document.activeElement.blur()
      return
    }
  }
})

$.when('click', '.auto-item', event => {
  event.preventDefault()
  const { path } = event.target.dataset

  const enclosure = jurassicFrom(path)
  let { suggestIndex } = $.learn()
  const index = parseInt(event.target.dataset.index)
  const start = Math.max(suggestIndex - 5, 0)
  suggestIndex = start + index
  $.teach({ suggestIndex, enclosure })
})


function jurassicFrom(path) {
  $.teach({path})
  // the root node edge case
  if(!path || path === '/') {
    return p98.children[0]
  }

  const files = path.split('/').reduce((directory, current) => {
    const next = directory.children.find(x => x.name === current)
    return next
  }, p98)

  return files
}

$.when('input', '[name="search"]', (event) => {
  const { value } = event.target;
  const sort = natsort();
  const suggestions = idx.search(value).sort((a,b) => sort(a.ref, b.ref))
  $.teach({ suggestions, suggestIndex: null, suggestionsLength: suggestions.length, musicFilter: event.target.value  })
})

$.when('focus', '[name="search"]', event => {
  $.teach({ showSuggestions: true })
})

$.when('blur', '[name="search"]', event => {
  setTimeout(() => {
    $.teach({ showSuggestions: false })
    document.activeElement.blur()
  }, 250)
})

$.when('click', 'a[href^="#"]', (event) => {
  event.preventDefault()
  const [_,name] = event.target.href.split('#')
  const tile = event.target.closest($.link).querySelector(`[name="${name}"]`)
  tile.scrollIntoView({block: "end", inline: "end", behavior: 'smooth'})
})

$.when('click', '[data-close-context]', (event) => {
  $.teach({ contextActions: null })
})

$.when('click', '[data-goto]', (event) => {
  const { goto } = event.target.dataset
  window.location.href = goto
})

$.when('click', '[data-back]', (event) => {
  history.back()
})

$.when('click', '[data-down]', (event) => {
  const { value } = event.target.closest($.link).querySelector('[name="search"]');
  const enclosure = jurassicFrom(value)
  $.teach({ enclosure })
})



$.when('click', '[data-up]', (event) => {
  const { path } = $.learn()
  const src = path.split('/').slice(0,-1).join('/')
  const enclosure = jurassicFrom(src)
  $.teach({ enclosure })
})

$.when('click', '[data-forward]', (event) => {
  history.forward()
})



export function identity(event) {
  const { contextActions } = $.learn()
  hideModal() // todo: find the root cause of this
  showModal(`
    <plan98-wallet></plan98-wallet>
  `, { onHide: restoreContext(contextActions) })
}

function restoreContext(contextActions) {
  return function thunk() {
    const wallet = document.querySelector('plan98-modal plan98-wallet')

    if(wallet) wallet.remove()
    $.teach({ contextActions })
  }
}

export function escape() {
  $.teach({ contextActions: null })
  window.dispatchEvent(new KeyboardEvent("keydown",{'key': 'Escape'}));
}


$.when('click','[data-playlist]', (event) => {
  $.teach({ playlistVisible: !$.learn().playlistVisible, contextActions: null })
})


function createExternalLinkAction(href) {
  return {
    text: 'launch externally',
    action: 'openExternal',
    script: import.meta.url,
    href
  }
}

export function openExternal(event) {
  const { href } = event.target.dataset
  self.open(href, '_blank')
  $.teach({ contextActions: null })
}

function createPlayAction(href) {
  return {
    text: 'play now',
    action: 'playNow',
    script: import.meta.url,
    href
  }
}

export function playNow(event) {
  const { href } = event.target.dataset

  const walkman = event.target.closest($.link).querySelector('[name="walkman"]')
  walkman.src = href
  walkman.play()
  $.teach({ audioPlaying: true, currentTrack: href, contextActions: null })
}

function createPlaylistAction(href) {
  return {
    text: 'to playlist',
    action: 'toPlaylist',
    script: import.meta.url,
    href
  }
}

export function toPlaylist(event) {
  const { href } = event.target.dataset
  state['ls/mp3'].length += 1
  state['ls/mp3'].list.push(href)
  $.teach({ contextActions: null })
}

const thirdPartyRules = []

export function requestThirdPartyRules(filter, options) {
  thirdPartyRules.push(filter)
}


export function requestActionMenu(actions) {
  $.teach({ contextActions: actions })
}


function thirdPartyActions(anchor) {
  return thirdPartyRules.flatMap(filter => filter(anchor))
}

function rules(anchor) {
  const actions = []

  if(anchor.matches('[href$=".mp3"], [href$=".wav"]')) {
    actions.push(createPlayAction(anchor.href));
    actions.push(createPlaylistAction(anchor.href));
  }
  // window manager related
  if(anchor.matches('[href^="steam://"]')) {
    actions.push(createExternalLinkAction(anchor.href));
  }

  return [...actions, ...thirdPartyActions(anchor)]
}

$.when('click', '[data-toggle]', async (event) => {
  const { menu } = $.learn()
  $.teach({ menu: !menu })
})

$.style(`
  & {
    position: relative;
    width: 100%;
    max-height: 100%;
    display: block;
    height: 100%;
  }

  & .action-button {
    background: black;
    color: rgba(255,255,255,.65);
    border: 0;
    border-radius: 0;
    height: 2rem;
    display: grid;
    place-items: center;
    padding: 0 .5rem;
  }


  & .action-button:hover,
  & .action-button:focus {
    color: rgba(255,255,255,.85);
  }

  & .search {
    pointer-events: all;
    position: relative;
    display: grid;
    grid-template-columns: auto auto auto 1fr auto auto;
    background: black;
  }

  & .search input {
    color: rgba(255,255,255,.85);
  }

  & .search img {
    display: block;
  }
  & .search input {
    display: block;
    margin: auto;
    text-align: left;
    background: transparent;
    font-size: 1rem;
    padding: .5rem;
    margin: 0 auto;
    width: 100%;
    border-radius: 0;
    border: none;
    height: 2rem;
  }

  & .search input:focus {
  }

  & .suggestions .auto-item,
  & .search .auto-item {
    background: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.5));
    background-color: var(--button-color, lemonchiffon);
    border: none;
    color: white;
    transition: background-color 200ms ease-in-out;
    padding: 1rem;
    display: block;
  }

  & .search .auto-item:focus,
  & .search .auto-item:hover {
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75));
  }

  & .suggestions {
    display: flex;
    text-align: left;
    overflow: hidden;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    z-index: 500;
  }

  & .suggestions .auto-item {
    background: var(--button-color, lemonchiffon);
    background-image: linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.85));
    color: var(--button-color, lemonchiffon);
    transition: all 100ms ease-in-out;
    padding: .5rem;
    width: 100%;
    text-align: left;
    max-width: 100%;
  }

  & .suggestions .auto-item:focus,
  & .suggestions .auto-item:hover {
    background-color: var(--button-color, lemonchiffon);
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    color: white;
  }

  & .suggestions .auto-item.active {
    color: white;
    background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35));
    background-color: var(--button-color, lemonchiffon);
  }

  & [data-suggestion] {
    display: block;
  }

  & [data-view="grid"] .file-reference {
    display: grid;
    grid-template-rows: 1fr auto;
    aspect-ratio: 1;
    border-radius: 0;
    padding: 0;
  }

  & [data-view="list"] .file-reference {
    display: grid;
    grid-template-columns: auto 1fr;
    border-radius: 0;
    padding: 0;
  }

  & [data-view="list"] .interactive-directory,
  & [data-view="list"] .interactive-file {
    aspect-ratio: 1;
    text-decoration: none;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 0;
    padding: 0;
  }

  & .directory-name,
  & .file-name {
    border-radius: 0;
    font-size: .8rem;
    line-height: 1;
    border: none;
    width: auto;
    display: inline-grid;
    max-width: 100%;
    width: 100%;
    text-decoration: none;
    place-items: center start;
    padding: .5rem;
    color: saddlebrown;
  }

  & .directory-name[disabled],
  & .file-name[disabled] {
    color: saddlebrown;
    opacity: 1;
  }

  & .irix[data-view="grid"] .system-icon {
    font-size: 3rem;
  }

  & .irix[data-view="grid"] {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 8px;
  }

  & .irix[data-view="list"] {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  & .irix[data-view="game"] {
    display: block;
    width: 100%;
    height: 100%;
  }

`)

function reduceAttributes(attributes) {
	return Object.keys(attributes)
		.reduce((str, key) => {
			return `${str} ${key}="${attributes[key]}"`
		}, '')
}
